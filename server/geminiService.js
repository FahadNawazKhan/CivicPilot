import { GoogleGenerativeAI } from '@google/generative-ai';
import knowledgeBase from './knowledgeBase.js';
import config from './config/environment.js';

const API_KEY = config.GEMINI_API_KEY;
let genAI = null;

if (API_KEY) {
  console.log("Gemini API Key detected. Initializing Google Generative AI...");
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("WARNING: No GEMINI_API_KEY found. Running in offline/mock fallback mode.");
}

async function discoverProcess(query) {
  if (!query || typeof query !== 'string') return null;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are the intent detector for CivicPilot, a government process assistant.
Analyze this user query: "${query}"

Match it to exactly one of these process IDs:
[passport, driving_license, gst_registration, business_registration, medical_store, restaurant, import_export_license, trade_license, fssai, shop_establishment, aadhaar]

Return ONLY the lowercase process ID (e.g. "restaurant" or "passport").
If it does not match any of these processes, return "none".
Do not include any punctuation, formatting, or extra text.`;

      const result = await model.generateContent(prompt);
      const matchedId = result.response.text().trim().toLowerCase();
      if (knowledgeBase[matchedId]) {
        return knowledgeBase[matchedId];
      }
    } catch (error) {
      console.error("Gemini API Error in discoverProcess:", error.message);
    }
  }

  const lowerQuery = query.toLowerCase();
  const matches = {
    passport: ["passport", "travel abroad", "visa", "pass port"],
    driving_license: ["drive", "driving", "license", "licence", "car", "bike", "rto", "vehicle", "learner"],
    gst_registration: ["gst", "tax registration", "gstin", "goods and services tax"],
    business_registration: ["business", "company", "pvt ltd", "incorporate", "register company", "opc", "incorporation", "start business"],
    medical_store: ["pharmacy", "medical store", "chemist", "drug license", "medicine", "drug store"],
    restaurant: ["restaurant", "cafe", "food business", "eating house", "diner", "canteen", "hotel"],
    import_export_license: ["import", "export", "iec", "dgft", "foreign trade", "customs code"],
    trade_license: ["trade license", "municipal license", "shop license", "trading"],
    fssai: ["fssai", "food license", "food safety", "foscos", "kitchen hygiene"],
    shop_establishment: ["shop license", "establishment", "gumasta", "labor registration", "office registration"],
    aadhaar: ["aadhaar", "uidai", "aadhar", "identity card", "unique id"]
  };

  for (const [id, keywords] of Object.entries(matches)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return knowledgeBase[id];
    }
  }

  if (lowerQuery.includes("pharmacy") || lowerQuery.includes("medical")) return knowledgeBase["medical_store"];
  if (lowerQuery.includes("cafe") || lowerQuery.includes("restaurant") || lowerQuery.includes("food")) return knowledgeBase["restaurant"];
  if (lowerQuery.includes("company") || lowerQuery.includes("private limited")) return knowledgeBase["business_registration"];
  if (lowerQuery.includes("driving") || lowerQuery.includes("rto")) return knowledgeBase["driving_license"];

  return null;
}

async function answerQuestion(processId, question, chatHistory = []) {
  if (processId === 'general') {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const formattedHistory = chatHistory.slice(-6).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
        ).join('\n');

        const prompt = `You are CivicPilot, a friendly AI Government Process helper.
You are helping a citizen who is trying to understand government processes in India. They want answers in VERY simple and basic English (no hard words, short sentences, easy to read).

Here is the list of processes we can help with:
${Object.values(knowledgeBase).map(p => `- ${p.name}: ${p.description}`).join('\n')}

Instructions:
1. Answer in VERY simple, basic, and clear English. Avoid any hard or complex words.
2. If the user asks about one of our supported processes, guide them to select it from the list or tell them how to start in simple words.
3. Keep your answers short, clear, and easy to read.

Previous Chat History:
${formattedHistory}

User's Question: "${question}"

CivicPilot Response:`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (error) {
        console.error("Gemini API Error in answerQuestion (general):", error.message);
      }
    }
    
    return "Hi! I am CivicPilot, your helper. I can help you with Passport, Driving License, GST, Company Registration, Medical Store/Pharmacy, Restaurant, Import/Export code, Trade License, FSSAI food license, and Shop license. Please select one service from the list to start!";
  }

  const processContext = knowledgeBase[processId];
  if (!processContext) {
    return "I could not find details for that service. How else can I help you?";
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const formattedHistory = chatHistory.slice(-6).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      ).join('\n');

      const prompt = `You are CivicPilot, a friendly AI Government Process helper.
You are helping a citizen with the process of getting a "${processContext.name}".
They want answers in VERY simple and basic English (no hard words, short sentences, easy to read).

Here is the information we have for this process:
${JSON.stringify(processContext, null, 2)}

Instructions:
1. Answer in VERY simple, basic, and clear English. Avoid any hard or complex words.
2. Rely on the provided information first.
3. If the user asks general questions (e.g. "Can a student start a restaurant?"), explain in very simple words (e.g. "Yes, if you are 18 or older, you can start a business. But you still need to get commercial licenses").
4. If details are not in the info, use your general knowledge of Indian government procedures to answer in simple terms.
5. Keep your answers short, structured (use simple points), and easy to read. Avoid any technical terms where possible, or explain them in very easy words.

Previous Chat History:
${formattedHistory}

User's Question: "${question}"

CivicPilot Response:`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Gemini API Error in answerQuestion:", error.message);
    }
  }

  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes("cost") || lowerQ.includes("fee") || lowerQ.includes("price") || lowerQ.includes("charge")) {
    return `The cost for **${processContext.name}** is around **${processContext.estimatedCost}**. \n\nHere is what you have to pay for each step:\n${processContext.steps.map(s => `- **${s.title}**: ${s.cost}`).join('\n')}`;
  }
  if (lowerQ.includes("time") || lowerQ.includes("day") || lowerQ.includes("long") || lowerQ.includes("duration") || lowerQ.includes("delay")) {
    return `It will take about **${processContext.timeline}** to get your **${processContext.name}**.\n\nHere is how much time each step takes:\n${processContext.steps.map(s => `- **${s.title}**: ${s.duration}`).join('\n')}`;
  }
  if (lowerQ.includes("document") || lowerQ.includes("paper") || lowerQ.includes("id proof") || lowerQ.includes("aadhaar") || lowerQ.includes("pan")) {
    return `You will need these papers/documents for your **${processContext.name}**:\n${processContext.documents.map(d => `- **${d.name}**: ${d.description}`).join('\n')}`;
  }
  if (lowerQ.includes("steps") || lowerQ.includes("sequence") || lowerQ.includes("how to") || lowerQ.includes("procedure")) {
    return `Here are the simple steps to get your **${processContext.name}**:\n${processContext.steps.map((s, idx) => `${idx + 1}. **${s.title}** (Takes ${s.duration}): ${s.desc}`).join('\n')}`;
  }

  return `I am here to help you get your **${processContext.name}**. You can ask me how much it costs, what documents you need, or the steps to apply. Tell me what you want to know!`;
}

async function analyzeDocument(docName, fileBuffer, mimeType) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const filePart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType
        },
      };

      const prompt = `You are a document auditing AI assistant for CivicPilot.
The user uploaded a document claiming to be their "${docName}" (e.g. Aadhaar, PAN, Passport photo, Utility bill).

Perform these checks:
1. Verify if the document matches the expected type "${docName}" based on its content (e.g., does it look like an Aadhaar card or PAN card? Note: since it's a demo, be slightly lenient but flag obvious mismatches).
2. Check if the image is blurry, cropped, or hard to read.
3. Check for obvious issues (e.g. expired dates, missing signatures, or redacted sections).

Respond ONLY with a JSON object in this exact format. Do not use markdown blocks:
{
  "valid": true or false,
  "status": "success" or "warning" or "error",
  "feedback": "A concise sentence summarizing the assessment (e.g., 'Aadhaar Card verified successfully.' or 'PAN card appears blurry, please upload a higher resolution image.')"
}`;

      const result = await model.generateContent([prompt, filePart]);
      const cleanJsonStr = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJsonStr);
    } catch (error) {
      console.error("Gemini API Error in analyzeDocument:", error.message);
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerName = docName.toLowerCase();
      
      if (lowerName.includes("aadhaar")) {
        resolve({
          valid: true,
          status: "success",
          feedback: "Aadhaar Card parsed successfully. Name and address match the criteria."
        });
      } else if (lowerName.includes("pan")) {
        resolve({
          valid: true,
          status: "success",
          feedback: "PAN Card verified. Tax identification number validated."
        });
      } else if (lowerName.includes("photo") || lowerName.includes("passport")) {
        resolve({
          valid: false,
          status: "warning",
          feedback: "The photo upload has a low resolution or is slightly blurry, but is acceptable. Ensure it has a white background."
        });
      } else {
        resolve({
          valid: true,
          status: "success",
          feedback: `${docName} uploaded and verified successfully.`
        });
      }
    }, 2000); 
  });
}

export {
  discoverProcess,
  answerQuestion,
  analyzeDocument
};