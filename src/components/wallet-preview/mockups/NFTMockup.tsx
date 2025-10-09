import { PhoneMockup } from "../PhoneMockup";
import { Grid3x3, Image } from "lucide-react";

export const NFTMockup = () => {
  return (
    <PhoneMockup>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black mb-1">NFT Gallery</h3>
            <p className="text-sm text-muted-foreground">12 Collections · 47 NFTs</p>
          </div>
          <Grid3x3 className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Featured NFT */}
        <div className="mb-6 p-4 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl">
          <div className="aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl mb-3 flex items-center justify-center">
            <Image className="w-12 h-12 text-white/50" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold mb-1">Mad Lads #4239</p>
              <p className="text-xs text-muted-foreground">Floor: 142 SOL</p>
            </div>
            <button className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent rounded-lg text-xs font-semibold">
              List
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-3">Your Collections</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Degods", count: "3 NFTs", floor: "98 SOL" },
              { name: "Okay Bears", count: "5 NFTs", floor: "45 SOL" },
              { name: "SMB", count: "8 NFTs", floor: "32 SOL" },
              { name: "BAYC", count: "1 NFT", floor: "28 ETH" }
            ].map((collection, i) => (
              <div key={i} className="p-3 bg-card/40 border border-primary/10 rounded-xl">
                <div className="aspect-square bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg mb-2 flex items-center justify-center">
                  <Image className="w-8 h-8 text-primary/50" />
                </div>
                <p className="font-semibold text-xs mb-1">{collection.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{collection.count}</p>
                <p className="text-xs text-green-500">Floor: {collection.floor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="p-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-sm">
            Explore
          </button>
          <button className="p-3 bg-card/50 border border-primary/20 rounded-xl font-semibold text-sm">
            Activity
          </button>
        </div>
      </div>
    </PhoneMockup>
  );
};
