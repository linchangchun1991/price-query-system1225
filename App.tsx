import React, { useState, useMemo, useEffect } from 'react';
import { User, Product } from './types';
import { ALLOWED_DOMAIN, INDUSTRY_KEYWORDS, MAJOR_MAP, TARGET_SCHOOL_KEYWORDS, API_BASE_URL, INITIAL_DATA } from './constants';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { AdminModal } from './components/AdminModal';
import { EditModal } from './components/EditModal';
import { 
  Search, ShieldCheck, Sparkles, LogOut, Plus, Globe2, UserCircle, 
  XCircle, GraduationCap, ChevronDown, MapPin, Briefcase, 
  LayoutTemplate, SlidersHorizontal, BarChart3, Settings,
  CheckSquare, Trash2, Tag, Loader2, RefreshCw, WifiOff, Cloud, School, Pencil
} from 'lucide-react';

// Admin Email Constant
const ADMIN_EMAIL = "liuqian@highmark.com.cn";
const LOCAL_STORAGE_KEY = "pricepulse_products";

// --- Login View Component ---
const LoginView: React.FC<{ onLogin: (email: string) => void, error: string | null }> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#0F172A] skew-y-[-2deg] origin-top-left -translate-y-20 -z-10" />
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10 pt-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-ivy-navy rounded-2xl flex items-center justify-center shadow-lg shadow-ivy-navy/30 text-white">
              <Globe2 size={32} />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">全球背景提升资源中心</h1>
            <p className="text-slate-500 text-sm mt-2">Global Resource Center</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">
                企业邮箱验证
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                   <UserCircle size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ivy-navy focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="请输入公司内部邮箱登录"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2 border border-red-100">
                <ShieldCheck size={14} />
                <span>{error}</span>
              </div>
            )}

            <Button fullWidth type="submit" size="lg" className="shadow-xl shadow-indigo-900/10">
              安全进入系统
            </Button>
          </form>
        </div>
        <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">仅限内部员工访问 • Secure Connection</p>
        </div>
      </div>
    </div>
  );
};

// --- Custom Select Component ---
const ProSelect = ({ 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  icon: any, 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  placeholder: string 
}) => (
  <div className="relative min-w-[140px] group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-ivy-navy transition-colors">
       <Icon size={16} />
    </div>
    <select 
       value={value}
       onChange={(e) => onChange(e.target.value)}
       className="w-full pl-10 pr-8 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-ivy-navy/20 focus:border-ivy-navy appearance-none cursor-pointer transition-all shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
      <ChevronDown size={14} strokeWidth={2.5} />
    </div>
  </div>
);

// --- Quick Filter Chip Component ---
const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
      active 
        ? 'bg-ivy-navy text-white border-ivy-navy shadow-md shadow-ivy-navy/20' 
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'cloud' | 'local'>('cloud');
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Search & Filter State
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  
  // Admin Batch Action State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // Import
  const [isAiModalOpen, setIsAiModalOpen] = useState(false); // AI
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Null = Batch Edit

  // AI Matching State
  const [schoolInput, setSchoolInput] = useState('');
  const [majorInput, setMajorInput] = useState('');
  const [aiReason, setAiReason] = useState<string | null>(null);

  // --- Auth Logic ---
  const handleLogin = (email: string) => {
    if (email.trim() === ADMIN_EMAIL) {
      setUser({ email, role: 'admin' });
      setAuthError(null);
    } else if (email.endsWith(ALLOWED_DOMAIN)) {
      setUser({ email, role: 'viewer' });
      setAuthError(null);
    } else {
      setAuthError(`访问被拒绝。请使用公司后缀 (${ALLOWED_DOMAIN}) 的邮箱。`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetAllFilters();
    setIsSelectionMode(false);
    setSelectedProductIds(new Set());
  };

  // --- API Integration Logic (Hybrid Mode) ---
  
  // Helper: Save to LocalStorage
  const saveToLocal = (data: Product[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // 1. Fetch Data
  const fetchProducts = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      // 尝试连接 API
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('API Offline');
      const data = await response.json();
      
      setProducts(data);
      saveToLocal(data); // Sync cloud to local backup
      setConnectionStatus('cloud');
    } catch (err) {
      console.warn("Cloud connection failed, falling back to local.", err);
      setConnectionStatus('local');
      
      // Fallback: LocalStorage -> Initial Data
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        setProducts(JSON.parse(localData));
      } else {
        setProducts(INITIAL_DATA);
        saveToLocal(INITIAL_DATA);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Helper for syncing changes
  const syncProductsToCloud = async (productsToSync: Product[]) => {
     try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productsToSync)
      });
      if (!response.ok) throw new Error('Cloud sync failed');
    } catch (err) {
      console.warn("Sync failed, data saved locally.", err);
      setDataError('云端同步失败，操作已在本地生效。');
    }
  };

  // 2. Add Products
  const handleAddProducts = async (newItems: Product[]) => {
    const updatedProducts = [...newItems, ...products];
    setProducts(updatedProducts);
    saveToLocal(updatedProducts);
    await syncProductsToCloud(newItems);
  };

  // 3. Edit Product (Single & Batch)
  const handleEditSave = async (updates: Partial<Product>) => {
    let updatedList = [...products];
    let itemsToSync: Product[] = [];

    if (editingProduct) {
      // Single Edit
      updatedList = updatedList.map(p => {
         if (p.id === editingProduct.id) {
           const newItem = { ...p, ...updates };
           itemsToSync.push(newItem);
           return newItem;
         }
         return p;
      });
    } else {
      // Batch Edit
      updatedList = updatedList.map(p => {
        if (selectedProductIds.has(p.id)) {
           // Only apply non-empty/non-undefined updates
           const newItem = { ...p };
           (Object.keys(updates) as Array<keyof Product>).forEach(key => {
             const val = updates[key];
             if (val !== undefined && val !== "" && val !== 0) {
               // @ts-ignore
               newItem[key] = val;
             }
           });
           itemsToSync.push(newItem);
           return newItem;
        }
        return p;
      });
      
      // Clear selection after batch edit
      setSelectedProductIds(new Set());
      setIsSelectionMode(false);
    }

    setProducts(updatedList);
    saveToLocal(updatedList);
    await syncProductsToCloud(itemsToSync);
  };

  // 4. Single Delete
  const handleDeleteProduct = async (id: string) => {
    // Optimistic update
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveToLocal(updatedProducts);

    if (selectedProductIds.has(id)) {
      const newSet = new Set(selectedProductIds);
      newSet.delete(id);
      setSelectedProductIds(newSet);
    }

    try {
      const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
    } catch (err) {
      console.warn("Delete sync failed, processed locally.");
    }
  };

  // 5. Batch Delete
  const handleBatchDelete = async () => {
    if (confirm(`确定要删除选中的 ${selectedProductIds.size} 个项目吗？`)) {
      const idsToDelete = Array.from(selectedProductIds);
      
      // Optimistic Update
      const updatedProducts = products.filter(p => !selectedProductIds.has(p.id));
      setProducts(updatedProducts);
      saveToLocal(updatedProducts);

      setSelectedProductIds(new Set());
      setIsSelectionMode(false);

      try {
        const response = await fetch(API_BASE_URL, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsToDelete })
        });
        
        if (!response.ok) throw new Error('Batch delete sync failed');
      } catch (err) {
        console.warn("Batch delete sync failed, processed locally.");
        setDataError('批量删除仅在本地生效，云端同步失败。');
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedProductIds(newSet);
  };

  const handleSelectAll = (currentFilteredProducts: Product[]) => {
    if (selectedProductIds.size === currentFilteredProducts.length && currentFilteredProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(currentFilteredProducts.map(p => p.id)));
    }
  };

  const resetAllFilters = () => {
    setQuery('');
    setSelectedIndustry('');
    setSelectedLocation('');
    setSelectedDept('');
    setAiReason(null);
  }

  // --- Search & Filter Logic ---
  const { 
    filteredProducts, 
    aiRecommendations, 
    availableIndustries, 
    availableLocations,
    availableDepts 
  } = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();
    const searchTokens = lowerQuery.split(/\s+/).filter(token => token.length > 0);
    
    // Extract Filters unique values from current dataset
    const industries = Array.from(new Set(products.map(p => p.industry))).filter(Boolean).sort();
    const locations = Array.from(new Set(products.map(p => p.location))).filter(Boolean).sort();
    const depts = Array.from(new Set(products.map(p => p.delivery_dept))).filter(Boolean).sort();

    // Filter Logic
    let filtered = products.filter(p => {
      const matchesSearch = searchTokens.length === 0 || searchTokens.every(token => 
        p.name.toLowerCase().includes(token) ||
        p.industry.toLowerCase().includes(token) ||
        p.role.toLowerCase().includes(token) ||
        p.type.toLowerCase().includes(token) ||
        p.format.toLowerCase().includes(token) ||
        p.location.toLowerCase().includes(token) ||
        p.delivery_dept.toLowerCase().includes(token) ||
        p.id.toLowerCase().includes(token)
      );
      
      const matchesIndustry = selectedIndustry ? p.industry === selectedIndustry : true;
      const matchesLocation = selectedLocation ? p.location.includes(selectedLocation) : true;
      const matchesDept = selectedDept ? p.delivery_dept === selectedDept : true;

      return matchesSearch && matchesIndustry && matchesLocation && matchesDept;
    });

    // AI Recommendation Logic
    let recs: Product[] = [];
    if (lowerQuery.length > 1) {
      let targetIndustry: string | null = null;
      for (const [key, val] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (lowerQuery.includes(key) || lowerQuery.includes(val)) {
          targetIndustry = val;
          break;
        }
      }

      if (targetIndustry) {
        recs = products
          .filter(p => (p.industry.includes(targetIndustry!) || p.delivery_dept.includes(targetIndustry!)) && !filtered.includes(p)) 
          .sort((a, b) => b.price_standard - a.price_standard) 
          .slice(0, 3);
      }
    }

    return { 
      filteredProducts: filtered, 
      aiRecommendations: recs, 
      availableIndustries: industries,
      availableLocations: locations,
      availableDepts: depts
    };
  }, [products, query, selectedIndustry, selectedLocation, selectedDept]);

  // --- AI Match Logic ---
  const handleAiMatch = () => {
    const major = majorInput.toLowerCase().trim();
    const school = schoolInput.toLowerCase().trim();
    
    if (!major && !school) return;

    resetAllFilters();

    let matchedIndustry = '';
    let isTargetSchool = false;
    let reason = '';

    if (school) {
        isTargetSchool = TARGET_SCHOOL_KEYWORDS.some(k => school.includes(k));
    }

    if (major) {
        for (const [key, config] of Object.entries(MAJOR_MAP)) {
            if (major.includes(key)) {
                matchedIndustry = config.industry;
                break;
            }
        }
    }

    if (matchedIndustry) {
        if (availableIndustries.includes(matchedIndustry)) {
            setSelectedIndustry(matchedIndustry);
        }
        reason += `基于 ${major} 专业背景，系统已自动定位【${matchedIndustry}】行业的核心资源。`;
    } else if (major) {
         setQuery(major);
         reason += `正在为您检索与 “${majorInput}” 高度匹配的项目资源。`;
    }

    if (isTargetSchool) {
        reason += ` 识别到 Target School 名校背景 (${schoolInput})，建议优先推荐高端保 Offer 类旗舰项目。`;
    }

    setAiReason(reason);
    setIsAiModalOpen(false);
  };

  const toggleQueryTag = (tag: string) => {
    if (query.includes(tag)) {
      setQuery(query.replace(tag, '').trim());
    } else {
      setQuery(`${query} ${tag}`.trim());
    }
  };

  if (!user) return <LoginView onLogin={handleLogin} error={authError} />;

  const activeFiltersCount = [selectedIndustry, selectedLocation, selectedDept, query, aiReason].filter(Boolean).length;
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 pb-20">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-ivy-navy text-white p-1.5 rounded-lg">
                <Globe2 size={20} />
             </div>
             <span className="font-bold text-lg text-slate-800 tracking-tight">全球背景提升资源中心</span>
             {isAdmin ? (
               <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                 <Settings size={10} /> 管理员模式
               </span>
             ) : (
               <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">内部系统</span>
             )}
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              connectionStatus === 'cloud' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
               {connectionStatus === 'cloud' ? <Cloud size={12} /> : <WifiOff size={12} />}
               {connectionStatus === 'cloud' ? '云端已连接' : '本地离线模式'}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
               <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
               <span className="text-xs font-medium text-slate-600">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-700 transition-colors" title="退出登录">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Controls */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">资源管理看板</h1>
               <div className="flex items-center gap-2">
                 <p className="text-slate-500">实时掌握全球实习、科研及背景提升项目的价格与库存动态</p>
                 {isLoading && <Loader2 className="animate-spin text-slate-400" size={14} />}
               </div>
             </div>
             <div className="flex items-center gap-3">
               <Button onClick={() => setIsAiModalOpen(true)} variant="glass" className="shadow-sm">
                 <Sparkles size={16} className="mr-2 text-indigo-600" /> AI 选岗助手
               </Button>
               {isAdmin && (
                 <>
                   <Button 
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        setSelectedProductIds(new Set());
                      }} 
                      variant={isSelectionMode ? 'secondary' : 'secondary'}
                      className={`transition-colors ${isSelectionMode ? 'bg-slate-200 border-slate-300' : ''}`}
                   >
                     <CheckSquare size={18} className="mr-2" /> {isSelectionMode ? '退出批量管理' : '批量管理'}
                   </Button>
                   <Button onClick={() => setIsModalOpen(true)} className="pl-3 pr-4 shadow-lg shadow-ivy-navy/20">
                     <Plus size={18} className="mr-1" /> 导入数据
                   </Button>
                 </>
               )}
             </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-2">
             {/* Search */}
             <div className="relative flex-1 min-w-[300px]">
               <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                 <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input
                 type="text"
                 className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-ivy-navy/10 focus:bg-white transition-all"
                 placeholder="支持多关键词搜索，如：上海 金融 PTA..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
               {query && (
                 <button onClick={() => setQuery('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                   <XCircle size={16} fill="currentColor" className="text-slate-200" />
                 </button>
               )}
             </div>
             
             <div className="w-px bg-slate-200 mx-2 hidden xl:block" />

             {/* Select Filters */}
             <div className="flex flex-wrap gap-2 items-center">
               <ProSelect 
                 icon={Briefcase} 
                 placeholder="所有行业" 
                 options={availableIndustries} 
                 value={selectedIndustry} 
                 onChange={setSelectedIndustry} 
               />
               <ProSelect 
                 icon={MapPin} 
                 placeholder="所有地点" 
                 options={availableLocations} 
                 value={selectedLocation} 
                 onChange={setSelectedLocation} 
               />
               <ProSelect 
                 icon={LayoutTemplate} 
                 placeholder="交付部门" 
                 options={availableDepts} 
                 value={selectedDept} 
                 onChange={setSelectedDept} 
               />
               
               {activeFiltersCount > 0 && (
                 <button 
                   onClick={resetAllFilters}
                   className="ml-2 text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                 >
                   重置筛选
                 </button>
               )}
             </div>
          </div>
          
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center px-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1 flex items-center gap-1">
               <Tag size={12} /> 快速筛选:
             </span>
             {['远程', '实地', '走人事', '走项目', 'PTA', '投行'].map(tag => (
               <FilterChip 
                 key={tag} 
                 label={tag} 
                 active={query.includes(tag)} 
                 onClick={() => toggleQueryTag(tag)} 
               />
             ))}
          </div>
        </div>

        {/* Data Error Banner (Enhanced) */}
        {dataError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
            <WifiOff size={20} />
            <div className="flex-1 text-sm font-medium">{dataError}</div>
            <Button variant="secondary" size="sm" onClick={fetchProducts} className="bg-white/80 border-amber-200 text-amber-800 hover:bg-white">
              <RefreshCw size={14} className="mr-2" /> 重试连接
            </Button>
          </div>
        )}

        {/* Admin Batch Actions Bar */}
        {isSelectionMode && isAdmin && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl border border-slate-200 rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5">
             <div className="text-sm font-medium text-slate-700 border-r border-slate-200 pr-4">
               已选中 <span className="font-bold text-ivy-navy">{selectedProductIds.size}</span> 个项目
             </div>
             <button 
               onClick={() => handleSelectAll(filteredProducts)}
               className="text-sm font-medium text-slate-600 hover:text-ivy-navy transition-colors"
             >
               {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? '取消全选' : '全选当前页'}
             </button>
             
             {/* Batch Edit Button */}
             <Button 
               size="sm" 
               variant="secondary" 
               disabled={selectedProductIds.size === 0}
               onClick={() => {
                 setEditingProduct(null); // Set to null for batch mode
                 setIsEditModalOpen(true);
               }}
               className="ml-2 rounded-full px-5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
             >
               <Pencil size={14} className="mr-2" /> 批量修改
             </Button>

             <Button 
               size="sm" 
               variant="danger" 
               disabled={selectedProductIds.size === 0}
               onClick={handleBatchDelete}
               className="ml-2 rounded-full px-5"
             >
               <Trash2 size={14} className="mr-2" /> 批量删除
             </Button>
          </div>
        )}

        {/* AI Insight Panel */}
        {aiReason && (
           <div className="mb-6 animate-in fade-in slide-in-from-top-2">
             <div className="bg-gradient-to-r from-indigo-50/80 to-white border border-indigo-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0">
                   <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-indigo-900 font-bold text-sm mb-0.5">AI 选岗策略分析</h4>
                  <p className="text-indigo-800/80 text-sm">{aiReason}</p>
                </div>
             </div>
           </div>
        )}

        {/* Results Stats */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <span className="text-sm font-semibold text-slate-700">共找到 {filteredProducts.length} 个项目</span>
             <span className="w-1 h-1 rounded-full bg-slate-300" />
             <span className="text-xs text-slate-500">
               {isLoading ? '正在同步数据...' : '数据已就绪'}
             </span>
           </div>
           
           {filteredProducts.length > 0 && (
             <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
               <BarChart3 size={14} />
               <span>列表均价: {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(filteredProducts.reduce((acc, curr) => acc + curr.price_floor, 0) / filteredProducts.length)}</span>
             </div>
           )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-20">
          {isLoading && products.length === 0 ? (
             // Loading Skeleton
             Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
             ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={isAdmin ? handleDeleteProduct : undefined}
                onEdit={isAdmin ? (p) => {
                  setEditingProduct(p);
                  setIsEditModalOpen(true);
                } : undefined}
                selectionMode={isSelectionMode}
                isSelected={selectedProductIds.has(product.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4 border border-slate-100">
                 <SlidersHorizontal className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">未找到相关资源</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                {products.length === 0 && !isLoading ? "数据库暂时为空，请点击右上角导入数据" : "请尝试调整搜索关键词或筛选条件"}
              </p>
              <Button variant="secondary" onClick={resetAllFilters} className="mt-6">
                清除所有筛选
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Admin Modal (Import) */}
      {isAdmin && (
        <AdminModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddProducts} 
        />
      )}
      
      {/* Edit Modal (Single & Batch) */}
      {isAdmin && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={editingProduct}
          selectedCount={selectedProductIds.size}
          onSave={handleEditSave}
        />
      )}

      {/* AI Match Modal (保持不变) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-gradient-to-r from-ivy-navy to-slate-900 p-6 flex justify-between items-start">
                <div className="text-white">
                   <div className="flex items-center gap-2 mb-1">
                     <GraduationCap className="text-indigo-300" size={24} />
                     <h3 className="text-xl font-bold">AI 智能选岗</h3>
                   </div>
                   <p className="text-indigo-200 text-sm">基于大数据的智能资源匹配引擎</p>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-white/60 hover:text-white">
                  <XCircle size={24} />
                </button>
             </div>
             
             <div className="p-8">
               <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">就读院校 (University)</label>
                    <div className="relative group">
                      <School className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-ivy-navy transition-colors" size={18} />
                      <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ivy-navy/20 focus:border-ivy-navy outline-none text-slate-800 transition-all font-medium"
                        placeholder="例如: 哈佛大学, 复旦大学, 纽约大学"
                        value={schoolInput}
                        onChange={(e) => setSchoolInput(e.target.value)}
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">主修专业 (Major)</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-ivy-navy transition-colors" size={18} />
                      <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ivy-navy/20 focus:border-ivy-navy outline-none text-slate-800 transition-all font-medium"
                        placeholder="例如: 计算机科学, 金融学, 市场营销"
                        value={majorInput}
                        onChange={(e) => setMajorInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiMatch()}
                      />
                    </div>
                 </div>
               </div>

               <div className="mt-8 flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>取消</Button>
                 <Button onClick={handleAiMatch} disabled={!majorInput.trim() && !schoolInput.trim()} className="shadow-lg shadow-ivy-navy/20">
                   <Sparkles size={16} className="mr-2" /> 生成匹配方案
                 </Button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}