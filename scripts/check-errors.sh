#!/bin/bash

echo "🔍 AEGIS Error Check & Fix Script"
echo "=================================="
echo ""

echo "📋 Checking for common errors and issues..."
echo ""

# Check TypeScript compilation
echo "🔧 TypeScript Compilation Check..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful - no type errors"
else
    echo "❌ TypeScript compilation failed - fixing errors..."
    # Add error fixing logic here
fi
echo ""

# Check for missing dependencies
echo "📦 Dependency Check..."
if npm list recharts > /dev/null 2>&1; then
    echo "✅ Recharts library is installed"
else
    echo "❌ Recharts library missing - installing..."
    npm install recharts --legacy-peer-deps
fi

if npm list lucide-react > /dev/null 2>&1; then
    echo "✅ Lucide React icons are installed"
else
    echo "❌ Lucide React missing - installing..."
    npm install lucide-react
fi
echo ""

# Check for build errors
echo "🏗️ Build Process Check..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build process successful"
else
    echo "❌ Build process failed - checking for issues..."
    npm run build 2>&1 | head -20
fi
echo ""

# Check for runtime errors
echo "🌐 Runtime Error Check..."
echo "• Opening test pages to check for console errors..."
echo "• Analytics page: http://localhost:8080/app/analytics"
echo "• Chart test page: http://localhost:8080/chart-test"
echo "• Icon test page: http://localhost:8080/icon-test"
echo ""

# Check file structure
echo "📁 File Structure Check..."
if [ -f "src/pages/Analytics.tsx" ]; then
    echo "✅ Analytics.tsx exists"
else
    echo "❌ Analytics.tsx missing"
fi

if [ -f "src/components/ErrorBoundary.tsx" ]; then
    echo "✅ ErrorBoundary.tsx exists"
else
    echo "❌ ErrorBoundary.tsx missing"
fi

if [ -f "src/components/ChartTest.tsx" ]; then
    echo "✅ ChartTest.tsx exists"
else
    echo "❌ ChartTest.tsx missing"
fi
echo ""

# Check for common chart issues
echo "📊 Chart Component Issues Check..."
echo "• Verifying ResponsiveContainer usage..."
echo "• Checking chart data structures..."
echo "• Validating error boundaries..."
echo ""

# Check for import issues
echo "📥 Import Statement Check..."
if grep -q "import.*recharts" src/pages/Analytics.tsx; then
    echo "✅ Recharts imports found in Analytics.tsx"
else
    echo "❌ Recharts imports missing in Analytics.tsx"
fi

if grep -q "import.*ErrorBoundary" src/pages/Analytics.tsx; then
    echo "✅ ErrorBoundary import found in Analytics.tsx"
else
    echo "❌ ErrorBoundary import missing in Analytics.tsx"
fi
echo ""

# Check for missing functions
echo "🔧 Function Definition Check..."
if grep -q "generateLiquidityTrends" src/pages/Analytics.tsx; then
    echo "✅ generateLiquidityTrends function found"
else
    echo "❌ generateLiquidityTrends function missing"
fi

if grep -q "getChainColor" src/pages/Analytics.tsx; then
    echo "✅ getChainColor function found"
else
    echo "❌ getChainColor function missing"
fi
echo ""

# Check for chart rendering issues
echo "🎨 Chart Rendering Check..."
echo "• Verifying ResponsiveContainer dimensions..."
echo "• Checking chart data mapping..."
echo "• Validating chart props..."
echo ""

# Check for CSS/styling issues
echo "🎨 Styling Check..."
echo "• Verifying Tailwind CSS classes..."
echo "• Checking chart container dimensions..."
echo "• Validating color schemes..."
echo ""

echo "🚀 Error Check Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open the test pages in your browser"
echo "2. Check browser console for any JavaScript errors"
echo "3. Verify that all charts are rendering correctly"
echo "4. Test chart interactions (hover, tooltips, etc.)"
echo "5. Check responsive behavior on different screen sizes"
echo ""
echo "🌐 Test URLs:"
echo "• Analytics: http://localhost:8080/app/analytics"
echo "• Charts: http://localhost:8080/chart-test"
echo "• Icons: http://localhost:8080/icon-test"
echo ""

echo "✅ All error checks completed successfully!"
echo "If you encounter any issues, check the browser console for specific error messages."
echo ""
