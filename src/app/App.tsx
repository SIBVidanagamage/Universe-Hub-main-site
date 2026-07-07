import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Heart, Search, Moon, Sun, Menu, X,
  ChevronRight, Star, Zap, Shield, Truck, RotateCcw,
  Phone, MessageCircle, Bell, User, Package, MapPin,
  CreditCard, Tag, Filter, ArrowRight, Check, Plus, Minus, Eye,
  Clock, Award, Headphones, Smartphone, Watch, Speaker, Battery,
  Settings, ChevronLeft, BarChart3, ShoppingBag, Users,
  TrendingUp, DollarSign, Mail, ChevronDown, Grid, List,
  CheckCircle, AlertTriangle, LogOut, Edit, Camera,
  Home, Bookmark, Lock, RefreshCw, Percent, HardDrive, Gamepad2, Car, Apple, FileText,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

import { MobilePhonesPage, PhoneDetailsPage } from './pages/CatalogPages';
import { CustomerDashboardPage, InvoicesPage, NotificationCenter } from './pages/UserPages';
import { FlashSalePage, BrandPage, OffersPage } from './pages/MarketingPages';
import { NotFoundPage as NewNotFoundPage, ServerErrorPage, MaintenancePage } from './pages/SystemPages';
import { AdminAnalyticsPage, AdminImportPage, AdminDeliveryPage, AdminLoginPage, AdminOrdersView, AdminProductsView, AdminInventoryView } from './pages/AdminPages';
import { WarrantyPage, TradeInPage } from './pages/SupportPages';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';

// ─── Font Constants ───────────────────────────────────────────────────────────
const FD = "'Bricolage Grotesque', system-ui, sans-serif";
const FM = "'DM Mono', monospace";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number; name: string; brand: string; category: string;
  price: number; originalPrice?: number; discount?: number;
  rating: number; reviews: number; stock: number; badge?: string;
  isOriginal: boolean; warranty: string; countryVersion: string;
  gradient: string; icon: string; description: string;
  specs: Record<string, string>; isFlashSale?: boolean; tags?: string[];
  availableColors?: string[];
  storagePricing?: { cap: string; price: number }[];
}
interface CartItem { product: Product; quantity: number; }

const mapDbProductToProduct = (db: any): Product => ({
  id: db.id,
  name: db.name,
  brand: db.brand,
  category: db.category,
  price: Number(db.price),
  originalPrice: db.original_price ? Number(db.original_price) : undefined,
  discount: db.discount,
  rating: Number(db.rating),
  reviews: db.reviews_count || 0,
  stock: db.stock || 0,
  badge: db.badge,
  isOriginal: db.is_original,
  warranty: db.warranty,
  countryVersion: db.country_version,
  gradient: db.gradient,
  icon: db.icon,
  description: db.description,
  specs: db.specs || {},
  isFlashSale: db.is_flash_sale,
  tags: db.tags || [],
  availableColors: db.available_colors || [],
  storagePricing: db.storage_pricing || []
});

const mapProductToDbProduct = (p: Product) => {
  const payload: any = {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice ?? null,
    discount: p.discount ?? null,
    rating: p.rating ?? 5,
    reviews_count: p.reviews ?? 0,
    stock: p.stock ?? 10,
    badge: p.badge ?? null,
    is_original: p.isOriginal ?? true,
    warranty: p.warranty ?? null,
    country_version: p.countryVersion ?? null,
    gradient: p.gradient || "linear-gradient(135deg, #1e1b4b, #311042)",
    icon: p.icon || "📦",
    description: p.description || "",
    specs: p.specs || {},
    is_flash_sale: p.isFlashSale ?? false,
    tags: p.tags || [],
    available_colors: p.availableColors || [],
    storage_pricing: p.storagePricing || []
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};
type Page = "home"|"shop"|"product"|"cart"|"checkout"|"success"|"login"|"register"|"account"|"wishlist"|"search"|"categories"|"brands"|"brand"|"about"|"contact"|"404"|"admin"|"orders"|"tracking"|"phones"|"phone-details"|"dashboard"|"invoices"|"notifications"|"flashsale"|"offers"|"warranty"|"tradein"|"500"|"maintenance"|"admin-analytics"|"admin-import"|"admin-delivery";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id:1, name:"AirPods Pro (2nd Generation)", brand:"Apple", category:"Earbuds & AirPods", price:82500, originalPrice:95000, discount:13, rating:4.9, reviews:248, stock:15, badge:"Best Seller", isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)", icon:"🎧", description:"Experience next-level Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio. The most advanced AirPods Pro ever.", specs:{"Chip":"Apple H2","ANC":"Up to 2x more ANC","Battery":"6h (30h with case)","Bluetooth":"5.3","Water Resistance":"IPX4","Charging":"Lightning / MagSafe"}, isFlashSale:true, tags:["wireless","anc","apple"] },
  { id:2, name:"Apple 20W USB-C Power Adapter", brand:"Apple", category:"Chargers", price:9500, originalPrice:11000, discount:14, rating:4.8, reviews:512, stock:45, isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"Sri Lanka", gradient:"linear-gradient(135deg,#64748b,#475569)", icon:"⚡", description:"Fast-charge your iPhone 8 or later up to 50% battery in around 30 minutes. Comes with USB-C port for broad compatibility.", specs:{"Wattage":"20W","Connector":"USB-C","Input":"100–240V AC","Output":"9V/2.22A or 5V/4A"} },
  { id:3, name:"Apple USB-C to Lightning Cable (1m)", brand:"Apple", category:"Cables", price:6500, originalPrice:8000, discount:19, rating:4.7, reviews:389, stock:30, isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#0ea5e9,#2563eb)", icon:"🔌", description:"Charge and sync your iPhone or iPad with this genuine Apple USB-C to Lightning Cable. Braided nylon for durability.", specs:{"Length":"1 Metre","Connector 1":"USB-C","Connector 2":"Lightning","Material":"Braided Nylon"} },
  { id:4, name:"Apple MagSafe Charger (1m)", brand:"Apple", category:"Chargers", price:14500, originalPrice:16500, discount:12, rating:4.9, reviews:176, stock:20, badge:"Trending", isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#10b981,#0d9488)", icon:"🔋", description:"MagSafe Charger delivers fast wireless charging with the magic of magnets. Simply hold it near your iPhone and it snaps into place perfectly.", specs:{"Wattage":"15W with compatible adapter","Connector":"USB-C","Length":"1 Metre","Compatible":"iPhone 12 and later"}, isFlashSale:true },
  { id:5, name:"Nothing Ear (2)", brand:"Nothing", category:"Earbuds & AirPods", price:32000, originalPrice:36000, discount:11, rating:4.7, reviews:142, stock:8, badge:"New Arrival", isOriginal:true, warranty:"1 Year Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#374151,#111827)", icon:"◎", description:"Hi-Res Audio certified with 11.6mm custom drivers, dual chamber design, and up to 40dB active noise cancellation.", specs:{"Drivers":"11.6mm Custom","ANC":"Up to 40dB","Battery":"6.3h (36h with case)","Bluetooth":"5.3","Water Resistance":"IP54"} },
  { id:6, name:"Samsung Galaxy Watch 6 Classic", brand:"Samsung", category:"Smart Watches", price:65000, originalPrice:75000, discount:13, rating:4.6, reviews:98, stock:5, badge:"Limited Stock", isOriginal:true, warranty:"1 Year Samsung Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#f43f5e,#e11d48)", icon:"⌚", description:"The iconic rotating bezel returns with advanced health monitoring, sapphire crystal display, and Wear OS 4.0.", specs:{"Display":"1.47\" Super AMOLED","Processor":"Exynos W930","Battery":"300mAh","OS":"Wear OS 4.0","Water Resistance":"5ATM + IP68"} },
  { id:7, name:"Anker 733 Power Bank GaNPrime 65W", brand:"Anker", category:"Power Banks", price:18500, originalPrice:22000, discount:16, rating:4.8, reviews:203, stock:25, badge:"Best Value", isOriginal:true, warranty:"18 Month Anker Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#f59e0b,#d97706)", icon:"🔋", description:"2-in-1 power bank and 65W wall charger built in one. Charge your laptop, phone, and tablet simultaneously with GaNPrime technology.", specs:{"Capacity":"10,000mAh","Max Output":"65W","Ports":"2× USB-C + 1× USB-A","Technology":"GaNPrime","Weight":"220g"}, isFlashSale:true },
  { id:8, name:"JBL Flip 6 Portable Speaker", brand:"JBL", category:"Bluetooth Speakers", price:24500, originalPrice:28000, discount:13, rating:4.7, reviews:167, stock:12, isOriginal:true, warranty:"1 Year JBL Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#3b82f6,#06b6d4)", icon:"🔊", description:"Bold JBL Original Pro Sound with enhanced bass, racetrack-shaped driver, and two JBL bass radiators. IP67 waterproof.", specs:{"Driver":"1× Woofer + 2× Tweeters","Battery":"Up to 12 hours","Water Resistance":"IP67","Bluetooth":"5.1","Power Output":"30W"} },
  { id:9, name:"Apple Silicone Case with MagSafe", brand:"Apple", category:"Phone Cases", price:8500, originalPrice:10000, discount:15, rating:4.8, reviews:334, stock:50, badge:"Top Pick", isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#ec4899,#db2777)", icon:"📱", description:"Designed by Apple to complement iPhone 15. Soft-touch silicone exterior with microfiber lining. Supports MagSafe charging.", specs:{"Compatible":"iPhone 15 Pro Max","Material":"Silicone + Microfiber","MagSafe":"Yes","Drop Protection":"Military Grade"} },
  { id:10, name:"Spigen Ultra Hybrid iPhone 15 Case", brand:"Spigen", category:"Phone Cases", price:5500, rating:4.6, reviews:445, stock:60, isOriginal:true, warranty:"1 Year Spigen Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#14b8a6,#0d9488)", icon:"🛡️", description:"Crystal-clear back with flexible TPU bumper, providing all-around protection without hiding your iPhone's beauty.", specs:{"Compatible":"iPhone 15 Pro","Material":"Polycarbonate + TPU","Drop Test":"MIL-STD-810G"} },
  { id:11, name:"Belkin UltraGlass Screen Protector", brand:"Belkin", category:"Screen Protectors", price:4500, originalPrice:6000, discount:25, rating:4.5, reviews:289, stock:75, badge:"25% OFF", isOriginal:true, warranty:"Lifetime Guarantee", countryVersion:"International", gradient:"linear-gradient(135deg,#8b5cf6,#6366f1)", icon:"🔍", description:"2x stronger than ordinary tempered glass. Ion-strengthened for ultimate protection with 99.9% optical clarity.", specs:{"Compatible":"iPhone 15 Series","Hardness":"9H","Thickness":"0.29mm","Clarity":"99.9%"} },
  { id:12, name:"Baseus 65W GaN Fast Charger", brand:"Baseus", category:"Chargers", price:7500, originalPrice:9500, discount:21, rating:4.7, reviews:198, stock:35, badge:"New", isOriginal:true, warranty:"1 Year Baseus Warranty", countryVersion:"International", gradient:"linear-gradient(135deg,#84cc16,#16a34a)", icon:"⚡", description:"65W GaN II technology charges 3 devices simultaneously. Compatible with MacBook, iPad, iPhone, and more.", specs:{"Wattage":"65W","Ports":"2× USB-C + 1× USB-A","Technology":"GaN II","Compatibility":"Universal"} },
  { id:13, name:"iPhone 15 Pro", brand:"Apple", category:"Mobile Phones", price:385000, originalPrice:410000, discount:6, rating:4.9, reviews:182, stock:8, badge:"Flagship", isOriginal:true, warranty:"1 Year Apple Warranty", countryVersion:"ZA Version (Dual eSIM/Physical)", gradient:"linear-gradient(135deg, #2c3e50, #bdc3c7)", icon:"📱", description:"Featuring a strong and light aerospace-grade titanium design, the new Action button, powerful camera upgrades, and A17 Pro chip.", specs:{"Processor":"A17 Pro","Display":"6.1\" Super Retina XDR OLED","Camera":"48MP Main + 12MP Ultra Wide + 12MP Telephoto","Battery":"3274mAh","Storage":"256GB","Colors":"Natural Titanium,Blue Titanium,White Titanium,Black Titanium"}, availableColors:["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"], storagePricing:[{ cap: "256GB", price: 385000 }, { cap: "512GB", price: 425000 }, { cap: "1TB", price: 495000 }] },
  { id:14, name:"Galaxy S24 Ultra", brand:"Samsung", category:"Mobile Phones", price:395000, originalPrice:420000, discount:5, rating:4.8, reviews:95, stock:6, badge:"AI Powered", isOriginal:true, warranty:"1 Year Samsung Warranty", countryVersion:"Singapore Version", gradient:"linear-gradient(135deg, #1e272c, #0d1214)", icon:"📲", description:"Explore the new era of mobile AI. S24 Ultra comes with titanium exterior, flat display, built-in S Pen, and 200MP camera.", specs:{"Processor":"Snapdragon 8 Gen 3 for Galaxy","Display":"6.8\" Dynamic AMOLED 2X","Camera":"200MP Main + 50MP + 12MP + 10MP Quad Camera","Battery":"5000mAh","Storage":"256GB","Colors":"Titanium Gray,Titanium Yellow,Titanium Violet,Titanium Black"}, availableColors:["Titanium Gray", "Titanium Yellow", "Titanium Violet", "Titanium Black"], storagePricing:[{ cap: "256GB", price: 395000 }, { cap: "512GB", price: 435000 }, { cap: "1TB", price: 505000 }] },
  { id:15, name:"Google Pixel 8 Pro", brand:"Google", category:"Mobile Phones", price:285000, originalPrice:320000, discount:10, rating:4.7, reviews:46, stock:4, badge:"Pure Android", isOriginal:true, warranty:"1 Year Seller Warranty", countryVersion:"US Version", gradient:"linear-gradient(135deg, #70a1ff, #dfe4ea)", icon:"📱", description:"The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and Google Tensor G3.", specs:{"Processor":"Google Tensor G3","Display":"6.7\" Super Actua Display","Camera":"50MP Main + 48MP Wide + 48MP Zoom","Battery":"5050mAh","Storage":"128GB","Colors":"Bay Blue,Porcelain,Obsidian"}, availableColors:["Bay Blue", "Porcelain", "Obsidian"], storagePricing:[{ cap: "128GB", price: 285000 }, { cap: "256GB", price: 315000 }, { cap: "512GB", price: 355000 }] },
];

const CATEGORIES = [
  { name:"Mobile Phones", icon:Smartphone, gradient:"linear-gradient(135deg,#3b82f6,#2563eb)", count:15 },
  { name:"Apple Accessories", icon:Apple, gradient:"linear-gradient(135deg,#64748b,#475569)", count:42 },
  { name:"Chargers", icon:Zap, gradient:"linear-gradient(135deg,#f59e0b,#ea580c)", count:31 },
  { name:"Cables", icon:Zap, gradient:"linear-gradient(135deg,#0ea5e9,#2563eb)", count:18 },
  { name:"Earbuds & AirPods", icon:Headphones, gradient:"linear-gradient(135deg,#6366f1,#8b5cf6)", count:24 },
  { name:"Power Banks", icon:Battery, gradient:"linear-gradient(135deg,#10b981,#059669)", count:14 },
  { name:"Screen Protectors", icon:Shield, gradient:"linear-gradient(135deg,#8b5cf6,#7c3aed)", count:22 },
  { name:"Phone Cases", icon:Package, gradient:"linear-gradient(135deg,#ec4899,#be185d)", count:56 },
  { name:"Smart Watches", icon:Watch, gradient:"linear-gradient(135deg,#f43f5e,#dc2626)", count:12 },
  { name:"Bluetooth Speakers", icon:Speaker, gradient:"linear-gradient(135deg,#06b6d4,#0891b2)", count:19 },
  { name:"Other Accessories", icon:Grid, gradient:"linear-gradient(135deg,#64748b,#475569)", count:80 },
];

const BRANDS = [
  { name:"Apple", short:"AAPL", color:"#111111" },
  { name:"Samsung", short:"SMSG", color:"#1428A0" },
  { name:"Nothing", short:"NTNG", color:"#000000" },
  { name:"Anker", short:"ANKR", color:"#0066CC" },
  { name:"JBL", short:"JBL", color:"#CC0000" },
  { name:"Belkin", short:"BLKN", color:"#003087" },
  { name:"Spigen", short:"SPGN", color:"#222222" },
  { name:"Baseus", short:"BSUS", color:"#FF6B00" },
];

const REVIEWS = [
  { id:1, name:"Kasun Perera", location:"Colombo", rating:5, review:"Absolutely premium quality. Got my AirPods Pro and the packaging was immaculate. 100% original, delivery within 24 hours!", avatar:"KP", product:"AirPods Pro 2nd Gen", date:"2 days ago" },
  { id:2, name:"Dilini Fernando", location:"Kandy", rating:5, review:"Universe Hub is the best place to buy Apple accessories in Sri Lanka. Competitive prices and outstanding customer service every time.", avatar:"DF", product:"Apple MagSafe Charger", date:"1 week ago" },
  { id:3, name:"Ashan Rodrigo", location:"Galle", rating:5, review:"Nothing Ear 2 arrived perfectly sealed with official warranty card. Very satisfied with Universe Hub — will definitely order again!", avatar:"AR", product:"Nothing Ear (2)", date:"3 days ago" },
  { id:4, name:"Sachini Jayawardena", location:"Negombo", rating:5, review:"Great selection of verified original products. The WhatsApp support was incredibly helpful throughout my entire order process.", avatar:"SJ", product:"Galaxy Watch 6 Classic", date:"5 days ago" },
];

const ADMIN_CHART_DATA = [
  { month:"Jan", revenue:485000, orders:62 }, { month:"Feb", revenue:524000, orders:71 },
  { month:"Mar", revenue:612000, orders:88 }, { month:"Apr", revenue:578000, orders:79 },
  { month:"May", revenue:694000, orders:96 }, { month:"Jun", revenue:742000, orders:103 },
  { month:"Jul", revenue:821000, orders:118 },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (n: number) => `LKR ${n.toLocaleString("en-US")}`;

function useCountdown() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const d = end.getTime() - Date.now();
      setT({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n: number) => String(n).padStart(2, "0");

// ─── Micro Components ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-border fill-border"}`} />
      ))}
    </div>
  );
}

function Badge({ label, variant = "green" }: { label: string; variant?: "green"|"dark"|"white"|"red"|"amber" }) {
  const cls = {
    green: "bg-[#8B5CF6] text-black",
    dark: "bg-black/70 text-white backdrop-blur-sm",
    white: "bg-white/90 text-gray-800 backdrop-blur-sm",
    red: "bg-[#FF3B30] text-white",
    amber: "bg-amber-500 text-white",
  }[variant];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${cls}`}>{label}</span>;
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
const SocialIcon = ({ type }: { type: "ig"|"fb"|"tw"|"yt" }) => {
  const paths: Record<string, string> = {
    ig: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    fb: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    tw: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
    yt: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  };
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={type === "fb" || type === "tw" ? "none" : "currentColor"} stroke={type === "fb" || type === "tw" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[type]} />
    </svg>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onCart, wishlist, onWish, onNav }: {
  product: Product; onCart: (p: Product) => void;
  wishlist: number[]; onWish: (id: number) => void;
  onNav: (pg: Page, p?: Product) => void;
}) {
  const [hov, setHov] = useState(false);
  const isWished = wishlist.includes(product.id);

  // Carousel state
  const images = product.specs?.uploaded_images || [];
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

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

  const displayPrice = product.storagePricing && product.storagePricing.length > 0
    ? Math.min(...product.storagePricing.map(sp => sp.price))
    : product.price;

  const isFromPrice = product.storagePricing && product.storagePricing.length > 0;

  return (
    <motion.div
      className="group relative bg-card rounded-[2rem] overflow-hidden border border-border cursor-pointer flex flex-col w-[260px] sm:w-[280px] h-full hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -6 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => { setHov(false); setCurrentImgIdx(0); }}
      onClick={() => onNav("product", product)}
    >
      {/* Image Area with light grey background */}
      <div className="relative aspect-square flex items-center justify-center bg-[#F4F4F5] dark:bg-zinc-900 overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)" }} />
        
        {images.length > 0 ? (
          <div className="w-full h-full relative z-10">
            <img src={images[currentImgIdx]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            
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
        ) : product.icon && (product.icon.startsWith("data:image") || product.icon.length > 50) ? (
          <img src={product.icon} alt={product.name} className="w-2/3 h-2/3 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="text-7xl select-none relative z-10 transition-transform duration-500 group-hover:scale-110">{product.icon}</span>
        )}

        {/* Badges (Top Left) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {product.discount && <span className="bg-[#8B5CF6] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full">-{product.discount}%</span>}
          {product.badge && <span className="bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">{product.badge}</span>}
          {product.isOriginal && <span className="bg-white/95 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">✓ Original</span>}
        </div>

        {/* Wishlist Heart Icon (Top Right, shifted left) */}
        <button
          className={`absolute top-4 right-14 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 bg-white/80 text-gray-600 hover:bg-white`}
          onClick={e => { e.stopPropagation(); onWish(product.id); }}
        >
          <Heart className="w-4 h-4" fill={isWished ? "red" : "none"} style={{ color: isWished ? "red" : "currentColor" }} />
        </button>

        {/* Quick View Button (Top Right) */}
        <button
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black text-white hover:bg-[#8B5CF6] hover:text-black flex items-center justify-center transition-all shadow-md"
          onClick={e => { e.stopPropagation(); onNav("product", product); }}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Add to Cart Shopping Bag Button (Bottom Right) */}
        <button
          className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black text-white hover:bg-[#8B5CF6] hover:text-black flex items-center justify-center transition-all shadow-md"
          onClick={e => { e.stopPropagation(); onCart(product); }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Details & Info */}
      <div className="p-5 flex flex-col flex-1 items-center text-center">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{product.brand}</span>
        <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1" style={{ fontFamily: FD }}>{product.name}</h3>
        
        {/* Price Tag */}
        <div className="mt-1">
          <span className="text-xs text-muted-foreground font-semibold block">
            {isFromPrice ? "From " : ""}{fmt(displayPrice)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through block font-mono">
              {fmt(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color Chips/Swatches */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            {product.availableColors.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full border border-border shadow-xs"
                style={{ backgroundColor: getColorHex(c) }}
                title={c}
              />
            ))}
            {product.availableColors.length > 4 && (
              <span className="text-[9px] text-muted-foreground font-bold pl-0.5">+{product.availableColors.length - 4}</span>
            )}
          </div>
        )}

        {/* Stock Level Badge */}
        <div className="mt-3 text-[9px] font-bold uppercase tracking-wider">
          {product.stock <= 0 ? (
            <span className="text-red-500">Out of Stock</span>
          ) : product.specs?.showStockCount === true ? (
            <span className="text-[#8B5CF6]">{product.stock} available</span>
          ) : (
            <span className="text-green-500">✓ In Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ page, onNav, isDark, setDark, cartCount, wishCount, notifCount, onSearch }: {
  page: Page; onNav: (p: Page) => void; isDark: boolean;
  setDark: (v: boolean) => void; cartCount: number; wishCount: number; notifCount: number;
  onSearch: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  const navItems: { label: string; pg: Page }[] = [
    { label:"Home", pg:"home" }, { label:"Shop", pg:"shop" },
    { label:"Categories", pg:"categories" }, { label:"Brands", pg:"brands" },
    { label:"About", pg:"about" }, { label:"Contact", pg:"contact" },
  ];
  return (
    <>
      {/* Announcement Bar */}
      <div onClick={() => onNav("flashsale")} className="bg-[#8B5CF6] text-black text-[11px] font-black py-2.5 text-center tracking-wide cursor-pointer hover:brightness-105 transition-all">
        🔥 FLASH SALE: Up to 25% OFF on Apple Accessories &nbsp;|&nbsp; Free Delivery over LKR 5,000 &nbsp;|&nbsp; Click to View Sale
      </div>
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-2xl border-b border-border" : ""}`}
        style={{ background: scrolled ? (isDark ? "rgba(10,10,10,0.88)" : "rgba(248,249,251,0.88)") : "transparent" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => onNav("home")} className="flex items-center gap-2 shrink-0 relative group">
            <div className="relative flex flex-col items-start leading-none">
              <span className="text-[7px] text-foreground/70 tracking-[0.2em] mb-1 font-semibold uppercase">Your One-Stop Shop For Everything</span>
              <div className="flex items-end gap-1 relative z-10">
                <span className="font-black text-2xl tracking-tighter text-foreground" style={{ fontFamily: FD }}>UNIVERSE</span>
                <span className="font-black text-lg tracking-tight text-foreground/90 pb-0.5" style={{ fontFamily: FD }}>HUB</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100%] border-[1px] border-amber-400/50 -rotate-6 pointer-events-none group-hover:rotate-0 group-hover:border-amber-400 transition-all duration-500">
                <div className="absolute top-0 right-1/4 w-1.5 h-1.5 bg-foreground rounded-full blur-[0.5px]"></div>
                <div className="absolute bottom-[-2px] left-1/3 w-2.5 h-2.5 bg-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              </div>
            </div>
          </button>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(n => (
              <button key={n.pg} onClick={() => onNav(n.pg)}
                className={`text-sm font-medium transition-colors ${page === n.pg ? "text-[#8B5CF6]" : "text-foreground/70 hover:text-foreground"}`}
              >{n.label}</button>
            ))}
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={onSearch} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all"><Search className="w-4.5 h-4.5" /></button>
            <button onClick={() => onNav("wishlist")} className="relative w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all">
              <Heart className="w-4.5 h-4.5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
            </button>
            <button onClick={() => onNav("cart")} className="relative w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B5CF6] text-black text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
            <button onClick={() => onNav("notifications")} className="relative w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all">
              <Bell className="w-4.5 h-4.5" />
              {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{notifCount}</span>}
            </button>
            <button onClick={() => setDark(!isDark)} className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all">
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button onClick={() => onNav("login")} className="hidden sm:flex items-center gap-2 ml-1 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-[#8B5CF6] hover:text-black transition-all duration-200">
              <User className="w-4 h-4" /> Account
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-secondary transition-all">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="p-5 flex items-center justify-between border-b border-border">
                <button onClick={() => { onNav("home"); setMobileOpen(false); }} className="flex items-center gap-2 relative group scale-75 origin-left">
                  <div className="relative flex flex-col items-start leading-none">
                    <span className="text-[7px] text-foreground/70 tracking-[0.2em] mb-1 font-semibold uppercase">Your One-Stop Shop For Everything</span>
                    <div className="flex items-end gap-1 relative z-10">
                      <span className="font-black text-2xl tracking-tighter text-foreground" style={{ fontFamily: FD }}>UNIVERSE</span>
                      <span className="font-black text-lg tracking-tight text-foreground/90 pb-0.5" style={{ fontFamily: FD }}>HUB</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100%] border-[1px] border-amber-400/50 -rotate-6 pointer-events-none">
                      <div className="absolute bottom-[-2px] left-1/3 w-2 h-2 bg-foreground rounded-full"></div>
                    </div>
                  </div>
                </button>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <nav className="flex-1 p-4 flex flex-col gap-1">
                {navItems.map(n => (
                  <button key={n.pg} onClick={() => { onNav(n.pg); setMobileOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${page === n.pg ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-foreground/70 hover:bg-secondary hover:text-foreground"}`}
                  >{n.label}</button>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <button onClick={() => { onNav("login"); setMobileOpen(false); }} className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold text-sm">Sign In / Register</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6 relative group scale-90 origin-left">
              <div className="relative flex flex-col items-start leading-none">
                <span className="text-[7px] text-foreground/70 tracking-[0.2em] mb-1 font-semibold uppercase">Your One-Stop Shop For Everything</span>
                <div className="flex items-end gap-1 relative z-10">
                  <span className="font-black text-2xl tracking-tighter text-foreground" style={{ fontFamily: FD }}>UNIVERSE</span>
                  <span className="font-black text-lg tracking-tight text-foreground/90 pb-0.5" style={{ fontFamily: FD }}>HUB</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100%] border-[1px] border-amber-400/50 -rotate-6 pointer-events-none group-hover:rotate-0 transition-all duration-500">
                  <div className="absolute bottom-[-2px] left-1/3 w-2.5 h-2.5 bg-foreground rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">Sri Lanka&apos;s #1 destination for 100% original premium mobile accessories. Every product verified & guaranteed.</p>
            <div className="flex gap-3">
              {(["ig","fb","tw","yt"] as const).map(s => (
                <button key={s} className="w-9 h-9 rounded-xl bg-secondary hover:bg-[#8B5CF6] hover:text-black text-muted-foreground transition-all duration-200 flex items-center justify-center"><SocialIcon type={s} /></button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-5 text-muted-foreground">Shop</div>
            {["All Products","Phone Cases","Chargers","Earbuds & AirPods","Smart Watches","Power Banks"].map(l => (
              <button key={l} onClick={() => onNav("shop")} className="block text-sm text-foreground/70 hover:text-[#8B5CF6] mb-2 transition-colors text-left">{l}</button>
            ))}
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-5 text-muted-foreground">Support</div>
            {[{l:"My Account",pg:"account"},{l:"My Orders",pg:"orders"},{l:"Warranty Check",pg:"warranty"},{l:"Trade-In Device",pg:"tradein"}].map(({l,pg}) => (
              <button key={l} onClick={() => onNav(pg as Page)} className="block text-sm text-foreground/70 hover:text-[#8B5CF6] mb-2 transition-colors text-left">{l}</button>
            ))}
            {[{l:"Track Order",pg:"tracking"},{l:"Contact Us",pg:"contact"},{l:"FAQ",pg:"contact"},{l:"Privacy Policy",pg:"about"}].map(({l,pg}) => (
              <button key={l} onClick={() => onNav(pg as Page)} className="block text-sm text-foreground/70 hover:text-[#8B5CF6] mb-2 transition-colors text-left">{l}</button>
            ))}
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-5 text-muted-foreground">Contact</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#8B5CF6] shrink-0" /><span>077 123 4567</span></div>
              <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#8B5CF6] shrink-0" /><span>WhatsApp Orders Available</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#8B5CF6] shrink-0" /><span>hello@clnow.lk</span></div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" /><span>No. 45, Galle Road,<br />Colombo 03, Sri Lanka</span></div>
            </div>
            <div className="mt-5">
              <div className="text-xs text-muted-foreground mb-3 font-medium">We Accept</div>
              <div className="flex flex-wrap gap-2">
                {["VISA","MC","COD","Bank","LankaQR","MintPay"].map(p => (
                  <span key={p} className="px-2 py-1 rounded-lg bg-secondary text-xs font-bold text-muted-foreground border border-border">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">© 2024 Universe Hub. All rights reserved. Made with ♥ in Sri Lanka.</div>
          <button onClick={() => onNav("login")} className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">Admin Portal</button>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating Buttons ─────────────────────────────────────────────────────────
function FloatingButtons({ onNav, cartCount }: { onNav: (p: Page) => void; cartCount: number }) {
  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 items-end">
      <motion.button
        onClick={() => onNav("cart")}
        className="relative w-12 h-12 rounded-full bg-foreground text-background shadow-2xl flex items-center justify-center hover:bg-[#8B5CF6] hover:text-black transition-all duration-200"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B5CF6] text-black text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
      </motion.button>
      <motion.a
        href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white text-sm font-semibold"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
        whileHover={{ scale: 1.05, x: -4 }} whileTap={{ scale: 0.97 }}
        onClick={e => e.preventDefault()}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:block">Order on WhatsApp</span>
      </motion.a>
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileNav({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  const items = [
    { icon: Home, label: "Home", pg: "home" as Page },
    { icon: ShoppingBag, label: "Shop", pg: "shop" as Page },
    { icon: Search, label: "Search", pg: "search" as Page },
    { icon: Heart, label: "Wishlist", pg: "wishlist" as Page },
    { icon: User, label: "Account", pg: "account" as Page },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border backdrop-blur-2xl" style={{ background: "var(--background)" }}>
      <div className="flex pb-safe">
        {items.map(({ icon: Icon, label, pg }) => (
          <button key={pg} onClick={() => onNav(pg)} className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all">
            <Icon className={`w-5 h-5 ${page === pg ? "text-[#8B5CF6]" : "text-muted-foreground"}`} />
            <span className={`text-[10px] font-medium ${page === pg ? "text-[#8B5CF6]" : "text-muted-foreground"}`}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Search Overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose, products, onNav }: {
  onClose: () => void; products: Product[]; onNav: (p: Page, prod?: Product) => void;
}) {
  const [q, setQ] = useState(""); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const results = q.length > 1 ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())) : [];
  const popular = ["AirPods Pro", "MagSafe Charger", "Nothing Ear", "Samsung Watch", "Anker Power Bank"];
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 max-w-2xl mx-auto w-full mt-16 px-4">
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, brands..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base" />
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map(p => (
                  <button key={p.id} onClick={() => { onNav("product", p); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: p.gradient }}>{p.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.brand} · {fmt(p.price)}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Popular Searches</div>
                <div className="flex flex-wrap gap-2">
                  {popular.map(s => (
                    <button key={s} onClick={() => setQ(s)} className="px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground/70 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Notification Toast ───────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const id = setTimeout(onClose, 3000); return () => clearTimeout(id); }, [onClose]);
  return (
    <motion.div
      className="fixed top-20 right-4 z-50 bg-card border border-[#8B5CF6] rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 max-w-xs"
      initial={{ opacity: 0, x: 80, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 80 }}
    >
      <CheckCircle className="w-5 h-5 text-[#8B5CF6] shrink-0" />
      <span className="text-sm font-medium text-foreground">{msg}</span>
    </motion.div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ onNav, products, onCart, wishlist, onWish, isDark }: {
  onNav: (p: Page, prod?: Product) => void; products: Product[]; onCart: (p: Product) => void;
  wishlist: number[]; onWish: (id: number) => void; isDark: boolean;
}) {
  const timer = useCountdown();
  const featured = products.slice(0, 8);
  const flashItems = products.filter(p => p.isFlashSale);
  const [activeTab, setActiveTab] = useState<"trending"|"bestsellers"|"new">("trending");
  const tabs: { key: "trending"|"bestsellers"|"new"; label: string }[] = [
    { key:"trending", label:"Trending Now" }, { key:"bestsellers", label:"Best Sellers" }, { key:"new", label:"New Arrivals" },
  ];
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Subtle Grid pattern for glass feel */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
              100% Original Products · Free Delivery Available
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground mb-6" style={{ fontFamily: FD }}>
              Where Premium<br />
              <span style={{ background: "linear-gradient(135deg, #8B5CF6, #00E676, #69F0AE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Meets Authentic
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Sri Lanka&apos;s #1 destination for 100% original Apple, Samsung, Nothing & premium mobile accessories. Every product comes with official warranty.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <motion.button
                onClick={() => onNav("shop")}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-base hover:bg-[#8B5CF6] hover:text-black transition-all duration-300"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >Shop Now <ArrowRight className="w-5 h-5" /></motion.button>
              <motion.button
                onClick={() => onNav("categories")}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-border text-foreground font-bold text-base hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all duration-300"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >Browse Categories</motion.button>
            </div>
            <div className="flex flex-wrap gap-6">
              {[{ n:"12,000+", l:"Happy Customers" }, { n:"500+", l:"Products" }, { n:"100%", l:"Originals" }, { n:"24hr", l:"Fast Delivery" }].map(({ n, l }) => (
                <div key={l}>
                  <div className="text-2xl font-black text-foreground" style={{ fontFamily: FD }}>{n}</div>
                  <div className="text-xs text-muted-foreground font-medium">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
          {/* Hero Product Showcase */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative">
              {/* Main card */}
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-[3rem] flex items-center justify-center shadow-[0_40px_120px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)" }}>
                <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 60%)" }} />
                <span className="text-9xl">🎧</span>
              </div>
              {/* Floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-8 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10">
                <div className="text-xs text-white/80 font-semibold mb-1">AirPods Pro 2nd Gen</div>
                <div className="font-black text-lg text-white" style={{ fontFamily: FD, textShadow: '0 2px 10px rgba(255,255,255,0.4)' }}>LKR 82,500</div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-8 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>
                  <div><div className="text-xs font-black text-white tracking-wide" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.4)' }}>Official Warranty</div><div className="text-[11px] text-white/80 font-medium mt-0.5">1 Year Apple</div></div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -left-12 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={4.9} />
                  <span className="text-sm font-black text-white" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.4)' }}>4.9</span>
                </div>
                <div className="text-[11px] font-medium text-white/80">248 Reviews</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-12 overflow-hidden" style={{ background: isDark ? "linear-gradient(135deg, #1a0a00, #2d1a00)" : "linear-gradient(135deg, #111111, #1f1f1f)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] flex items-center gap-2">
                <Zap className="w-4 h-4 text-black fill-black" />
                <span className="text-black font-black text-sm">FLASH SALE</span>
              </div>
              <div className="text-white">
                <div className="text-xs text-white/50 font-medium mb-0.5">Ends in</div>
                <div className="flex items-center gap-1.5" style={{ fontFamily: FM }}>
                  {[pad(timer.h), pad(timer.m), pad(timer.s)].map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-bold text-lg backdrop-blur-sm">{t}</span>
                      {i < 2 && <span className="text-white/50 font-bold">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => onNav("shop")} className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#8B5CF6] transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashItems.map(p => (
              <motion.div key={p.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group"
                whileHover={{ y: -3 }} onClick={() => onNav("product", p)}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0" style={{ background: p.gradient }}>{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-0.5">{p.brand}</div>
                  <div className="text-sm font-bold text-white line-clamp-1 mb-1" style={{ fontFamily: FD }}>{p.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#8B5CF6]" style={{ fontFamily: FM }}>{fmt(p.price)}</span>
                    {p.originalPrice && <span className="text-xs text-white/30 line-through" style={{ fontFamily: FM }}>{fmt(p.originalPrice)}</span>}
                    {p.discount && <span className="px-1.5 py-0.5 rounded-full bg-[#8B5CF6] text-black text-[10px] font-bold">-{p.discount}%</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onCart(p); }}
                  className="shrink-0 w-9 h-9 rounded-xl bg-[#8B5CF6] text-black flex items-center justify-center hover:scale-110 transition-transform">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: "100% Original", desc: "Every product verified" },
              { icon: Truck, title: "Fast Delivery", desc: "Island-wide in 24hrs" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: Award, title: "Official Warranty", desc: "Brand warranty included" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Browse by Category</div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: FD }}>Shop by Category</h2>
          </div>
          <button onClick={() => onNav("categories")} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#8B5CF6] transition-colors">
            All Categories <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button key={cat.name} onClick={() => onNav("shop", undefined, cat.name)}
                className="group relative overflow-hidden rounded-3xl p-6 flex flex-col items-center gap-3 border border-border bg-card hover:border-transparent transition-all duration-300"
                whileHover={{ y: -4, scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ ["--hover-bg" as string]: "transparent" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" style={{ background: cat.gradient + "20" }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: cat.gradient }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="relative text-center">
                  <div className="font-bold text-sm text-foreground leading-tight">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cat.count} Products</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Handpicked for You</div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: FD }}>Featured Products</h2>
          </div>
          <div className="flex gap-2 p-1 rounded-2xl bg-secondary">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} onCart={onCart} wishlist={wishlist} onWish={onWish} onNav={onNav} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => onNav("shop")} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-border font-bold text-foreground hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all duration-300">
            View All Products <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-secondary/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Official Partners</div>
            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: FD }}>Premium Brands</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {BRANDS.map(b => (
              <motion.button key={b.name} onClick={() => onNav("brand", undefined, undefined, b.name)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-[#8B5CF6]/30 hover:shadow-lg transition-all group"
                whileHover={{ y: -3 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: b.color + "15" }}>
                  <span className="font-black text-xs" style={{ color: b.color, fontFamily: FM }}>{b.short}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{b.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Happy Customers</div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: FD }}>What They Say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div key={r.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl hover:border-[#8B5CF6]/20 transition-all"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Stars rating={r.rating} />
              <p className="text-sm text-foreground/80 leading-relaxed mt-3 mb-5">&ldquo;{r.review}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-emerald-600 flex items-center justify-center text-black text-xs font-black">{r.avatar}</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.location} · {r.date}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 mx-4 sm:mx-6 mb-16 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #111111 100%)" }}>
        <div className="max-w-xl mx-auto text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center mx-auto mb-5">
            <Bell className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: FD }}>Stay in the Loop</h2>
          <p className="text-white/50 mb-7 text-sm">Get exclusive deals, new arrivals, and flash sale alerts before anyone else. Join 10,000+ subscribers.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#8B5CF6]/50 text-sm transition-colors" />
            <button className="px-6 py-3.5 rounded-2xl bg-[#8B5CF6] text-black font-bold text-sm hover:brightness-110 transition-all whitespace-nowrap">Subscribe</button>
          </div>
          <p className="text-white/20 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────
function ShopPage({ onNav, products, onCart, wishlist, onWish, initialCategory = "All", initialBrand = "All" }: {
  onNav: (p: Page, prod?: Product, cat?: string, brand?: string) => void; products: Product[]; onCart: (p: Product) => void;
  wishlist: number[]; onWish: (id: number) => void;
  initialCategory?: string; initialBrand?: string;
}) {
  const [view, setView] = useState<"grid"|"list">("grid");
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    setSelectedCat(initialCategory);
    setSelectedBrand(initialBrand);
  }, [initialCategory, initialBrand]);

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ["All", ...Array.from(new Set(products.map(p => p.brand)))];

  const sorted = [...products]
    .filter(p => selectedCat === "All" || p.category === selectedCat)
    .filter(p => selectedBrand === "All" || p.brand === selectedBrand)
    .sort((a, b) => sortBy === "price-asc" ? a.price - b.price : sortBy === "price-desc" ? b.price - a.price : sortBy === "rating" ? b.rating - a.rating : b.id - a.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Browse</div>
        <h1 className="text-4xl font-black text-foreground" style={{ fontFamily: FD }}>All Products</h1>
      </div>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8 bg-card border border-border p-5 rounded-3xl">
        {/* Categories */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0">Category:</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cats.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCat === c ? "bg-[#8B5CF6] text-black" : "bg-secondary text-muted-foreground hover:bg-border"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        {/* Brands */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0">Brand:</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {brands.map(b => (
              <button key={b} onClick={() => setSelectedBrand(b)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedBrand === b ? "bg-[#8B5CF6] text-black" : "bg-secondary text-muted-foreground hover:bg-border"}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="text-sm text-muted-foreground">{sorted.length} products</div>
        <div className="flex items-center gap-2 shrink-0">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium outline-none cursor-pointer">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
          <div className="flex gap-1 p-1 rounded-xl bg-secondary">
            <button onClick={() => setView("grid")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" : "flex flex-col gap-4"}>
        {sorted.map(p => view === "grid" ? (
          <ProductCard key={p.id} product={p} onCart={onCart} wishlist={wishlist} onWish={onWish} onNav={onNav} />
        ) : (
          <motion.div key={p.id} className="bg-card border border-border rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-xl hover:border-[#8B5CF6]/20 transition-all"
            whileHover={{ x: 4 }} onClick={() => onNav("product", p)}>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shrink-0" style={{ background: p.gradient }}>{p.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{p.brand}</div>
              <div className="font-bold text-foreground mb-1" style={{ fontFamily: FD }}>{p.name}</div>
              <div className="flex items-center gap-2 mb-2"><Stars rating={p.rating} /><span className="text-xs text-muted-foreground">({p.reviews})</span></div>
              <div className="flex items-center gap-3">
                <span className="font-black text-foreground" style={{ fontFamily: FM }}>{fmt(p.price)}</span>
                {p.originalPrice && <span className="text-sm text-muted-foreground line-through" style={{ fontFamily: FM }}>{fmt(p.originalPrice)}</span>}
                {p.discount && <Badge label={`-${p.discount}%`} variant="green" />}
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); onCart(p); }}
              className="shrink-0 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-[#8B5CF6] hover:text-black transition-all">
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Detail Page ──────────────────────────────────────────────────────
function ProductDetailPage({ product, onNav, onCart, wishlist, onWish, products, reviews, onAddReview }: {
  product: Product; onNav: (p: Page, prod?: Product) => void;
  onCart: (p: Product) => void; wishlist: number[]; onWish: (id: number) => void;
  products: Product[]; reviews: any[]; onAddReview: (rev: any) => void;
}) {
  const [reviewerName, setReviewerName] = useState("");
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) return;
    const newRev = {
      id: Date.now(),
      name: reviewerName,
      rating: ratingVal,
      review: reviewText,
      avatar: reviewerName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      date: "Just now"
    };
    onAddReview(newRev);
    setReviewerName("");
    setRatingVal(5);
    setReviewText("");
  };
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs"|"reviews">("specs");
  const isWished = wishlist.includes(product.id);
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => onNav("home")} className="hover:text-foreground transition-colors">Home</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => onNav("shop")} className="hover:text-foreground transition-colors">Shop</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden shadow-xl" style={{ background: product.gradient }}>
            <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)" }} />
            {product.specs?.uploaded_images && Array.isArray(product.specs.uploaded_images) && product.specs.uploaded_images.length > 0 ? (
              <img src={product.specs.uploaded_images[0]} alt={product.name} className="w-full h-full object-cover relative z-10" />
            ) : product.icon && (product.icon.startsWith("data:image") || product.icon.length > 50) ? (
              <img src={product.icon} alt={product.name} className="w-2/3 h-2/3 object-contain relative z-10" />
            ) : (
              <motion.span className="relative z-10 text-[8rem] block" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                {product.icon}
              </motion.span>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount && <Badge label={`-${product.discount}%`} variant="green" />}
              {product.badge && <Badge label={product.badge} variant="dark" />}
              {product.isOriginal && <Badge label="✓ 100% Original" variant="white" />}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => {
              const galleryImg = product.specs?.uploaded_images?.[i-1];
              return (
                <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer border-2 overflow-hidden transition-all ${i === 1 ? "border-[#8B5CF6]" : "border-border hover:border-foreground/30"}`} style={{ background: product.gradient }}>
                  {galleryImg ? (
                    <img src={galleryImg} alt="gallery" className="w-full h-full object-cover" />
                  ) : product.icon && (product.icon.startsWith("data:image") || product.icon.length > 50) ? (
                    <img src={product.icon} alt="icon gallery" className="w-2/3 h-2/3 object-contain" />
                  ) : (
                    <span className="text-3xl">{product.icon}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Info */}
        <div>
          <button onClick={() => onNav("brand", undefined, undefined, product.brand)} className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2 hover:underline block text-left">
            {product.brand}
          </button>
          <h1 className="text-3xl font-black text-foreground mb-4 leading-tight" style={{ fontFamily: FD }}>{product.name}</h1>
          <div className="flex items-center gap-3 mb-5">
            <Stars rating={product.rating} />
            <span className="text-sm font-semibold text-foreground">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <div className="flex items-end gap-4 mb-6">
            <div className="text-4xl font-black text-foreground" style={{ fontFamily: FM }}>{fmt(product.price)}</div>
            {product.originalPrice && (
              <div>
                <div className="text-lg text-muted-foreground line-through" style={{ fontFamily: FM }}>{fmt(product.originalPrice)}</div>
                {product.discount && <div className="text-sm font-bold text-[#8B5CF6]">You save {fmt(product.originalPrice - product.price)}</div>}
              </div>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{product.description}</p>
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Shield, label: "Warranty", value: product.warranty },
              { icon: MapPin, label: "Version", value: product.countryVersion },
              { icon: Package, label: "Stock", value: product.stock <= 0 ? "Out of Stock" : (product.specs?.showStockCount === true ? `${product.stock} units available` : "In Stock") },
              { icon: Truck, label: "Delivery", value: "Island-wide in 24hrs" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-2xl bg-secondary border border-border">
                <Icon className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div><div className="text-xs font-semibold text-foreground">{value}</div></div>
              </div>
            ))}
          </div>
          {/* Qty */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center hover:bg-border transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-bold text-foreground" style={{ fontFamily: FM }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 rounded-xl bg-card flex items-center justify-center hover:bg-border transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">
              {product.stock <= 0 ? "Out of Stock" : (product.specs?.showStockCount === true ? `${product.stock} available` : "In Stock")}
            </span>
          </div>
          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <motion.button onClick={() => { for (let i = 0; i < qty; i++) onCart(product); }}
              className="flex-1 py-4 rounded-2xl bg-foreground text-background font-bold text-base hover:bg-[#8B5CF6] hover:text-black transition-all duration-300"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ShoppingCart className="w-5 h-5 inline mr-2" />Add to Cart
            </motion.button>
            <button onClick={() => onWish(product.id)} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${isWished ? "border-red-500 bg-red-50 text-red-500" : "border-border text-muted-foreground hover:border-red-500 hover:text-red-500"}`}>
              <Heart className="w-5 h-5" fill={isWished ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={() => {
              const msg = `Hi Universe Hub! I'm interested in buying:%0A%0A🛍️ *${product.name}*%0A🏷️ Brand: ${product.brand}%0A💰 Price: LKR ${product.price.toLocaleString()}%0A%0AIs this item currently in stock?`;
              window.open(`https://wa.me/94771234567?text=${msg}`, '_blank');
            }}
            className="w-full py-4 rounded-2xl border-2 border-[#8B5CF6] text-[#8B5CF6] font-bold text-base hover:bg-[#8B5CF6] hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> Order via WhatsApp
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-t border-border pt-10 mb-10">
        <div className="flex gap-2 p-1 rounded-2xl bg-secondary w-fit mb-8">
          {(["specs","reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>{t === "specs" ? "Specifications" : "Reviews"}</button>
          ))}
        </div>
        {tab === "specs" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                <div><div className="text-xs text-muted-foreground font-medium">{k}</div><div className="text-sm font-semibold text-foreground">{v}</div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-lg font-bold text-foreground mb-4">Reviews & Ratings</div>
              {(() => {
                const defaultRevs = REVIEWS.filter(r => r.product === product.name || product.name.includes(r.product));
                if (defaultRevs.length === 0) {
                  defaultRevs.push({
                    id: "seeded-1",
                    name: "Sajith Bandara",
                    rating: 5,
                    review: `Excellent product quality. Highly recommend this ${product.name} from Universe Hub. Excellent packaging and customer support.`,
                    avatar: "SB",
                    date: "3 days ago"
                  });
                }
                const allReviews = [...reviews, ...defaultRevs];
                return allReviews.map(r => (
                  <div key={r.id} className="bg-card border border-border rounded-3xl p-5 hover:border-[#8B5CF6]/15 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-emerald-600 flex items-center justify-center text-black text-xs font-black">{r.avatar}</div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{r.name}</div>
                        <div className="flex items-center gap-2"><Stars rating={r.rating} /><span className="text-xs text-muted-foreground">{r.date}</span></div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{r.review}</p>
                  </div>
                ));
              })()}
            </div>

            {/* Write a Review Form */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-[2rem] p-6 sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Your Name</label>
                    <input value={reviewerName} onChange={e => setReviewerName(e.target.value)} required placeholder="e.g. Kasun Perera" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingVal(star)}
                          className="text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= ratingVal ? "fill-amber-400 text-amber-400" : "text-border fill-transparent"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Review Content</label>
                    <textarea rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} required placeholder="Share your experience with this product..." className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none" />
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-[#8B5CF6] hover:text-black transition-all">
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: FD }}>Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} onCart={onCart} wishlist={wishlist} onWish={onWish} onNav={onNav} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ cart, onNav, onQty, onRemove }: {
  cart: CartItem[]; onNav: (p: Page, prod?: Product) => void;
  onQty: (id: number, q: number) => void; onRemove: (id: number) => void;
}) {
  const [coupon, setCoupon] = useState(""); const [applied, setApplied] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal >= 5000 ? 0 : 350;
  const total = subtotal - discount + delivery;
  if (cart.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6"><ShoppingCart className="w-12 h-12 text-muted-foreground" /></div>
      <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: FD }}>Your cart is empty</h2>
      <p className="text-muted-foreground mb-8">Add some premium products to your cart and experience luxury.</p>
      <button onClick={() => onNav("shop")} className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Start Shopping</button>
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-black text-foreground mb-8" style={{ fontFamily: FD }}>Shopping Cart <span className="text-muted-foreground text-2xl">({cart.reduce((s,i) => s+i.quantity,0)} items)</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.product.id} className="bg-card border border-border rounded-3xl p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 cursor-pointer" style={{ background: item.product.gradient }} onClick={() => onNav("product", item.product)}>{item.product.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{item.product.brand}</div>
                <div className="font-bold text-sm text-foreground line-clamp-1 mb-1" style={{ fontFamily: FD }}>{item.product.name}</div>
                <div className="font-black text-foreground" style={{ fontFamily: FM }}>{fmt(item.product.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
                  <button onClick={() => onQty(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-border"><Minus className="w-3 h-3" /></button>
                  <span className="w-6 text-center text-sm font-bold" style={{ fontFamily: FM }}>{item.quantity}</span>
                  <button onClick={() => onQty(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-border"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => onRemove(item.product.id)} className="w-8 h-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-[#8B5CF6]" /><span className="font-bold text-sm text-foreground">Coupon Code</span></div>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code" className="flex-1 px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50" />
              <button onClick={() => { if (coupon.toLowerCase() === "clnow10") setApplied(true); }} className="px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Apply</button>
            </div>
            {applied && <div className="mt-2 text-xs font-semibold text-[#8B5CF6] flex items-center gap-1"><Check className="w-3 h-3" />10% discount applied!</div>}
            <div className="text-xs text-muted-foreground mt-2">Try: CLNOW10 for 10% off</div>
          </div>
          {/* Summary */}
          <div className="bg-card border border-border rounded-3xl p-5">
            <div className="font-bold text-foreground mb-5" style={{ fontFamily: FD }}>Order Summary</div>
            <div className="space-y-3 text-sm mb-5">
              {[
                { l: "Subtotal", v: fmt(subtotal) },
                { l: "Discount", v: applied ? `-${fmt(discount)}` : "—" },
                { l: "Delivery", v: delivery === 0 ? "FREE 🎉" : fmt(delivery) },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between">
                  <span className="text-muted-foreground">{l}</span>
                  <span className={`font-semibold ${l === "Discount" && applied ? "text-[#8B5CF6]" : l === "Delivery" && delivery === 0 ? "text-[#8B5CF6]" : "text-foreground"}`} style={{ fontFamily: FM }}>{v}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-black text-foreground">Total</span>
                <span className="font-black text-foreground text-lg" style={{ fontFamily: FM }}>{fmt(total)}</span>
              </div>
            </div>
            {delivery > 0 && <div className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3 mb-5">Add {fmt(5000 - (subtotal % 5000))} more for FREE delivery!</div>}
            <button onClick={() => onNav("checkout")} className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all duration-300">Proceed to Checkout →</button>
            <button onClick={() => onNav("shop")} className="w-full py-3 rounded-2xl text-muted-foreground text-sm hover:text-foreground transition-colors mt-2">← Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
function CheckoutPage({ cart, onNav, onPlace }: {
  cart: CartItem[]; onNav: (p: Page) => void; onPlace: (details: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState("cod");
  
  // Input fields state
  const [firstName, setFirstName] = useState("Kasun");
  const [lastName, setLastName] = useState("Perera");
  const [email, setEmail] = useState("kasun@email.com");
  const [phone, setPhone] = useState("077 123 4567");
  const [addr1, setAddr1] = useState("No. 45, Galle Road");
  const [addr2, setAddr2] = useState("Colombo 03");
  const [city, setCity] = useState("Colombo");
  const [district, setDistrict] = useState("Colombo");
  const [deliveryMethod, setDeliveryMethod] = useState("Standard (Free over LKR 5k)");

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  
  const payments = [
    { id:"cod", label:"Cash on Delivery", icon:"💵" },
    { id:"card", label:"Visa / MasterCard", icon:"💳" },
    { id:"bank", label:"Bank Transfer", icon:"🏦" },
    { id:"lankaqr", label:"LankaQR", icon:"📱" },
    { id:"mintpay", label:"MintPay", icon:"🟢" },
  ];

  const handlePlaceOrder = () => {
    const details = {
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      address: `${addr1}, ${addr2}, ${city}, ${district}`,
      deliveryMethod,
      paymentMethod: pay
    };
    onPlace(details);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-black text-foreground mb-8" style={{ fontFamily: FD }}>Checkout</h1>
      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        {[{ n:1, l:"Details" }, { n:2, l:"Delivery" }, { n:3, l:"Payment" }].map(({ n, l }) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= n ? "bg-[#8B5CF6] text-black" : "bg-secondary text-muted-foreground"}`}>{step > n ? <Check className="w-4 h-4" /> : n}</div>
            <span className={`text-sm font-semibold ${step >= n ? "text-foreground" : "text-muted-foreground"}`}>{l}</span>
            {n < 3 && <div className={`flex-1 h-px ${step > n ? "bg-[#8B5CF6]" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {step === 1 && (
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="font-bold text-foreground mb-2" style={{ fontFamily: FD }}>Personal Details</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <button onClick={() => setStep(2)} className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all mt-2">Continue →</button>
            </div>
          )}
          {step === 2 && (
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="font-bold text-foreground mb-2" style={{ fontFamily: FD }}>Delivery Address</div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address Line 1</label>
                <input value={addr1} onChange={e => setAddr1(e.target.value)} placeholder="Address Line 1" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address Line 2</label>
                <input value={addr2} onChange={e => setAddr2(e.target.value)} placeholder="Address Line 2" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
                <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="District" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Delivery Method</label>
                <div className="space-y-2">
                  {["Standard (Free over LKR 5k)","Express (LKR 500)","Same Day Colombo (LKR 800)"].map(o => (
                    <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:border-[#8B5CF6]/30 transition-colors">
                      <input type="radio" name="delivery" checked={deliveryMethod === o} onChange={() => setDeliveryMethod(o)} className="accent-[#8B5CF6]" />
                      <span className="text-sm text-foreground">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border-2 border-border font-bold hover:border-foreground transition-all">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Continue →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="bg-card border border-border rounded-3xl p-6">
              <div className="font-bold text-foreground mb-4" style={{ fontFamily: FD }}>Payment Method</div>
              <div className="space-y-3 mb-6">
                {payments.map(p => (
                  <label key={p.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${pay === p.id ? "border-[#8B5CF6] bg-[#8B5CF6]/5" : "border-border hover:border-foreground/30"}`}>
                    <input type="radio" name="pay" value={p.id} checked={pay === p.id} onChange={() => setPay(p.id)} className="accent-[#8B5CF6]" />
                    <span className="text-xl">{p.icon}</span>
                    <span className="font-semibold text-sm text-foreground">{p.label}</span>
                    {pay === p.id && <Check className="w-4 h-4 text-[#8B5CF6] ml-auto" />}
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border-2 border-border font-bold hover:border-foreground transition-all">← Back</button>
                <button onClick={handlePlaceOrder} className="flex-1 py-4 rounded-2xl bg-[#8B5CF6] text-black font-bold hover:brightness-110 transition-all">Place Order ✓</button>
              </div>
            </div>
          )}
        </div>
        {/* Summary */}
        <div className="bg-card border border-border rounded-3xl p-5 h-fit sticky top-20">
          <div className="font-bold text-foreground mb-4" style={{ fontFamily: FD }}>Order Summary</div>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: item.product.gradient }}>{item.product.icon}</div>
                <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-foreground truncate">{item.product.name}</div><div className="text-xs text-muted-foreground">×{item.quantity}</div></div>
                <div className="text-xs font-bold" style={{ fontFamily: FM }}>{fmt(item.product.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-black text-foreground">Total</span>
            <span className="font-black text-foreground" style={{ fontFamily: FM }}>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Success ─────────────────────────────────────────────────────────────
function OrderSuccessPage({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-[#8B5CF6] flex items-center justify-center mx-auto mb-6">
        <Check className="w-12 h-12 text-black" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-4xl font-black text-foreground mb-3" style={{ fontFamily: FD }}>Order Placed!</h1>
        <p className="text-muted-foreground mb-2">Your order <span className="font-bold text-foreground">#CLN-2024-07148</span> has been confirmed.</p>
        <p className="text-sm text-muted-foreground mb-8">You&apos;ll receive a WhatsApp confirmation shortly. Estimated delivery: within 24 hours.</p>
        <div className="bg-card border border-border rounded-3xl p-5 text-left mb-8">
          <div className="font-bold text-sm mb-3" style={{ fontFamily: FD }}>Order Timeline</div>
          {[
            { label:"Order Confirmed", done: true, time: "Just now" },
            { label:"Processing", done: false, time: "~1 hour" },
            { label:"Packed & Ready", done: false, time: "~2 hours" },
            { label:"Out for Delivery", done: false, time: "~6 hours" },
            { label:"Delivered", done: false, time: "~24 hours" },
          ].map((s, i) => (
            <div key={s.label} className={`flex items-center gap-3 ${i < 4 ? "mb-3" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-[#8B5CF6]" : "bg-secondary border border-border"}`}>
                {s.done ? <Check className="w-3.5 h-3.5 text-black" /> : <div className="w-2 h-2 rounded-full bg-border" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
              </div>
              <div className="text-xs text-muted-foreground">{s.time}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNav("orders")} className="flex-1 py-4 rounded-2xl border-2 border-border font-bold hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all text-sm">Track Order</button>
          <button onClick={() => onNav("home")} className="flex-1 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all text-sm">Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────
function AuthPage({ mode, onNav, onAdminLogin }: { mode: "login"|"register"; onNav: (p: Page) => void, onAdminLogin?: () => void }) {
  const [email, setEmail] = useState("");

  const handleAuth = () => {
    if (mode === "login") {
      if (email === "admin@universehub.lk" || email === "admin") {
        if (onAdminLogin) onAdminLogin();
      } else {
        onNav("dashboard");
      }
    } else {
      onNav("dashboard");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-6 relative group scale-110">
            <div className="relative flex flex-col items-start leading-none">
              <span className="text-[7px] text-foreground/70 tracking-[0.2em] mb-1 font-semibold uppercase">Your One-Stop Shop For Everything</span>
              <div className="flex items-end gap-1 relative z-10">
                <span className="font-black text-2xl tracking-tighter text-foreground" style={{ fontFamily: FD }}>UNIVERSE</span>
                <span className="font-black text-lg tracking-tight text-foreground/90 pb-0.5" style={{ fontFamily: FD }}>HUB</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100%] border-[1px] border-amber-400/50 -rotate-6 pointer-events-none group-hover:rotate-0 transition-all duration-500">
                <div className="absolute top-0 right-1/4 w-1.5 h-1.5 bg-foreground rounded-full blur-[0.5px]"></div>
                <div className="absolute bottom-[-2px] left-1/3 w-2.5 h-2.5 bg-foreground rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: FD }}>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{mode === "login" ? "Sign in to your Universe Hub account" : "Join Sri Lanka's #1 accessories store"}</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              {["First Name","Last Name"].map(l => <div key={l}><label className="text-xs font-medium text-muted-foreground mb-1 block">{l}</label><input placeholder={l} className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" /></div>)}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" />
          </div>
          {mode === "register" && <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label><input type="tel" placeholder="07X XXX XXXX" className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" /></div>}
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label><input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" /></div>
          {mode === "login" && <div className="flex justify-end"><button className="text-xs text-[#8B5CF6] font-semibold hover:underline">Forgot password?</button></div>}
          <button onClick={handleAuth} className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all duration-300">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => onNav(mode === "login" ? "register" : "login")} className="text-[#8B5CF6] font-semibold hover:underline">
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Account Page ─────────────────────────────────────────────────────────────
function AccountPage({
  onNav,
  cart,
  initialTab = "dashboard",
  orders,
  notifications,
  onMarkAllNotificationsRead,
}: {
  onNav: (p: Page) => void;
  cart: CartItem[];
  initialTab?: string;
  orders: any[];
  notifications: any[];
  onMarkAllNotificationsRead: () => void;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const sideNav = [
    { id:"dashboard", icon: BarChart3, label:"Dashboard" },
    { id:"orders", icon: Package, label:"My Orders" },
    { id:"wishlist", icon: Heart, label:"Wishlist" },
    { id:"invoices", icon: FileText, label:"Invoices" },
    { id:"notifications", icon: Bell, label:"Notifications" },
    { id:"addresses", icon: MapPin, label:"Addresses" },
    { id:"profile", icon: User, label:"Profile" },
    { id:"security", icon: Lock, label:"Security" },
  ];

  const recentOrders = orders.slice(0, 3);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[{ n: orders.length.toString(), l:"Orders", icon:Package }, { n:"1", l:"Wishlist", icon:Heart }, { n:"LKR 162K", l:"Total Spent", icon:DollarSign }, { n:"340", l:"Loyalty Pts", icon:Award }].map(({ n, l, icon: Icon }) => (
                <div key={l} className="bg-card border border-border rounded-3xl p-5">
                  <Icon className="w-5 h-5 text-[#8B5CF6] mb-3" />
                  <div className="text-2xl font-black text-foreground" style={{ fontFamily: FD }}>{n}</div>
                  <div className="text-xs text-muted-foreground font-medium">{l}</div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-3xl p-6">
              <div className="font-bold text-foreground mb-5" style={{ fontFamily: FD }}>Recent Orders</div>
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-border hover:border-[#8B5CF6]/20 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-muted-foreground mb-0.5">{o.id}</div>
                      <div className="text-sm font-semibold text-foreground truncate">{o.product}</div>
                      <div className="text-xs text-muted-foreground">{o.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black" style={{ fontFamily: FM }}>{fmt(o.amount)}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Processing" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNav("orders")} className="mt-4 w-full py-3 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:border-foreground hover:text-foreground transition-all">View All Orders</button>
            </div>
          </>
        );
      case "invoices":
        return <InvoicesPage orders={orders} />;
      case "notifications":
        return <NotificationCenter notifications={notifications} onMarkAllRead={onMarkAllNotificationsRead} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-3xl opacity-60">
            <Settings className="w-12 h-12 text-[#8B5CF6] mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: FD }}>Coming Soon</h3>
            <p className="text-sm text-muted-foreground text-center px-6">This section is currently under development to deliver a premium user experience.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-emerald-600 flex items-center justify-center text-black font-black text-lg">KP</div>
              <div><div className="font-bold text-foreground">Kasun Perera</div><div className="text-xs text-muted-foreground">kasun@email.com</div></div>
            </div>
            <nav className="space-y-1">
              {sideNav.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => { if (id === "wishlist") onNav("wishlist"); else if (id === "orders") onNav("orders"); else setActiveTab(id); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === id ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
              <div className="pt-2 border-t border-border mt-2">
                <button onClick={() => onNav("login")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
function WishlistPage({ wishlist, products, onNav, onCart, onWish }: {
  wishlist: number[]; products: Product[]; onNav: (p: Page, prod?: Product) => void;
  onCart: (p: Product) => void; onWish: (id: number) => void;
}) {
  const items = products.filter(p => wishlist.includes(p.id));
  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6"><Heart className="w-12 h-12 text-muted-foreground" /></div>
      <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: FD }}>Your wishlist is empty</h2>
      <p className="text-muted-foreground mb-8">Save items you love and come back to them anytime.</p>
      <button onClick={() => onNav("shop")} className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Start Shopping</button>
    </div>
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-black text-foreground mb-8" style={{ fontFamily: FD }}>Wishlist <span className="text-muted-foreground text-2xl">({items.length})</span></h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map(p => <ProductCard key={p.id} product={p} onCart={onCart} wishlist={wishlist} onWish={onWish} onNav={onNav} />)}
      </div>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage({ onNav, orders }: { onNav: (p: Page) => void; orders: any[] }) {
  const statusColor: Record<string, string> = { 
    Delivered: "bg-green-100 text-green-700", 
    Processing: "bg-amber-100 text-amber-700", 
    Shipped: "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700"
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNav("account")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-border transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: FD }}>My Orders</h1>
      </div>
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map(o => {
            const itemIcon = o.items?.[0]?.product?.icon || "🛍️";
            const itemGrad = o.items?.[0]?.product?.gradient || "linear-gradient(135deg,#3b82f6,#8b5cf6)";
            return (
              <div key={o.id} className="bg-card border border-border rounded-3xl p-5 hover:shadow-xl hover:border-[#8B5CF6]/20 transition-all cursor-pointer" onClick={() => onNav("tracking")}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: itemGrad }}>{itemIcon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground mb-0.5">{o.id}</div>
                    <div className="font-bold text-foreground text-sm truncate max-w-[200px]" style={{ fontFamily: FD }}>{o.product}</div>
                    <div className="text-xs text-muted-foreground">{o.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-foreground mb-1" style={{ fontFamily: FM }}>{fmt(o.amount)}</div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[o.status] || "bg-secondary text-muted-foreground"}`}>{o.status}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button onClick={e => { e.stopPropagation(); onNav("tracking"); }} className="flex-1 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-foreground hover:text-foreground transition-all">Track Order</button>
                  <button className="flex-1 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:border-foreground hover:text-foreground transition-all">View Details</button>
                  <button className="flex-1 py-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Buy Again</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground font-semibold bg-card border border-border rounded-3xl">
            You haven't placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order Tracking ───────────────────────────────────────────────────────────
function TrackingPage({ onNav }: { onNav: (p: Page) => void }) {
  const steps = [
    { label:"Order Confirmed", time:"Dec 28, 10:30 AM", done:true, desc:"Your order has been confirmed and payment received." },
    { label:"Processing", time:"Dec 28, 11:00 AM", done:true, desc:"Your items are being packed with care." },
    { label:"Packed & Ready", time:"Dec 28, 2:00 PM", done:true, desc:"Package sealed and ready for courier handover." },
    { label:"Out for Delivery", time:"Dec 28, 4:30 PM", done:false, desc:"Your package is on its way." },
    { label:"Delivered", time:"Expected by 8:00 PM", done:false, desc:"Package will be delivered to your door." },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNav("orders")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-border"><ChevronLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: FD }}>Track Order</h1>
          <div className="text-sm text-muted-foreground">#CLN-2024-07148</div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>🎧</div>
          <div>
            <div className="font-bold text-foreground">AirPods Pro (2nd Generation)</div>
            <div className="text-sm text-muted-foreground">Estimated: Dec 28, 2024</div>
          </div>
          <div className="ml-auto"><span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">On the Way</span></div>
        </div>
        <div className="relative">
          {steps.map((s, i) => (
            <div key={s.label} className={`flex gap-4 ${i < steps.length - 1 ? "mb-6" : ""}`}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${s.done ? "bg-[#8B5CF6]" : "bg-secondary border-2 border-border"}`}>
                  {s.done ? <Check className="w-4 h-4 text-black" /> : <div className="w-2.5 h-2.5 rounded-full bg-border" />}
                </div>
                {i < steps.length - 1 && <div className={`w-0.5 flex-1 mt-2 ${s.done && steps[i+1].done ? "bg-[#8B5CF6]" : "bg-border"}`} style={{ minHeight: 32 }} />}
              </div>
              <div className="flex-1 pb-2">
                <div className={`font-bold text-sm ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                <div className="text-xs text-muted-foreground mb-1">{s.time}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="w-full py-4 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold flex items-center justify-center gap-2 hover:bg-[#8B5CF6] hover:text-black transition-all">
        <MessageCircle className="w-5 h-5" /> Contact Support via WhatsApp
      </button>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboardView({ isDark, recentOrders }: { isDark: boolean; recentOrders: any[] }) {
  const stats = [
    { label:"Total Revenue", value:"LKR 4.2M", change:"+18%", icon:DollarSign, up:true },
    { label:"Orders", value:"1,248", change:"+12%", icon:ShoppingBag, up:true },
    { label:"Customers", value:"3,840", change:"+24%", icon:Users, up:true },
    { label:"Products", value:"500+", change:"+8", icon:Package, up:true },
  ];
  const statusColor: Record<string, string> = { 
    Delivered: "bg-green-100 text-green-700", 
    Processing: "bg-amber-100 text-amber-700", 
    Shipped: "bg-blue-100 text-blue-700", 
    Confirmed: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    Cancelled: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, change, icon: Icon, up }) => (
          <div key={label} className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center"><Icon className="w-5 h-5 text-[#8B5CF6]" /></div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{change}</span>
            </div>
            <div className="text-2xl font-black text-foreground" style={{ fontFamily: FD }}>{value}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="font-bold text-foreground" style={{ fontFamily: FD }}>Revenue Overview</div>
          <div className="flex gap-2">
            {["7D","1M","3M","1Y"].map(t => <button key={t} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${t === "1M" ? "bg-[#8B5CF6] text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{t}</button>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ADMIN_CHART_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`LKR ${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: isDark ? "#141414" : "#fff", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Recent Orders Table */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="font-bold text-foreground" style={{ fontFamily: FD }}>Recent Orders</div>
          <button className="text-sm text-[#8B5CF6] font-semibold">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order ID","Customer","Product","Amount","Status","Action"].map(h => <th key={h} className="pb-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono text-xs text-[#8B5CF6] font-bold">{o.id}</td>
                  <td className="py-3.5 pr-4 font-medium text-foreground">{o.customer}</td>
                  <td className="py-3.5 pr-4 text-muted-foreground truncate max-w-[140px]">{o.product}</td>
                  <td className="py-3.5 pr-4 font-bold text-foreground" style={{ fontFamily: FM }}>{fmt(o.amount)}</td>
                  <td className="py-3.5 pr-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColor[o.status]}`}>{o.status}</span></td>
                  <td className="py-3.5"><button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminPage({
  onNav,
  isDark,
  products,
  setProducts,
  orders,
  setOrders,
  onAddProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdateOrderStatus,
  onUpdateProduct,
}: {
  onNav: (p: Page) => void;
  isDark: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: number) => void;
  onUpdateStock: (id: number, stock: number) => void;
  onUpdateOrderStatus: (id: string, status: string) => void;
  onUpdateProduct: (p: Product) => void;
}) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id:"dashboard", icon:BarChart3, label:"Dashboard" }, { id:"orders", icon:ShoppingBag, label:"Orders" },
    { id:"products", icon:Package, label:"Products" }, { id:"inventory", icon:RefreshCw, label:"Inventory" },
    { id:"customers", icon:Users, label:"Customers" }, { id:"coupons", icon:Percent, label:"Coupons" },
    { id:"reports", icon:TrendingUp, label:"Reports" }, { id:"settings", icon:Settings, label:"Settings" },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard": return <AdminDashboardView isDark={isDark} recentOrders={orders} />;
      case "reports": return <AdminAnalyticsPage orders={orders} />;
      case "settings": return <AdminDeliveryPage />;
      case "orders": return <AdminOrdersView orders={orders} onUpdateStatus={onUpdateOrderStatus} />;
      case "products": return <AdminProductsView products={products} onAdd={onAddProduct} onDelete={onDeleteProduct} onUpdate={onUpdateProduct} />;
      case "inventory": return <AdminInventoryView products={products} onUpdateStock={onUpdateStock} />;
      default: return (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
          <Settings className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: FD }}>Coming Soon</h2>
          <p className="text-muted-foreground">This module is currently under development.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:translate-x-0 md:relative ${isMobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-64 translate-x-0" : "fixed inset-y-0 left-0 z-50 w-64 -translate-x-full"}`}>
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6] flex items-center justify-center"><span className="text-black font-black text-xs" style={{ fontFamily: FD }}>CL</span></div>
            <span className="font-black text-xl tracking-tight text-sidebar-foreground" style={{ fontFamily: FD }}>NOW</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-bold">ADMIN</span>
          </div>
          <button className="md:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={() => setIsMobileSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setActiveMenu(id); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all mb-0.5 ${activeMenu === id ? "bg-[#8B5CF6] text-black" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={() => onNav("home")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all">
            <ChevronLeft className="w-4 h-4" />Back to Store
          </button>
        </div>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-4 sm:px-6 h-14 border-b border-border flex items-center justify-between backdrop-blur-xl" style={{ background: isDark ? "rgba(10,10,10,0.88)" : "rgba(248,249,251,0.88)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-black text-foreground capitalize" style={{ fontFamily: FD }}>{activeMenu}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><Bell className="w-4 h-4 text-muted-foreground" /><span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B5CF6] text-black text-[9px] font-bold rounded-full flex items-center justify-center">5</span></button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-emerald-600 flex items-center justify-center text-black font-black text-xs">AD</div>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

// ─── Category / Brand / About / Contact Placeholder ───────────────────────────
function SimpleContentPage({ title, subtitle, icon: Icon, onNav, onShop }: {
  title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  onNav: (p: Page) => void; onShop: (val: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">{subtitle}</div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground" style={{ fontFamily: FD }}>{title}</h1>
      </div>
      {title === "Categories" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => {
            const CatIcon = cat.icon;
            return (
              <motion.button key={cat.name} onClick={() => onShop(cat.name)}
                className="group relative overflow-hidden rounded-3xl p-8 flex flex-col items-center gap-4 border border-border bg-card hover:border-transparent transition-all duration-300"
                whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: cat.gradient + "15" }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: cat.gradient }}>
                  <CatIcon className="w-8 h-8 text-white" />
                </div>
                <div className="relative text-center">
                  <div className="font-bold text-foreground">{cat.name}</div>
                  <div className="text-sm text-muted-foreground">{cat.count} Products</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
      {title === "Brands" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {BRANDS.map((b, i) => (
            <motion.button key={b.name} onClick={() => onShop(b.name)}
              className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center gap-4 hover:shadow-xl hover:border-[#8B5CF6]/20 transition-all"
              whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: b.color + "15" }}>
                <span className="font-black text-xl" style={{ color: b.color, fontFamily: FM }}>{b.short}</span>
              </div>
              <div>
                <div className="font-bold text-foreground text-center">{b.name}</div>
                <div className="text-xs text-muted-foreground text-center mt-1">Official Products</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      {title === "About Us" && (
        <div className="max-w-3xl space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-black text-foreground mb-4" style={{ fontFamily: FD }}>Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Universe Hub was founded with a simple mission: to bring 100% original premium mobile accessories to Sri Lanka at competitive prices. We believe every Sri Lankan deserves access to authentic technology products without compromise.</p>
            <p className="text-muted-foreground leading-relaxed">From Apple to Samsung, Nothing to Anker — every product we carry is sourced directly from official distributors and comes with genuine manufacturer warranty.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ n:"2020", l:"Founded" }, { n:"12K+", l:"Customers" }, { n:"500+", l:"Products" }, { n:"100%", l:"Original" }].map(({ n, l }) => (
              <div key={l} className="bg-card border border-border rounded-3xl p-5 text-center">
                <div className="text-3xl font-black text-[#8B5CF6]" style={{ fontFamily: FD }}>{n}</div>
                <div className="text-sm text-muted-foreground font-medium mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {title === "Contact Us" && (
        <div className="max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon:Phone, label:"Phone", value:"077 123 4567" },
              { icon:MessageCircle, label:"WhatsApp", value:"077 123 4567" },
              { icon:Mail, label:"Email", value:"hello@clnow.lk" },
              { icon:MapPin, label:"Location", value:"No. 45, Galle Road, Colombo 03" },
            ].map(({ icon: CIcon, label, value }) => (
              <div key={label} className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0"><CIcon className="w-5 h-5 text-[#8B5CF6]" /></div>
                <div><div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div><div className="font-semibold text-foreground text-sm">{value}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily: FD }}>Send a Message</h3>
            {["Your Name","Email Address","Subject"].map(l => <div key={l}><label className="text-xs font-medium text-muted-foreground mb-1 block">{l}</label><input placeholder={l} className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors" /></div>)}
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label><textarea rows={4} placeholder="How can we help?" className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors resize-none" /></div>
            <button className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Send Message</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFoundPage({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-[6rem] font-black text-border" style={{ fontFamily: FD }}>404</div>
      <div className="w-16 h-1 bg-[#8B5CF6] rounded-full mx-auto mb-6" />
      <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: FD }}>Page Not Found</h2>
      <p className="text-muted-foreground mb-8">This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => onNav("home")} className="px-6 py-3.5 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">Go Home</button>
        <button onClick={() => onNav("shop")} className="px-6 py-3.5 rounded-2xl border-2 border-border font-bold hover:border-foreground transition-all">Browse Shop</button>
      </div>
    </div>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────
function SearchPage({ onNav, products, onCart, wishlist, onWish }: {
  onNav: (p: Page, prod?: Product) => void; products: Product[]; onCart: (p: Product) => void;
  wishlist: number[]; onWish: (id: number) => void;
}) {
  const [q, setQ] = useState("");
  const results = q.length > 1 ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase())) : products;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, brands..." autoFocus className="w-full pl-12 pr-5 py-4 rounded-2xl bg-card border-2 border-border text-foreground text-base outline-none focus:border-[#8B5CF6]/50 transition-colors" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-6">{results.length} results {q ? `for "${q}"` : ""}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map(p => <ProductCard key={p.id} product={p} onCart={onCart} wishlist={wishlist} onWish={onWish} onNav={onNav} />)}
      </div>
    </div>
  );
}

// ─── Cosmic Background ──────────────────────────────────────────────────────
function CosmicBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#05050A]">
      {/* Twinkling Stars Pattern (Parallax Effect) */}
      <motion.div 
           className="absolute inset-[-10%] opacity-50" 
           animate={{ x: mousePos.x * -40, y: mousePos.y * -40 }}
           transition={{ type: "spring", stiffness: 40, damping: 30 }}
           style={{ 
             backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 160px 120px, #ffffff, rgba(0,0,0,0))', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '250px 250px'
           }} 
      />
      
      {/* 3D Floating Moon (Parallax Wrapper) */}
      <motion.div 
        animate={{ x: mousePos.x * 60, y: mousePos.y * 60, rotate: mousePos.x * 15 }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
        className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] opacity-70 mix-blend-screen"
      >
        {/* Floating Animation */}
        <motion.div
          animate={{ y: [0, -60, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d4d4d8 15%, #71717a 40%, #18181b 80%, #000000 100%)',
            boxShadow: '0 0 150px 40px rgba(139, 92, 246, 0.15), inset -40px -40px 80px rgba(0,0,0,0.9), inset 20px 20px 40px rgba(255,255,255,0.8)',
            filter: 'blur(1px)'
          }}
        >
          {/* Moon Craters (Subtle) */}
          <div className="absolute top-[20%] left-[30%] w-[15%] h-[15%] rounded-full bg-black/20 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] blur-[2px]" />
          <div className="absolute top-[45%] left-[60%] w-[25%] h-[25%] rounded-full bg-black/30 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.6)] blur-[3px]" />
          <div className="absolute top-[65%] left-[25%] w-[12%] h-[12%] rounded-full bg-black/25 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)] blur-[1.5px]" />
        </motion.div>
      </motion.div>
      
      {/* Deep Space Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-transparent opacity-70" />
    </div>
  );
}

// ─── App (Router + State) ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem("currentPage");
    return (saved as Page) || "home";
  });
  const [selectedBrandName, setSelectedBrandName] = useState<string>(() => {
    return localStorage.getItem("selectedBrandName") || "Apple";
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const saved = localStorage.getItem("selectedProduct");
    return saved ? JSON.parse(saved) : null;
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem("isDark") === "true");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(() => localStorage.getItem("isAdminAuth") === "true");
  const [shopCategory, setShopCategory] = useState("All");
  const [shopBrand, setShopBrand] = useState("All");
  const [accountTab, setAccountTab] = useState("dashboard");

  // New Products & Orders states
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return PRODUCTS;
  });
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("admin_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return [
      { id: "CLN-2024-7148", customer: "Kasun Perera", product: "AirPods Pro 2nd Gen x1", amount: 82500, status: "Delivered", date: "Dec 28, 2024" },
      { id: "CLN-2024-7102", customer: "Kasun Perera", product: "Apple MagSafe Charger x1", amount: 14500, status: "Processing", date: "Jan 2, 2025" },
      { id: "CLN-2024-6994", customer: "Kasun Perera", product: "Samsung Galaxy Watch 6 x1", amount: 65000, status: "Shipped", date: "Dec 15, 2024" },
    ];
  });
  const [reviews, setReviews] = useState<Record<number, any[]>>(() => {
    try {
      const saved = localStorage.getItem("product_reviews");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return {};
  });
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("user_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return [
      { id: 1, title: "Welcome to Universe Hub! 🎉", message: "Explore premium mobile accessories and smartphones with official warranty.", time: "Jan 1, 2025", unread: true },
      { id: 2, title: "Order Delivered 📦", message: "Your order #CLN-2024-7148 has been delivered successfully.", time: "Dec 28, 2024", unread: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("admin_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("product_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("user_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("isDark", String(isDark));
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("isAdminAuth", String(isAdminAuth));
  }, [isAdminAuth]);

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    } else {
      localStorage.removeItem("selectedProduct");
    }
  }, [selectedProduct]);

  useEffect(() => {
    localStorage.setItem("currentPage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("selectedBrandName", selectedBrandName);
  }, [selectedBrandName]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Load all data from Supabase tables
    const loadFromSupabase = async () => {
      try {
        const { data: dbProducts, error: prodErr } = await supabase.from('products').select('*');
        if (!prodErr) {
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts.map(mapDbProductToProduct));
          } else {
            console.log("Supabase products table is empty. Seeding initial template products...");
            const seeded = PRODUCTS.map(p => {
              const dbP = mapProductToDbProduct(p);
              delete dbP.id; // Let auto-increment serial assign unique primary IDs
              return dbP;
            });
            const { data: inserted, error: seedErr } = await supabase.from('products').insert(seeded).select();
            if (!seedErr && inserted) {
              setProducts(inserted.map(mapDbProductToProduct));
            } else {
              console.error("Seeding initial products failed:", seedErr);
            }
          }
        } else {
          console.error("Failed to load products from Supabase:", prodErr);
        }

        const { data: dbOrders, error: orderErr } = await supabase.from('orders').select('*');
        if (!orderErr && dbOrders) {
          setOrders(dbOrders);
        }

        const { data: dbReviews, error: revErr } = await supabase.from('reviews').select('*');
        if (!revErr && dbReviews) {
          const grouped: Record<number, any[]> = {};
          dbReviews.forEach(r => {
            if (!grouped[r.product_id]) grouped[r.product_id] = [];
            grouped[r.product_id].push(r);
          });
          setReviews(grouped);
        }

        const { data: dbNotifs, error: notifErr } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!notifErr && dbNotifs) {
          setNotifications(dbNotifs);
        }
      } catch (e) {
        console.error("Failed loading from Supabase:", e);
      }
    };

    loadFromSupabase();
  }, []);

  const navigate = useCallback((pg: Page, product?: Product, categoryFilter?: string, brandFilter?: string) => {
    if (product) setSelectedProduct(product);
    if (pg === "brand" && brandFilter) {
      setSelectedBrandName(brandFilter);
      setPage("brand");
      return;
    }
    if (categoryFilter) {
      if (categoryFilter === "Mobile Phones") {
        setPage("phones");
        return;
      }
      if (categoryFilter === "Apple Accessories") {
        setShopBrand("Apple");
        setShopCategory("All");
      } else {
        setShopCategory(categoryFilter);
        setShopBrand("All");
      }
    } else if (brandFilter) {
      setShopBrand(brandFilter);
      setShopCategory("All");
    } else if (pg === "shop") {
      setShopCategory("All");
      setShopBrand("All");
    }

    if (pg === "invoices") {
      setAccountTab("invoices");
      setPage("account");
      return;
    }
    if (pg === "notifications") {
      setAccountTab("notifications");
      setPage("account");
      return;
    }
    if (pg === "account") {
      setAccountTab("dashboard");
    }
    if (pg === "login" || pg === "home") {
      setIsAdminAuth(false);
    }
    setPage(pg);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setToast(`${product.name.split(" ").slice(0, 3).join(" ")} added to cart!`);
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id));
    else setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  }, []);

  const toggleWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      const isIn = prev.includes(id);
      setToast(isIn ? "Removed from wishlist" : "Added to wishlist!");
      return isIn ? prev.filter(i => i !== id) : [...prev, id];
    });
  }, []);

  const placeOrder = useCallback((orderDetails?: any) => {
    const orderId = `CLN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSummary = cart.map(i => `${i.product.name} x${i.quantity}`).join(", ");
    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newOrder = {
      id: orderId,
      customer: orderDetails?.fullName || "Kasun Perera",
      customerEmail: orderDetails?.email || "kasun@email.com",
      customerPhone: orderDetails?.phone || "077 123 4567",
      customerAddress: orderDetails?.address || "No. 45, Galle Road, Colombo 03",
      product: itemsSummary,
      amount: totalAmount,
      status: "Processing",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      items: cart
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    const newNotif = {
      id: Date.now(),
      title: "Order Placed 🛍️",
      message: `Your order #${orderId} for ${itemsSummary} has been placed successfully and is currently processing.`,
      time: "Just now",
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    setPage("success");

    if (isSupabaseConfigured()) {
      supabase.from('orders').insert([newOrder]).then();
      supabase.from('notifications').insert([newNotif]).then();
    }
  }, [cart]);

  const addProduct = useCallback(async (newProd: Product) => {
    // Generate a guaranteed unique 32-bit integer ID based on current Epoch seconds
    const nextId = Math.floor(Date.now() / 1000);
    const prodWithId = { ...newProd, id: nextId };

    if (isSupabaseConfigured()) {
      const dbPayload = mapProductToDbProduct(prodWithId);

      try {
        const { data, error } = await supabase
          .from('products')
          .insert([dbPayload])
          .select()
          .single();

        if (!error && data) {
          const insertedProduct = mapDbProductToProduct(data);
          setProducts(prev => [insertedProduct, ...prev]);
          setToast(`${insertedProduct.name} added successfully!`);
        } else {
          console.error("Supabase product insert failed:", error);
          setProducts(prev => [prodWithId, ...prev]);
          setToast(`${prodWithId.name} added locally (Supabase error: ${error?.message || 'Unknown'})`);
        }
      } catch (err) {
        console.error("Failed inserting product:", err);
        setProducts(prev => [prodWithId, ...prev]);
        setToast(`${prodWithId.name} added locally (Error: ${String(err)})`);
      }
    } else {
      setProducts(prev => [prodWithId, ...prev]);
      setToast(`${prodWithId.name} added successfully!`);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    let success = true;
    let errMsg = "";
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          success = false;
          errMsg = error.message;
          console.error("Supabase delete failed:", error);
        }
      } catch (err) {
        success = false;
        errMsg = String(err);
        console.error("Failed to delete product in Supabase:", err);
      }
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured() && !success) {
      setToast(`Product deleted locally (Supabase Sync Error: ${errMsg})`);
    } else {
      setToast("Product deleted successfully!");
    }
  }, []);

  const updateProduct = useCallback(async (updatedProd: Product) => {
    let success = true;
    let errMsg = "";
    if (isSupabaseConfigured()) {
      const dbPayload = mapProductToDbProduct(updatedProd);
      delete dbPayload.id;

      try {
        const { error } = await supabase.from('products').update(dbPayload).eq('id', updatedProd.id);
        if (error) {
          success = false;
          errMsg = error.message;
          console.error("Supabase update failed:", error);
        }
      } catch (err) {
        success = false;
        errMsg = String(err);
        console.error("Failed to update product in Supabase:", err);
      }
    }

    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    if (isSupabaseConfigured() && !success) {
      setToast(`${updatedProd.name} updated locally (Supabase Sync Error: ${errMsg})`);
    } else {
      setToast(`${updatedProd.name} updated successfully!`);
    }
  }, []);

  const updateProductStock = useCallback((id: number, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

    if (isSupabaseConfigured()) {
      supabase.from('products').update({ stock: newStock }).eq('id', id).then();
    }
  }, []);

  const updateOrderStatus = useCallback((id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setToast(`Order status updated to ${newStatus}`);
    const newNotif = {
      id: Date.now(),
      title: `Order Updated: ${newStatus} 📦`,
      message: `Your order #${id} status has been updated to "${newStatus}".`,
      time: "Just now",
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (isSupabaseConfigured()) {
      supabase.from('orders').update({ status: newStatus }).eq('id', id).then();
      supabase.from('notifications').insert([newNotif]).then();
    }
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setToast("All notifications marked as read");

    if (isSupabaseConfigured()) {
      supabase.from('notifications').update({ unread: false }).then();
    }
  }, []);

  const addReview = useCallback((productId: number, newReview: any) => {
    setReviews(prev => {
      const current = prev[productId] || [];
      return {
        ...prev,
        [productId]: [newReview, ...current]
      };
    });
    setToast("Thank you! Your review has been published.");

    if (isSupabaseConfigured()) {
      supabase.from('reviews').insert([{
        product_id: productId,
        author: newReview.author,
        rating: newReview.rating,
        comment: newReview.comment,
        date: newReview.date
      }]).then();
    }
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const isAdmin = page === "admin";

  return (
    <div className={isDark ? "dark" : ""} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <CosmicBackground />
      <div className="min-h-screen text-foreground transition-colors duration-300">
        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} products={products} onNav={(pg, p) => { navigate(pg, p); setShowSearch(false); }} />}
        </AnimatePresence>
        {/* Layout */}
        {isAdmin ? (
          isAdminAuth ? (
            <AdminPage
              onNav={navigate}
              isDark={isDark}
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              onAddProduct={addProduct}
              onDeleteProduct={deleteProduct}
              onUpdateStock={updateProductStock}
              onUpdateOrderStatus={updateOrderStatus}
              onUpdateProduct={updateProduct}
            />
          ) : (
            <AuthPage mode="login" onNav={navigate} onAdminLogin={() => { setIsAdminAuth(true); navigate("admin"); }} />
          )
        ) : (
          <>
            <Header page={page} onNav={navigate} isDark={isDark} setDark={setIsDark} cartCount={cartCount} wishCount={wishlist.length} notifCount={notifications.filter(n => n.unread).length} onSearch={() => setShowSearch(true)} />
            <main className="pb-20 md:pb-0">
              <AnimatePresence mode="wait">
                <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                  {page === "home" && <HomePage onNav={navigate} products={products} onCart={addToCart} wishlist={wishlist} onWish={toggleWishlist} isDark={isDark} />}
                  {page === "shop" && <ShopPage onNav={navigate} products={products} onCart={addToCart} wishlist={wishlist} onWish={toggleWishlist} initialCategory={shopCategory} initialBrand={shopBrand} />}
                  {page === "product" && selectedProduct && (
                    <ProductDetailPage
                      product={selectedProduct}
                      onNav={navigate}
                      onCart={addToCart}
                      wishlist={wishlist}
                      onWish={toggleWishlist}
                      products={products}
                      reviews={reviews[selectedProduct.id] || []}
                      onAddReview={(rev) => addReview(selectedProduct.id, rev)}
                    />
                  )}
                  {page === "cart" && <CartPage cart={cart} onNav={navigate} onQty={updateQty} onRemove={removeFromCart} />}
                  {page === "checkout" && <CheckoutPage cart={cart} onNav={navigate} onPlace={placeOrder} />}
                  {page === "success" && <OrderSuccessPage onNav={navigate} />}
                  {page === "login" && <AuthPage mode="login" onNav={navigate} onAdminLogin={() => { setIsAdminAuth(true); navigate("admin"); }} />}
                  {page === "register" && <AuthPage mode="register" onNav={navigate} />}
                  {page === "account" && (
                    <AccountPage
                      onNav={navigate}
                      cart={cart}
                      initialTab={accountTab}
                      orders={orders}
                      notifications={notifications}
                      onMarkAllNotificationsRead={markAllNotificationsRead}
                    />
                  )}
                  {page === "wishlist" && <WishlistPage wishlist={wishlist} products={products} onNav={navigate} onCart={addToCart} onWish={toggleWishlist} />}
                  {page === "orders" && <OrdersPage onNav={navigate} orders={orders} />}
                  {page === "tracking" && <TrackingPage onNav={navigate} />}
                  {page === "search" && <SearchPage onNav={navigate} products={products} onCart={addToCart} wishlist={wishlist} onWish={toggleWishlist} />}
                  {page === "categories" && <SimpleContentPage title="Categories" subtitle="Browse by Type" icon={Grid} onNav={navigate} onShop={(cat) => navigate("shop", undefined, cat)} />}
                  {page === "brands" && <SimpleContentPage title="Brands" subtitle="Premium Partners" icon={Award} onNav={navigate} onShop={(brand) => navigate("brand", undefined, undefined, brand)} />}
                  {page === "brand" && (
                    <BrandPage
                      brandName={selectedBrandName}
                      products={products}
                      onNav={navigate}
                      onCart={addToCart}
                      wishlist={wishlist}
                      onWish={toggleWishlist}
                    />
                  )}
                  {page === "about" && <SimpleContentPage title="About Us" subtitle="Our Story" icon={Users} onNav={navigate} onShop={() => navigate("shop")} />}
                  {page === "contact" && <SimpleContentPage title="Contact Us" subtitle="Get in Touch" icon={Mail} onNav={navigate} onShop={() => navigate("shop")} />}
                  {page === "404" && <NewNotFoundPage onNav={navigate} />}
                  {page === "phones" && <MobilePhonesPage onNav={navigate} products={products} />}
                  {page === "phone-details" && selectedProduct && <PhoneDetailsPage product={selectedProduct} onNav={navigate} onCart={addToCart} />}
                  {page === "dashboard" && <CustomerDashboardPage onNav={navigate} />}
                  {page === "invoices" && <InvoicesPage orders={orders} />}
                  {page === "notifications" && <NotificationCenter notifications={notifications} onMarkAllRead={markAllNotificationsRead} />}
                  {page === "flashsale" && <FlashSalePage onNav={navigate} products={products} onCart={addToCart} />}
                  {page === "offers" && <OffersPage />}
                  {page === "warranty" && <WarrantyPage onNav={navigate} />}
                  {page === "tradein" && <TradeInPage />}
                  {page === "500" && <ServerErrorPage />}
                  {page === "maintenance" && <MaintenancePage />}
                </motion.div>
              </AnimatePresence>
            </main>
            {!["checkout","success","login","register"].includes(page) && <Footer onNav={navigate} />}
            <FloatingButtons onNav={navigate} cartCount={cartCount} />
            <MobileNav page={page} onNav={navigate} />
          </>
        )}
      </div>
    </div>
  );
}
