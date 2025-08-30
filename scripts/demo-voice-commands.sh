#!/bin/bash

# Aegis AI - Voice Commands Demo Script
# This script demonstrates the speech-to-text voice command feature with waveform visualization

set -e

echo "🎤 Aegis AI - Voice Commands Demo"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🎯 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}📋 $1${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_code() {
    echo -e "${PURPLE}💻 $1${NC}"
}

# Check browser compatibility
check_browser_compatibility() {
    print_header "Checking Browser Compatibility"
    
    print_section "Speech Recognition Support"
    echo "Voice commands require a modern browser with speech recognition support:"
    echo ""
    echo "✅ Supported Browsers:"
    echo "   • Google Chrome (Recommended)"
    echo "   • Microsoft Edge"
    echo "   • Safari (macOS)"
    echo "   • Firefox (Limited support)"
    echo ""
    echo "❌ Not Supported:"
    echo "   • Internet Explorer"
    echo "   • Old browser versions"
    echo ""
    
    print_section "Required Features"
    echo "Your browser must support:"
    echo "• Web Speech API (SpeechRecognition)"
    echo "• MediaDevices API (microphone access)"
    echo "• Web Audio API (waveform visualization)"
    echo "• Canvas API (visual rendering)"
    echo ""
}

# Demonstrate voice command capabilities
demonstrate_voice_capabilities() {
    print_header "Voice Command Capabilities"
    
    print_section "1. Speech-to-Text Processing"
    echo "Advanced speech recognition with real-time processing:"
    echo "• Continuous listening mode"
    echo "• Interim results for live feedback"
    echo "• Multiple language support (English, Spanish, etc.)"
    echo "• Confidence scoring for accuracy"
    echo "• Error handling and recovery"
    echo ""
    
    print_section "2. Real-time Waveform Visualization"
    echo "Live audio visualization with animated waveforms:"
    echo "• Real-time audio level monitoring"
    echo "• Animated bar charts and visual feedback"
    echo "• Color-coded audio intensity"
    echo "• Smooth animations and transitions"
    echo "• Responsive design for all screen sizes"
    echo ""
    
    print_section "3. Natural Language Understanding"
    echo "AI-powered command interpretation:"
    echo "• Context-aware command parsing"
    echo "• Automatic task type detection"
    echo "• Intent recognition and classification"
    echo "• Multi-domain understanding (DeFi, security, development)"
    echo "• Smart response generation"
    echo ""
    
    print_section "4. Voice Command Examples"
    echo "Perfect for AEGIS project development:"
    echo ""
    echo "🎤 DeFi & Lending:"
    echo "   • 'Show me loan options for my BTC'"
    echo "   • 'What's the best LTV ratio for ETH?'"
    echo "   • 'Calculate borrowing costs for 1000 USDC'"
    echo ""
    echo "🛡️ Security & Analysis:"
    echo "   • 'Analyze my portfolio for security risks'"
    echo "   • 'Check for vulnerabilities in my smart contracts'"
    echo "   • 'What are the latest DeFi attack vectors?'"
    echo ""
    echo "💻 Development:"
    echo "   • 'Generate a secure lending smart contract'"
    echo "   • 'Review my Solidity code for best practices'"
    echo "   • 'Create unit tests for my DeFi protocol'"
    echo ""
    echo "📊 Strategy & Portfolio:"
    echo "   • 'Optimize my portfolio for maximum yield'"
    echo "   • 'Develop a cross-chain arbitrage strategy'"
    echo "   • 'What's my risk exposure across all chains?'"
    echo ""
}

# Demonstrate technical implementation
demonstrate_technical_implementation() {
    print_header "Technical Implementation Details"
    
    print_section "1. Speech Recognition Engine"
    print_code "Web Speech API Integration"
    echo "• Native browser speech recognition"
    echo "• Real-time audio processing"
    echo "• Continuous listening capabilities"
    echo "• Error handling and recovery"
    echo "• Cross-browser compatibility"
    echo ""
    
    print_section "2. Audio Visualization System"
    print_code "Web Audio API + Canvas"
    echo "• Real-time audio analysis"
    echo "• Frequency domain processing"
    echo "• Smooth waveform rendering"
    echo "• Responsive visual feedback"
    echo "• Performance optimization"
    echo ""
    
    print_section "3. AI Command Processing"
    print_code "Natural Language Processing"
    echo "• Intent classification"
    echo "• Context understanding"
    echo "• Task type detection"
    echo "• Response generation"
    echo "• Conversation history"
    echo ""
    
    print_section "4. React Component Architecture"
    print_code "Modern React Implementation"
    echo "• Custom hooks for voice processing"
    echo "• State management for audio data"
    echo "• Real-time UI updates"
    echo "• Responsive design patterns"
    echo "• Accessibility features"
    echo ""
}

# Show user experience flow
show_user_experience_flow() {
    print_header "User Experience Flow"
    
    print_section "Step 1: Voice Command Initiation"
    echo "1. User clicks the microphone button"
    echo "2. Browser requests microphone permission"
    echo "3. Audio context is initialized"
    echo "4. Waveform visualization begins"
    echo "5. Speech recognition starts listening"
    echo ""
    
    print_section "Step 2: Voice Input Processing"
    echo "1. User speaks naturally into microphone"
    echo "2. Real-time audio level monitoring"
    echo "3. Live waveform visualization"
    echo "4. Speech recognition processes audio"
    echo "5. Interim results displayed"
    echo ""
    
    print_section "Step 3: Command Interpretation"
    echo "1. Final transcript is generated"
    echo "2. AI analyzes command intent"
    echo "3. Task type is automatically determined"
    echo "4. Context is applied from project settings"
    echo "5. Command is routed to appropriate AI service"
    echo ""
    
    print_section "Step 4: AI Response Generation"
    echo "1. Gemini AI processes the command"
    echo "2. Context-aware response is generated"
    echo "3. Results are formatted and displayed"
    echo "4. Conversation history is updated"
    echo "5. User can continue with voice or text"
    echo ""
}

# Demonstrate security and privacy
demonstrate_security_privacy() {
    print_header "Security and Privacy Features"
    
    print_section "Local Processing"
    echo "All voice processing happens locally:"
    echo "• No voice data sent to external servers"
    echo "• Audio processing in browser only"
    echo "• Local speech recognition"
    echo "• Privacy-first design"
    echo "• GDPR compliant"
    echo ""
    
    print_section "Permission Management"
    echo "Secure microphone access:"
    echo "• Explicit user consent required"
    echo "• Browser-level permission controls"
    echo "• Temporary access only when needed"
    echo "• Easy permission revocation"
    echo "• Clear permission indicators"
    echo ""
    
    print_section "Data Handling"
    echo "Minimal data retention:"
    echo "• Only final transcripts stored locally"
    echo "• No raw audio data saved"
    echo "• Conversation history in browser only"
    echo "• Easy data clearing"
    echo "• No tracking or analytics"
    echo ""
}

# Show integration benefits
show_integration_benefits() {
    print_header "Integration Benefits for AEGIS"
    
    print_section "Development Acceleration"
    echo "How voice commands speed up development:"
    echo ""
    echo "🚀 Natural Interaction:"
    echo "   • No need to type complex commands"
    echo "   • Faster than traditional input methods"
    echo "   • Hands-free operation during coding"
    echo "   • Multi-tasking capabilities"
    echo ""
    echo "📱 Accessibility:"
    echo "   • Voice-first interface for mobile users"
    echo "   • Alternative input method for disabilities"
    echo "   • Inclusive design principles"
    echo "   • Universal usability"
    echo ""
    
    print_section "AI Co-Pilot Enhancement"
    echo "Voice commands make AI more accessible:"
    echo ""
    echo "🤖 Conversational Interface:"
    echo "   • Natural language interaction"
    echo "   • Human-like conversation flow"
    echo "   • Context-aware responses"
    echo "   • Seamless AI integration"
    echo ""
    echo "🎯 Task Efficiency:"
    echo "   • Quick command execution"
    echo "   • Reduced cognitive load"
    echo "   • Faster problem solving"
    echo "   • Streamlined workflows"
    echo ""
}

# Provide setup instructions
provide_setup_instructions() {
    print_header "Setting Up Voice Commands"
    
    print_section "Prerequisites"
    echo "1. Modern browser with speech recognition support"
    echo "2. Microphone access permission"
    echo "3. Stable internet connection"
    echo "4. AEGIS project environment configured"
    echo ""
    
    print_section "Installation Steps"
    echo "1. Ensure all dependencies are installed:"
    echo "   npm install"
    echo ""
    echo "2. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "3. Navigate to VoiceCommandDemo page"
    echo "4. Grant microphone permissions when prompted"
    echo "5. Click microphone button to start"
    echo ""
    
    print_section "Testing Voice Commands"
    echo "Try these example commands:"
    echo "• 'Show me loan options for my BTC'"
    echo "• 'Analyze my portfolio security'"
    echo "• 'Generate a DeFi lending contract'"
    echo "• 'What's my risk across all chains?'"
    echo ""
}

# Show troubleshooting guide
show_troubleshooting_guide() {
    print_header "Troubleshooting Common Issues"
    
    print_section "Microphone Access Issues"
    echo "Problem: Microphone permission denied"
    echo "Solution:"
    echo "1. Check browser settings for microphone permissions"
    echo "2. Ensure microphone is not used by other applications"
    echo "3. Try refreshing the page and granting permission again"
    echo "4. Check if microphone is properly connected"
    echo ""
    
    print_section "Speech Recognition Issues"
    echo "Problem: Voice commands not being recognized"
    echo "Solution:"
    echo "1. Ensure you're using a supported browser"
    echo "2. Check internet connection (required for speech recognition)"
    echo "3. Speak clearly and at normal volume"
    echo "4. Try different voice command phrases"
    echo ""
    
    print_section "Waveform Visualization Issues"
    echo "Problem: No waveform display"
    echo "Solution:"
    echo "1. Check browser console for errors"
    echo "2. Ensure Web Audio API is supported"
    echo "3. Try refreshing the page"
    echo "4. Check if audio context is properly initialized"
    echo ""
}

# Main demonstration flow
main() {
    echo "Welcome to the Aegis AI Voice Commands Demonstration!"
    echo "This script showcases the speech-to-text voice command feature with waveform visualization."
    echo ""
    
    check_browser_compatibility
    demonstrate_voice_capabilities
    demonstrate_technical_implementation
    show_user_experience_flow
    demonstrate_security_privacy
    show_integration_benefits
    provide_setup_instructions
    show_troubleshooting_guide
    
    print_header "Demonstration Complete!"
    echo ""
    echo "🎉 You've learned about the powerful voice command capabilities!"
    echo ""
    echo "Key Features:"
    echo "• Advanced speech-to-text processing"
    echo "• Real-time waveform visualization"
    echo "• Natural language AI interaction"
    echo "• Secure and private voice processing"
    echo "• Seamless AEGIS integration"
    echo ""
    echo "Ready to try voice commands? Start the development server and navigate to VoiceCommandDemo!"
    echo ""
    print_success "Voice Commands Demo completed successfully! 🎤"
}

# Run demonstration
main "$@"
