# Events Card Implementation

This document explains how events are displayed in card format in our chatbot application.

## Overview

The implementation consists of several components:

1. **Event Tool in API Route**: A tool that queries events from Supabase based on filters
2. **EventCard Component**: Displays an individual event with details
3. **EventsRenderer Component**: Renders multiple event cards in a grid
4. **EventsToolRenderer Component**: Formats the AI tool response for display

## How it Works

### 1. Tool Response Handling

When the AI assistant calls the `getEvents` tool:

1. The tool queries the Supabase database and formats the results
2. The formatted response is returned to the AI
3. In the UI, the `message.tsx` component identifies the tool result using the `toolName === 'getEvents'` check
4. It passes the result to the `EventsToolRenderer` component

### 2. Card Rendering Pipeline

The rendering flow is as follows:

```
AI Tool Response → EventsToolRenderer → EventsRenderer → EventCard (for each event)
```

- **EventsToolRenderer**: Handles the raw tool response, formats data and shows a header
- **EventsRenderer**: Organizes multiple events in a grid, implements pagination if needed
- **EventCard**: Displays a single event with image, details, etc.

## UI/UX Design

The event cards are designed with:

- Clear visual hierarchy with the most important information prominently displayed
- Image preview when available, with fallback for events without images
- Category and price tags for quick filtering
- Consistent styling that matches the overall application design
- Responsive layout that works on mobile and desktop

## Adding New Features

To extend the event cards implementation:

1. **New Fields**: Add new fields to the EventType interface in `types/events.ts`
2. **Enhanced UI**: Modify `EventCard.tsx` to display new fields
3. **Filtering**: Extend the `getEvents` tool in `route.ts` to support new filter parameters

## Example Usage

In a conversation, users can ask:
- "Show me events this weekend"
- "Find yoga classes tomorrow"
- "What beach parties are happening next week?" 

The assistant will use the `getEvents` tool, which will display results as cards automatically. 