#!/usr/bin/env node

/**
 * Aegis AI - Gemini Integration Test Script
 * This script tests the basic functionality of the Gemini AI integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Aegis AI - Gemini Integration Test');
console.log('=====================================');

// Test configuration
const testConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModelName: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash',
  testPrompts: [
    'Explain DeFi in one sentence',
    'What is the risk level of a portfolio with 80% ETH?',
    'Give me 3 DeFi security tips'
  ]
};

// Test functions
async function testGeminiInitialization() {
  console.log('\n🔧 Testing Gemini AI Initialization...');
  
  if (!testConfig.geminiApiKey) {
    console.log('❌ GEMINI_API_KEY not found in environment variables');
    console.log('   Please set GEMINI_API_KEY in your .env file');
    return false;
  }
  
  if (testConfig.geminiApiKey === 'your_gemini_api_key_here') {
    console.log('❌ GEMINI_API_KEY is still set to placeholder value');
    console.log('   Please update with your actual API key');
    return false;
  }
  
  try {
    const gemini = new GoogleGenerativeAI(testConfig.geminiApiKey);
    const model = gemini.getGenerativeModel({ model: testConfig.geminiModelName });
    console.log(`✅ Gemini AI initialized successfully with model: ${testConfig.geminiModelName}`);
    return { gemini, model };
  } catch (error) {
    console.log(`❌ Failed to initialize Gemini AI: ${error.message}`);
    return false;
  }
}

async function testContentGeneration(model) {
  console.log('\n🤖 Testing Content Generation...');
  
  try {
    const prompt = testConfig.testPrompts[0];
    console.log(`   Prompt: "${prompt}"`);
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.3
      }
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Content generated successfully`);
    console.log(`   Response: "${text}"`);
    return true;
  } catch (error) {
    console.log(`❌ Content generation failed: ${error.message}`);
    return false;
  }
}

async function testBatchGeneration(model) {
  console.log('\n📦 Testing Batch Generation...');
  
  try {
    const results = [];
    
    for (const prompt of testConfig.testPrompts) {
      console.log(`   Processing: "${prompt}"`);
      
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.2
        }
      });
      
      const response = await result.response;
      const text = response.text();
      
      results.push({ prompt, response: text });
      console.log(`   ✅ Generated: "${text.substring(0, 50)}..."`);
    }
    
    console.log(`✅ Batch generation completed successfully (${results.length} prompts)`);
    return true;
  } catch (error) {
    console.log(`❌ Batch generation failed: ${error.message}`);
    return false;
  }
}

async function testErrorHandling(model) {
  console.log('\n⚠️  Testing Error Handling...');
  
  try {
    // Test with empty prompt
    const result = await model.generateContent({
      contents: [{ parts: [{ text: '' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    
    console.log('✅ Empty prompt handled gracefully');
    return true;
  } catch (error) {
    console.log(`❌ Error handling test failed: ${error.message}`);
    return false;
  }
}

async function testServiceEndpoints() {
  console.log('\n🌐 Testing Service Endpoints...');
  
  try {
    // Test Gemini service health (if running)
    const response = await fetch('http://localhost:4006/api/gemini/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Gemini service endpoint accessible');
      console.log(`   Status: ${data.status}`);
      console.log(`   API Key Configured: ${data.apiKeyConfigured}`);
    } else {
      console.log('⚠️  Gemini service not accessible (may not be running)');
    }
  } catch (error) {
    console.log('⚠️  Gemini service not accessible (may not be running)');
  }
  
  try {
    // Test main backend AI (if running)
    const response = await fetch('http://localhost:3001/api/ai/status');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Main backend AI endpoint accessible');
      console.log(`   Status: ${data.success}`);
    } else {
      console.log('⚠️  Main backend AI not accessible (may not be running)');
    }
  } catch (error) {
    console.log('⚠️  Main backend AI not accessible (may not be running)');
  }
}

// Main test execution
async function runTests() {
  console.log('\n🚀 Starting Gemini AI Integration Tests...\n');
  
  // Test 1: Initialization
  const geminiInit = await testGeminiInitialization();
  if (!geminiInit) {
    console.log('\n❌ Gemini AI initialization failed. Cannot continue tests.');
    return;
  }
  
  // Test 2: Content Generation
  const contentGen = await testContentGeneration(geminiInit.model);
  
  // Test 3: Batch Generation
  const batchGen = await testBatchGeneration(geminiInit.model);
  
  // Test 4: Error Handling
  const errorHandling = await testErrorHandling(geminiInit.model);
  
  // Test 5: Service Endpoints
  await testServiceEndpoints();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Gemini Initialization: ${geminiInit ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Content Generation: ${contentGen ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Batch Generation: ${batchGen ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Error Handling: ${errorHandling ? 'PASS' : 'FAIL'}`);
  
  const passedTests = [geminiInit, contentGen, batchGen, errorHandling].filter(Boolean).length;
  const totalTests = 4;
  
  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Gemini AI integration is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Start the services: ./start-gemini-ai.sh');
    console.log('2. Test the full system: ./test-gemini-ai.sh');
    console.log('3. Check the documentation: README-GEMINI-AI.md');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
    console.log('\nTroubleshooting:');
    console.log('1. Verify your GEMINI_API_KEY in .env file');
    console.log('2. Check your internet connection');
    console.log('3. Ensure you have sufficient API quota');
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testGeminiInitialization, testContentGeneration };
