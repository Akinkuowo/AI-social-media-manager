import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API Key");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: listModels is on the genAI instance in newer versions, or requires a different approach.
    // In @google/generative-ai, there isn't a direct listModels on the main class usually, 
    // it's often used via the REST API or we just guess.
    
    // However, I suspect the issue is simply the model ID string.
    console.log("Attempting to probe gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello?");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (err: any) {
    console.error("Failed with gemini-1.5-flash:", err.message);
    
    try {
      console.log("Attempting to probe gemini-pro...");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hello?");
      console.log("Success with gemini-pro:", result.response.text());
    } catch (err2: any) {
      console.error("Failed with gemini-pro:", err2.message);
    }
  }
}

list();
