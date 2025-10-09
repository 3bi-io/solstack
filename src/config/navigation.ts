import { 
  ChartCandlestick,
  Rocket, 
  Gift, 
  Repeat,
  Wallet,
  TrendingUp,
  FileText,
  TreePine,
  Shield,
  Key,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  type LucideIcon
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: string;
  requiresAuth?: boolean;
}

export const mainNavItems: NavItem[] = [
  { 
    icon: ChartCandlestick, 
    label: "Markets", 
    path: "/markets",
    badge: "AI"
  },
  { 
    icon: Rocket, 
    label: "Launch", 
    path: "/launch" 
  },
  { 
    icon: Gift, 
    label: "Airdrop", 
    path: "/airdrop" 
  },
  { 
    icon: Repeat, 
    label: "Swap", 
    path: "/swap" 
  },
];

export const toolsNavItems: NavItem[] = [
  { 
    icon: Wallet, 
    label: "Wallet", 
    path: "/wallet" 
  },
  { 
    icon: TrendingUp, 
    label: "Transactions", 
    path: "/transactions",
    requiresAuth: true
  },
  { 
    icon: FileText, 
    label: "Logs", 
    path: "/logs" 
  },
  { 
    icon: TreePine, 
    label: "Merkle Airdrop", 
    path: "/merkle-airdrop" 
  },
  { 
    icon: Shield, 
    label: "Multi-Sig", 
    path: "/multisig" 
  },
];

export const advancedNavItems: NavItem[] = [
  { 
    icon: Key, 
    label: "API Access", 
    path: "/api-keys" 
  },
  { 
    icon: Users, 
    label: "Referrals", 
    path: "/referrals" 
  },
];

export const accountNavItems: NavItem[] = [
  { 
    icon: CreditCard, 
    label: "Billing", 
    path: "/billing",
    requiresAuth: true
  },
  { 
    icon: Settings, 
    label: "Settings", 
    path: "/settings",
    requiresAuth: true
  },
  { 
    icon: HelpCircle, 
    label: "Help", 
    path: "/help" 
  },
];

// Flatten all nav items for easy access
export const allNavItems: NavItem[] = [
  ...mainNavItems,
  ...toolsNavItems,
  ...advancedNavItems,
  ...accountNavItems,
];
