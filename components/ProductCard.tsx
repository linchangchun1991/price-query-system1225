import React from 'react';
import { Product } from '../types';
import { MapPin, Clock, Briefcase, LayoutTemplate, Sparkles, User, MonitorSmartphone, TrendingDown, Hash, Building2, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isRecommended?: boolean;
  onDelete?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isRecommended = false, onDelete }) => {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(price);
  };

  // Calculate discount percentage
  const discount = Math.round(((product.price_standard - product.price_floor) / product.price_standard) * 100);
  const hasDiscount = discount > 0;

  return (
    <div className={`
      relative group flex flex-col justify-between
      bg-white transition-all duration-300
      ${isRecommended 
        ? 'ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/5 z-10' 
        : 'border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/50'
      }
      rounded-xl overflow-hidden
    `}>
      {/* Admin Delete Action */}
      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if(confirm(`确定要删除产品 "${product.name}" (ID: ${product.id}) 吗？`)) {
              onDelete(product.id);
            }
          }}
          className="absolute top-2 right-2 z-20 p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          title="删除产品"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* AI Recommendation Banner */}
      {isRecommended && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1.5">
          <Sparkles size={10} className="fill-white/20" />
          AI 智能精选
        </div>
      )}
      
      <div className="p-5 flex flex-col h-full">
        {/* Header: ID and Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1">
              <Hash size={9} /> {product.id}
            </span>
            <span className={`
              text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border
              ${product.type.includes("VIP") 
                ? "bg-amber-50 text-amber-700 border-amber-100" 
                : "bg-blue-50 text-blue-700 border-blue-100"}
            `}>
              {product.type}
            </span>
          </div>
          {hasDiscount && (
             <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
               -{discount}%
             </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-3 group-hover:text-indigo-700 transition-colors line-clamp-2 min-h-[42px]" title={product.name}>
          {product.name}
        </h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
           <Badge icon={<Building2 size={10} />} text={product.industry} />
           <Badge icon={<LayoutTemplate size={10} />} text={product.delivery_dept} />
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-slate-500 bg-slate-50/80 rounded-lg p-2.5 mb-4 border border-slate-100">
           <div className="flex items-center gap-1.5 col-span-2">
             <User size={12} className="text-slate-400" />
             <span className="truncate font-medium text-slate-700" title={product.role}>{product.role}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <MapPin size={12} className="text-slate-400" />
             <span className="truncate" title={product.location}>{product.location}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <MonitorSmartphone size={12} className="text-slate-400" />
             <span className="truncate">{product.format}</span>
           </div>
           <div className="flex items-center gap-1.5 col-span-2 pt-1 mt-1 border-t border-slate-200/50">
             <Clock size={12} className="text-slate-400" />
             <span className="truncate">周期: {product.duration}</span>
           </div>
        </div>

        {/* Pricing Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400">官方指导价</span>
             <span className="text-xs text-slate-400 line-through decoration-slate-300">
                {formatPrice(product.price_standard)}
             </span>
           </div>
           <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-[10px] text-ivy-red font-medium mb-0.5">
                <span>底价</span>
             </div>
             <div className="text-lg font-bold text-slate-900 font-mono tracking-tight leading-none group-hover:text-ivy-red transition-colors">
               {formatPrice(product.price_floor)}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper sub-component
const Badge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200 max-w-full truncate">
    <span className="shrink-0 opacity-60">{icon}</span>
    <span className="truncate">{text}</span>
  </span>
);