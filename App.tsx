import React, { useState, useMemo } from 'react';
import { User, Product } from './types';
import { INITIAL_DATA, ALLOWED_DOMAIN, INDUSTRY_KEYWORDS, MAJOR_MAP, TARGET_SCHOOL_KEYWORDS } from './constants';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { AdminModal } from './components/AdminModal';
import { 
  Search, ShieldCheck, Sparkles, LogOut, Plus, Globe2, UserCircle, 
  Filter, XCircle, GraduationCap, ChevronDown, MapPin, Briefcase, 
  School, Building, LayoutTemplate, SlidersHorizontal, BarChart3, Settings 
} from 'lucide-react';

// Admin Email Constant
const ADMIN_EMAIL = "liuqian@highmark.com.cn";

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

// --- Custom Select Component for "Pro" feel ---
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
  <div className="relative min-w-[160px] group">
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

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_DATA);
  
  // Search & Filter State
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>(''); // Delivery Dept Filter
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
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
      setUser({ email, role: 'viewer' }); // Regular employees are viewers
      setAuthError(null);
    } else {
      setAuthError(`访问被拒绝。请使用公司后缀 (${ALLOWED_DOMAIN}) 的邮箱。`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetAllFilters();
  };

  // --- Data Management Logic ---
  const handleAddProducts = (newItems: Product[]) => {
    setProducts(prev => [...newItems, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
    
    // Extract Filters unique values from current dataset
    const industries = Array.from(new Set(products.map(p => p.industry))).filter(Boolean).sort();
    const locations = Array.from(new Set(products.map(p => p.location))).filter(Boolean).sort();
    const depts = Array.from(new Set(products.map(p => p.delivery_dept))).filter(Boolean).sort();

    // Filter Logic
    let filtered = products.filter(p => {
      // 1. Universal Search (Case insensitive, checks everything)
      const matchesSearch = !lowerQuery ? true : (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.industry.toLowerCase().includes(lowerQuery) ||
        p.role.toLowerCase().includes(lowerQuery) ||
        p.type.toLowerCase().includes(lowerQuery) ||
        p.format.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery) ||
        p.delivery_dept.toLowerCase().includes(lowerQuery) ||
        p.id.toLowerCase().includes(lowerQuery)
      );
      
      // 2. Specific Filters
      const matchesIndustry = selectedIndustry ? p.industry === selectedIndustry : true;
      const matchesLocation = selectedLocation ? p.location.includes(selectedLocation) : true;
      const matchesDept = selectedDept ? p.delivery_dept === selectedDept : true;

      return matchesSearch && matchesIndustry && matchesLocation && matchesDept;
    });

    // 3. AI Recommendation Logic
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

  if (!user) return <LoginView onLogin={handleLogin} error={authError} />;

  const activeFiltersCount = [selectedIndustry, selectedLocation, selectedDept, query, aiReason].filter(Boolean).length;
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
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
               <p className="text-slate-500">实时掌握全球实习、科研及背景提升项目的价格与库存动态</p>
             </div>
             <div className="flex items-center gap-3">
               <Button onClick={() => setIsAiModalOpen(true)} variant="glass" className="shadow-sm">
                 <Sparkles size={16} className="mr-2 text-indigo-600" /> AI 选岗助手
               </Button>
               {isAdmin && (
                 <Button onClick={() => setIsModalOpen(true)} className="pl-3 pr-4 shadow-lg shadow-ivy-navy/20">
                   <Plus size={18} className="mr-1" /> 导入数据
                 </Button>
               )}
             </div>
          </div>

          {/* SaaS Style Filter Toolbar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-2">
             {/* Search */}
             <div className="relative flex-1 min-w-[300px]">
               <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                 <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input
                 type="text"
                 className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-ivy-navy/10 focus:bg-white transition-all"
                 placeholder="搜索产品名称、ID、地点或关键词..."
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
        </div>

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

        {/* Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
               <Sparkles size={12} className="text-indigo-500" /> AI 智能推荐 (根据当前搜索意图)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {aiRecommendations.map(product => (
                <ProductCard key={`ai-${product.id}`} product={product} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        {/* Results Stats */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <span className="text-sm font-semibold text-slate-700">共找到 {filteredProducts.length} 个项目</span>
             <span className="w-1 h-1 rounded-full bg-slate-300" />
             <span className="text-xs text-slate-500">数据实时同步中</span>
           </div>
           
           {/* Simple average price stat for "Pro" feel */}
           {filteredProducts.length > 0 && (
             <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
               <BarChart3 size={14} />
               <span>当前列表均价: {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(filteredProducts.reduce((acc, curr) => acc + curr.price_floor, 0) / filteredProducts.length)}</span>
             </div>
           )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={isAdmin ? handleDeleteProduct : undefined}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4 border border-slate-100">
                 <SlidersHorizontal className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">未找到相关资源</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                请尝试调整搜索关键词或筛选条件
              </p>
              <Button variant="secondary" onClick={resetAllFilters} className="mt-6">
                清除所有筛选
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Admin Modal */}
      {isAdmin && (
        <AdminModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddProducts} 
        />
      )}

      {/* AI Match Modal */}
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