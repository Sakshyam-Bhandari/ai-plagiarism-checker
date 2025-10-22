import { GoogleGenAI, Type } from "@google/genai";
import { PlagiarismResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // but for this environment, we assume the key is present.
  console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    plagiarismScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the percentage of plagiarized content.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the plagiarism analysis.",
    },
    potentialSources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sourceText: {
            type: Type.STRING,
            description: "The snippet of text that is potentially plagiarized.",
          },
          url: {
            type: Type.STRING,
            description: "The potential URL of the original source.",
          },
          similarity: {
            type: Type.NUMBER,
            description: "A percentage score (0-100) of how similar the snippet is to the source.",
          },
        },
        required: ["sourceText", "similarity"],
      },
    },
  },
  required: ["plagiarismScore", "summary", "potentialSources"],
};


export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }
  
  const model = 'gemini-2.5-flash';

  const prompt = `
    Analyze the following text for plagiarism. Scour the web and academic databases for potential sources.
    Provide a detailed report in JSON format. The 'plagiarismScore' should be a percentage from 0 to 100, where 100 is a direct copy.
    The 'summary' should be a brief, neutral analysis of the findings.
    In 'potentialSources', list any matching text segments you find, their likely origin URL, and a similarity score for that specific segment.
    If no plagiarism is found, return a score of 0, an empty 'potentialSources' array, and a summary stating the text appears original.

    Text to analyze:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text.trim();
    const cleanedJsonString = responseText.replace(/^```json\s*|```\s*$/g, '');
    const result = JSON.parse(cleanedJsonString);
    return result as PlagiarismResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to check for plagiarism. The AI model may be overloaded or the content could not be processed.");
  }
};