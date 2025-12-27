import { ExternalLink } from 'lucide-react';

const links = [
  { label: 'Genesis One', href: 'https://genesis.one', external: true },
  { label: 'Restitution Layer', href: 'https://restitution.layer', external: true },
  { label: 'Kernel.cool', href: 'https://kernel.cool', external: true },
  { label: 'GitHub', href: 'https://github.com/solstack', external: true },
  { label: 'Discord', href: 'https://discord.gg/solstack', external: true },
];

export const LandingFooter = () => {
  return (
    <footer className="relative mt-16 py-8 border-t border-border/30">
      {/* Gradient border effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="space-y-6">
        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
              {link.external && (
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </a>
          ))}
        </nav>

        {/* Tagline */}
        <p className="text-center text-xs font-mono text-muted-foreground/70">
          Built for speed on Solana. Anchored in truth on Genesis One.
        </p>

        {/* Copyright */}
        <p className="text-center text-xs font-mono text-muted-foreground/50">
          © {new Date().getFullYear()} SolStack. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
