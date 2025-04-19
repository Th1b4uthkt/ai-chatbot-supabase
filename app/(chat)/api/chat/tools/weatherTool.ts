import { z } from 'zod';

/**
 * Tool to get current weather information for Koh Phangan
 */
export const weatherTool = {
  description: 'Get the current weather at Koh Phangan',
  parameters: z.object({
    latitude: z.number().default(9.7313).describe('Latitude for Koh Phangan'),
    longitude: z.number().default(100.0137).describe('Longitude for Koh Phangan'),
  }),
  execute: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability&daily=sunrise,sunset,uv_index_max&timezone=auto`
    );

    const weatherData = await response.json();
    return weatherData;
  },
}; 