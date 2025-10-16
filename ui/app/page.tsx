import { TokenMetaCard } from "./components/TokenMetaCard";
import { SwapCard } from "./components/SwapCard";
import { Portfolio } from "./components/Portfolio";
import { TopBar } from "./components/TopBar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 font-sans">
      <TopBar />
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <Image 
            src="/edenSwapLogo.png" 
            alt="EdenSwap" 
            width={200}
            height={80}
            className="h-20 sm:h-35 w-auto drop-shadow-[0_10px_6px_rgba(78,201,192,1)]"
            priority
          />
        </div>
      </header>
      <main className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TokenMetaCard />
          <SwapCard baseLabel="NAT" quoteLabel="ETH" />
        </div>
        <Portfolio />
      </main>
    </div>
  );
}
