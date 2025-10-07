import { Hero } from "@/components/Hero";
import { StatsGrid } from "@/components/StatsGrid";
import { BundlerInterface } from "@/components/BundlerInterface";
import { RecentBundles } from "@/components/RecentBundles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Hero />
        <StatsGrid />
        <div className="space-y-6">
          <BundlerInterface />
          <RecentBundles />
        </div>
      </div>
    </div>
  );
};

export default Index;
