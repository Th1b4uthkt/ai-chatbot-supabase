import { activitiesServicesTool } from './activitiesServicesTool';
import { eventsTool } from './eventsTool';
import { weatherTool } from './weatherTool';

export type AllowedTools = 'getWeather' | 'getEvents' | 'getActivitiesServices';

// Group tools by category for easier management
export const weatherTools: AllowedTools[] = ['getWeather'];
export const eventTools: AllowedTools[] = ['getEvents'];
export const exploreTools: AllowedTools[] = ['getActivitiesServices'];

// Export all available tools
export const allTools: AllowedTools[] = [...weatherTools, ...eventTools, ...exploreTools];

// Tool definitions map - allows easy access to tool definitions by name
export const tools = {
  getWeather: weatherTool,
  getEvents: eventsTool,
  getActivitiesServices: activitiesServicesTool,
}; 