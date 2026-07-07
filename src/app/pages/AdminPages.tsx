import React from 'react';
import { BarChart3, Package, Users, Settings, Smartphone, MessageCircle, FileText, TrendingUp, UploadCloud, Download, Percent, Truck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const CHART_DATA = [
  { month: "Jan", revenue: 450000 },
  { month: "Feb", revenue: 520000 },
  { month: "Mar", revenue: 480000 },
  { month: "Apr", revenue: 610000 },
  { month: "May", revenue: 590000 },
  { month: "Jun", revenue: 750000 },
];

export function AdminAnalyticsPage({ orders }: { orders: any[] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const netProfit = Math.round(totalRevenue * 0.82);
  const totalExpenses = Math.round(totalRevenue * 0.18);
  const totalOrders = orders.length;

  // Group revenue by month
  const monthlyRevenueMap: Record<string, number> = {
    "Jan": 150000,
    "Feb": 120000,
    "Mar": 180000,
    "Apr": 220000,
    "May": 310000,
    "Jun": 450000,
    "Jul": 100000, // July base offset
    "Aug": 0,
    "Sep": 0,
    "Oct": 0,
    "Nov": 0,
    "Dec": 0
  };

  orders.forEach((o: any) => {
    if (o.date) {
      const match = o.date.match(/^[A-Za-z]{3}/);
      if (match) {
        const m = match[0];
        if (monthlyRevenueMap[m] !== undefined) {
          monthlyRevenueMap[m] += o.amount;
        }
      }
    }
  });

  const chartData = [
    { month: "Jan", revenue: monthlyRevenueMap["Jan"] },
    { month: "Feb", revenue: monthlyRevenueMap["Feb"] },
    { month: "Mar", revenue: monthlyRevenueMap["Mar"] },
    { month: "Apr", revenue: monthlyRevenueMap["Apr"] },
    { month: "May", revenue: monthlyRevenueMap["May"] },
    { month: "Jun", revenue: monthlyRevenueMap["Jun"] },
    { month: "Jul", revenue: monthlyRevenueMap["Jul"] },
    { month: "Aug", revenue: monthlyRevenueMap["Aug"] },
    { month: "Sep", revenue: monthlyRevenueMap["Sep"] },
    { month: "Oct", revenue: monthlyRevenueMap["Oct"] },
    { month: "Nov", revenue: monthlyRevenueMap["Nov"] },
    { month: "Dec", revenue: monthlyRevenueMap["Dec"] },
  ].filter(d => d.revenue > 0 || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].includes(d.month));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", val: `LKR ${totalRevenue.toLocaleString()}`, change: "+24%", icon: TrendingUp, up: true },
          { label: "Net Profit", val: `LKR ${netProfit.toLocaleString()}`, change: "+12%", icon: BarChart3, up: true },
          { label: "Total Expenses", val: `LKR ${totalExpenses.toLocaleString()}`, change: "-5%", icon: FileText, up: false },
          { label: "Total Orders", val: totalOrders.toString(), change: "+18%", icon: Package, up: true }
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                   <s.icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.change}</span>
             </div>
             <div className="text-3xl font-black mb-1 font-mono">{s.val}</div>
             <div className="text-sm font-semibold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border p-6 rounded-3xl h-[400px]">
        <h3 className="font-bold text-lg mb-6">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#888" axisLine={false} tickLine={false} />
            <YAxis stroke="#888" axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdminImportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-card border border-border p-8 rounded-3xl text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
             <UploadCloud className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black mb-2">Bulk Product Import</h2>
          <p className="text-muted-foreground mb-8">Upload a CSV or Excel file to update inventory, prices, and product details in bulk.</p>
          
          <div className="border-2 border-dashed border-border rounded-2xl p-12 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all cursor-pointer">
             <p className="font-bold text-foreground mb-2">Drag & Drop your file here</p>
             <p className="text-sm text-muted-foreground">or click to browse (CSV, XLSX)</p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
             <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary font-bold hover:bg-border transition-colors">
                <Download className="w-4 h-4" /> Download Template
             </button>
             <button className="px-8 py-3 rounded-xl bg-[#8B5CF6] text-black font-bold hover:brightness-110 transition-colors">
                Process Upload
             </button>
          </div>
       </div>
    </div>
  );
}

export function AdminDeliveryPage() {
  return (
    <div className="bg-card border border-border p-8 rounded-3xl">
       <div className="flex items-center justify-between mb-8">
          <div>
             <h2 className="text-2xl font-black mb-1">Delivery Charges</h2>
             <p className="text-muted-foreground">Configure dynamic shipping rates based on district.</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-[#8B5CF6] hover:text-black transition-colors">
             Add Zone
          </button>
       </div>

       <div className="space-y-4">
          {[
            { zone: "Colombo 1-15", cost: 350, time: "Same Day" },
            { zone: "Western Province", cost: 450, time: "1-2 Days" },
            { zone: "Outstation", cost: 650, time: "2-4 Days" },
          ].map(z => (
            <div key={z.zone} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-foreground/30 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                     <Truck className="w-5 h-5" />
                  </div>
                  <div>
                     <div className="font-bold">{z.zone}</div>
                     <div className="text-xs text-muted-foreground">ETA: {z.time}</div>
                  </div>
               </div>
               <div className="font-mono font-bold text-lg">LKR {z.cost}</div>
            </div>
          ))}
       </div>
    </div>
  );
}

export function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-50 backdrop-blur-md bg-background/50">
      <div className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[#8B5CF6]/5 pointer-events-none" />
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage Universe Hub</p>
        </div>
        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" defaultValue="admin@universehub.lk" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
            <input type="password" defaultValue="********" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors" />
          </div>
          <button 
            onClick={onLogin}
            className="w-full py-4 mt-6 rounded-xl bg-[#8B5CF6] text-black font-black text-lg hover:brightness-110 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersView({ orders, onUpdateStatus }: { orders: any[]; onUpdateStatus: (id: string, status: string) => void }) {
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);

  const statusColor: Record<string, string> = {
    "Delivered": "bg-green-500/10 text-green-500 border border-green-500/20",
    "Processing": "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    "Shipped": "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    "Cancelled": "bg-red-500/10 text-red-500 border border-red-500/20",
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground">Manage Orders</h2>
        <span className="px-3 py-1 bg-secondary text-foreground text-xs font-bold rounded-full">{orders.length} Total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              <th className="pb-3 pr-4">Order ID</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Products</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                <td className="py-4 pr-4 font-mono font-bold text-xs text-[#8B5CF6]">{o.id}</td>
                <td className="py-4 pr-4 font-semibold text-foreground">{o.customer}</td>
                <td className="py-4 pr-4 text-muted-foreground truncate max-w-[200px]">{o.product}</td>
                <td className="py-4 pr-4 text-xs text-muted-foreground">{o.date}</td>
                <td className="py-4 pr-4 font-bold text-foreground font-mono">LKR {o.amount.toLocaleString()}</td>
                <td className="py-4 pr-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor[o.status] || "bg-secondary text-muted-foreground"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-4">
                  <button onClick={() => setSelectedOrder(o)} className="text-xs font-bold text-[#8B5CF6] hover:underline">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2rem] p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-foreground mb-4">Order Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Order ID</span>
                  <span className="font-mono font-bold text-[#8B5CF6]">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Date</span>
                  <span className="font-semibold">{selectedOrder.date}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Customer</span>
                  <span className="font-semibold">{selectedOrder.customer}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Total Amount</span>
                  <span className="font-bold font-mono">LKR {selectedOrder.amount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-3 block">Update Order Status</span>
                <div className="grid grid-cols-4 gap-2">
                  {["Processing", "Shipped", "Delivered", "Cancelled"].map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(selectedOrder.id, st);
                        setSelectedOrder(prev => ({ ...prev, status: st }));
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedOrder.status === st ? 'bg-[#8B5CF6] text-black border-transparent' : 'bg-secondary text-muted-foreground border-border hover:border-foreground/30'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-3 bg-foreground text-background font-bold rounded-xl text-sm hover:bg-border transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminProductsView({ products, onAdd, onDelete, onUpdate }: { products: any[]; onAdd: (p: any) => void; onDelete: (id: number) => void; onUpdate: (p: any) => void }) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [name, setName] = React.useState("");
  const [brand, setBrand] = React.useState("Apple");
  const [category, setCategory] = React.useState("Phone Cases");
  const [price, setPrice] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [icon, setIcon] = React.useState("📱");
  const [stock, setStock] = React.useState("50");
  const [discount, setDiscount] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [colorsStr, setColorsStr] = React.useState("");
  const [storagePricingList, setStoragePricingList] = React.useState<{ cap: string; price: number }[]>([]);
  const [showStockCount, setShowStockCount] = React.useState(false);

  // Edit states
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editBrand, setEditBrand] = React.useState("Apple");
  const [editCategory, setEditCategory] = React.useState("Phone Cases");
  const [editPrice, setEditPrice] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editIcon, setEditIcon] = React.useState("📱");
  const [editStock, setEditStock] = React.useState("50");
  const [editDiscount, setEditDiscount] = React.useState("");
  const [editImages, setEditImages] = React.useState<string[]>([]);
  const [editColorsStr, setEditColorsStr] = React.useState("");
  const [editStoragePricingList, setEditStoragePricingList] = React.useState<{ cap: string; price: number }[]>([]);
  const [editShowStockCount, setEditShowStockCount] = React.useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const promises = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(promises).then(base64s => {
        setImages(prev => [...prev, ...base64s]);
      });
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const promises = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(promises).then(base64s => {
        setEditImages(prev => [...prev, ...base64s]);
      });
    }
  };

  const startEdit = (p: any) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditBrand(p.brand);
    setEditCategory(p.category);
    setEditPrice(String(p.price));
    setEditDesc(p.description || "");
    setEditIcon(p.icon || "📱");
    setEditStock(String(p.stock || 10));
    setEditDiscount(p.discount ? String(p.discount) : "");
    setEditImages(p.specs?.uploaded_images || []);
    setEditColorsStr(p.availableColors ? p.availableColors.join(", ") : "");
    setEditStoragePricingList(p.storagePricing || []);
    setEditShowStockCount(p.specs?.showStockCount === true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const colorsArray = colorsStr.split(",").map(c => c.trim()).filter(Boolean);
    const newProduct = {
      id: Date.now(),
      name,
      brand,
      category,
      price: parseFloat(price),
      description: desc,
      icon,
      stock: parseInt(stock) || 10,
      gradient: "linear-gradient(135deg, #1e1b4b, #311042)",
      discount: discount ? parseInt(discount) : undefined,
      specs: { uploaded_images: images, showStockCount: showStockCount },
      availableColors: colorsArray,
      storagePricing: storagePricingList
    };
    onAdd(newProduct);
    // Reset form
    setName("");
    setPrice("");
    setDesc("");
    setDiscount("");
    setImages([]);
    setColorsStr("");
    setStoragePricingList([]);
    setShowStockCount(false);
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName || !editPrice) return;
    const editColorsArray = editColorsStr.split(",").map(c => c.trim()).filter(Boolean);
    const updatedProduct = {
      ...editingProduct,
      name: editName,
      brand: editBrand,
      category: editCategory,
      price: parseFloat(editPrice),
      description: editDesc,
      icon: editIcon,
      stock: parseInt(editStock) || 10,
      discount: editDiscount ? parseInt(editDiscount) : undefined,
      specs: { ...editingProduct.specs, uploaded_images: editImages, showStockCount: editShowStockCount },
      availableColors: editColorsArray,
      storagePricing: editStoragePricingList
    };
    onUpdate(updatedProduct);
    setEditingProduct(null);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground">Products Manager</h2>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Add, update, or remove mobile devices & accessories.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="px-5 py-3 rounded-2xl bg-foreground text-background font-black text-xs hover:bg-[#8B5CF6] hover:text-black transition-all">
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              <th className="pb-3 pr-4">Product</th>
              <th className="pb-3 pr-4">Brand</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Stock</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                <td className="py-3.5 pr-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg select-none overflow-hidden" style={{ background: p.gradient || "bg-secondary" }}>
                    {p.icon && (p.icon.startsWith("data:image") || p.icon.length > 50) ? (
                      <img src={p.icon} alt={p.name} className="w-8 h-8 object-contain" />
                    ) : (
                      p.icon
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground truncate max-w-[200px]">{p.name}</div>
                    {p.badge && <span className="text-[9px] bg-[#8B5CF6]/20 text-[#8B5CF6] px-1.5 py-0.5 rounded font-black mt-0.5 inline-block">{p.badge}</span>}
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-semibold text-muted-foreground">{p.brand}</td>
                <td className="py-3.5 pr-4 text-muted-foreground">{p.category}</td>
                <td className="py-3.5 pr-4 font-bold text-foreground font-mono">LKR {p.price.toLocaleString()}</td>
                <td className="py-3.5 pr-4 font-semibold text-foreground">{p.stock || 0} units</td>
                <td className="py-3.5 flex items-center gap-3">
                  <button onClick={() => startEdit(p)} className="text-xs font-bold text-[#8B5CF6] hover:underline">
                    Edit
                  </button>
                  <button onClick={() => onDelete(p.id)} className="text-xs font-bold text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground">Add New Product</h3>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. AirPods Pro Max" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Brand</label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors">
                  {["Apple", "Samsung", "Google", "Xiaomi", "Anker", "Nothing", "Spigen"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors">
                  {["Mobile Phones", "Phone Cases", "Chargers", "Earbuds & AirPods", "Smart Watches", "Power Banks"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Price (LKR)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="145000" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Initial Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="50" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Icon Image</label>
                <div className="relative">
                  <div className={`relative w-full h-[46px] rounded-xl overflow-hidden border border-border bg-secondary flex items-center justify-center ${icon && (icon.startsWith("data:image") || icon.length > 50) ? "" : "hidden"}`}>
                    <img src={icon && icon.startsWith("data:image") ? icon : ""} alt="Icon preview" className="h-8 object-contain" />
                    <button
                      type="button"
                      onClick={() => setIcon("📱")}
                      className="absolute right-2 text-red-500 font-bold text-xs hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <label 
                    onClick={e => e.stopPropagation()} 
                    className={`w-full h-[46px] rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 flex items-center justify-center cursor-pointer transition-colors text-xs font-semibold text-muted-foreground ${icon && (icon.startsWith("data:image") || icon.length > 50) ? "hidden" : "flex"}`}
                  >
                    <span>Click to upload icon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onClick={e => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setIcon(reader.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1 bg-secondary/30 p-3 rounded-xl border border-border/50">
              <input
                type="checkbox"
                id="showStockCount"
                checked={showStockCount}
                onChange={e => setShowStockCount(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-secondary text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <label htmlFor="showStockCount" className="text-xs font-bold text-muted-foreground uppercase tracking-widest cursor-pointer select-none">
                Show exact stock quantity number on website
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Discount % (Optional)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="15" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Available Colors (Comma-separated, optional)</label>
              <input value={colorsStr} onChange={e => setColorsStr(e.target.value)} placeholder="e.g. Natural Titanium, Blue Titanium, Obsidian" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Storage Options & Pricing (Optional)</label>
              <div className="space-y-2.5">
                {storagePricingList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={item.cap}
                      placeholder="e.g. 128GB"
                      required
                      onChange={e => {
                        const list = [...storagePricingList];
                        list[idx].cap = e.target.value;
                        setStoragePricingList(list);
                      }}
                      className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                    <input
                      type="number"
                      value={item.price || ""}
                      placeholder="Price in LKR"
                      required
                      onChange={e => {
                        const list = [...storagePricingList];
                        list[idx].price = parseFloat(e.target.value) || 0;
                        setStoragePricingList(list);
                      }}
                      className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setStoragePricingList(prev => prev.filter((_, i) => i !== idx))}
                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setStoragePricingList(prev => [...prev, { cap: "", price: 0 }])}
                  className="py-2 px-4 rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 text-xs font-bold text-muted-foreground transition-all flex items-center justify-center gap-1"
                >
                  + Add Storage Variant
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Images (Optional)</label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-secondary">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xl text-muted-foreground font-black">+</span>
                  <span className="text-[8px] text-muted-foreground font-bold">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
              <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Product descriptions..." className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none" />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3.5 rounded-xl border border-border font-bold hover:border-foreground transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3.5 rounded-xl bg-[#8B5CF6] text-black font-bold hover:brightness-110 transition-all">Add Product</button>
            </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground">Edit Product</h3>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} required placeholder="e.g. AirPods Pro Max" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Brand</label>
                <select value={editBrand} onChange={e => setEditBrand(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors">
                  {["Apple", "Samsung", "Google", "Xiaomi", "Anker", "Nothing", "Spigen"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Category</label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors">
                  {["Mobile Phones", "Phone Cases", "Chargers", "Earbuds & AirPods", "Smart Watches", "Power Banks"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Price (LKR)</label>
                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} required placeholder="145000" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Stock</label>
                <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} placeholder="50" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Icon Image</label>
                <div className="relative">
                  <div className={`relative w-full h-[46px] rounded-xl overflow-hidden border border-border bg-secondary flex items-center justify-center ${editIcon && (editIcon.startsWith("data:image") || editIcon.length > 50) ? "" : "hidden"}`}>
                    <img src={editIcon && editIcon.startsWith("data:image") ? editIcon : ""} alt="Icon preview" className="h-8 object-contain" />
                    <button
                      type="button"
                      onClick={() => setEditIcon("📱")}
                      className="absolute right-2 text-red-500 font-bold text-xs hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <label 
                    onClick={e => e.stopPropagation()} 
                    className={`w-full h-[46px] rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 flex items-center justify-center cursor-pointer transition-colors text-xs font-semibold text-muted-foreground ${editIcon && (editIcon.startsWith("data:image") || editIcon.length > 50) ? "hidden" : "flex"}`}
                  >
                    <span>Click to upload icon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onClick={e => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditIcon(reader.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1 bg-secondary/30 p-3 rounded-xl border border-border/50">
              <input
                type="checkbox"
                id="editShowStockCount"
                checked={editShowStockCount}
                onChange={e => setEditShowStockCount(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-secondary text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <label htmlFor="editShowStockCount" className="text-xs font-bold text-muted-foreground uppercase tracking-widest cursor-pointer select-none">
                Show exact stock quantity number on website
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Discount % (Optional)</label>
              <input type="number" value={editDiscount} onChange={e => setEditDiscount(e.target.value)} placeholder="15" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Available Colors (Comma-separated, optional)</label>
              <input value={editColorsStr} onChange={e => setEditColorsStr(e.target.value)} placeholder="e.g. Natural Titanium, Blue Titanium, Obsidian" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Storage Options & Pricing (Optional)</label>
              <div className="space-y-2.5">
                {editStoragePricingList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={item.cap}
                      placeholder="e.g. 128GB"
                      required
                      onChange={e => {
                        const list = [...editStoragePricingList];
                        list[idx].cap = e.target.value;
                        setEditStoragePricingList(list);
                      }}
                      className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                    <input
                      type="number"
                      value={item.price || ""}
                      placeholder="Price in LKR"
                      required
                      onChange={e => {
                        const list = [...editStoragePricingList];
                        list[idx].price = parseFloat(e.target.value) || 0;
                        setEditStoragePricingList(list);
                      }}
                      className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setEditStoragePricingList(prev => prev.filter((_, i) => i !== idx))}
                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditStoragePricingList(prev => [...prev, { cap: "", price: 0 }])}
                  className="py-2 px-4 rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 text-xs font-bold text-muted-foreground transition-all flex items-center justify-center gap-1"
                >
                  + Add Storage Variant
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Images (Optional)</label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {editImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-secondary">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xl text-muted-foreground font-black">+</span>
                  <span className="text-[8px] text-muted-foreground font-bold">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleEditImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
              <textarea rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Product descriptions..." className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none" />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3.5 rounded-xl border border-border font-bold hover:border-foreground transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3.5 rounded-xl bg-[#8B5CF6] text-black font-bold hover:brightness-110 transition-all">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function AdminInventoryView({ products, onUpdateStock }: { products: any[]; onUpdateStock: (id: number, qty: number) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-3xl p-6">
        <h2 className="text-2xl font-black text-foreground mb-6">Stock Control</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Current Stock</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const stockVal = p.stock ?? 10;
                const isLow = stockVal <= 5;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 pr-4 flex items-center gap-3">
                      <span className="text-lg">{p.icon}</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">{p.name}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">{p.category}</td>
                    <td className="py-3.5 pr-4 font-mono font-bold">{stockVal} units</td>
                    <td className="py-3.5 pr-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-secondary border border-border p-1 rounded-xl">
                        <button onClick={() => onUpdateStock(p.id, Math.max(0, stockVal - 1))} className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-border transition-colors text-xs font-bold">-</button>
                        <span className="w-8 text-center font-bold text-xs font-mono">{stockVal}</span>
                        <button onClick={() => onUpdateStock(p.id, stockVal + 1)} className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-border transition-colors text-xs font-bold">+</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Uploader Integration */}
      <AdminImportPage />
    </div>
  );
}
