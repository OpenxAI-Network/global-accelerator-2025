# 🛠️ Fix Scripts Guide - Stranded Island Adventure

## 📋 Available Fix Scripts

This project includes several automated fix scripts to resolve common development issues quickly and efficiently.

---

## 🔧 **fix-webpack.sh** - Webpack Module Errors

**Purpose**: Fixes webpack module errors like "Cannot find module './447.js'"

**What it does**:
- Clears `.next` build cache
- Removes `node_modules/.cache`
- Restarts development server

**When to use**:
- Webpack compilation errors
- Stale build cache issues
- Module not found errors

**Usage**:
```bash
./fix-webpack.sh
```

---

## 🚀 **fix-complete.sh** - Complete System Reset

**Purpose**: Comprehensive fix for all common Next.js issues

**What it does**:
- Stops all running processes
- Removes all build artifacts (`.next`, `node_modules`, `.swc`)
- Deletes `package-lock.json`
- Fresh dependency installation
- TypeScript compilation check
- Full application rebuild
- Development server restart
- System testing

**When to use**:
- Missing `.next` files (ENOENT errors)
- Build corruption
- Dependency conflicts
- Multiple issues at once
- **Recommended for most problems**

**Usage**:
```bash
./fix-complete.sh
```

---

## 🧪 **test-api.sh** - API Endpoint Testing

**Purpose**: Tests if the chat API endpoint is working correctly

**What it does**:
- Checks if app is running
- Tests API endpoint with sample data
- Provides troubleshooting steps if API fails

**When to use**:
- Verify API functionality
- Debug chat issues
- Test after fixes

**Usage**:
```bash
./test-api.sh
```

---

## 📖 **test-story-progression.sh** - Story System Testing

**Purpose**: Tests the complete story progression system

**What it does**:
- Tests milestone transitions (1→2→3→4→5)
- Verifies story progression works
- Checks AI responses at each phase

**When to use**:
- Verify story progression fixes
- Test milestone system
- Debug narrative issues

**Usage**:
```bash
./test-story-progression.sh
```

---

## 🔍 **status-check.sh** - System Health Check

**Purpose**: Comprehensive system status verification

**What it does**:
- Checks Node.js and npm versions
- Verifies Ollama installation and status
- Tests project dependencies
- Validates TypeScript compilation
- Confirms build process
- Tests development server
- Verifies API functionality
- Provides status summary

**When to use**:
- Initial setup verification
- After applying fixes
- Regular system health checks
- Debugging complex issues

**Usage**:
```bash
./status-check.sh
```

---

## 🚀 **start.sh** - Automated Startup

**Purpose**: Automated project startup with dependency verification

**What it does**:
- Checks Node.js version
- Verifies Ollama installation
- Downloads required model if missing
- Installs dependencies
- Starts development server

**When to use**:
- First-time setup
- After system changes
- Regular development startup

**Usage**:
```bash
./start.sh
```

---

## 🎯 **When to Use Which Script**

### **Quick Fixes**
```bash
# Webpack errors only
./fix-webpack.sh

# Most common issues
./fix-complete.sh
```

### **Testing & Verification**
```bash
# Check system health
./status-check.sh

# Test API functionality
./test-api.sh

# Verify story progression
./test-story-progression.sh
```

### **Setup & Startup**
```bash
# First time or after changes
./start.sh

# Windows users
start.bat
```

---

## 🔄 **Fix Workflow**

### **1. Quick Assessment**
```bash
./status-check.sh
```

### **2. Apply Appropriate Fix**
```bash
# For webpack errors
./fix-webpack.sh

# For most issues (recommended)
./fix-complete.sh
```

### **3. Verify Fix**
```bash
./status-check.sh
```

### **4. Test Functionality**
```bash
./test-api.sh
./test-story-progression.sh
```

---

## 🚨 **Common Error Patterns & Solutions**

### **Error: "Cannot find module './447.js'"**
```bash
./fix-webpack.sh
```

### **Error: "ENOENT: no such file or directory, open '.next/server/pages/_document.js'"**
```bash
./fix-complete.sh
```

### **Error: "Failed to get response"**
```bash
# Check Ollama status
ollama list

# If not running
ollama serve

# Test API
./test-api.sh
```

### **Error: "Story not progressing"**
```bash
# Test story system
./test-story-progression.sh

# Check API responses
./test-api.sh
```

---

## 🛡️ **Prevention Tips**

### **Best Practices**
1. **Always use `Ctrl+C`** to stop dev server
2. **Run `./status-check.sh`** regularly
3. **Use `./fix-complete.sh`** for major issues
4. **Keep Ollama running** during development
5. **Clear cache** after major changes

### **Regular Maintenance**
```bash
# Weekly health check
./status-check.sh

# Clear cache if needed
./fix-webpack.sh

# Full reset if issues persist
./fix-complete.sh
```

---

## 📚 **Additional Resources**

### **Documentation**
- **`TROUBLESHOOTING.md`**: Detailed troubleshooting guide
- **`README.md`**: Project overview and setup
- **`PROJECT_SUMMARY.md`**: Technical implementation details
- **`STORY_PROGRESSION_FIX.md`**: Story system fixes

### **Manual Commands**
```bash
# Clear cache manually
cd nextjs-app
rm -rf .next
rm -rf node_modules/.cache

# Fresh install
npm install --legacy-peer-deps

# Rebuild
npm run build

# Start server
npm run dev
```

---

## 🎉 **Success Indicators**

### **All Scripts Working**
- ✅ Development server starts without errors
- ✅ API endpoint responds correctly
- ✅ Story progresses through milestones
- ✅ No webpack or ENOENT errors
- ✅ Complete adventure experience

### **If Issues Persist**
1. **Run `./status-check.sh`** for diagnosis
2. **Use `./fix-complete.sh`** for comprehensive fix
3. **Check `TROUBLESHOOTING.md`** for detailed solutions
4. **Verify Ollama** is running and model is available

---

## 🚀 **Quick Start Commands**

```bash
# Check everything is working
./status-check.sh

# If issues found, fix them
./fix-complete.sh

# Start the adventure
./start.sh

# Open browser to http://localhost:3000
```

---

**These scripts make troubleshooting quick and easy!** 🛠️✨

Most issues can be resolved with `./fix-complete.sh`, and `./status-check.sh` will tell you exactly what's working and what needs attention.
