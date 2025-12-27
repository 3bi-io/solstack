import { Brain, Shield, Rocket, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tools = [
  {
    icon: Brain,
    title: 'AI Market Intel',
    description: 'Real-time sentiment analysis and price predictions powered by Claude and Grok AI models.',
    gradient: 'from-primary to-purple-400',
    glowColor: 'shadow-primary/30',
  },
  {
    icon: Shield,
    title: 'Safe Farms',
    description: 'Vetted Solana pools with AI-powered rug-pull risk scores. Farm with confidence.',
    gradient: 'from-green-500 to-emerald-400',
    glowColor: 'shadow-green-500/30',
  },
  {
    icon: Rocket,
    title: 'Token Launches',
    description: 'Fair SPL token creation with no mint authority. Transparent, trustless launches.',
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'shadow-blue-500/30',
  },
  {
    icon: ArrowLeftRight,
    title: 'Genesis Bridge',
    description: 'Secure SOL ↔ GEN1 swaps through audited vault contracts. Bridged to the First Honest Chain.',
    gradient: 'from-accent to-teal-400',
    glowColor: 'shadow-accent/30',
  },
];

export const CoreToolsSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground mb-3">
          Core Tools
        </h2>
        <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
          Everything you need to trade, launch, and bridge on Solana with AI-powered security.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {tools.map((tool) => (
          <Card 
            key={tool.title}
            className={`group relative bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg ${tool.glowColor} cursor-pointer`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            
            <CardHeader className="relative pb-2">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="font-mono text-lg text-foreground group-hover:text-primary transition-colors">
                {tool.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative">
              <CardDescription className="font-sans text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
