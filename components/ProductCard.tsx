import React from 'react';
import { Product } from '../types';
import { Sparkles, Check, Pencil, Trash2, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isRecommended?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (product: Product) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isRecommended = false, 
  onDelete,
  onEdit,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onClick
}) => {
  
  // Format currency with no decimals for cleaner look
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(price);
  };

  const discount = Math.round(((product.price_standard - product.price_floor) / product.price_standard) * 100);
  const hasDiscount = discount > 0;

  const handleClick = (e: React.MouseEvent) => {
    // Priority 1: Selection Mode
    if (selectionMode && onToggleSelect) {
      onToggleSelect(product.id);
      return;
    }
    
    // Priority 2: Standard Click (Open Detail)
    // Fix: Removed the restriction (!onEdit && !onDelete) so admins can also view details
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`
      relative group flex flex-col justify-between
      bg-white transition-all duration-300
      ${isRecommended 
        ? 'ring-2 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10' 
        : 'border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1'
      }
      ${isSelected ? 'ring-2 ring-ivy-navy bg-slate-50' : ''}
      rounded-2xl overflow-hidden cursor-pointer h-full min-h-[320px]
    `}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:from-indigo-50 transition-colors" />

      {/* Batch Selection Overlay */}
      {selectionMode && (
        <div className="absolute top-4 left-4 z-30">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-ivy-navy border-ivy-navy' : 'bg-white border-slate-200'}`}>
            {isSelected && <Check size={14} className="text-white" />}
          </div>
        </div>
      )}

      {/* Admin Actions - Improved Visibility & Hit Area */}
      {!selectionMode && (onEdit || onDelete) && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 opacity-100 transition-all bg-white/90 backdrop-blur rounded-lg p-1.5 shadow-sm border border-slate-100">
           {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-2 hover:bg-slate-100 rounded-md text-slate-400 hover:text-ivy-navy transition-colors"
              title="编辑项目"
            >
              <Pencil size={16} />
            </button>
           )}
           {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); if(confirm('确认删除该项目?')) onDelete(product.id); }}
              className="p-2 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition-colors"
              title="删除项目"
            >
              <Trash2 size={16} />
            </button>
           )}
        </div>
      )}

      {/* AI Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
      )}
      
      <div className="p-6 md:p-7 flex flex-col h-full z-10 relative">
        
        {/* Top: Metadata Tags (Subtle) */}
        <div className="flex items-center gap-2 mb-6">
           <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md">
             {product.type}
           </span>
           {isRecommended && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
               <Sparkles size={10} /> AI 精选
             </span>
           )}
        </div>
        
        {/* Main Content: HUGE Name & Role */}
        <div className="mb-auto">
          <h3 className="text-2xl font-black text-slate-900 leading-[1.1] mb-3 group-hover:text-ivy-navy transition-colors line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          
          <div className="inline-block bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 mb-2">
            <span className="text-sm font-bold text-slate-700 block truncate max-w-[200px]" title={product.role}>
               {product.role}
            </span>
          </div>
          
          <div className="text-xs text-slate-400 font-medium mt-1 pl-1">
             {product.location} · {product.duration}
          </div>
        </div>

        {/* Bottom: Pricing (Maximized) */}
        <div className="mt-8 pt-6 border-t border-slate-50 group-hover:border-slate-100 transition-colors">
           <div className="flex items-end justify-between">
              <div>
                 {hasDiscount && (
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 line-through decoration-slate-300">
                        {formatPrice(product.price_standard)}
                      </span>
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 rounded">
                        -{discount}%
                      </span>
                   </div>
                 )}
                 <div className="text-3xl font-black text-ivy-red tracking-tight leading-none">
                   {formatPrice(product.price_floor)}
                 </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-ivy-navy group-hover:text-white transition-all duration-300 shadow-sm">
                 <ArrowRight size={18} />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
