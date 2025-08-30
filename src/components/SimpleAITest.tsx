import React from 'react';

const SimpleAITest: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Simple AI Test</h1>
      <p className="text-gray-700 mb-4">This is a simple test component to verify rendering works.</p>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Test Section 1</h2>
          <p className="text-blue-700">This should be visible if the component renders correctly.</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h2 className="font-semibold text-green-800">Test Section 2</h2>
          <p className="text-green-700">Another test section to verify the layout works.</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h2 className="font-semibold text-purple-800">Test Section 3</h2>
          <p className="text-purple-700">Final test section to ensure everything displays properly.</p>
        </div>
      </div>
      
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Test Button
      </button>
    </div>
  );
};

export default SimpleAITest;
