import { ShieldAlert, Lock, Github } from 'lucide-react';

const reasons = [
  {
    icon: ShieldAlert,
    title: 'Scam Detection',
    description: 'AI flags suspicious contracts before you swap. Real-time analysis of token metadata, liquidity, and holder patterns.',
    accent: 'primary',
  },
  {
    icon: Lock,
    title: 'Honest Bridge',
    description: 'Locked liquidity to Genesis One with no admin withdraw. Audited vault contracts you can verify on-chain.',
    accent: 'accent',
  },
  {
    icon: Github,
    title: 'Open Tools',
    description: 'All code on GitHub. Deploy via Kernel.cool. No hidden mechanics, no private keys, no trust required.',
    accent: 'foreground',
  },
];

export const WhySolstackSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground mb-3">
          Why SolStack
        </h2>
        <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
          Built for transparency. Anchored in truth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="group relative p-6 sm:p-8 rounded-2xl bg-card/30 backdrop-blur border border-border/30 hover:border-primary/30 transition-all duration-300"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
              reason.accent === 'primary' ? 'from-primary/10 to-transparent' :
              reason.accent === 'accent' ? 'from-accent/10 to-transparent' :
              'from-foreground/5 to-transparent'
            } opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                reason.accent === 'primary' ? 'bg-primary/20 text-primary shadow-[0_0_30px_rgba(153,69,255,0.3)]' :
                reason.accent === 'accent' ? 'bg-accent/20 text-accent shadow-[0_0_30px_rgba(0,180,180,0.3)]' :
                'bg-foreground/10 text-foreground'
              }`}>
                <reason.icon className="w-7 h-7" />
              </div>
              
              <h3 className="font-mono text-xl font-bold text-foreground mb-3">
                {reason.title}
              </h3>
              
              <p className="font-sans text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
