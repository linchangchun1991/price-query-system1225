import React from 'react';
import { Product } from '../types';
import { MapPin, Clock, Briefcase, Sparkles, User, MonitorSmartphone, Trash2, Check, Copy, Pencil } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isRecommended?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (product: Product) => void;
  // Batch Selection Props
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isRecommended = false, 
  onDelete,
  onEdit,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const [copied, setCopied] = React.useState(false);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(price);
  };

  // Calculate discount percentage
  const discount = Math.round(((product.price_standard - product.price_floor) / product.price_standard) * 100);
  const hasDiscount = discount > 0;

  // Handle Copy
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `【项目推荐】${product.name}\n行业：${product.industry}\n地点：${product.location}\n形式：${product.format}\n周期：${product.duration}\n优惠价：${product.price_floor}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => selectionMode && onToggleSelect && onToggleSelect(product.id)}
      className={`
      relative group flex flex-col justify-between
      bg-white transition-all duration-300
      ${isRecommended 
        ? 'ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/5 z-10' 
        : 'border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/50'
      }
      ${isSelected ? 'ring-2 ring-ivy-navy bg-slate-50' : ''}
      rounded-xl overflow-hidden cursor-pointer
    `}>
      
      {/* Batch Selection Overlay */}
      {selectionMode && (
        <div className="absolute top-3 left-3 z-30">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-ivy-navy border-ivy-navy' : 'bg-white border-slate-300'}`}>
            {isSelected && <Check size={12} className="text-white" />}
          </div>
        </div>
      )}

      {/* Admin Actions (Delete & Edit) - Only show if NOT in selection mode */}
      {!selectionMode && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
           {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-ivy-navy hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 shadow-sm"
              title="编辑产品"
            >
              <Pencil size={16} />
            </button>
           )}
           {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if(confirm(`确定要删除产品 "${product.name}" 吗？`)) {
                  onDelete(product.id);
                }
              }}
              className="p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 shadow-sm"
              title="删除产品"
            >
              <Trash2 size={16} />
            </button>
           )}
        </div>
      )}

      {/* UX: Copy Button (Show only when not admin mode or specialized) */}
      {!selectionMode && !onEdit && !onDelete && (
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 z-20 p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          title="复制项目信息"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
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
        {/* Header: Tags */}
        <div className={`flex items-start justify-between mb-3 ${selectionMode ? 'pl-6' : ''} ${!selectionMode && (onEdit || onDelete) ? 'pr-16' : ''}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`
              text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border
              ${product.type.includes("VIP") 
                ? "bg-amber-50 text-amber-700 border-amber-100" 
                : "bg-blue-50 text-blue-700 border-blue-100"}
            `}>
              {product.type}
            </span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
               {product.industry}
            </span>
          </div>
          {hasDiscount && (
             <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shrink-0">
               -{discount}%
             </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-3 group-hover:text-indigo-700 transition-colors line-clamp-2 min-h-[42px]" title={product.name}>
          {product.name}
        </h3>
        
        {/* Key Features Highlighting (UX Improvement) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`
             flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border
             ${product.location.includes("远程") 
               ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
               : "bg-orange-50 text-orange-700 border-orange-100"}
          `}>
             <MapPin size={12} />
             {product.location}
          </div>
          
          <div className={`
             flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200
          `}>
             <MonitorSmartphone size={12} />
             {product.format}
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="grid grid-cols-1 gap-y-1.5 text-xs text-slate-500 mb-4 px-1">
           <div className="flex items-center gap-2">
             <User size={12} className="text-slate-400 shrink-0" />
             <span className="truncate" title={product.role}>岗位：<span className="text-slate-700">{product.role}</span></span>
           </div>
           <div className="flex items-center gap-2">
             <Clock size={12} className="text-slate-400 shrink-0" />
             <span className="truncate">周期：{product.duration}</span>
           </div>
           <div className="flex items-center gap-2">
             <Briefcase size={12} className="text-slate-400 shrink-0" />
             <span className="truncate">交付：{product.delivery_dept}</span>
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
                <span>优惠后</span>
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