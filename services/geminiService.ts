
import { GoogleGenAI, Type } from "@google/genai";
import { Driver, Store, User, AIRecommendation } from '../types';
import { calculateDistance } from '../utils/geoUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDispatchRecommendation = async (
  orderId: string,
  user: User,
  store: Store,
  drivers: Driver[]
): Promise<AIRecommendation> => {
  // Pre-filter available drivers and calculate distances to the store
  const availableDrivers = drivers.filter(d => d.status === 'available');
  
  const driverData = availableDrivers.map(d => ({
    id: d.id,
    name: d.name,
    distanceToStore: calculateDistance(d.lat, d.lng, store.lat, store.lng),
    distanceFromStoreToUser: calculateDistance(store.lat, store.lng, user.lat, user.lng)
  }));

  const prompt = `
    Context: You are a delivery dispatcher. 
    Task: Choose the best driver for an order from ${store.name} to ${user.name}.
    
    Data:
    - Target User: ${user.name} at [${user.lat}, ${user.lng}]
    - Target Store: ${store.name} at [${store.lat}, ${store.lng}]
    - Available Drivers: ${JSON.stringify(driverData)}
    
    Rules:
    - Primary factor: Lowest distance to store.
    - Secondary factor: Driver positioning relative to the final destination.
    - Provide a short, logical reasoning.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedDriverId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            estimatedTime: { type: Type.STRING }
          },
          required: ['suggestedDriverId', 'reasoning', 'estimatedTime']
        }
      }
    });

    return JSON.parse(response.text) as AIRecommendation;
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    // Fallback: Pick closest driver manually
    const closest = driverData.sort((a, b) => a.distanceToStore - b.distanceToStore)[0];
    return {
      suggestedDriverId: closest?.id || drivers[0].id,
      reasoning: "Automatic fallback to closest driver based on raw GPS data.",
      estimatedTime: "Calculated based on distance."
    };
  }
};
