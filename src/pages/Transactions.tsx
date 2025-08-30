import React, { useState } from 'react';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionDetails from '../components/Transactions/TransactionDetails';
import ThreatAnalysisPanel from '../components/Transactions/ThreatAnalysisPanel';
import { Threat } from '../types';

const Transactions: React.FC<{ threats: Threat[] }> = ({ threats }) => {
  const [selectedTx, setSelectedTx] = useState<Threat | null>(null);
  const [filter, setFilter] = useState('all');
  
  const filteredThreats = threats.filter(tx => {
    if (filter === 'all') return true;
    return tx.chain === filter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filter Transactions</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="all"
                name="chain"
                value="all"
                checked={filter === 'all'}
                onChange={() => setFilter('all')}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="all" className="ml-2 text-gray-700">All Chains</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="ethereum"
                name="chain"
                value="ethereum"
                checked={filter === 'ethereum'}
                onChange={() => setFilter('ethereum')}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="ethereum" className="ml-2 text-gray-700">Ethereum</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="bitcoin"
                name="chain"
                value="bitcoin"
                checked={filter === 'bitcoin'}
                onChange={() => setFilter('bitcoin')}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="bitcoin" className="ml-2 text-gray-700">Bitcoin</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="solana"
                name="chain"
                value="solana"
                checked={filter === 'solana'}
                onChange={() => setFilter('solana')}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="solana" className="ml-2 text-gray-700">Solana</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="polygon"
                name="chain"
                value="polygon"
                checked={filter === 'polygon'}
                onChange={() => setFilter('polygon')}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="polygon" className="ml-2 text-gray-700">Polygon</label>
            </div>
          </div>
        </div>
        
        <TransactionList 
          threats={filteredThreats} 
          onSelect={setSelectedTx} 
          selectedId={selectedTx?.id} 
        />
      </div>
      
      <div className="lg:col-span-2">
        {selectedTx ? (
          <div className="space-y-6">
            <TransactionDetails threat={selectedTx} />
            <ThreatAnalysisPanel threat={selectedTx} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Transaction</h3>
            <p className="text-gray-500">Choose a transaction from the list to view details and threat analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 