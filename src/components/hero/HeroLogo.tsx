import solstackLogo from "@/assets/solstack-logo.png";

export const HeroLogo = () => {
  return (
    <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
      <div className="relative">
        <img 
          src={solstackLogo} 
          alt="SOLSTACK Logo - AI-Powered Solana DeFi Platform" 
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 drop-shadow-2xl object-contain rounded-2xl liquid-flow"
          loading="eager"
        />
        {/* Glow effect behind logo */}
        <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full -z-10 animate-pulse" />
      </div>
    </div>
  );
};
