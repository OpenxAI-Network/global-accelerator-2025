// Simple test for AI Service
const { AIAssistant } = require('./src/services/AIAssistant.ts');

async function testAI() {
  console.log('🧪 Testing AI Service...');
  
  try {
    // Create AI Assistant (no API key = demo mode)
    const ai = new AIAssistant();
    
    console.log('✅ AI Assistant created successfully');
    console.log('Status:', ai.getStatus());
    
    // Test a simple command
    const command = {
      text: 'Show me loan options for my BTC',
      timestamp: new Date().toISOString(),
      context: 'test'
    };
    
    console.log('📝 Testing command:', command.text);
    
    const response = await ai.processCommand(command);
    
    console.log('🤖 AI Response received:');
    console.log('Response:', response.response);
    console.log('Task Type:', response.taskType);
    console.log('Confidence:', response.confidence);
    console.log('Suggestions:', response.suggestions);
    
    console.log('✅ AI Service test completed successfully!');
    
  } catch (error) {
    console.error('❌ AI Service test failed:', error);
  }
}

// Run test
testAI();
