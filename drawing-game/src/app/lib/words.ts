import axios from "axios";
import { error } from "console";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCO-rfZob9TyOQtpPulKk6zeP3mA-goHwo";

if(!GEMINI_API_KEY){
    throw new Error("GEMINI WORD KEY NOT FOUND");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

const prompt = "Build a prompt bank with quirky drawing challenges (for example: 'Draw a giraffe in the arctic', 'Draw a superhero riding a bicycle', 'Draw a shark in a barrel', 'Draw a bumblebee that loves capitalism', 'Draw a van down by the river', etc. Keep in mind the person has to draw it in 2 mins so it should not be too complex. make sure numbers arent used and its in an array form";

export const gameWords = await model.generateContent(prompt);

console.log(gameWords.response.text());


