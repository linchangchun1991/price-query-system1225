
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
const LOCAL_STORAGE_KEY = "pricepulse_products";

// --- Simple Login View ---
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

          <Button fullWidth type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
            登录
          </Button>

          <div className="pt-4 border-t border-slate-100">
             <Button 
                type="button" 
                fullWidth 
                variant="secondary"
                onClick={() => onLogin(`demo${ALLOWED_DOMAIN}`)}
                className="text-slate-600"
            >
                <PlayCircle size={16} className="mr-2" /> 访客演示
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Simple Select ---
const SimpleSelect = ({ value, onChange, options, placeholder, icon: Icon }: any) => (
  <div className="relative">
     <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
        <Icon size={14} />
     </div>
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

// --- Main Application ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filters
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  // Item Focus
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // AI Inputs
  const [schoolInput, setSchoolInput] = useState('');
  const [majorInput, setMajorInput] = useState('');

  // --- Auth ---
  const handleLogin = (email: string) => {
    if (email.trim() === ADMIN_EMAIL || email.endsWith(ALLOWED_DOMAIN)) {
      setUser({ email, role: email === ADMIN_EMAIL ? 'admin' : 'viewer' });
      setAuthError(null);
    } else {
      setAuthError('请使用公司邮箱');
    }
  };

  // --- Data Logic (Synchronized) ---
  
  // 1. Load Data: Local Cache -> Then API (Source of Truth)
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Step 1: Instant load from LocalStorage (Cache)
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
        try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setProducts(parsed);
            }
        } catch(e) {}
    }

    // Step 2: Fetch from Network (Source of Truth)
    try {
        const res = await fetch(API_BASE_URL);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                // Server data overrides local data
                setProducts(data);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            } else if (data.length === 0 && (!local || JSON.parse(local).length === 0)) {
                // If server is empty and local is empty, use initial
                // Only on very first init
            }
        }
    } catch (e) {
        console.warn("API offline, using cached data");
    } finally {
        setIsLoading(false);
    }
  };

  // Helper: Persist to LocalStorage
  const persistLocal = (newData: Product[]) => {
    setProducts(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  };

  // 2. Add: Update Local -> Push to API
  const handleAddProducts = async (newItems: Product[]) => {
    // Optimistic Update
    const newList = [...newItems, ...products];
    persistLocal(newList);
    setIsSyncing(true);

    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems)
      });
    } catch (e) {
      console.error("Failed to sync add", e);
      alert("网络同步失败，数据已保存到本地");
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Edit: Update Local -> Push to API (Upsert)
  const handleEditSave = async (updates: Partial<Product>) => {
    let updatedProducts = [...products];
    let itemsToSync: Product[] = [];

    if (editingProduct) {
        // Single Edit
        const newItem = { ...editingProduct, ...updates };
        itemsToSync = [newItem];
        updatedProducts = updatedProducts.map(p => p.id === newItem.id ? newItem : p);
    } else {
        // Batch Edit
        itemsToSync = updatedProducts
            .filter(p => selectedProductIds.has(p.id))
            .map(p => ({ ...p, ...updates }));

        updatedProducts = updatedProducts.map(p => {
            if (selectedProductIds.has(p.id)) {
                return { ...p, ...updates };
            }
            return p;
        });
        setIsSelectionMode(false);
        setSelectedProductIds(new Set());
    }

    // Optimistic Update
    persistLocal(updatedProducts);
    setIsSyncing(true);

    try {
      // API Upsert
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSync)
      });
    } catch (e) {
      console.error("Failed to sync edit", e);
      alert("网络同步失败，数据已保存到本地");
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Delete: Update Local -> Call DELETE API
  const handleDelete = async (id: string) => {
    persistLocal(products.filter(p => p.id !== id));
    
    // Sync
    try {
        await fetch(`${API_BASE_URL}?id=${id}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
  };

  // 5. Batch Delete
  const handleBatchDelete = async () => {
    if (!confirm('确认删除选中项目?')) return;
    
    const idsToDelete = Array.from(selectedProductIds);
    persistLocal(products.filter(p => !selectedProductIds.has(p.id)));
    setIsSelectionMode(false);
    setSelectedProductIds(new Set());

    // Sync
    try {
      await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
    } catch(e) { console.error(e); }
  };

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !query || 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.type.toLowerCase().includes(query.toLowerCase()) ||
        p.role.toLowerCase().includes(query.toLowerCase());
      const matchInd = !selectedIndustry || p.industry === selectedIndustry;
      const matchLoc = !selectedLocation || p.location.includes(selectedLocation);
      return matchSearch && matchInd && matchLoc;
    });
  }, [products, query, selectedIndustry, selectedLocation]);

  const uniqueIndustries = Array.from(new Set(products.map(p => p.industry))).sort();
  const uniqueLocations = Array.from(new Set(products.map(p => p.location))).sort();

  // --- AI Logic ---
  const handleAiMatch = () => {
    setQuery(majorInput || schoolInput);
    if (majorInput) {
        for (const [k, v] of Object.entries(MAJOR_MAP)) {
            if (majorInput.includes(k)) setSelectedIndustry(v.industry);
        }
    }
    setIsAiModalOpen(false);
  };

  if (!user) return <LoginView onLogin={handleLogin} error={authError} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <Globe className="text-blue-600" size={20} />
            <span>全球背景提升资源匹配中心</span>
            {isLoading && <Loader2 size={16} className="animate-spin text-slate-400 ml-2" />}
            {isSyncing && <RefreshCw size={16} className="animate-spin text-green-500 ml-2" />}
        </div>
        <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">{user.email}</span>
            <button onClick={() => setUser(null)} className="text-slate-400 hover:text-slate-800"><LogOut size={18} /></button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">资源列表</h1>
                <p className="text-slate-500 text-sm">
                    共 {filteredProducts.length} 个项目 
                    {products.length === 0 && !isLoading && " (数据库为空)"}
                </p>
            </div>
            
            <div className="flex gap-2">
                <Button onClick={() => setIsAiModalOpen(true)} variant="secondary">
                    <Sparkles size={16} className="mr-2 text-indigo-500" /> AI 选岗
                </Button>
                
                {user.role === 'admin' && (
                    <>
                        <Button 
                            variant="secondary"
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedProductIds(new Set());
                            }}
                        >
                            <CheckSquare size={16} className="mr-2" /> 
                            {isSelectionMode ? '取消选择' : '批量管理'}
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} className="mr-2" /> 导入
                        </Button>
                    </>
                )}
            </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    placeholder="搜索项目名称、岗位、类型..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <SimpleSelect 
                    icon={Briefcase} 
                    options={uniqueIndustries} 
                    value={selectedIndustry} 
                    onChange={setSelectedIndustry} 
                    placeholder="所有行业" 
                />
                <SimpleSelect 
                    icon={MapPin} 
                    options={uniqueLocations} 
                    value={selectedLocation} 
                    onChange={setSelectedLocation} 
                    placeholder="所有地点" 
                />
                {(query || selectedIndustry || selectedLocation) && (
                    <button 
                        onClick={() => { setQuery(''); setSelectedIndustry(''); setSelectedLocation(''); }}
                        className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                    >
                        重置
                    </button>
                )}
            </div>
        </div>

        {/* Batch Actions */}
        {isSelectionMode && selectedProductIds.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl border border-slate-200 z-50 flex items-center gap-4 animate-bounce-in">
                <span className="font-bold text-slate-700">{selectedProductIds.size} 已选</span>
                <div className="h-4 w-px bg-slate-200" />
                <button 
                    onClick={() => { setEditingProduct(null); setIsEditModalOpen(true); }}
                    className="text-blue-600 font-medium hover:text-blue-800"
                >
                    批量修改
                </button>
                <button 
                    onClick={handleBatchDelete}
                    className="text-red-600 font-medium hover:text-red-800"
                >
                    批量删除
                </button>
            </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    selectionMode={isSelectionMode}
                    isSelected={selectedProductIds.has(p.id)}
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
            
            {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400">
                    <div className="flex justify-center mb-4"><SlidersHorizontal size={48} className="opacity-20" /></div>
                    <p>暂无数据，请尝试调整筛选或导入数据</p>
                    <div className="mt-4">
                        <Button variant="secondary" onClick={() => persistLocal(INITIAL_DATA)}>
                            <RefreshCw size={14} className="mr-2" /> 恢复演示数据
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
      {user.role === 'admin' && (
        <>
            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddProducts} />
            <EditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                product={editingProduct} 
                selectedCount={selectedProductIds.size}
                onSave={handleEditSave}
            />
        </>
      )}

      <ProductDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        product={viewingProduct} 
      />

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">AI 智能选岗</h3>
                    <button onClick={() => setIsAiModalOpen(false)}><XCircle size={24} className="text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">院校</label>
                        <input className="w-full border rounded-lg p-2" value={schoolInput} onChange={e => setSchoolInput(e.target.value)} placeholder="例如: 哈佛大学" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">专业</label>
                        <input className="w-full border rounded-lg p-2" value={majorInput} onChange={e => setMajorInput(e.target.value)} placeholder="例如: 计算机科学" />
                    </div>
                    <Button fullWidth onClick={handleAiMatch} className="mt-4">开始匹配</Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
