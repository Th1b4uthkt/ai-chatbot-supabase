import { eventsTool } from './eventsTool';
import { weatherTool } from './weatherTool';

export type AllowedTools = 'getWeather' | 'getEvents';

// Group tools by category for easier management
export const weatherTools: AllowedTools[] = ['getWeather'];
export const eventTools: AllowedTools[] = ['getEvents'];

// Export all available tools
export const allTools: AllowedTools[] = [...weatherTools, ...eventTools];

// Tool definitions map - allows easy access to tool definitions by name
export const tools = {
  getWeather: weatherTool,
  getEvents: eventsTool,
}; 