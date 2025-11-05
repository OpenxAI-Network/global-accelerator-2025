# Campus Marketplace

A student-focused buy-and-sell marketplace with AI-powered content moderation, built for the OpenxAI Global Accelerator 2025 Hackathon.

---

## 🚀 Demo & Walkthrough

*   **Demo Video:** [Watch the 90-second walkthrough](https://youtu.be/hVszWvd1E-U) (coming soon)

---

## ✨ Features

-   **School-based Marketplace**: Students can buy and sell items exclusively within their verified university community.
-   **AI Content Moderation**: Ollama-powered moderation to prevent inappropriate or illegal listings in real-time.
-   **Secure Authentication**: End-to-end user authentication including signup, login, and a secure forgot-password flow.
-   **Dynamic Filtering & Search**: Browse by category, or search for specific items.
-   **User Profiles**: School-verified user profiles with options for customization.
-   **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS and Framer Motion.

---

## 🏁 Getting Started

We offer two ways to run this project. The Docker method is recommended for a full-stack experience.

### Option A: Run with Docker (Recommended)

This method starts the Next.js frontend, the backend `auth-service`, and a PostgreSQL database.

**Prerequisites:**
*   Docker and Docker Compose installed.
*   Ollama server running (e.g., `ollama serve` in a separate terminal).

**Steps:**

1.  **Clone the repository.**

2.  **Start the services:**
    ```bash
    docker compose up --build
    ```

3.  **Access the application** at [http://localhost:3000](http://localhost:3000).

### Option B: Run Frontend Only (Mocked Backend)

This method runs the Next.js frontend in isolation. Core backend functionality like authentication is **mocked**, allowing for UI/UX testing without needing a database or backend services.

**Prerequisites:**
*   Node.js 18+

**Steps:**

1.  **Navigate to the frontend app directory:**
    ```bash
    cd nextjs-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: If you encounter a `Cannot read properties of undefined (reading 'spec')` error, this indicates a problem with the local npm environment. The Docker-based setup is recommended to avoid this.* 

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the application** at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion
-   **Backend**: Node.js, Express, PostgreSQL
-   **Containerization**: Docker
-   **AI Moderation**: Ollama with Llama 3.2 model
-   **UI**: ShadCN, Lucide React

---

## 🧪 Testing

This project is set up with Jest for unit tests and Playwright for End-to-End (E2E) tests.

-   **Run Unit Tests:**
    ```bash
    cd nextjs-app
    npm test
    ```

-   **Run E2E Tests:**
    ```bash
    cd nextjs-app
    npx playwright test
    ```

---

## ⚙️ Environment Variables

When running with Docker Compose, the necessary environment variables for the `auth-service` are sourced from the `docker-compose.yml` file.

For local development or custom deployments *without* Docker Compose, the `auth-service` requires a `.env` file in `services/auth-service/.env` with the following variables:

```
# PostgreSQL connection string
DATABASE_URL=postgresql://admin:password123@localhost:5432/marketplace

# JWT secret for signing tokens
JWT_SECRET=a-very-secret-key

# Port for the auth-service
PORT=3001
```

---

## License

MIT License - Built for the OpenxAI Global Accelerator 2025 Hackathon.