import React, { useState, useEffect } from 'react';
import { Tag, Zap, Percent, ChevronRight, ChevronLeft, ShoppingCart, Heart, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

type Page = string;
type Product = any;

const BRAND_THEMES: Record<string, {
  gradient: string;
  tagline: string;
  badgeColor: string;
  logoShort: string;
  accentColor: string;
}> = {
  Apple: {
    gradient: "linear-gradient(135deg, #1e293b, #0f172a, #020617)",
    tagline: "Designed by Apple in California. Sleek, minimalist aesthetics meeting the peak of mobile engineering.",
    badgeColor: "bg-slate-800 text-slate-100",
    logoShort: "AAPL",
    accentColor: "#f1f5f9"
  },
  Samsung: {
    gradient: "linear-gradient(135deg, #1d4ed8, #1e3a8a, #030712)",
    tagline: "Galaxy Ecosystem. Pushing the boundaries of screen display, cameras, and productivity features.",
    badgeColor: "bg-blue-900 text-blue-100",
    logoShort: "SMSG",
    accentColor: "#3b82f6"
  },
  Nothing: {
    gradient: "linear-gradient(135deg, #111111, #000000, #222222)",
    tagline: "Pure Technology. Iconic transparent materials, customized dot-matrix design, and raw elegance.",
    badgeColor: "bg-neutral-900 text-white",
    logoShort: "NTNG",
    accentColor: "#ffffff"
  },
  Anker: {
    gradient: "linear-gradient(135deg, #0ea5e9, #0369a1, #082f49)",
    tagline: "GaNPrime Power Solutions. Fast charging and premium energy management for your flagship devices.",
    badgeColor: "bg-sky-950 text-sky-200",
    logoShort: "ANKR",
    accentColor: "#0ea5e9"
  },
  JBL: {
    gradient: "linear-gradient(135deg, #ea580c, #c2410c, #431407)",
    tagline: "Original Pro Sound. Bold portable bluetooth audio with high fidelity and dust/water protection.",
    badgeColor: "bg-orange-950 text-orange-200",
    logoShort: "JBL",
    accentColor: "#ea580c"
  },
  Belkin: {
    gradient: "linear-gradient(135deg, #10b981, #047857, #064e3b)",
    tagline: "Premium Power & Connectivity. Screen protectors, chargers, and cables engineered to the highest safety standards.",
    badgeColor: "bg-emerald-950 text-emerald-200",
    logoShort: "BLKN",
    accentColor: "#10b981"
  },
  Spigen: {
    gradient: "linear-gradient(135deg, #374151, #1f2937, #111827)",
    tagline: "Military Grade Protection. Engineered cases built to protect your flagship phone without compromise.",
    badgeColor: "bg-zinc-800 text-zinc-100",
    logoShort: "SPGN",
    accentColor: "#9ca3af"
  },
  Baseus: {
    gradient: "linear-gradient(135deg, #fbbf24, #d97706, #78350f)",
    tagline: "Base on User. Simple, clean, and highly efficient charging solutions built for your active lifestyle.",
    badgeColor: "bg-amber-950 text-amber-200",
    logoShort: "BSUS",
    accentColor: "#f59e0b"
  }
};

const DEFAULT_THEME = {
  gradient: "linear-gradient(135deg, #4f46e5, #3730a3, #1e1b4b)",
  tagline: "Premium Mobile Accessories. Hand-picked authentic gear and support for premium systems.",
  badgeColor: "bg-indigo-900 text-indigo-200",
  logoShort: "ACC",
  accentColor: "#8b5cf6"
};

function BrandProductCard({ p, onNav, onCart, wishlist, onWish }: {
  p: any;
  onNav: (p: Page, prod?: Product) => void;
  onCart: (p: Product) => void;
  wishlist: number[];
  onWish: (id: number) => void;
}) {
  const [hov, setHov] = useState(false);
  const images = p.specs?.uploaded_images || [];
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const isWished = wishlist.includes(p.id);

  // Auto-carousel on hover
  useEffect(() => {
    if (images.length > 1 && hov) {
      const timer = setInterval(() => {
        setCurrentImgIdx(prev => (prev + 1) % images.length);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [images.length, hov]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIdx(prev => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIdx(prev => (prev - 1 + images.length) % images.length);
    }
  };

  const getColorHex = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("titanium") || lower.includes("gray") || lower.includes("grey") || lower.includes("natural")) return "#A2A4A6";
    if (lower.includes("white") || lower.includes("silver") || lower.includes("clear")) return "#FFFFFF";
    if (lower.includes("black") || lower.includes("dark") || lower.includes("obsidian") || lower.includes("space")) return "#171717";
    if (lower.includes("blue")) return "#3B82F6";
    if (lower.includes("green")) return "#10B981";
    if (lower.includes("purple") || lower.includes("vinca")) return "#8B5CF6";
    if (lower.includes("yellow") || lower.includes("gold")) return "#EAB308";
    if (lower.includes("red") || lower.includes("rose") || lower.includes("pink")) return "#EC4899";
    return "#6B7280";
  };

  const displayPrice = p.storagePricing && p.storagePricing.length > 0
    ? Math.min(...p.storagePricing.map((sp: any) => sp.price))
    : p.price;

  const isFromPrice = p.storagePricing && p.storagePricing.length > 0;

  return (
    <motion.div
      className="group relative bg-card rounded-[2rem] overflow-hidden border border-border cursor-pointer flex flex-col h-full hover:shadow-lg transition-all duration-300 w-full animate-fade-in"
      whileHover={{ y: -6 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => { setHov(false); setCurrentImgIdx(0); }}
      onClick={() => onNav("product", p)}
    >
      {/* Image Area with light grey background */}
      <div className="relative aspect-square flex items-center justify-center bg-[#F4F4F5] dark:bg-zinc-900 overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)" }} />
        
        {images.length > 0 ? (
          <div className="w-full h-full relative z-10">
            <img src={images[currentImgIdx]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            
            {/* Slider arrows on hover */}
            {images.length > 1 && hov && (
              <>
                <button 
                  onClick={handlePrevImage} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center z-20 backdrop-blur-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextImage} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center z-20 backdrop-blur-sm transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Carousel slider dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {(images as any[]).map((_: any, i: number) => (
                  <div key={i} className={`w-1.25 h-1.25 rounded-full transition-all ${i === currentImgIdx ? "bg-white scale-110" : "bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
        ) : p.icon && (p.icon.startsWith("data:image") || p.icon.length > 50) ? (
          <img src={p.icon} alt={p.name} className="w-2/3 h-2/3 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="text-7xl select-none relative z-10 transition-transform duration-500 group-hover:scale-110">{p.icon}</span>
        )}

        {/* Badges (Top Left) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {p.discount && <span className="bg-[#8B5CF6] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full">-{p.discount}%</span>}
          {p.badge && <span className="bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">{p.badge}</span>}
          {p.isOriginal && <span className="bg-white/95 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">✓ Original</span>}
        </div>

        {/* Wishlist Heart Icon (Top Right, shifted left) */}
        <button
          className={`absolute top-4 right-14 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 bg-white/80 text-gray-600 hover:bg-white`}
          onClick={e => { e.stopPropagation(); onWish(p.id); }}
        >
          <Heart className="w-4 h-4" fill={isWished ? "red" : "none"} style={{ color: isWished ? "red" : "currentColor" }} />
        </button>

        {/* Quick View Button (Top Right) */}
        <button
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black text-white hover:bg-[#8B5CF6] hover:text-black flex items-center justify-center transition-all shadow-md"
          onClick={e => { e.stopPropagation(); onNav("product", p); }}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Add to Cart Shopping Bag Button (Bottom Right) */}
        <button
          className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black text-white hover:bg-[#8B5CF6] hover:text-black flex items-center justify-center transition-all shadow-md"
          onClick={e => { e.stopPropagation(); onCart(p); }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Details & Info */}
      <div className="p-5 flex flex-col flex-1 items-center text-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{p.brand}</span>
        <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{p.name}</h3>
        
        {/* Price Tag */}
        <div className="mt-1">
          <span className="text-xs text-muted-foreground font-semibold block font-mono">
            {isFromPrice ? "From " : ""}LKR {displayPrice.toLocaleString()}
          </span>
          {p.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through block font-mono">
              LKR {p.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color Chips/Swatches */}
        {p.availableColors && p.availableColors.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            {p.availableColors.slice(0, 4).map((c: string, idx: number) => (
              <div
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                style={{ backgroundColor: getColorHex(c) }}
                title={c}
              />
            ))}
            {p.availableColors.length > 4 && (
              <span className="text-[9px] text-muted-foreground font-bold pl-0.5">+{p.availableColors.length - 4}</span>
            )}
          </div>
        )}

        {/* Stock Level Badge */}
        <div className="mt-3 text-[9px] font-bold uppercase tracking-wider">
          {p.stock <= 0 ? (
            <span className="text-red-500">Out of Stock</span>
          ) : p.specs?.showStockCount === true ? (
            <span className="text-[#8B5CF6]">{p.stock} available</span>
          ) : (
            <span className="text-green-500">✓ In Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function BrandPage({ brandName = "Apple", products, onNav, onCart, wishlist, onWish }: {
  brandName?: string;
  products: Product[];
  onNav: (p: Page, prod?: Product) => void;
  onCart: (p: Product) => void;
  wishlist: number[];
  onWish: (id: number) => void;
}) {
  const theme = BRAND_THEMES[brandName] || DEFAULT_THEME;
  const brandProducts = products.filter(p => p.brand === brandName);

  return (
    <div className="animate-fade-in pb-16">
      <div className="relative min-h-[40vh] flex flex-col justify-end text-white px-6 sm:px-12 py-12" style={{ background: theme.gradient }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => onNav("brands")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/35 border border-white/10 backdrop-blur-md text-xs font-bold hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </button>
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10 space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md font-black tracking-widest text-xs uppercase w-fit">
            {theme.logoShort}
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {brandName}
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl font-medium leading-relaxed">
            {theme.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <div className="p-6 bg-gradient-to-r from-[#8B5CF6]/5 to-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <div className="text-sm font-bold text-foreground">Special {brandName} Discount Available!</div>
              <div className="text-xs text-muted-foreground">Use coupon code <span className="font-bold font-mono text-[#8B5CF6]">NEW10</span> at checkout for 10% off accessories.</div>
            </div>
          </div>
          <div className="text-xs font-bold text-[#8B5CF6] uppercase bg-[#8B5CF6]/15 px-3 py-1.5 rounded-xl border border-[#8B5CF6]/20">Active Promo</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Showcase Catalog</h2>
            <p className="text-xs text-muted-foreground">Curated authentic hardware and accessories</p>
          </div>
          <div className="text-xs font-bold text-muted-foreground uppercase bg-secondary px-3 py-1.5 rounded-xl">{brandProducts.length} items</div>
        </div>

        {brandProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brandProducts.map(p => (
              <BrandProductCard key={p.id} p={p} onNav={onNav} onCart={onCart} wishlist={wishlist} onWish={onWish} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <span className="text-4xl block mb-4">🔍</span>
            <div className="text-sm font-bold text-muted-foreground mb-1">No products found</div>
            <div className="text-xs text-muted-foreground">We are currently updating our {brandName} inventory. Check back soon!</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FlashSalePage({ onNav, products, onCart }: { onNav: (p: Page, prod?: Product) => void, products: Product[], onCart: (p: Product) => void }) {
  const [timeLeft, setTimeLeft] = useState(3600 * 5); // 5 hours

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  const flashItems = products.filter(p => p.isFlashSale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-3xl p-10 text-center mb-12 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
         <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
         </div>
         <h1 className="text-4xl sm:text-5xl font-black mb-6" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Flash Sale Ends In</h1>
         <div className="flex justify-center gap-4 text-3xl font-black font-mono">
            <div className="bg-black/35 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md">{hrs.toString().padStart(2, '0')}h</div>
            <div className="bg-black/35 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md">{mins.toString().padStart(2, '0')}m</div>
            <div className="bg-black/35 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md">{secs.toString().padStart(2, '0')}s</div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashItems.length > 0 ? (
          flashItems.map(p => (
            <motion.div key={p.id} className="bg-card border border-border rounded-3xl p-5 flex flex-col h-full cursor-pointer hover:shadow-xl hover:border-[#8B5CF6]/30 transition-all group"
              whileHover={{ y: -6 }} onClick={() => onNav("product", p)}>
              <div className="aspect-square rounded-2xl flex items-center justify-center text-7xl select-none relative overflow-hidden mb-4" style={{ background: p.gradient }}>
                <div className="absolute inset-0 opacity-15" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)" }} />
                <span className="relative z-10">{p.icon}</span>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {p.discount && <span className="bg-[#8B5CF6] text-black text-[10px] font-black px-2 py-0.5 rounded-full">-{p.discount}%</span>}
                  {p.badge && <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">{p.badge}</span>}
                </div>
              </div>
              <div className="flex-grow flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{p.brand}</span>
                <h3 className="font-bold text-base text-foreground line-clamp-1 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
                <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/50">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Deal Price</span>
                    <span className="font-bold text-foreground text-base font-mono">LKR {p.price.toLocaleString()}</span>
                    {p.originalPrice && <span className="text-xs text-muted-foreground line-through block font-mono">LKR {p.originalPrice.toLocaleString()}</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); onCart(p); }}
                    className="w-10 h-10 rounded-xl bg-foreground text-background hover:bg-[#8B5CF6] hover:text-black flex items-center justify-center transition-all">
                    <ShoppingCart className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground font-bold">
             No active flash sale items at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

export function OffersPage() {
  const coupons = [
    { code: "NEW10", desc: "10% off your first accessory purchase.", min: 5000 },
    { code: "FREESHIP", desc: "Free delivery on all orders over 15K.", min: 15000 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Active Offers</h1>
      <p className="text-muted-foreground mb-12">Apply these codes at checkout to unlock your savings.</p>

      <div className="space-y-6">
         {coupons.map(c => (
           <div key={c.code} className="p-8 border-2 border-dashed border-[#8B5CF6] bg-[#8B5CF6]/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <div className="text-lg font-bold text-foreground mb-2">{c.desc}</div>
                 <div className="text-sm text-muted-foreground">Min. spend: LKR {c.min.toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="text-2xl font-black font-mono tracking-widest bg-white px-6 py-3 rounded-xl border border-border shadow-sm">{c.code}</div>
                 <button className="text-sm font-bold text-[#8B5CF6] hover:underline">Copy Code</button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
