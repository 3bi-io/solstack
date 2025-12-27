import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDown } from 'lucide-react';

export const HeroFeatures = () => {
  const navigate = useNavigate();

  const scrollToTools = () => {
    const element = document.getElementById('core-tools');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Primary CTA */}
      <Button
        size="lg"
        onClick={() => navigate('/wallet')}
        className="group relative w-full sm:w-auto font-mono text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
      >
        <Wallet className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Connect Wallet
      </Button>
      
      {/* Secondary CTA */}
      <Button
        size="lg"
        variant="outline"
        onClick={scrollToTools}
        className="group w-full sm:w-auto font-mono text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all duration-300"
      >
        Explore Tools
        <ArrowDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
      </Button>
    </div>
  );
};
