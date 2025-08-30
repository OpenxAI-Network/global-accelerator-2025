import React from 'react';
import AEGISRevenueTable from '../components/AEGISRevenueTable';

const RevenueDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AEGIS Revenue Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive overview of our sustainable, scalable revenue model
          </p>
        </div>
        
        <AEGISRevenueTable />
      </div>
    </div>
  );
};

export default RevenueDashboard;
