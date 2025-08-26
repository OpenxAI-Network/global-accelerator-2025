import { Sparkles, TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">Round-Up Investment Visualizer</h1>
              <p className="text-lg text-emerald-100">Turn spare change into serious savings</p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-center">
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="font-medium text-emerald-100">Financial Education Made Simple</span>
            </div>
            <p className="text-lg leading-relaxed text-white/90">
              Discover how the small change from your everyday purchases could grow into significant wealth through the
              power of compound investing. Upload your transaction data or try our sample to see your potential.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
