# AEGIS AI Liquid Vault - Node.js Installation Script
# Run this script as Administrator for best results

Write-Host "AEGIS AI Liquid Vault - Node.js Installation Helper" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is already installed
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Host "✅ Node.js is already installed!" -ForegroundColor Green
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
        Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
        Write-Host ""
        
        # Check if we're in the right directory
        if (Test-Path "package.json") {
            Write-Host "✅ Found package.json - installing dependencies..." -ForegroundColor Green
            npm install
            Write-Host ""
            Write-Host "🎉 Project setup complete!" -ForegroundColor Green
            Write-Host "Run 'npm run dev' to start the development server" -ForegroundColor Yellow
        } else {
            Write-Host "❌ package.json not found. Make sure you're in the project directory." -ForegroundColor Red
        }
        exit 0
    }
} catch {
    # Node.js not installed, continue with installation
}

Write-Host "❌ Node.js is not installed. Let's install it!" -ForegroundColor Yellow
Write-Host ""

# Check if winget is available
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "📦 Installing Node.js using winget..." -ForegroundColor Cyan
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    
    try {
        winget install OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
        Write-Host "✅ Node.js installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install with winget. Trying alternative method..." -ForegroundColor Red
    }
} else {
    Write-Host "❌ winget not available. Please install Node.js manually:" -ForegroundColor Red
    Write-Host "1. Go to https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Download the LTS version" -ForegroundColor Yellow
    Write-Host "3. Run the installer" -ForegroundColor Yellow
    Write-Host "4. Make sure to check 'Add to PATH'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation, close and reopen PowerShell, then run this script again." -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🔄 Please close and reopen PowerShell, then run this script again to verify installation." -ForegroundColor Yellow
Write-Host "This ensures the PATH is updated with Node.js." -ForegroundColor Cyan 