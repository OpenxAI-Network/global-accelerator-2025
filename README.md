Of course. Here is a detailed GitHub README for the CollabGraph project, incorporating its integration with the environmental impact engine.

---

# CollabGraph 🌐➡️🌍

**Map the Ecosystem of Innovation & Its Impact on the Planet**

CollabGraph is an AI-powered network visualization platform that transforms how we see collaboration in tech ecosystems. By mapping the hidden connections between people, projects, and technologies, it not only reveals the structure of innovation but also quantifies its real-world environmental impact using a powerful simulation engine.

![CollabGraph Screenshot](https://via.placeholder.com/800x400/3D3D3D/FFFFFF?text=CollabGraph+Network+Visualization+with+Impact+Metrics)
*Visualize your hackathon's network and its collective environmental footprint.*

## 🚀 Features

- **Dynamic Network Graphs:** Interactive, real-time visualization of collaborators, projects, and technologies using a force-directed graph.
- **AI-Powered Analysis:** Leverages community detection algorithms to identify clusters, key influencers, and potential collaboration opportunities.
- **Environmental Impact Integration:** Every project and collaboration is run through an environmental impact engine (powered by a modified Dead-Earth AI) to calculate its CO₂, toxicity, and ecosystem health metrics.
- **Impact Scoring:** Nodes are color-coded based on their environmental impact score, allowing users to instantly identify sustainable projects.
- **Collaboration Simulator:** Model the potential environmental outcome of a collaboration between selected users or projects before they even meet.
- **Advanced Filtering:** Use the "Impact Lens" to filter the entire graph to show only positive-impact projects or specific technology stacks.

## 🧠 The Problem It Solves

Hackathons and innovation ecosystems are fragmented, making it difficult for participants to find the right collaborators, mentors, or projects. This disconnection slows innovation and hides the environmental impact of collective action. CollabGraph solves this by mapping these hidden connections and quantifying their real-world sustainability effects, turning abstract networks into a force for planetary good.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Graph Visualization:** React Flow, D3.js
- **3D Globe:** Three.js / React Three Fiber (for impact simulation view)
- **Backend API:** Next.js API Routes, Python (for AI analysis)
- **AI Model:** Ollama (deepseek-r1:8b) for natural language processing and impact simulation
- **Database:** Neo4j (Graph Database)
- **Deployment:** Vercel / AWS

## 📦 Installation

To run CollabGraph locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/collabgraph.git
    cd collabgraph
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your configuration:
    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret_here
    NEO4J_URI=your_neo4j_connection_uri
    NEO4J_USERNAME=neo4j
    NEO4J_PASSWORD=your_password_here
    OLLAMA_API_HOST=http://localhost:11434
    ```

4.  **Set up Ollama (for AI features):**
    ```bash
    # Install Ollama
    curl -fsSL https://ollama.ai/install.sh | sh

    # Pull the required model
    ollama pull deepseek-r1:8b
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

1.  **Explore the Graph:** Upon loading the app, you will see a global graph of all participants and projects. Drag nodes to explore and use the search bar to find specific people or technologies.
2.  **Apply the Impact Lens:** Use the filter panel on the left to toggle the "Impact Lens." This will recolor the graph, highlighting projects and people with a positive environmental impact in green.
3.  **Simulate Collaboration:** Select 2-3 nodes on the graph and click the "Simulate Collaboration" button. The AI will generate a description of a potential joint project and run it through the environmental impact engine, showing you a projected outcome.
4.  **Add Your Project:** Connect your hackathon profile to add your project. Write a description, and the AI will automatically calculate its initial environmental impact score and add you to the graph.

## 📁 Project Structure

```
collabgraph/
├── app/
│   ├── api/
│   │   ├── impact/                 # Environmental impact calculation API
│   │   ├── graph/                  # Neo4j graph data queries
│   │   └── simulation/             # Collaboration simulation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── graph/                      # React Flow graph components
│   ├── impact/                     # Impact scoring and globe components
│   ├── ui/                         # Shadcn/ui components
│   └── simulator/                  # Collaboration simulator modal
├── lib/
│   ├── neo4j.ts                    # Database connection client
│   ├── ollama.ts                   # AI model client
│   └── utils.ts
├── types/                          # TypeScript type definitions
└── public/
```

## 🔮 API Reference

### Calculate Project Impact
`POST /api/impact`

**Body:**
```json
{
  "description": "A project deploying IoT sensors for smart grid optimization"
}
```

**Response:**
```json
{
  "co2_impact": -12000,
  "air_toxicity_impact": -5,
  "ecosystem_health": 2.1
}
```

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report bugs, and suggest new features.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built initially for the **OpenxAI Hack Node USA** hackathon.
- Environmental impact calculations powered by a modified version of the **Dead-Earth Project** simulation engine.
- Visualizations inspired by React Flow and D3.js documentation.

---

**CollabGraph** - Making the invisible connections of innovation visible, and their impact on our planet undeniable.
