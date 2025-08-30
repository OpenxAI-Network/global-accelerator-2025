import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface OnboardingFlowProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isVisible,
  onComplete,
  onSkip
}) => {
  const [run, setRun] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('aegis-onboarding-complete', false);

  useEffect(() => {
    if (isVisible && !hasSeenOnboarding) {
      setRun(true);
    }
  }, [isVisible, hasSeenOnboarding]);

  const steps: Step[] = [
    {
      target: '.dashboard-welcome',
      content: 'Welcome to Aegis! This is your unified dashboard for managing cross-chain DeFi positions.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.wallet-connection',
      content: 'Connect your wallets from any blockchain. Aegis automatically detects and links them.',
      placement: 'bottom',
    },
    {
      target: '.portfolio-overview',
      content: 'View your entire portfolio across all chains in one place. No more switching between networks!',
      placement: 'top',
    },
    {
      target: '.loan-health',
      content: 'Monitor your loan health in real-time. Get alerts before positions become risky.',
      placement: 'left',
    },
    {
      target: '.ai-assistant',
      content: 'Ask our AI assistant anything about your portfolio or DeFi strategies.',
      placement: 'right',
    },
    {
      target: '.cross-chain-actions',
      content: 'Execute cross-chain transactions seamlessly. Bridge assets, rebalance positions, and more.',
      placement: 'top',
    },
    {
      target: '.notifications',
      content: 'Stay informed with real-time notifications about your positions and market opportunities.',
      placement: 'left',
    }
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setHasSeenOnboarding(true);
      
      if (status === STATUS.FINISHED) {
        onComplete();
      } else {
        onSkip();
      }
    }
  };

  const handleStart = () => {
    setRun(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {!run && !hasSeenOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-welcome">
            <h2>Welcome to Aegis</h2>
            <p>Let's get you started with a quick tour of your new cross-chain DeFi dashboard.</p>
            <button 
              onClick={handleStart}
              className="btn-primary"
            >
              Start Tour
            </button>
            <button 
              onClick={() => {
                setHasSeenOnboarding(true);
                onSkip();
              }}
              className="btn-secondary"
            >
              Skip Tour
            </button>
          </div>
        </div>
      )}

      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleCallback}
        styles={{
          options: {
            primaryColor: '#6366f1',
            zIndex: 1000,
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour'
        }}
      />
    </>
  );
};

export default OnboardingFlow;
