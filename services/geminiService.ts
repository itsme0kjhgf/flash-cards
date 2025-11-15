
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Language } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getTextFromImages(images: { base64: string, mimeType: string }[]): Promise<string> {
    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    ...imageParts,
                    { text: 'Extract all the text from these images accurately, combining them into a single coherent block of text. The text could be in English, French, or Arabic.' },
                ],
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error extracting text from images:', error);
        throw new Error('Failed to analyze images.');
    }
}

export async function generateFlashcardsFromText(text: string, language: Language, cardCount: number): Promise<Array<{ question: string; answer: string }>> {
    const prompt = `
        Based on the following text, generate a set of approximately ${cardCount} flashcards.
        The flashcards should be in ${language}.

        Rules:
        1. Identify the most important key concepts, facts, definitions, and ideas.
        2. Create concise, clear questions for the 'front' of the card.
        3. Provide accurate and brief answers for the 'back' of the card.
        4. Prioritize quality over the exact quantity. If the text is short, create fewer high-quality cards.
        5. Ensure the question and answer pairs are logical and directly related to the provided text.

        Text to analyze:
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flashcards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: {
                                        type: Type.STRING,
                                        description: 'The question for the flashcard.',
                                    },
                                    answer: {
                                        type: Type.STRING,
                                        description: 'The answer to the question.',
                                    },
                                },
                                required: ['question', 'answer'],
                            },
                        },
                    },
                    required: ['flashcards'],
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        if (!jsonResponse.flashcards || !Array.isArray(jsonResponse.flashcards)) {
            throw new Error("Invalid response format from API. Expected a 'flashcards' array.");
        }

        return jsonResponse.flashcards;

    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw new Error('Failed to generate flashcards.');
    }
}

export async function generateSpeech(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from the API.");
        }

        return base64Audio;
    } catch (error) {
        console.error('Error generating speech:', error);
        throw new Error('Failed to generate speech.');
    }
}
