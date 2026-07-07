import React, { useState } from 'react';
import { Shield, Truck, RefreshCcw, Search, Smartphone, Camera, Trash2, Upload, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

type Page = string;

export function WarrantyPage({ onNav }: { onNav: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState<"check" | "register">("check");
  
  // Verify states
  const [searchImei, setSearchImei] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  
  // Register states
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regImei, setRegImei] = useState("");
  const [regModel, setRegModel] = useState("iPhone 15 Pro");
  const [regInvoice, setRegInvoice] = useState("");
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRegistered, setIsRegistered] = useState(false);

  // Claim states
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimIssue, setClaimIssue] = useState("");
  const [claimRefCode, setClaimRefCode] = useState("");
  const [isClaimSubmitted, setIsClaimSubmitted] = useState(false);

  const checkWarranty = async () => {
    if (!searchImei) return;
    setSearchStatus("loading");

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('warranties')
          .select('*')
          .eq('imei', searchImei)
          .single();

        if (!error && data) {
          const purchaseDateStr = data.purchase_date;
          const purchaseDate = new Date(purchaseDateStr);
          const expiryDate = new Date(purchaseDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          const expiryDateStr = expiryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const isActive = expiryDate.getTime() > Date.now();

          setLookupResult({
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone,
            imei: data.imei,
            model: data.device_model,
            invoice: data.invoice_no,
            purchaseDate: purchaseDateStr,
            expiryDate: expiryDateStr,
            isActive
          });
          setSearchStatus("found");
          return;
        }
      } catch (err) {
        console.error("Supabase warranty search query failed:", err);
      }
    }
    
    setTimeout(() => {
      // 1. Search in localStorage
      try {
        const saved = localStorage.getItem("registered_warranties");
        if (saved) {
          const list = JSON.parse(saved);
          const found = list.find((w: any) => w.imei.toLowerCase() === searchImei.toLowerCase());
          if (found) {
            const pDate = new Date(found.purchaseDate);
            const expDate = new Date(pDate.setFullYear(pDate.getFullYear() + 1));
            const isActive = expDate > new Date();
            
            setLookupResult({
              ...found,
              expiryDate: expDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              isActive
            });
            setSearchStatus("found");
            return;
          }
        }
      } catch (e) { console.error(e); }

      // 2. Fallback to default mock entry if search length is > 5
      if (searchImei.length > 5) {
        setLookupResult({
          name: "Kasun Perera",
          email: "kasun@email.com",
          phone: "077 123 4567",
          imei: searchImei,
          model: "iPhone 15 Pro",
          invoice: "INV-2024-7148",
          purchaseDate: "2024-12-28",
          expiryDate: "Dec 28, 2026",
          isActive: true
        });
        setSearchStatus("found");
      } else {
        setSearchStatus("notfound");
      }
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newReg = {
      name: regName,
      phone: regPhone,
      email: regEmail,
      imei: regImei,
      model: regModel,
      invoice: regInvoice,
      purchaseDate: regDate
    };

    try {
      const saved = localStorage.getItem("registered_warranties");
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem("registered_warranties", JSON.stringify([newReg, ...list]));
      
      // Send notification alert
      const savedNotifs = localStorage.getItem("user_notifications");
      const notifs = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: Date.now(),
        title: "Warranty Registered 🛡️",
        message: `Your device ${regModel} (IMEI: ${regImei}) has been registered for official warranty.`,
        time: "Just now",
        unread: true
      };
      localStorage.setItem("user_notifications", JSON.stringify([newNotif, ...notifs]));

      if (isSupabaseConfigured()) {
        supabase.from('warranties').insert([{
          imei: regImei,
          customer_name: regName,
          customer_phone: regPhone,
          customer_email: regEmail,
          device_model: regModel,
          invoice_no: regInvoice,
          purchase_date: regDate
        }]).then();
        supabase.from('notifications').insert([newNotif]).then();
      }
    } catch (e) { console.error(e); }

    setIsRegistered(true);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimIssue || !lookupResult) return;
    
    const reference = `CLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setClaimRefCode(reference);
    setIsClaimSubmitted(true);
    setIsClaiming(false);

    // Save claim query notification
    try {
      const savedNotifs = localStorage.getItem("user_notifications");
      const notifs = savedNotifs ? JSON.parse(savedNotifs) : [];
      const newNotif = {
        id: Date.now(),
        title: "Warranty Claim Submitted 🛠️",
        message: `Claim query #${reference} for your ${lookupResult.model} has been submitted. Status: Under Review.`,
        time: "Just now",
        unread: true
      };
      localStorage.setItem("user_notifications", JSON.stringify([newNotif, ...notifs]));

      if (isSupabaseConfigured()) {
        supabase.from('notifications').insert([newNotif]).then();
      }
    } catch (e) { console.error(e); }

    // Redirect to WhatsApp Business number prefilled text query
    const message = `Hi Universe Hub! I'd like to submit a Warranty Claim.%0A%0A🛠️ *Warranty Claim details*%0A- *Reference ID:* ${reference}%0A- *Customer:* ${lookupResult.name}%0A- *Phone:* ${lookupResult.phone}%0A- *IMEI:* ${lookupResult.imei}%0A- *Device:* ${lookupResult.model}%0A- *Reported Issue:* ${claimIssue}`;
    window.open(`https://wa.me/94771234567?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in relative">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Universe Warranty Center</h1>
        <p className="text-muted-foreground">Verify your official device warranty status or register your newly purchased smartphone.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-secondary border border-border rounded-2xl gap-1">
          <button onClick={() => { setActiveTab("check"); setSearchStatus("idle"); setLookupResult(null); }} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'check' ? 'bg-[#8B5CF6] text-black' : 'text-muted-foreground hover:text-foreground'}`}>
            <Search className="w-4 h-4" /> Verify Warranty
          </button>
          <button onClick={() => { setActiveTab("register"); setIsRegistered(false); }} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'register' ? 'bg-[#8B5CF6] text-black' : 'text-muted-foreground hover:text-foreground'}`}>
            <CheckCircle className="w-4 h-4" /> Register Device
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl">
        {activeTab === "check" ? (
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Check Warranty Status</h3>
            <div className="flex gap-4">
              <input 
                value={searchImei} onChange={e => setSearchImei(e.target.value)} 
                placeholder="Enter IMEI or Serial Number..." 
                className="flex-1 px-6 py-4 rounded-2xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors font-mono"
              />
              <button onClick={checkWarranty} className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-[#8B5CF6] hover:text-black transition-colors">
                {searchStatus === "loading" ? "Verifying..." : "Verify"}
              </button>
            </div>

            {searchStatus === "found" && lookupResult && (
              <div className={`p-6 rounded-2xl border animate-scale-up ${lookupResult.isActive ? "bg-green-50/5 border-green-500/20" : "bg-red-50/5 border-red-500/20"}`}>
                <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{lookupResult.model}</h4>
                    <span className="text-xs text-muted-foreground font-mono">IMEI: {lookupResult.imei}</span>
                  </div>
                  {lookupResult.isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">🛡️ Active</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">⚠️ Expired</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div><span className="text-muted-foreground block">Customer:</span><span className="font-bold text-foreground">{lookupResult.name}</span></div>
                  <div><span className="text-muted-foreground block">Invoice No:</span><span className="font-mono font-bold text-foreground">{lookupResult.invoice}</span></div>
                  <div><span className="text-muted-foreground block">Purchase Date:</span><span className="font-bold text-foreground">{lookupResult.purchaseDate}</span></div>
                  <div><span className="text-muted-foreground block">Warranty Expiration:</span><span className="font-bold text-foreground">{lookupResult.expiryDate}</span></div>
                </div>

                {lookupResult.isActive && (
                  <div className="bg-secondary/40 border border-border p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-foreground mb-0.5">Need support or claim repairs?</h5>
                      <p className="text-[11px] text-muted-foreground">Submit a query directly to our support desk on WhatsApp.</p>
                    </div>
                    <button onClick={() => setIsClaiming(true)} className="px-4 py-2 bg-[#8B5CF6] text-black text-xs font-black rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 whitespace-nowrap">
                      Claim Warranty 🛠️
                    </button>
                  </div>
                )}
              </div>
            )}

            {searchStatus === "notfound" && (
              <div className="p-6 rounded-2xl bg-red-50/5 border border-red-500/20 text-center animate-scale-up">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h4 className="font-bold text-base text-foreground mb-1">Warranty Expired / Not Found</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We could not locate any active registration details matching this IMEI serial key. If this is a mistake, please register this device or contact our helpdesk.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {isRegistered ? (
              <div className="text-center py-8 space-y-4 animate-scale-up">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="font-bold text-2xl text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Registration Complete!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your device warranty registration details have been synchronized. You can check search status anytime inside the lookup tab.
                </p>
                <button onClick={() => { setIsRegistered(false); setRegImei(""); setRegName(""); setRegPhone(""); }} className="px-6 py-2.5 bg-foreground text-background font-bold text-xs rounded-xl hover:bg-[#8B5CF6] hover:text-black transition-all">
                  Register Another Device
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <h3 className="font-bold text-xl text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Register Official Device Warranty</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                    <input required value={regName} onChange={e => setRegName(e.target.value)} placeholder="Kasun Perera" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                    <input required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="077 123 4567" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                    <input required type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="kasun@email.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Device Model</label>
                    <input required value={regModel} onChange={e => setRegModel(e.target.value)} placeholder="iPhone 15 Pro" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">IMEI or Serial Number</label>
                    <input required value={regImei} onChange={e => setRegImei(e.target.value)} placeholder="IMEI-998877" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Invoice / Receipt Number</label>
                    <input required value={regInvoice} onChange={e => setRegInvoice(e.target.value)} placeholder="INV-2024-9988" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors font-mono" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Purchase Date</label>
                  <input required type="date" value={regDate} onChange={e => setRegDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-colors mt-4">
                  Register Warranty
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Claim Query Input Dialog */}
      {isClaiming && lookupResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleClaimSubmit} className="bg-card w-full max-w-md rounded-3xl border border-border p-8 shadow-2xl space-y-6 animate-scale-up">
            <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Submit Warranty Claim</h2>
            <p className="text-xs text-muted-foreground">Please describe the exact technical issues or damages you are facing with your {lookupResult.model}.</p>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Describe the issue <span className="text-red-500">*</span></label>
              <textarea 
                required 
                rows={4} 
                value={claimIssue} 
                onChange={e => setClaimIssue(e.target.value)} 
                placeholder="Examples: Green lines on display, battery draining very fast, microphone not working..." 
                className="w-full p-4 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setIsClaiming(false)} className="flex-1 py-3 bg-secondary hover:bg-border text-muted-foreground font-bold rounded-2xl text-xs transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 bg-[#8B5CF6] text-black font-bold rounded-2xl text-xs hover:brightness-110 transition-all">
                Submit & Open WhatsApp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claim Success Dialog */}
      {isClaimSubmitted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border p-8 shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Claim Submitted!</h2>
              <p className="text-sm text-muted-foreground">Your claim ticket has been generated and redirected to WhatsApp.</p>
            </div>
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Reference ID:</span><span className="font-bold text-foreground">{claimRefCode}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Claim status:</span><span className="font-bold text-[#8B5CF6] uppercase">Under Review</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Business Line:</span><span className="font-bold text-foreground">077 123 4567</span></div>
            </div>
            <button onClick={() => { setIsClaimSubmitted(false); setClaimIssue(""); }} className="w-full py-3.5 bg-foreground text-background rounded-2xl font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TradeInPage() {
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("iPhone 14 Pro");
  const [storage, setStorage] = useState("128GB");
  const [condition, setCondition] = useState("Good (Minor wear)");
  const [countryVersion, setCountryVersion] = useState("Singapore (ZA/A)");
  const [simType, setSimType] = useState("1 Physical SIM + 1 eSIM");
  const [deviceImage, setDeviceImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const deviceData: Record<string, Record<string, number>> = {
    Apple: {
      "iPhone 13 Pro": 140000,
      "iPhone 14 Pro": 180000,
      "iPhone 15 Pro Max": 240000,
    },
    Samsung: {
      "Galaxy S22 Ultra": 120000,
      "Galaxy S23 Ultra": 170000,
      "Galaxy S24 Ultra": 220000,
    },
    Google: {
      "Pixel 7 Pro": 100000,
      "Pixel 8 Pro": 150000,
    }
  };

  const storageMultipliers: Record<string, number> = {
    "128GB": 1.0,
    "256GB": 1.15,
    "512GB": 1.3
  };

  const conditionMultipliers: Record<string, number> = {
    "Flawless (No scratches)": 1.0,
    "Good (Minor wear)": 0.85,
    "Cracked Screen": 0.5,
    "Damaged / Dead": 0.2
  };

  const simMultipliers: Record<string, number> = {
    "1 Physical SIM + 1 eSIM": 1.0,
    "Dual Physical SIM": 1.02,
    "Dual eSIM Only": 0.94
  };

  const countryMultipliers: Record<string, number> = {
    "Singapore (ZA/A)": 1.0,
    "USA (LL/A)": 0.98,
    "Japan (J/A)": 0.96,
    "Europe / UK": 1.0,
    "Middle East / UAE": 0.97,
    "International / Other": 0.98
  };

  // Keep model in sync with brand changes
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const models = Object.keys(deviceData[newBrand]);
    setModel(models[0]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeviceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const basePrice = deviceData[brand]?.[model] || 100000;
  const storageMult = storageMultipliers[storage] || 1.0;
  const conditionMult = conditionMultipliers[condition] || 1.0;
  const simMult = simMultipliers[simType] || 1.0;
  const countryMult = countryMultipliers[countryVersion] || 1.0;
  const estimate = Math.round(basePrice * storageMult * conditionMult * simMult * countryMult);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    if (!deviceImage) {
      alert("Please upload a device image!");
      return;
    }
    const reference = `TRD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setRefCode(reference);
    setIsSubmitted(true);

    // Save user notifications trigger
    try {
      const saved = localStorage.getItem("user_notifications");
      const list = saved ? JSON.parse(saved) : [];
      const newNotif = {
        id: Date.now(),
        title: "Trade-In Request Submitted 📱",
        message: `Your trade-in valuation request #${reference} for ${brand} ${model} (${storage}, ${countryVersion}, ${simType}) has been received. Estimated value LKR ${estimate.toLocaleString()}.`,
        time: "Just now",
        unread: true
      };
      localStorage.setItem("user_notifications", JSON.stringify([newNotif, ...list]));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Trade-In Your Device</h1>
        <p className="text-muted-foreground">Get an instant estimate for your old phone and upgrade to a new flagship today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Details */}
        <div className="lg:col-span-2 bg-card border border-border p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="font-bold text-xl text-foreground mb-6" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Device Valuation details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Brand</label>
                <select value={brand} onChange={e => handleBrandChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(deviceData).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Model</label>
                <select value={model} onChange={e => setModel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(deviceData[brand] || {}).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Storage</label>
                <select value={storage} onChange={e => setStorage(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(storageMultipliers).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Device Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(conditionMultipliers).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Country Version</label>
                <select value={countryVersion} onChange={e => setCountryVersion(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(countryMultipliers).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">SIM Configuration</label>
                <select value={simType} onChange={e => setSimType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors">
                  {Object.keys(simMultipliers).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Mandatory Image Upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Upload Phone Image <span className="text-red-500">*</span></label>
              {deviceImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={deviceImage} alt="Phone Preview" className="w-14 h-14 object-cover rounded-xl border border-border" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Selected Image</span>
                      <span className="text-[10px] text-green-600 font-bold block">✓ Ready to upload</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setDeviceImage(null)} className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all mr-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border hover:border-[#8B5CF6]/50 bg-secondary/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 group">
                  <input type="file" accept="image/*" required onChange={handleImageChange} className="hidden" />
                  <Camera className="w-8 h-8 text-muted-foreground group-hover:text-[#8B5CF6] transition-colors" />
                  <div className="text-xs font-bold text-foreground">Upload device image (Required)</div>
                  <div className="text-[10px] text-muted-foreground">Supports JPEG, PNG, WEBP files</div>
                </label>
              )}
            </div>

            <hr className="border-border my-6" />

            <h3 className="font-bold text-lg text-foreground mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Contact details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Kasun Perera" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="077 123 4567" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none text-sm text-foreground focus:border-[#8B5CF6] transition-colors" />
              </div>
            </div>

            <button type="submit" className="w-full mt-6 py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-colors">
              Submit Trade-In Request
            </button>
          </form>
        </div>

        {/* Live Estimate Card */}
        <div className="lg:col-span-1 bg-secondary/40 border border-border p-8 rounded-[2.5rem] flex flex-col justify-center text-center h-fit sticky top-20 shadow-sm">
          <Smartphone className="w-16 h-16 mx-auto mb-6 text-[#8B5CF6] animate-pulse" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Estimated Value</div>
          <div className="text-4xl font-black text-foreground mb-4 font-mono">LKR {estimate.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This estimate considers storage size, device physical condition, SIM configurations, and country version region codes.
          </p>
        </div>
      </div>

      {/* Submission Success Dialog */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border p-8 shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Request Received!</h2>
              <p className="text-sm text-muted-foreground">Your trade-in estimation query has been registered successfully.</p>
            </div>
            {deviceImage && (
              <img src={deviceImage} alt="Phone Uploaded" className="w-24 h-24 object-cover mx-auto rounded-2xl border border-border shadow-md" />
            )}
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Reference ID:</span><span className="font-bold text-foreground">{refCode}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Specs:</span><span className="font-bold text-foreground">{brand} {model} ({storage})</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Country & SIM:</span><span className="font-bold text-foreground text-right">{countryVersion} - {simType}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Valuation Estimate:</span><span className="font-mono font-bold text-foreground">LKR {estimate.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Contact:</span><span className="font-bold text-foreground">{phone}</span></div>
            </div>
            <button onClick={() => { setIsSubmitted(false); setName(""); setPhone(""); setDeviceImage(null); }} className="w-full py-3.5 bg-foreground text-background rounded-2xl font-bold hover:bg-[#8B5CF6] hover:text-black transition-all">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
