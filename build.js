#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Aegis AI for deployment...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
}

try {
    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync('node_modules')) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
    }
    
    // Install UI dependencies
    if (!fs.existsSync('ui/node_modules')) {
        console.log('📦 Installing UI dependencies...');
        execSync('cd ui && npm install', { stdio: 'inherit' });
    }
    
    // Build the project
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Build UI separately
    console.log('🔨 Building UI...');
    execSync('cd ui && npm run build', { stdio: 'inherit' });
    
    // Copy UI build to main dist
    if (fs.existsSync('ui/dist')) {
        console.log('📁 Copying UI build to main dist...');
        if (!fs.existsSync('dist/ui')) {
            fs.mkdirSync('dist/ui', { recursive: true });
        }
        
        // Copy UI files
        const copyRecursive = (src, dest) => {
            if (fs.statSync(src).isDirectory()) {
                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest, { recursive: true });
                }
                fs.readdirSync(src).forEach(file => {
                    copyRecursive(path.join(src, file), path.join(dest, file));
                });
            } else {
                fs.copyFileSync(src, dest);
            }
        };
        
        copyRecursive('ui/dist', 'dist/ui');
    }
    
    console.log('\n✅ Build completed successfully!');
    console.log('📁 Output directory: dist/');
    console.log('🌐 Main page: dist/index.html');
    console.log('🎨 UI Dashboard: dist/ui/index.html');
    console.log('🎮 UI Demo: dist/ui/demo.html');
    
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
}
