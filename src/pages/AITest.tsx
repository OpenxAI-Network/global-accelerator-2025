import React from 'react';
import AIAssistant from '../components/AIAssistant';

const AITest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Assistant Test Page</h1>
        <p className="text-center text-gray-600 mb-8">
          Test the AI Assistant functionality - both buttons should work now!
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AIAssistant 
            showVoiceCommands={true}
            initialContext={{
              userProfile: {
                experience: 'intermediate',
                focus: 'defi',
                chains: ['Ethereum', 'Polygon', 'Arbitrum']
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AITest;
