@echo off
chcp 65001 >nul
echo 🏝️ Welcome to Stranded Island Adventure! 🏝️
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18.17+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node -v

REM Check if Ollama is installed
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Ollama is not installed. Please install Ollama first.
    echo    Visit: https://ollama.ai/
    pause
    exit /b 1
)

echo ✅ Ollama is installed

REM Check if Ollama is running and model is available
ollama list >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔄 Starting Ollama service...
    start /b ollama serve
    timeout /t 5 /nobreak >nul
)

ollama list | findstr "llama3.2:1b" >nul 2>nul
if %errorlevel% neq 0 (
    echo 📥 Downloading required Ollama model (llama3.2:1b)...
    echo    This may take a few minutes depending on your internet connection.
    ollama pull llama3.2:1b
)

echo ✅ Required model is available

REM Navigate to the app directory
cd nextjs-app

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies (this may take a moment)...
    npm install --legacy-peer-deps
)

echo ✅ Dependencies are installed
echo.
echo 🚀 Starting the adventure game...
echo    The game will open in your browser at: http://localhost:3000
echo.
echo    Press Ctrl+C to stop the game when you're done playing.
echo.

REM Start the development server
npm run dev

pause
