import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  LineChart, 
  ArrowRightLeft, 
  Bell, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  checkComplete?: () => boolean;
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STORAGE_KEY = 'solstack_onboarding_complete';

export const OnboardingTutorial = ({ onComplete, onSkip }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const { connected, connect } = useWallet();
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Solstack',
      description: 'Your all-in-one Solana DeFi platform. Let\'s get you set up in just a few steps.',
      icon: <Sparkles className="h-12 w-12 text-primary" />,
    },
    {
      id: 'connect-wallet',
      title: 'Connect Your Wallet',
      description: 'Connect your Solana wallet to access all features. We support Phantom, Solflare, Backpack, and more.',
      icon: <Wallet className="h-12 w-12 text-primary" />,
      action: connected ? undefined : {
        label: 'Connect Wallet',
        onClick: () => {
          try {
            connect();
          } catch {
            // Wallet modal will open
          }
        },
      },
      checkComplete: () => connected,
    },
    {
      id: 'portfolio',
      title: 'View Your Portfolio',
      description: 'See all your Solana holdings, track performance over time, and get AI-powered insights.',
      icon: <LineChart className="h-12 w-12 text-primary" />,
      action: {
        label: 'Go to Portfolio',
        onClick: () => {
          setIsOpen(false);
          navigate('/portfolio');
        },
      },
    },
    {
      id: 'swap',
      title: 'Swap Tokens',
      description: 'Trade any Solana tokens with the best rates from Jupiter aggregator. Low fees, fast execution.',
      icon: <ArrowRightLeft className="h-12 w-12 text-primary" />,
      action: {
        label: 'Try Swapping',
        onClick: () => {
          setIsOpen(false);
          navigate('/swap');
        },
      },
    },
    {
      id: 'alerts',
      title: 'Set Price Alerts',
      description: 'Never miss a trading opportunity. Set up custom price alerts and get notified instantly.',
      icon: <Bell className="h-12 w-12 text-primary" />,
      action: {
        label: 'Create Alert',
        onClick: () => {
          setIsOpen(false);
          navigate('/portfolio');
        },
      },
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You\'re ready to explore Solstack. Start trading, staking, and growing your portfolio.',
      icon: <Check className="h-12 w-12 text-green-500" />,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const stepComplete = currentStepData.checkComplete?.() ?? true;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onSkip();
  };

  // Auto-advance when step is complete
  useEffect(() => {
    if (currentStepData.checkComplete && stepComplete && !isLastStep) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stepComplete, currentStep]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1 mb-4" />
          <div className="flex justify-center py-4">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {currentStepData.checkComplete && (
          <div className="flex justify-center">
            {stepComplete ? (
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="secondary">
                Action Required
              </Badge>
            )}
          </div>
        )}

        {currentStepData.action && !stepComplete && (
          <div className="flex justify-center pt-2">
            <Button onClick={currentStepData.action.onClick} className="gap-2">
              {currentStepData.action.label}
            </Button>
          </div>
        )}

        <DialogFooter className="flex-row justify-between gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Check if onboarding has been completed
 */
export const hasCompletedOnboarding = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
};

/**
 * Reset onboarding state
 */
export const resetOnboarding = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }
};
