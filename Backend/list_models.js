/**
 * List available Gemini models for your API key
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // There is no direct listModels in the new SDK easily like this, 
    // so we will just try the common ones one by one to see which has access.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    console.log("--- Scanning Gemini Models ---");
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            // Test it with a very tiny prompt
            const res = await model.generateContent("hi");
            if (res.response.text()) {
                console.log(`✅ ${m}: SUPPORTED`);
            }
        } catch (e) {
            console.log(`❌ ${m}: NOT SUPPORTED (${e.message})`);
        }
    }
  } catch (err) {
    console.error("Major API Error:", err.message);
  }
}

listModels();
