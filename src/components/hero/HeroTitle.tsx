export const HeroTitle = () => {
  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-2 sm:mb-3 md:mb-4 tracking-tight animate-fade-in px-2 relative">
      <span className="relative inline-block">
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-50 animate-pulse" />
        <span 
          className="relative bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent [text-shadow:0_0_80px_rgba(var(--primary-rgb),0.5)]" 
          style={{ 
            WebkitTextStroke: '1px rgba(var(--primary-rgb), 0.3)',
            letterSpacing: '0.02em'
          }}
        >
          SOLSTACK
        </span>
      </span>
    </h1>
  );
};
