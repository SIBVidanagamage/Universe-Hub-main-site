import React from 'react';

type Page = string;

export function NotFoundPage({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <div className="text-[8rem] font-black text-secondary leading-none mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>404</div>
      <div className="w-16 h-1 bg-[#8B5CF6] rounded-full mx-auto mb-8" />
      <h2 className="text-3xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Page Not Found</h2>
      <p className="text-muted-foreground mb-12">The page you're looking for doesn't exist or has been moved to a different URL.</p>
      <div className="flex gap-4 justify-center">
        <button onClick={() => onNav("home")} className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Go to Home</button>
        <button onClick={() => onNav("shop")} className="px-8 py-4 rounded-2xl border-2 border-border font-bold hover:border-foreground transition-all">Browse Shop</button>
      </div>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <div className="text-[8rem] font-black text-red-500/10 leading-none mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>500</div>
      <div className="w-16 h-1 bg-red-500 rounded-full mx-auto mb-8" />
      <h2 className="text-3xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Internal Server Error</h2>
      <p className="text-muted-foreground mb-12">We're experiencing some technical difficulties on our end. Please try refreshing the page or come back later.</p>
      <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">
         Refresh Page
      </button>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-center">
       <div className="max-w-lg mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mx-auto mb-8 text-4xl">
             🛠️
          </div>
          <h1 className="text-4xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>We'll be right back.</h1>
          <p className="text-muted-foreground mb-8">Universe Hub is currently undergoing scheduled maintenance to upgrade our platform. We expect to be back online shortly.</p>
          <div className="p-6 rounded-3xl bg-secondary border border-border">
             <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Expected Completion Time</div>
             <div className="text-2xl font-black font-mono">14:00 LKT</div>
          </div>
       </div>
    </div>
  );
}
