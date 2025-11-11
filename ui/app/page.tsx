import { TokenMetaCard } from "./components/TokenMetaCard";
import { SwapCard } from "./components/SwapCard";
import { Portfolio } from "./components/Portfolio";
import { TopBar } from "./components/TopBar";
import GlitchLogo from "./components/GlitchLogo";

export default function Home() {
  return (
    <div className="min-h-screen w-full px-6 py-10 sm:px-10 font-sans">
      <TopBar />
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="drop-shadow-[0_10px_6px_rgba(78,201,192,1)]">
            <GlitchLogo />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TokenMetaCard />
          <SwapCard baseLabel="NAT" quoteLabel="TIA" />
        </div>
        <Portfolio />
      </main>
      <footer className="max-w-5xl mx-auto mt-1 text-center  bg-white rounded-lg p-4">
        <p className="text-sm font-bold text-base-content/60">
          This is a demo app for educational purposes. All tokens are testnet-only and have no real value.
        </p>
      </footer>
    </div>
  );
}
