import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
});

export async function summarizeEmail(content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Summarize the following email in 1-2 sentences. Keep it concise.\n\nEmail:\n${content}`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("AI Summarization failed:", error);
    return "Summary generation failed.";
  }
}

export async function categorizeLead(emailBody: string): Promise<{ industry: string, role: string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Based on the following email content, extract the sender's likely industry and job role. Return ONLY a valid JSON object in this format: {"industry": "Software", "role": "CEO"}. If unknown, use "Unknown".\n\nEmail:\n${emailBody}`,
    });
    
    let text = response.text || "{}";
    // Strip markdown formatting if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Categorization failed:", error);
    return { industry: "Unknown", role: "Unknown" };
  }
}
