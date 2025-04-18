import {
  convertToCoreMessages,
  CoreMessage,
  CoreAssistantMessage,
  CoreToolMessage,
  Message,
  StreamData,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { blocksPrompt, regularPrompt, systemPrompt } from '@/ai/prompts';
import { corsHeaders } from '@/app/api/cors-middleware';
import { getChatById, getDocumentById, getSession } from '@/db/cached-queries';
import {
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
  deleteChatById,
} from '@/db/mutations';
import { createClient, validateToken } from '@/lib/supabase/server';
import { MessageRole } from '@/lib/supabase/types';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather'
  | 'getEvents'
  | 'findMarkets'
  | 'getEventDetails';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const eventTools: AllowedTools[] = [
  'getEvents',
  'findMarkets',
  'getEventDetails',
];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools, ...eventTools];

async function getUser(request: Request) {
  // Vérifier d'abord le jeton Bearer (mobile)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await validateToken(token);
    if (!error && data.user) {
      return data.user;
    }
  }
  
  // Sinon, utiliser l'authentification basée sur les cookies (web)
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Add helper function to format message content for database storage
function formatMessageContent(message: CoreMessage): string {
  // For user messages, store as plain text
  if (message.role === 'user') {
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
  }

  // For tool messages, format as array of tool results
  if (message.role === 'tool') {
    return JSON.stringify(
      message.content.map((content) => ({
        type: content.type || 'tool-result',
        toolCallId: content.toolCallId,
        toolName: content.toolName,
        result: content.result,
      }))
    );
  }

  // For assistant messages, format as array of text and tool calls
  if (message.role === 'assistant') {
    if (typeof message.content === 'string') {
      return JSON.stringify([{ type: 'text', text: message.content }]);
    }

    return JSON.stringify(
      message.content.map((content) => {
        if (content.type === 'text') {
          return {
            type: 'text',
            text: content.text,
          };
        }
        return {
          type: 'tool-call',
          toolCallId: content.toolCallId,
          toolName: content.toolName,
          args: content.args,
        };
      })
    );
  }

  return '';
}

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const user = await getUser(request);

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Détecter le type de plateforme à partir de l'en-tête User-Agent
  const userAgent = request.headers.get('user-agent') || '';
  const isNativeMobile = userAgent.includes('Expo') || userAgent.includes('React Native');

  try {
    const chat = await getChatById(id);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      await saveChat({ id, userId: user.id, title });
    } else if (chat.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await saveMessages({
      chatId: id,
      messages: [
        {
          id: generateUUID(),
          chat_id: id,
          role: userMessage.role as MessageRole,
          content: formatMessageContent(userMessage),
          created_at: new Date().toISOString(),
        },
      ],
    });

    const streamingData = new StreamData();
    let cachedResponseMessages: (CoreAssistantMessage | CoreToolMessage)[] = [];

    const result = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt,
      messages: coreMessages,
      maxSteps: 5,
      experimental_activeTools: allTools,
      tools: {
        getWeather: {
          description: 'Get the current weather at Koh Phangan',
          parameters: z.object({
            latitude: z.number().default(9.7313).describe('Latitude for Koh Phangan'),
            longitude: z.number().default(100.0137).describe('Longitude for Koh Phangan'),
          }),
          execute: async ({ latitude, longitude }) => {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability&daily=sunrise,sunset,uv_index_max&timezone=auto`
            );

            const weatherData = await response.json();
            return weatherData;
          },
        },
        getEvents: {
          description: 'Get upcoming events on Koh Phangan based on filters',
          parameters: z.object({
            timeFrame: z.enum(['today', 'tomorrow', 'this weekend', 'next week', 'this month']).describe('Time period to search for events'),
            category: z.string().optional().describe('Optional category filter'),
            tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
            location: z.string().optional().describe('Optional location filter'),
          }),
          execute: async ({ timeFrame, category, tags, location }) => {
            const supabase = await createClient();
            
            // Get current date info
            const now = new Date();
            const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
            let query = supabase.from('events').select('*');
            
            // Apply time frame filter
            switch(timeFrame) {
              case 'today':
                query = query.eq('day', now.getDate());
                break;
              case 'tomorrow':
                const tomorrow = new Date(now);
                tomorrow.setDate(now.getDate() + 1);
                query = query.eq('day', tomorrow.getDate());
                break;
              case 'this weekend':
                // Calculate days until weekend
                const daysUntilSaturday = currentDay === 6 ? 0 : 6 - currentDay;
                const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
                const saturdayDate = new Date(now);
                saturdayDate.setDate(now.getDate() + daysUntilSaturday);
                const sundayDate = new Date(now);
                sundayDate.setDate(now.getDate() + daysUntilSunday);
                
                // Format dates for query
                const saturdayFormatted = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
                const sundayFormatted = `${sundayDate.getFullYear()}-${String(sundayDate.getMonth() + 1).padStart(2, '0')}-${String(sundayDate.getDate()).padStart(2, '0')}`;
                
                // Set time range for the entire weekend
                query = query.or(`time.gte.${saturdayFormatted}T00:00:00,time.lt.${sundayFormatted}T23:59:59`);
                break;
              case 'next week':
                const nextWeekStart = new Date(now);
                nextWeekStart.setDate(now.getDate() + (7 - currentDay));
                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                
                // Create array of days for next week
                const nextWeekDays = [];
                for (let i = 0; i <= 6; i++) {
                  const day = new Date(nextWeekStart);
                  day.setDate(nextWeekStart.getDate() + i);
                  nextWeekDays.push(day.getDate());
                }
                
                query = query.in('day', nextWeekDays);
                break;
              case 'this month':
                const currentMonth = now.getMonth();
                query = query.filter('time', 'gte', `${now.getFullYear()}-${currentMonth + 1}-01`).filter('time', 'lt', `${now.getFullYear()}-${currentMonth + 2}-01`);
                break;
            }
            
            // Apply optional filters
            if (category) {
              query = query.ilike('category', `%${category}%`);
            }
            
            if (tags && tags.length > 0) {
              // Filter events that contain ANY of the provided tags
              query = query.or(tags.map((tag: string) => `tags.cs.{${tag}}`).join(','));
            }
            
            if (location) {
              query = query.ilike('location', `%${location}%`);
            }
            
            // Sort by day and time
            query = query.order('day').order('time');
            
            const { data, error } = await query;
            
            if (error) {
              return { error: error.message };
            }
            
            return {
              events: data.map(event => ({
                id: event.id,
                title: event.title,
                category: event.category,
                time: event.time,
                location: event.location,
                price: event.price,
                tags: event.tags || [],
                image: event.image
              })),
              count: data.length,
              timeFrame
            };
          },
        },
        findMarkets: {
          description: 'Find markets and bazaars happening on Koh Phangan',
          parameters: z.object({
            date: z.string().optional().describe('Optional date to check for markets (YYYY-MM-DD)'),
          }),
          execute: async ({ date }) => {
            const supabase = await createClient();
            
            let query = supabase.from('events').select('*')
              .or('tags.cs.{market},title.ilike.%market%,description.ilike.%market%,category.ilike.%market%');
            
            // If date is provided, filter by that specific date
            if (date) {
              try {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                  query = query.eq('day', parsedDate.getDate());
                }
              } catch (e) {
                // Invalid date format, ignore date filter
              }
            }
            
            const { data, error } = await query.order('day').order('time');
            
            if (error) {
              return { error: error.message };
            }
            
            return {
              markets: data.map(market => ({
                id: market.id,
                title: market.title,
                location: market.location,
                time: market.time,
                day: market.day,
                description: market.description,
                image: market.image,
                tags: market.tags || []
              })),
              count: data.length
            };
          },
        },
        getEventDetails: {
          description: 'Get detailed information about a specific event',
          parameters: z.object({
            eventId: z.string().describe('The ID of the event'),
          }),
          execute: async ({ eventId }) => {
            const supabase = await createClient();
            
            const { data, error } = await supabase
              .from('events')
              .select('*')
              .eq('id', eventId)
              .single();
            
            if (error) {
              return { error: error.message };
            }
            
            if (!data) {
              return { error: 'Event not found' };
            }
            
            return {
              id: data.id,
              title: data.title,
              category: data.category,
              description: data.description,
              image: data.image,
              time: data.time,
              location: data.location,
              price: data.price,
              rating: data.rating,
              reviews: data.reviews,
              duration: data.duration,
              organizer: {
                name: data.organizer_name,
                image: data.organizer_image,
                email: data.organizer_contact_email,
                phone: data.organizer_contact_phone,
                website: data.organizer_website
              },
              facilities: data.facilities,
              tags: data.tags,
              latitude: data.latitude,
              longitude: data.longitude,
              capacity: data.capacity,
              attendee_count: data.attendee_count
            };
          },
        },
        createDocument: {
          description: 'Create a document for a writing activity',
          parameters: z.object({
            title: z.string(),
          }),
          execute: async ({ title }) => {
            const id = generateUUID();
            let draftText: string = '';

            // Stream UI updates immediately for better UX
            streamingData.append({ type: 'id', content: id });
            streamingData.append({ type: 'title', content: title });
            streamingData.append({ type: 'clear', content: '' });

            // Generate content
            const { fullStream } = await streamText({
              model: customModel(model.apiIdentifier),
              system:
                'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
              prompt: title,
            });

            for await (const delta of fullStream) {
              const { type } = delta;

              if (type === 'text-delta') {
                draftText += delta.textDelta;
                // Stream content updates in real-time
                streamingData.append({
                  type: 'text-delta',
                  content: delta.textDelta,
                });
              }
            }

            // Try to save with retries
            // let attempts = 0;
            // const maxAttempts = 3;
            // let savedId: string | null = null;

            // while (attempts < maxAttempts && !savedId) {
            //   try {
            //     await saveDocument({
            //       id,
            //       title,
            //       content: draftText,
            //       userId: user.id,
            //     });
            //     savedId = id;
            //     break;
            //   } catch (error) {
            //     attempts++;
            //     if (attempts === maxAttempts) {
            //       // If original ID fails, try with a new ID
            //       const newId = generateUUID();
            //       try {
            //         await saveDocument({
            //           id: newId,
            //           title,
            //           content: draftText,
            //           userId: user.id,
            //         });
            //         // Update the ID in the UI
            //         streamingData.append({ type: 'id', content: newId });
            //         savedId = newId;
            //       } catch (finalError) {
            //         console.error('Final attempt failed:', finalError);
            //         return {
            //           error:
            //             'Failed to create document after multiple attempts',
            //         };
            //       }
            //     }
            //     await new Promise((resolve) =>
            //       setTimeout(resolve, 100 * attempts)
            //     );
            //   }
            // }

            streamingData.append({ type: 'finish', content: '' });

            if (user && user.id) {
              await saveDocument({
                id,
                title,
                content: draftText,
                userId: user.id,
              });
            }

            return {
              id,
              title,
              content: `A document was created and is now visible to the user.`,
            };
          },
        },
        updateDocument: {
          description: 'Update a document with the given description',
          parameters: z.object({
            id: z.string().describe('The ID of the document to update'),
            description: z
              .string()
              .describe('The description of changes that need to be made'),
          }),
          execute: async ({ id, description }) => {
            const document = await getDocumentById(id);

            if (!document) {
              return {
                error: 'Document not found',
              };
            }

            const { content: currentContent } = document;
            let draftText: string = '';

            streamingData.append({
              type: 'clear',
              content: document.title,
            });

            const { fullStream } = await streamText({
              model: customModel(model.apiIdentifier),
              system:
                'You are a helpful writing assistant. Based on the description, please update the piece of writing.',
              experimental_providerMetadata: {
                openai: {
                  prediction: {
                    type: 'content',
                    content: currentContent,
                  },
                },
              },
              messages: [
                {
                  role: 'user',
                  content: description,
                },
                { role: 'user', content: currentContent },
              ],
            });

            for await (const delta of fullStream) {
              const { type } = delta;

              if (type === 'text-delta') {
                const { textDelta } = delta;

                draftText += textDelta;
                streamingData.append({
                  type: 'text-delta',
                  content: textDelta,
                });
              }
            }

            streamingData.append({ type: 'finish', content: '' });

            if (user && user.id) {
              await saveDocument({
                id,
                title: document.title,
                content: draftText,
                userId: user.id,
              });
            }

            return {
              id,
              title: document.title,
              content: 'The document has been updated successfully.',
            };
          },
        },
        requestSuggestions: {
          description: 'Request suggestions for a document',
          parameters: z.object({
            documentId: z
              .string()
              .describe('The ID of the document to request edits'),
          }),
          execute: async ({ documentId }) => {
            const document = await getDocumentById(documentId);

            if (!document || !document.content) {
              return {
                error: 'Document not found',
              };
            }

            let suggestions: Array<{
              originalText: string;
              suggestedText: string;
              description: string;
              id: string;
              documentId: string;
              isResolved: boolean;
            }> = [];

            const { elementStream } = await streamObject({
              model: customModel(model.apiIdentifier),
              system:
                'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
              prompt: document.content,
              output: 'array',
              schema: z.object({
                originalSentence: z.string().describe('The original sentence'),
                suggestedSentence: z
                  .string()
                  .describe('The suggested sentence'),
                description: z
                  .string()
                  .describe('The description of the suggestion'),
              }),
            });

            for await (const element of elementStream) {
              const suggestion = {
                originalText: element.originalSentence,
                suggestedText: element.suggestedSentence,
                description: element.description,
                id: generateUUID(),
                documentId: documentId,
                isResolved: false,
              };

              streamingData.append({
                type: 'suggestion',
                content: suggestion,
              });

              suggestions.push(suggestion);
            }

            if (user && user.id) {
              const userId = user.id;

              await saveSuggestions({
                suggestions: suggestions.map((suggestion) => ({
                  ...suggestion,
                  userId,
                  createdAt: new Date(),
                  documentCreatedAt: document.created_at,
                })),
              });
            }

            // if (user && user.id) {
            //   for (const suggestion of suggestions) {
            //     await saveSuggestions({
            //       documentId: suggestion.documentId,
            //       documentCreatedAt: document.created_at,
            //       originalText: suggestion.originalText,
            //       suggestedText: suggestion.suggestedText,
            //       description: suggestion.description,
            //       userId: user.id,
            //     });
            //   }
            // }

            return {
              id: documentId,
              title: document.title,
              message: 'Suggestions have been added to the document',
            };
          },
        },
      },
      onFinish: async ({ responseMessages }) => {
        // Stocker les messages pour une utilisation ultérieure par les clients mobiles
        cachedResponseMessages = responseMessages;
        
        // Sauvegarder les messages dans la base de données
        if (user && user.id) {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(responseMessages);

            await saveMessages({
              chatId: id,
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === 'assistant') {
                    streamingData.appendMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
                    chat_id: id,
                    role: message.role as MessageRole,
                    content: formatMessageContent(message),
                    created_at: new Date().toISOString(),
                  };
                }
              ),
            });
          } catch (error) {
            console.error('Failed to save chat:', error);
          }
        }

        streamingData.close();
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    });
    
    // Retourner une réponse appropriée selon la plateforme
    if (isNativeMobile) {
      // Pour mobile, attendre que le traitement soit terminé et renvoyer du JSON
      // Utiliser les messages mis en cache par onFinish
      const responseMessagesWithoutIncompleteToolCalls = 
        sanitizeResponseMessages(cachedResponseMessages);
        
      return new Response(JSON.stringify({
        messages: responseMessagesWithoutIncompleteToolCalls.map(message => ({
          id: generateUUID(),
          role: message.role,
          content: formatMessageContent(message),
        })),
      }), {
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
        }
      });
    } else {
      // Pour web, continuer à utiliser la réponse en streaming
      return result.toDataStreamResponse({
        data: streamingData,
      });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    if (error instanceof Error && error.message === 'Chat ID already exists') {
      // If chat already exists, just continue with the message saving
      await saveMessages({
        chatId: id,
        messages: [
          {
            id: generateUUID(),
            chat_id: id,
            role: userMessage.role as MessageRole,
            content: formatMessageContent(userMessage),
            created_at: new Date().toISOString(),
          },
        ],
      });
    } else {
      throw error; // Re-throw other errors
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const user = await getUser(request);

  try {
    const chat = await getChatById(id);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById(id, user.id);

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

// Ajouter le gestionnaire OPTIONS pour les requêtes préliminaires CORS
export { OPTIONS } from '@/app/api/cors-middleware';
