import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ChevronRight, ChevronLeft, Eye, MessageCircle, Info, Shield, Check, Star } from 'lucide-react';

// Common Types
type Product = any; 
type Page = string;

// Helper to format currency
const fmt = (num: number) => `LKR ${num.toLocaleString()}`;

function MobilePhoneCard({ p, onNav, onCart, wishlist, onWish }: {
  p: any;
  onNav: (pg: string, p?: any) => void;
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
      className="group relative bg-card rounded-[2rem] overflow-hidden border border-border cursor-pointer flex flex-col h-full hover:shadow-lg transition-all duration-300 w-full"
      whileHover={{ y: -6 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => { setHov(false); setCurrentImgIdx(0); }}
      onClick={() => onNav("phone-details", p)}
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
                {images.map((_, i) => (
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
          onClick={e => { e.stopPropagation(); onNav("phone-details", p); }}
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
            {isFromPrice ? "From " : ""}{fmt(displayPrice)}
          </span>
          {p.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through block font-mono">
              {fmt(p.originalPrice)}
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

export function MobilePhonesPage({ onNav, products, onCart, wishlist, onWish }: { 
  onNav: (p: Page, prod?: Product) => void; 
  products: Product[]; 
  onCart: (p: Product) => void;
  wishlist: number[];
  onWish: (id: number) => void;
}) {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [storageFilter, setStorageFilter] = useState("All");
  
  const brands = ["All", "Apple", "Samsung", "Google"];
  const storages = ["All", "128GB", "256GB", "512GB", "1TB"];

  const filtered = products
    .filter(p => p.category === "Mobile Phones")
    .filter(p => selectedBrand === "All" || p.brand === selectedBrand)
    .filter(p => storageFilter === "All" || (p.storagePricing && p.storagePricing.some((s: any) => s.cap === storageFilter)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Flagships</div>
        <h1 className="text-4xl font-black text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Mobile Phones</h1>
      </div>

      {/* Smart Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-card border border-border p-4 rounded-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Brand:</span>
          {brands.map(b => (
            <button key={b} onClick={() => setSelectedBrand(b)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedBrand === b ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-border"}`}>
              {b}
            </button>
          ))}
        </div>
        <div className="w-px h-8 bg-border hidden md:block mx-2"></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Storage:</span>
          {storages.map(s => (
             <button key={s} onClick={() => setStorageFilter(s)}
             className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${storageFilter === s ? "bg-[#8B5CF6] text-black" : "bg-secondary text-muted-foreground hover:bg-border"}`}>
             {s}
           </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.length > 0 ? (
            filtered.map(p => (
              <MobilePhoneCard key={p.id} p={p} onNav={onNav} onCart={onCart} wishlist={wishlist} onWish={onWish} />
            ))
         ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground font-semibold bg-card border border-border rounded-3xl">
              No smartphones matching the selected filters were found.
            </div>
         )}
      </div>
    </div>
  );
}

export function PhoneDetailsPage({ product, onNav, onCart }: { product: Product; onNav: (p: Page) => void; onCart: (p: Product) => void }) {
  const availableColors = product?.availableColors || ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"];
  const storagePricing = product?.storagePricing || [{ cap: "256GB", price: 385000 }, { cap: "512GB", price: 425000 }, { cap: "1TB", price: 495000 }];

  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [selectedStorage, setSelectedStorage] = useState(storagePricing[0].cap);

  const currentPrice = storagePricing.find(s => s.cap === selectedStorage)?.price || product?.price || 385000;

  const handleWhatsApp = () => {
    const msg = `Hi Universe Hub! I'm interested in buying:%0A%0A📱 *${product?.name || 'iPhone 15 Pro'}*%0A🎨 Color: ${selectedColor}%0A💾 Storage: ${selectedStorage}%0A💰 Price: LKR ${currentPrice.toLocaleString()}%0A%0AIs this currently in stock?`;
    window.open(`https://wa.me/94771234567?text=${msg}`, '_blank');
  };

  const handleReserve = () => {
    const customizedProduct = {
      ...product,
      price: currentPrice,
      name: `${product.name} (${selectedStorage} - ${selectedColor})`
    };
    onCart(customizedProduct);
  };

  // Color circle background mapping
  const colorMap: Record<string, string> = {
    "Natural Titanium": "bg-stone-400",
    "Blue Titanium": "bg-slate-700",
    "White Titanium": "bg-stone-100",
    "Black Titanium": "bg-zinc-800",
    "Titanium Gray": "bg-gray-500",
    "Titanium Yellow": "bg-amber-100",
    "Titanium Violet": "bg-violet-950",
    "Titanium Black": "bg-zinc-900",
    "Bay Blue": "bg-sky-300",
    "Porcelain": "bg-amber-50/70",
    "Obsidian": "bg-stone-900"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => onNav("home")} className="hover:text-foreground transition-colors">Home</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => onNav("phones")} className="hover:text-foreground transition-colors">Mobile Phones</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate">{product?.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="aspect-square rounded-[3rem] flex items-center justify-center border border-border relative overflow-hidden shadow-2xl" style={{ background: product?.gradient }}>
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)" }} />
          {product?.specs?.uploaded_images && Array.isArray(product.specs.uploaded_images) && product.specs.uploaded_images.length > 0 ? (
            <img src={product.specs.uploaded_images[0]} alt={product?.name} className="w-full h-full object-cover relative z-10 animate-fade-in" />
          ) : product?.icon && (product.icon.startsWith("data:image") || product.icon.length > 50) ? (
            <img src={product.icon} alt={product?.name} className="w-2/3 h-2/3 object-contain relative z-10 animate-fade-in" />
          ) : (
            <motion.span className="relative z-10 block text-[10rem]" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              {product?.icon}
            </motion.span>
          )}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {product?.badge && <span className="bg-black/85 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">{product.badge}</span>}
            {product?.discount && <span className="bg-[#8B5CF6] text-black px-3 py-1.5 rounded-full text-xs font-bold">-{product.discount}% OFF</span>}
          </div>
          <div className="absolute bottom-6 right-6 bg-[#8B5CF6]/90 backdrop-blur-md text-black px-4 py-1.5 rounded-2xl text-xs font-black shadow-lg">✓ 100% Original</div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
           <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">{product?.brand}</div>
           <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{product?.name}</h1>
           <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{product?.description}</p>
           
           <div className="text-3xl font-black text-foreground mb-8 font-mono">{fmt(currentPrice)}</div>

           {/* Variants */}
           <div className="space-y-6 mb-8 border-t border-b border-border/50 py-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Color: <span className="text-foreground font-semibold">{selectedColor}</span></label>
                <div className="flex flex-wrap gap-3">
                   {availableColors.map(c => (
                     <button
                       key={c}
                       onClick={() => setSelectedColor(c)}
                       className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === c ? 'border-[#8B5CF6] scale-110 p-0.5' : 'border-border hover:scale-105'}`}
                       title={c}
                     >
                        <div className={`w-full h-full rounded-full ${colorMap[c] || "bg-slate-400"}`}></div>
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Storage Capacity</label>
                <div className="grid grid-cols-3 gap-3">
                   {storagePricing.map(s => (
                     <button
                       key={s.cap}
                       onClick={() => setSelectedStorage(s.cap)}
                       className={`py-3.5 rounded-2xl border-2 font-bold transition-all text-sm ${selectedStorage === s.cap ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'border-border text-foreground hover:border-foreground/30'}`}
                     >
                        {s.cap}
                     </button>
                   ))}
                </div>
              </div>
           </div>

           {/* Call to Actions */}
           <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleWhatsApp} className="flex-1 py-4 rounded-2xl bg-[#25D366] text-white font-bold text-base hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                 <MessageCircle className="w-5 h-5" /> Order on WhatsApp
              </button>
              <button onClick={handleReserve} className="flex-grow py-4 px-6 rounded-2xl bg-foreground text-background font-bold text-base hover:bg-[#8B5CF6] hover:text-black transition-all">
                 Reserve & Add to Cart
              </button>
           </div>

           {/* Trade-In Promo Banner */}
           <div className="mt-4 p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <span className="text-xl">🔄</span>
               <div>
                 <div className="text-xs font-bold text-foreground">Have an old device to trade-in?</div>
                 <div className="text-[11px] text-muted-foreground">Get an instant estimation and save on your upgrade.</div>
               </div>
             </div>
             <button 
               onClick={() => onNav("tradein")}
               className="px-4 py-2 bg-[#8B5CF6] text-black text-xs font-bold rounded-xl hover:brightness-110 transition-all whitespace-nowrap"
             >
               Estimate Value
             </button>
           </div>

           {/* Info list */}
           <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="p-4 bg-secondary rounded-2xl border border-border flex items-center gap-3">
               <Shield className="w-5 h-5 text-[#8B5CF6]" />
               <div>
                 <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Warranty</div>
                 <div className="text-xs font-semibold text-foreground">{product?.warranty}</div>
               </div>
             </div>
             <div className="p-4 bg-secondary rounded-2xl border border-border flex items-center gap-3">
               <Info className="w-5 h-5 text-[#8B5CF6]" />
               <div>
                 <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Specs</div>
                 <div className="text-xs font-semibold text-foreground">{product?.specs?.Processor || "Official Specs"}</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
