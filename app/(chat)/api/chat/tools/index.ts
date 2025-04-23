import { eventsTool } from './eventsTool';
import { guidesTool } from './guidesTool';
import { partnersTool } from './partnersTool';
import { weatherTool } from './weatherTool';

export type AllowedTools = 'getWeather' | 'getEvents' | 'getPartners' | 'getGuides';

// Group tools by category for easier management
export const weatherTools: AllowedTools[] = ['getWeather'];
export const eventTools: AllowedTools[] = ['getEvents'];
export const partnerTools: AllowedTools[] = ['getPartners'];
export const guideTools: AllowedTools[] = ['getGuides'];

// Export all available tools
export const allTools: AllowedTools[] = [...weatherTools, ...eventTools, ...partnerTools, ...guideTools];

// Tool definitions map - allows easy access to tool definitions by name
export const tools = {
  getWeather: weatherTool,
  getEvents: eventsTool,
  getPartners: partnersTool,
  getGuides: guidesTool,
}; 