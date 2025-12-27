export const HeroTitle = () => {
  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in">
      {/* Main title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-black tracking-tight relative">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-40 animate-pulse" />
          <span className="relative bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            SOLSTACK
          </span>
        </span>
      </h1>
      
      {/* Tagline */}
      <p className="text-lg sm:text-xl md:text-2xl font-mono font-medium text-foreground">
        AI-Driven DeFi on Solana.{' '}
        <span className="text-accent">Bridged to the First Honest Chain.</span>
      </p>
      
      {/* Sub-tagline */}
      <p className="text-sm sm:text-base font-mono text-muted-foreground">
        No rugs. No hype. Just verifiable yields and tools.
      </p>
    </div>
  );
};
