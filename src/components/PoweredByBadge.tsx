export const PoweredByBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
        <div className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-background/95 backdrop-blur-sm border border-primary/40 rounded-full">
          <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap tracking-wide">
            Powered by <span className="text-primary">Cody Forbes</span>
          </span>
        </div>
      </div>
    </div>
  );
};
