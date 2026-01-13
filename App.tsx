
import React, { useState, useMemo, useEffect } from 'react';
import { User, Product } from './types';
import { ALLOWED_DOMAIN, INDUSTRY_KEYWORDS, MAJOR_MAP, TARGET_SCHOOL_KEYWORDS, API_BASE_URL, INITIAL_DATA } from './constants';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { AdminModal } from './components/AdminModal';
import { EditModal } from './components/EditModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { 
  Search, Globe, User as UserIcon, LogOut, Plus, 
  MapPin, Briefcase, SlidersHorizontal, BarChart3, Settings,
  CheckSquare, Trash2, Tag, Loader2, RefreshCw, Sparkles, School, PlayCircle, XCircle
} from 'lucide-react';

const ADMIN_EMAIL = "liuqian@highmark.com.cn";
const LOCAL_STORAGE_KEY = "pricepulse_products_v4"; // Bumped version to invalidate old buggy cache

// --- Login View ---
const LoginView: React.FC<{ onLogin: (email: string) => void, error: string | null }> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <Globe size={24} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-slate-900 mb-8">内部资源系统</h1>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">邮箱</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              placeholder="name@highmark.com.cn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 text-xs font-medium">{error}</div>}
          <Button fullWidth type="submit">登录</Button>
          <div className="pt-4 border-t border-slate-100">
             <Button type="button" fullWidth variant="secondary" onClick={() => onLogin(`demo${ALLOWED_DOMAIN}`)}>
                <PlayCircle size={16} className="mr-2" /> 访客演示
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SimpleSelect = ({ value, onChange, options, placeholder, icon: Icon }: any) => (
  <div className="relative">
     <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><Icon size={14} /></div>
     <select 
       value={value}
       onChange={(e) => onChange(e.target.value)}
       className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 appearance-none cursor-pointer h-10 min-w-[140px]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [schoolInput, setSchoolInput] = useState('');
  const [majorInput, setMajorInput] = useState('');

  const handleLogin = (email: string) => {
    if (email.trim() === ADMIN_EMAIL || email.endsWith(ALLOWED_DOMAIN)) {
      setUser({ email, role: email === ADMIN_EMAIL ? 'admin' : 'viewer' });
    } else {
      setAuthError('请使用公司邮箱');
    }
  };

  // 核心改动：不再盲目相信 LocalStorage
  const loadData = async (force = false) => {
    setIsLoading(true);
    
    // 仅在非强制刷新时尝试从本地加载
    if (!force) {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try { setProducts(JSON.parse(local)); } catch(e) {}
      }
    }

    try {
      // 强制添加时间戳参数，击穿 Cloudflare CDN 缓存
      const res = await fetch(`${API_BASE_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleEditSave = async (updates: Partial<Product>) => {
    let itemsToSync: Product[] = [];
    if (editingProduct) {
      itemsToSync = [{ ...editingProduct, ...updates }];
    } else {
      itemsToSync = products
        .filter(p => selectedProductIds.has(p.id))
        .map(p => ({ ...p, ...updates }));
    }

    setIsSyncing(true);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSync)
      });
      if (res.ok) {
        // 关键：保存成功后立即重新从服务器拉取，确保 UI 和数据库绝对同步
        await loadData(true);
        setIsSelectionMode(false);
        setSelectedProductIds(new Set());
      }
    } catch (e) {
      alert("同步失败，请检查网络");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}?id=${id}`, { method: 'DELETE' });
      loadData(true);
    } catch(e) {}
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !query || p.name.includes(query) || p.role.includes(query);
      const matchInd = !selectedIndustry || p.industry === selectedIndustry;
      const matchLoc = !selectedLocation || p.location.includes(selectedLocation);
      return matchSearch && matchInd && matchLoc;
    });
  }, [products, query, selectedIndustry, selectedLocation]);

  if (!user) return <LoginView onLogin={handleLogin} error={authError} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-slate-800">
            <Globe className="text-blue-600" size={20} />
            <span>资源匹配中心</span>
            {(isLoading || isSyncing) && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => loadData(true)} className="p-2 text-slate-400 hover:text-blue-600" title="手动刷新价格">
                <RefreshCw size={18} />
            </button>
            <span className="text-sm text-slate-500">{user.email}</span>
            <button onClick={() => setUser(null)}><LogOut size={18} className="text-slate-400" /></button>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">资源列表 <span className="text-sm font-normal text-slate-400 ml-2">价格实时同步中</span></h1>
            <div className="flex gap-2">
                {user.role === 'admin' && (
                    <>
                        <Button variant="secondary" onClick={() => setIsSelectionMode(!isSelectionMode)}>管理</Button>
                        <Button onClick={() => setIsModalOpen(true)}>导入</Button>
                    </>
                )}
            </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 mb-6 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                    placeholder="搜索岗位或项目..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <SimpleSelect icon={Briefcase} options={Array.from(new Set(products.map(p => p.industry)))} value={selectedIndustry} onChange={setSelectedIndustry} placeholder="行业" />
                <SimpleSelect icon={MapPin} options={Array.from(new Set(products.map(p => p.location)))} value={selectedLocation} onChange={setSelectedLocation} placeholder="地点" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
                <ProductCard 
                    key={p.id} product={p} 
                    selectionMode={isSelectionMode} isSelected={selectedProductIds.has(p.id)}
                    onToggleSelect={(id) => {
                        const newSet = new Set(selectedProductIds);
                        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                        setSelectedProductIds(newSet);
                    }}
                    onDelete={user.role === 'admin' ? () => handleDelete(p.id) : undefined}
                    onEdit={user.role === 'admin' ? (prod) => { setEditingProduct(prod); setIsEditModalOpen(true); } : undefined}
                    onClick={() => { setViewingProduct(p); setIsDetailModalOpen(true); }}
                />
            ))}
        </div>
      </div>

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={async (items) => {
          await fetch(API_BASE_URL, { method: 'POST', body: JSON.stringify(items) });
          loadData(true);
          setIsModalOpen(false);
      }} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={editingProduct} selectedCount={selectedProductIds.size} onSave={handleEditSave} />
      <ProductDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} product={viewingProduct} />
      {isSelectionMode && selectedProductIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl border flex items-center gap-4 z-50">
              <span className="font-bold">{selectedProductIds.size} 项已选</span>
              <button onClick={() => { setEditingProduct(null); setIsEditModalOpen(true); }} className="text-blue-600 font-bold">批量改价</button>
          </div>
      )}
    </div>
  );
}
