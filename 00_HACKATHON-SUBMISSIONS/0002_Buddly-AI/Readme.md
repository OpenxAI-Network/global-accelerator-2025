<p align="center">
  <img width="100" height="100" alt="Buddly AI Logo" src="https://github.com/user-attachments/assets/89a8f4e2-f8af-4a1c-863d-5e0bce7b77ad" />
</p>

<h1 align="center">Buddly AI</h1>
<p align="center"><em>Build & Edit websites by chatting with an AI 🤖⚡</em></p>

<p align="center">
  <a href="https://buddlyai.netlify.app"><strong>🌐 Live Demo →</strong></a>
</p>


# 🌟 Buddly AI — From Prompt to Prototype in Seconds

**Buddly AI** is a modern, web-based development environment that bridges the gap between idea and execution. Powered by AI, this intelligent assistant enables you to build, preview, and iterate on full web applications with just a natural language prompt.

🔥 [Live Demo](https://buddlyai.netlify.app/)

---

## Youtube Demo

🔥 [Live Demo](https://youtu.be/8_ge6l-V088)


## 📸 Screenshots
<img width="1360" height="530" alt="image" src="https://github.com/user-attachments/assets/e57e0d31-8132-4b53-a63a-07c86f6ca482" />



## ✨ Features

- 🤖 **AI-Powered Code Generation**  
  Write a simple prompt like _“Build a portfolio website with 3 sections”_ and Buddly AI will generate fully structured HTML, CSS, and JavaScript code.

- 💬 **Conversational Follow-ups**  
  Not satisfied with the first draft? Just say _“Change the background to dark blue”_ or _“Add a contact form”_ and the AI will modify your existing code intelligently.

- ⚡ **Live Preview Panel**  
  See the generated website instantly inside a sandboxed `<iframe>` without refreshing or switching windows.

- 📝 **Rich In-Browser Code Editing**  
  Tweak your generated code directly in the browser with beautiful syntax highlighting, powered by **CodeMirror**.

- 💾 **Persistent Chat & Project History**  
  All your prompts and generated sites are saved in your browser’s local storage. Access any previous project from the side history panel.

- 📱 **Fully Responsive UI**  
  The Buddly AI interface is designed to look and work great across desktops, tablets, and mobile devices.

- ⬇️ **Download Your Project**  
  Get your generated HTML, CSS, and JS files as a downloadable `.zip` archive.

- ⚙️ **Resilient Prompt Engineering**  
  The backend has advanced system prompts that force clean, parsable JSON and handle errors gracefully — even when Gemini gets quirky.

---

## 🗺️ Roadmap

- 🔐 User authentication & accounts
- ☁️ Cloud-based project storage via MongoDB or Firebase
- 🚀 One-click deployment to platforms like Vercel or Netlify
- 🌐 Shareable URLs for generated websites
- ⚛️ Support for frameworks like **React**, **Vue**, and **Svelte**

---

## 🚀 Live Demo

🔗 **Try Buddly AI Now →** [https://buddlyai.netlify.app](https://buddlyai.netlify.app)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ashish-Patnaik/Buddly-AI.git
cd Buddly-AI
```

### 2. Install Dependencies
```
npm install
```
### 3. Set up ollama
```
ollama run llama3
```
### Set up which model to run in server.js 


### 🧪 Running the Application
This project runs two servers: one for the backend API and another for the frontend UI.

▶️ Start the Backend API Server (Terminal 1)
```
npm run server
```
You should see:
```
🤖 Buddly AI API server running on http://localhost:3001
```

🧭 Start the Frontend Vite Server (Terminal 2)
```
npm run dev
```
Open your browser at:
```
http://localhost:5173
```

## 🔧 Available Scripts
Script	Description
```
npm run dev	Starts the Vite development server
npm run server	Starts the Node.js/Express backend API
npm run build	Builds the frontend app for production
npm run preview	Previews the production build locally
```

## 📁 Tech Stack
1. Frontend: Vite + Vanilla JS + CodeMirror

2. Backend: Node.js + Express

3. AI: Google Gemini (via @google/generative-ai)

4. Images: Pixabay API with secure proxying

5. State: LocalStorage (for history and state persistence)


## ✨ Inspiration
Inspired by the idea that coding should feel magical, Buddly AI gives creators a tool where imagination meets real-time execution — all without leaving the browser.

Built with ❤️ by Ashish Patnaik
---
