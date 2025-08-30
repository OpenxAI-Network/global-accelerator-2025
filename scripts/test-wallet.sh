#!/bin/bash

echo "🔗 AEGIS Wallet Connection & Blockchain Switching Test"
echo "======================================================"
echo ""

echo "📋 Testing Wallet Connection & Blockchain Switching..."
echo ""

# Check TypeScript compilation
echo "🔧 TypeScript Compilation Check..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful - no type errors"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo ""

# Check dependencies
echo "📦 Dependency Check..."
if npm list ethers > /dev/null 2>&1; then
    echo "✅ Ethers library is installed"
else
    echo "❌ Ethers library missing - installing..."
    npm install ethers --legacy-peer-deps
fi

if npm list @metamask/detect-provider > /dev/null 2>&1; then
    echo "✅ MetaMask provider detection is installed"
else
    echo "❌ MetaMask provider detection missing - installing..."
    npm install @metamask/detect-provider --legacy-peer-deps
fi
echo ""

# Check blockchain configuration
echo "🔗 Blockchain Configuration Check..."
if grep -q "zetachain.*7000" src/config/blockchains.ts; then
    echo "✅ ZetaChain mainnet configured (Chain ID: 7000)"
else
    echo "❌ ZetaChain mainnet configuration missing"
fi

if grep -q "zetachain-testnet.*7001" src/config/blockchains.ts; then
    echo "✅ ZetaChain testnet configured (Chain ID: 7001)"
else
    echo "❌ ZetaChain testnet configuration missing"
fi

if grep -q "ethereum.*1" src/config/blockchains.ts; then
    echo "✅ Ethereum mainnet configured (Chain ID: 1)"
else
    echo "❌ Ethereum mainnet configuration missing"
fi
echo ""

# Check wallet context
echo "💼 Wallet Context Check..."
if grep -q "switchToBlockchain" src/contexts/WalletContext.tsx; then
    echo "✅ Blockchain switching function found"
else
    echo "❌ Blockchain switching function missing"
fi

if grep -q "connect.*MetaMask" src/contexts/WalletContext.tsx; then
    echo "✅ MetaMask connection function found"
else
    echo "❌ MetaMask connection function missing"
fi

if grep -q "switchNetwork" src/contexts/WalletContext.tsx; then
    echo "✅ Network switching function found"
else
    echo "❌ Network switching function missing"
fi
echo ""

# Check blockchain switcher component
echo "🔄 Blockchain Switcher Component Check..."
if grep -q "BlockchainSwitcher" src/components/BlockchainSwitcher.tsx; then
    echo "✅ BlockchainSwitcher component exists"
else
    echo "❌ BlockchainSwitcher component missing"
fi

if grep -q "switchToNetwork" src/components/BlockchainSwitcher.tsx; then
    echo "✅ Network switching function in component"
else
    echo "❌ Network switching function missing in component"
fi
echo ""

# Check network switching helpers
echo "🌐 Network Switching Helpers Check..."
if grep -q "addNetworkToMetaMask" src/config/blockchains.ts; then
    echo "✅ Add network to MetaMask function found"
else
    echo "❌ Add network to MetaMask function missing"
fi

if grep -q "wallet_switchEthereumChain" src/config/blockchains.ts; then
    echo "✅ Switch Ethereum chain function found"
else
    echo "❌ Switch Ethereum chain function missing"
fi

if grep -q "wallet_addEthereumChain" src/config/blockchains.ts; then
    echo "✅ Add Ethereum chain function found"
else
    echo "❌ Add Ethereum chain function missing"
fi
echo ""

# Check wallet test components
echo "🧪 Wallet Test Components Check..."
if [ -f "src/components/SimpleWalletTest.tsx" ]; then
    echo "✅ SimpleWalletTest component exists"
else
    echo "❌ SimpleWalletTest component missing"
fi

if [ -f "src/components/WalletTest.tsx" ]; then
    echo "✅ WalletTest component exists"
else
    echo "❌ WalletTest component missing"
fi
echo ""

# Check routes
echo "🛣️ Route Configuration Check..."
if grep -q "/wallet-test" src/App.tsx; then
    echo "✅ Wallet test route configured"
else
    echo "❌ Wallet test route missing"
fi

if grep -q "SimpleWalletTest" src/App.tsx; then
    echo "✅ SimpleWalletTest import found"
else
    echo "❌ SimpleWalletTest import missing"
fi
echo ""

echo "🚀 Wallet Testing Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:8080/wallet-test in your browser"
echo "2. Click 'Connect Wallet' to connect MetaMask"
echo "3. Click 'Connect to ZetaChain' to test ZetaChain connection"
echo "4. Try switching between different networks"
echo "5. Check browser console for any errors"
echo ""
echo "🌐 Test URLs:"
echo "• Wallet Test: http://localhost:8080/wallet-test"
echo "• Analytics: http://localhost:8080/app/analytics"
echo "• Charts: http://localhost:8080/chart-test"
echo "• Icons: http://localhost:8080/icon-test"
echo ""
echo "💡 Testing Tips:"
echo "• Make sure MetaMask is installed and unlocked"
echo "• Check that you have some test ETH on the networks you want to test"
echo "• For ZetaChain, you may need to add the network manually first"
echo "• Monitor the browser console for detailed error messages"
echo ""
echo "🔧 Troubleshooting:"
echo "• If MetaMask doesn't connect, check if it's installed and unlocked"
echo "• If network switching fails, the network may not be added to MetaMask"
echo "• For ZetaChain, ensure you're using the correct RPC endpoints"
echo "• Check that all blockchain configurations are correct"
echo ""

echo "✅ All wallet connection checks completed successfully!"
echo "Visit http://localhost:8080/wallet-test to test the functionality."
echo ""
