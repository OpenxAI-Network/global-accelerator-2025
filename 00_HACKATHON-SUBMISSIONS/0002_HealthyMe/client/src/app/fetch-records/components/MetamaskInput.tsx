import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function MetamaskInput({ value, onChange, onSubmit, isLoading }:any) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
    <div className="flex items-center space-x-4">
      <div className="relative flex-grow">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Metamask Address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="Metamask logo"
            className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
          />
        </div>
      </div>
      <button
        onClick={onSubmit}

       
        disabled={isLoading}
        className="rounded-md  px-4 py-3 text-base font-medium text-white transition-colors  hover:[text-shadow:0_0_10px_#fff] bg-gradient-to-r from-blue-600 to-purple-600"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Fetch Records'
        )}
      </button>
      
    </div>
    <div className="mt-8 text-center">
    <div className="terms-and-conditions max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
      <p className="text-gray-600">
        By using this platform, you agree to our terms and conditions. All loans are subject to approval and may require collateral. 
        Interest rates are variable and may change based on market conditions. Repayment terms must be strictly adhered to. 
        Failure to repay loans may result in penalties and affect your credit score. Staking rewards are subject to change and may be 
        affected by network conditions. Please read our full terms of service and privacy policy for more information.
      </p>
    </div>
  </div>
  </>
  )
}

