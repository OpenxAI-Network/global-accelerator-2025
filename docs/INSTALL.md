# AEGIS AI Liquid Vault - Installation Guide

## Prerequisites

You need Node.js version 18 or higher to run this project.

## Installing Node.js on Windows

### Option 1: Download from Official Website (Recommended)
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (recommended for most users)
3. Run the installer and follow the setup wizard
4. Make sure to check "Add to PATH" during installation

### Option 2: Using Chocolatey (if you have it installed)
```powershell
choco install nodejs
```

### Option 3: Using Winget (Windows 10/11)
```powershell
winget install OpenJS.NodeJS
```

## Verifying Installation

After installation, open a new PowerShell window and run:
```powershell
node --version
npm --version
```

You should see version numbers displayed.

## Installing Project Dependencies

Once Node.js is installed, navigate to your project directory and run:
```powershell
npm install
```

## Running the Project

### Development Mode
```powershell
npm run dev
```

### Build for Production
```powershell
npm run build
```

### Preview Production Build
```powershell
npm run preview
```

## Troubleshooting

### If npm is not recognized:
- Close and reopen PowerShell
- Make sure Node.js was added to PATH during installation
- Try running PowerShell as Administrator

### If you get permission errors:
- Run PowerShell as Administrator
- Check your Windows security settings

### If you get network errors during npm install:
- Check your internet connection
- Try using a different DNS server
- Check if your firewall is blocking npm

## Project Structure

- `src/` - React frontend source code
- `contracts/` - Smart contract source code
- `docs/` - Documentation
- `scripts/` - Deployment and utility scripts

## Next Steps

After getting the project running:
1. Check out the smart contracts in the `contracts/` directory
2. Explore the React frontend in `src/`
3. Review the documentation in `docs/`
4. Run tests with `npm test` (once dependencies are installed) 