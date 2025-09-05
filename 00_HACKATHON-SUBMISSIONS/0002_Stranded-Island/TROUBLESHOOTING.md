# 🔧 Troubleshooting Guide - Stranded Island Adventure

## 🚨 Common Issues & Solutions

### **1. Webpack Module Error (Cannot find module './447.js')**

**Symptoms:**
- Runtime error: "Cannot find module './447.js'"
- Webpack compilation failures
- Stale build cache issues

**Solution:**
```bash
# Navigate to the app directory
cd nextjs-app

# Clean build cache
rm -rf .next
rm -rf node_modules/.cache

# Restart development server
npm run dev
```

---

### **1b. Missing .next Files (ENOENT Error)**

**Symptoms:**
- Runtime error: "ENOENT: no such file or directory, open '.next/server/pages/_document.js'"
- Missing build files
- Incomplete Next.js build

**Solution:**
```bash
# Navigate to the app directory
cd nextjs-app

# Complete cleanup and rebuild
rm -rf .next
rm -rf node_modules
rm package-lock.json

# Fresh installation
npm install --legacy-peer-deps

# Rebuild application
npm run build

# Start development server
npm run dev
```

**Quick Fix Script:**
```bash
# Use the comprehensive fix script
./fix-complete.sh
```

**Why This Happens:**
- Stale webpack chunks from previous builds
- Cache conflicts between different development sessions
- File system changes not properly reflected in build

**Prevention:**
- Always restart dev server after major file changes
- Use `Ctrl+C` to properly stop the dev server
- Clear cache when switching between branches

---

### **2. Dependency Installation Issues**

**Symptoms:**
- `npm install` fails with peer dependency warnings
- React version conflicts
- Build errors related to missing packages

**Solution:**
```bash
# Use legacy peer deps (required for this project)
npm install --legacy-peer-deps

# If that fails, try clearing npm cache
npm cache clean --force
npm install --legacy-peer-deps
```

**Why This Happens:**
- React 19 compatibility issues with some packages
- Peer dependency conflicts in Next.js 15
- Package lock file inconsistencies

---

### **3. Ollama Connection Issues**

**Symptoms:**
- API errors when trying to chat
- "Failed to get response" messages
- Ollama service not responding

**Solution:**
```bash
# Check if Ollama is running
ollama list

# If not running, start Ollama
ollama serve

# Verify model is available
ollama list | grep "llama3.2:1b"

# If model missing, download it
ollama pull llama3.2:1b
```

**Why This Happens:**
- Ollama service stopped
- Required model not downloaded
- Port conflicts or firewall issues

---

### **4. TypeScript Compilation Errors**

**Symptoms:**
- Type checking fails
- Build errors related to types
- Component prop type mismatches

**Solution:**
```bash
# Check for type errors
npm run typecheck

# Fix any type issues in components
# Common fixes:
# - Add missing 'type' property to Message interface
# - Ensure proper prop types for components
# - Check interface definitions match usage
```

**Why This Happens:**
- Missing type definitions
- Interface mismatches
- Incorrect prop types

---

### **5. Development Server Won't Start**

**Symptoms:**
- `npm run dev` fails
- Port 3000 already in use
- Server crashes on startup

**Solution:**
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill process using port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev

# Check for syntax errors
npm run typecheck
npm run build
```

**Why This Happens:**
- Previous dev server still running
- Port conflicts with other services
- Syntax errors preventing startup

---

### **6. Story Not Progressing (Fixed)**

**Symptoms:**
- AI keeps repeating opening scene
- Story stuck in infinite loop
- No milestone progression

**Solution:**
✅ **This issue has been fixed!** The story progression system now:
- Tracks milestones properly (1-5)
- Prevents repetitive opening scenes
- Ensures each choice moves story forward
- Provides contextual AI responses

**If you still experience issues:**
```bash
# Test story progression
./test-story-progression.sh

# Check API endpoint
./test-api.sh

# Verify Ollama is working
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","storyState":{"currentMilestone":1}}'
```

---

## 🛠️ Quick Fix Commands

### **Reset Everything (Nuclear Option)**
```bash
cd nextjs-app
rm -rf .next
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### **Quick Fix Scripts**
```bash
# Fix webpack errors only
./fix-webpack.sh

# Fix all issues (recommended)
./fix-complete.sh
```

### **Clean Build**
```bash
cd nextjs-app
npm run build
npm start
```

### **Check System Status**
```bash
# Node.js version
node -v

# Ollama status
ollama list

# Port usage
lsof -ti:3000

# Process status
ps aux | grep "next"
```

---

## 🔍 Debug Mode

### **Enable Verbose Logging**
```bash
# Set debug environment variable
DEBUG=* npm run dev

# Or use Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev
```

### **Check Console Logs**
- Browser Developer Tools → Console
- Terminal where `npm run dev` is running
- Network tab for API calls

### **Common Error Patterns**
- **Module not found**: Clear `.next` cache
- **Port in use**: Kill conflicting processes
- **Type errors**: Run `npm run typecheck`
- **Ollama errors**: Verify service and model

---

## 📱 Platform-Specific Issues

### **macOS**
```bash
# Kill processes by port
lsof -ti:3000 | xargs kill -9

# Check Ollama installation
which ollama
ollama --version
```

### **Windows**
```cmd
# Kill processes by port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Check Ollama
ollama --version
ollama list
```

### **Linux**
```bash
# Kill processes by port
fuser -k 3000/tcp

# Check Ollama
systemctl status ollama
ollama list
```

---

## 🚀 Performance Optimization

### **Development Mode**
```bash
# Fast refresh (default)
npm run dev

# Disable fast refresh if issues
FAST_REFRESH=false npm run dev
```

### **Production Mode**
```bash
# Build and start
npm run build
npm start

# Or use preview
npm run preview
```

---

## 📞 Getting Help

### **1. Check This Guide First**
- Most issues are covered above
- Follow solutions step by step

### **2. Verify Prerequisites**
- Node.js 18.17+
- Ollama installed and running
- `llama3.2:1b` model downloaded

### **3. Test Components**
```bash
# Test API
./test-api.sh

# Test story progression
./test-story-progression.sh

# Check types
npm run typecheck
```

### **4. Common Solutions**
- **Clear cache**: Remove `.next` folder
- **Restart services**: Stop and restart dev server
- **Check dependencies**: Use `--legacy-peer-deps`
- **Verify Ollama**: Ensure service is running

---

## 🎯 Prevention Tips

### **Best Practices**
1. **Always use `Ctrl+C`** to stop dev server
2. **Clear cache** after major changes
3. **Check types** before building
4. **Verify Ollama** before starting
5. **Use start scripts** for consistent setup

### **Regular Maintenance**
```bash
# Weekly cleanup
cd nextjs-app
rm -rf .next
npm run typecheck
npm run build
```

---

## 🏆 Success Indicators

### **Working System Shows:**
- ✅ Development server starts without errors
- ✅ Browser loads `http://localhost:3000`
- ✅ Story progresses through milestones
- ✅ AI responds to choices
- ✅ No repetitive opening scenes
- ✅ Complete story arc achievable

### **If You See These, You're Good:**
- 🚀 "Ready - started server on 0.0.0.0:3000"
- 🏝️ Stranded Island Adventure loads in browser
- 📖 Story progresses with each choice
- 🎯 Milestones advance (1/5 → 2/5 → 3/5...)
- 🏁 Ending reached in 5-6 choices

---

**Need more help?** Check the error messages carefully and follow the solutions above. Most issues can be resolved with cache clearing and service restarting.
