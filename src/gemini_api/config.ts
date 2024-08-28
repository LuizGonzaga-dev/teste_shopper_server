const { GoogleGenerativeAI } = require("@google/generative-ai");
const {GoogleAIFileManager} = require("@google/generative-ai/server");

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const genAiFileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });