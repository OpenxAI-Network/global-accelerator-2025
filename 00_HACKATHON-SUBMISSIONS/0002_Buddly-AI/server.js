import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.VITE_GEMINI_API_KEY;
const PIXABAY_API_KEY = process.env.VITE_PIXABAY_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash';

if (!API_KEY || !PIXABAY_API_KEY) {
    console.error('🔴 Missing VITE_GEMINI_API_KEY or VITE_PIXABAY_API_KEY in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME,
    generationConfig: {
        responseMimeType: 'application/json',
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ], });

// --- (A) Strengthened System Prompt ---
const BASE_SYSTEM_PROMPT = `You are a world-class front-end web developer. Your mission is to generate a complete, self-contained web application based on a user's request.

**Your response MUST be a single, valid JSON object and nothing else.** Do not wrap it in markdown fences, add comments, or any explanatory text.

The JSON object must have three string keys: "html", "css", and "js".

- "html": A complete HTML5 document. It must link to external files: <link rel="stylesheet" href="styles.css"> and <script src="app.js" defer></script>. Do not include inline <style> or <script> tags.
- "css": All styling.
- "js": All JavaScript logic.

**CRITICAL RULES:**
1.  **Strict JSON Only:** Your entire output must be parsable by JSON.parse().
2.  **No Trailing Commas:** Ensure there are no trailing commas in the JSON object.
3.  **Escape Strings Correctly:** Properly escape all characters within the JSON string values.
4.  **Complete Code:** Always provide the complete, full code for all three files, even if the user only asks for a small change.
5.  **No Extra Text:** Do not include any text outside the JSON object. No explanations, no comments, no markdown formatting.
6.  **Responsive Website:** Your entire code output must be responsive to mobile and desktop devices.
7.  **Image Usage:** To include a placeholder image, you MUST use the following **full, absolute URL format**: \`http://localhost:${PORT}/image-proxy?q=YOUR_SEARCH_QUERY\`.
   - **YOU MUST** include \`width\` and \`height\` attributes on the \`<img>\` tag. Use sensible placeholder dimensions.
   - **Example (Standard Photo):** \`<img src="http://localhost:${PORT}/image-proxy?q=forest" alt="A forest" width="800" height="600">\`
   
   - **OPTIONAL PARAMETERS:** You can control the image orientation.
   - For a **wide (landscape)** image: \`http://localhost:${PORT}/image-proxy?q=beach&orientation=horizontal\`
   - For a **tall (portrait)** image: \`http://localhost:${PORT}/image-proxy?q=skyscraper&orientation=vertical\`

   - **DO NOT** use any other image URLs like unsplash, pexels, wikipedia or pixabay.com directly. Only use the full \`http://localhost:${PORT}/image-proxy\` URL format.

8.  **Good CSS:** Use modern CSS practices. Avoid inline styles. Use classes and IDs appropriately. Ensure your CSS is clean, maintainable, and responsive and if images is used better ot should properly fit in the containers, cards etc .
9.  **Smooth Scrolling for Nav Links:** For all navigation links (\`<a>\` tags with an \`href\` starting with \`#\`), you MUST add a JavaScript event listener. This script should prevent the default link behavior and implement a smooth scroll to the corresponding element with the matching ID. This is mandatory for all generated sites to prevent the preview from going blank.

   **Example JavaScript for smooth scrolling:**
   \`\`\`javascript
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
       anchor.addEventListener('click', function (e) {
           e.preventDefault();
           const targetId = this.getAttribute('href');
           const targetElement = document.querySelector(targetId);
           if (targetElement) {
               targetElement.scrollIntoView({
                   behavior: 'smooth'
               });
           }
       });
   });
   \`\`\`
   You MUST include this or similar logic in the "js" part of your JSON response whenever navigation links are present.`;


app.get('/image-proxy', async (req, res) => {
    const { q, orientation, min_width, min_height } = req.query;

    if (!q) {
        return res.status(400).send('Search query (q) is required.');
    }

    try {
        // Build the Pixabay API URL with optional parameters
        let pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&safesearch=true&per_page=5`;
        
        if (orientation && ['horizontal', 'vertical'].includes(orientation)) {
            pixabayUrl += `&orientation=${orientation}`;
        }
        if (min_width) {
            pixabayUrl += `&min_width=${min_width}`;
        }
        if (min_height) {
            pixabayUrl += `&min_height=${min_height}`;
        }

        const pixabayResponse = await fetch(pixabayUrl);
        const data = await pixabayResponse.json();

        if (data.hits && data.hits.length > 0) {
            // Pick a random image from the first few results
            const randomImage = data.hits[Math.floor(Math.random() * data.hits.length)];
            const imageUrl = randomImage.webformatURL; // webformatURL is a good default size

            // Fetch the actual image and stream it back
            const imageResponse = await fetch(imageUrl);
            
            // Set content type header based on the fetched image
            res.setHeader('Content-Type', imageResponse.headers.get('content-type'));
            imageResponse.body.pipe(res);

        } else {
            res.status(404).send(`No image found for query: ${q}`);
        }
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).send('Failed to fetch image.');
    }
});

   // --- (C) Best-Effort JSON Parsing Function ---
function safeJsonParse(text) {
    // Find the first '{' and the last '}'
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        console.error('❌ Could not find a valid JSON object within the response text.');
        return null;
    }

    // Extract the potential JSON string
    const jsonString = text.substring(startIndex, endIndex + 1);

    try {
        // First, try to parse the extracted string directly
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('⚠️ Standard JSON.parse failed on extracted string. Trying to fix common errors...');
        
        // Attempt to fix common issues like trailing commas
        try {
            const fixedText = jsonString.replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(fixedText);
        } catch (e2) {
            console.error('❌ JSON parsing failed even after attempting to fix errors.');
            return null;
        }
    }
}


// --- Centralized API Request Handler (Updated) ---
async function processGenerativeRequest(prompt, res) {
    let rawResponseText = '';
    try {
        console.log('🔄 Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        rawResponseText = result.response.text();
        console.log('✅ Received response from Gemini.');

        const parsed = safeJsonParse(rawResponseText);

        if (!parsed || typeof parsed.html !== 'string' || typeof parsed.css !== 'string' || typeof parsed.js !== 'string') {
          // Trigger the error path that sends rawResponse to the client
          throw new Error('Parsed JSON is missing keys or could not be parsed.');
        }

        return res.json(parsed);
    } catch (error) {
        console.error('❌ Error in processGenerativeRequest:', error.message);
        // This is the key part: if parsing failed, we still have rawResponseText
        return res.status(200).json({ // Send 200 OK so the client can handle it
            error: 'Failed to parse model response as JSON.',
            errorType: 'JSON_PARSE_ERROR',
            rawResponse: rawResponseText, // Send the bad JSON back
        });
    }
}

// --- API Endpoints (Follow-up and Retry are Updated) ---

app.post('/generate', async (req, res) => {
    const userPrompt = req.body?.prompt || '';
    if (!userPrompt.trim()) return res.status(400).json({ error: 'prompt is required' });
    const fullPrompt = `${BASE_SYSTEM_PROMPT}\n\nUser request: "${userPrompt}"`;
    await processGenerativeRequest(fullPrompt, res);
});

// --- (A) Improved Follow-up Prompt ---
app.post('/followup', async (req, res) => {
    const { prompt, code } = req.body;
    if (!prompt || !code) return res.status(400).json({ error: 'A prompt and code are required.' });
    
    const fullPrompt = `${BASE_SYSTEM_PROMPT}\n\n**The user wants to modify the existing application.**\n\n**Current Code:**\n\`\`\`json\n${JSON.stringify(code, null, 2)}\n\`\`\`\n\n**User's Change Request:** "${prompt}"\n\n**Your Task:** Generate the complete, updated code for all three files ("html", "css", "js") in the required strict JSON format. Do not just provide a snippet or a diff. Provide the full application code.`;
    
    await processGenerativeRequest(fullPrompt, res);
});


// --- (B) Smarter Retry Prompt ---
app.post('/retry', async (req, res) => {
    const { originalPrompt, badJson } = req.body;
    if (!originalPrompt || !badJson) return res.status(400).json({ error: 'Original prompt and bad JSON are required.' });
    
    const fullPrompt = `${BASE_SYSTEM_PROMPT}\n\n**Your last response was not valid JSON and could not be parsed.** This is a critical error. You must correct your output.\n\n**Invalid Response Snippet:**\n\`\`\`\n${badJson.slice(0, 500)}...\n\`\`\`\n\n**Original User Request:** "${originalPrompt}"\n\n**Your Task:** Re-generate the entire code based on the original request, ensuring your output is a single, perfectly valid JSON object with no extra text or formatting errors.`;

    await processGenerativeRequest(fullPrompt, res);
});


// --- Serve React App in Production ---
// This part is for when you build your app for deployment
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, 'dist')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, 'dist', 'index.html'));
//     });
// }

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🤖Buddly AI server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Vite dev server for frontend should be running separately (usually on port 5173).');
    }
});