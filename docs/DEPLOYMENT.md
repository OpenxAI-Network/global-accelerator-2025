# 🚀 Deployment Guide for Lovable

This guide will help you deploy the Aegis AI interface on Lovable and resolve the "Preview has not been built yet" error.

## 🔧 Quick Fix for Lovable

### **Option 1: Automatic Build (Recommended)**

1. **Push your changes to GitHub**
2. **Lovable will automatically detect the new configuration**
3. **Wait for the build to complete** (usually 2-5 minutes)

### **Option 2: Manual Build Trigger**

If the automatic build doesn't work:

1. Go to your Lovable project dashboard
2. Click on "Settings" → "Build & Deploy"
3. Click "Trigger Build"
4. Wait for the build to complete

## 📁 Project Structure

```
aegis-ai-liquid-vault/
├── index.html              # Main landing page
├── ui/
│   ├── index.html         # AI Dashboard
│   ├── demo.html          # Demo page
│   ├── styles.css         # Main styles
│   ├── script.js          # Main functionality
│   ├── package.json       # UI dependencies
│   └── vite.config.js     # UI build config
├── package.json            # Main dependencies
├── vite.config.js          # Main build config
├── .lovable.json           # Lovable configuration
└── build.js               # Build script
```

## 🛠️ Build Process

The project uses **Vite** for building:

1. **Main build**: `npm run build` (builds root and UI)
2. **UI build**: `cd ui && npm run build` (builds UI separately)
3. **Output**: All files go to `dist/` directory

## 🔍 Troubleshooting

### **Error: "Preview has not been built yet"**

**Cause**: Build process failed or hasn't started
**Solution**: 
1. Check the build logs in Lovable
2. Ensure all dependencies are installed
3. Verify the build command works locally

### **Build Fails with Dependencies**

**Solution**:
```bash
# Install main dependencies
npm install

# Install UI dependencies
cd ui && npm install

# Test build locally
npm run build
```

### **File Not Found Errors**

**Solution**: Ensure all HTML files reference correct paths:
- CSS: `styles.css`
- JS: `script.js`
- Images: Use relative paths

## 🧪 Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install
cd ui && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 📱 Lovable-Specific Configuration

### **Build Settings**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **Routes**
- `/` → `index.html` (Landing page)
- `/ui` → `ui/index.html` (Dashboard)
- `/demo` → `ui/demo.html` (Demo)

### **Headers**
- Static assets cached for 1 year
- HTML files not cached (always fresh)

## 🚨 Common Issues & Solutions

### **1. Node Version Mismatch**
**Error**: "Node version not supported"
**Solution**: Ensure Node.js 18+ in Lovable settings

### **2. Build Timeout**
**Error**: "Build timed out"
**Solution**: Optimize build process, remove unnecessary dependencies

### **3. Missing Files**
**Error**: "File not found"
**Solution**: Check file paths, ensure all files are committed

### **4. Dependency Issues**
**Error**: "Module not found"
**Solution**: Clear node_modules, reinstall dependencies

## 🔄 Deployment Workflow

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Lovable detects** changes automatically
4. **Build starts** automatically
5. **Preview becomes available** after successful build
6. **Deploy to production** when ready

## 📊 Build Status

Check build status in Lovable:
- **Building**: Orange/yellow indicator
- **Success**: Green indicator
- **Failed**: Red indicator with error details

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check build logs** in Lovable dashboard
2. **Verify file structure** matches the expected layout
3. **Test build locally** using `npm run build`
4. **Check Lovable documentation** for platform-specific issues
5. **Contact support** with build logs and error details

## 🎯 Success Checklist

- [ ] All files committed to GitHub
- [ ] Dependencies properly installed
- [ ] Build command works locally
- [ ] Output directory contains all files
- [ ] Lovable build completes successfully
- [ ] Preview loads without errors

---

**Note**: The first build may take longer as Lovable sets up the environment. Subsequent builds should be faster.
