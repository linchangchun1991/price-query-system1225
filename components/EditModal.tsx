import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Button } from './Button';
import { X, Save, Layers, AlertCircle } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If product is provided, it's Single Edit mode. If null, it's Batch Edit mode.
  product?: Product | null; 
  selectedCount?: number;
  onSave: (updates: Partial<Product>) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  selectedCount = 0,
  onSave 
}) => {
  const isBatchMode = !product;

  const [formData, setFormData] = useState<Partial<Product>>({});

  // Initialize form data when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Single Edit: Fill with existing data
        setFormData({ ...product });
      } else {
        // Batch Edit: Reset to empty
        setFormData({});
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Product, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Helper to render input fields
  const renderInput = (label: string, field: keyof Product, type: 'text' | 'number' = 'text', placeholder?: string) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
          focus:ring-2 focus:ring-ivy-navy/20 focus:border-ivy-navy outline-none
          ${isBatchMode && !formData[field] ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-300 text-slate-900'}
        `}
        placeholder={placeholder || (isBatchMode ? "不修改 (保持原样)" : "")}
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-white/20">
        
        {/* Header */}
        <div className={`px-8 py-5 border-b flex items-center justify-between ${isBatchMode ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isBatchMode ? 'text-amber-800' : 'text-slate-800'}`}>
              {isBatchMode ? <Layers size={20} /> : <Save size={20} />}
              {isBatchMode ? '批量修改产品信息' : '编辑产品详情'}
            </h2>
            <p className="text-xs mt-1 opacity-70">
              {isBatchMode 
                ? `正在修改 ${selectedCount} 个选中项目。仅需填写您想改变的字段，留空字段将保持原样。` 
                : `ID: ${product?.id} | 上次更新: ${new Date().toLocaleDateString()}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Core Info */}
            <div className="md:col-span-2">
              {renderInput("产品名称", "name", "text", "输入完整的产品名称")}
            </div>
            
            {renderInput("产品类型", "type", "text", "例如: 国内实习, 远程PTA")}
            {renderInput("所属行业", "industry", "text", "例如: 金融, 互联网")}
            
            {renderInput("具体岗位", "role", "text", "例如: 数据分析师, 行业研究员")}
            {renderInput("交付部门", "delivery_dept", "text", "例如: 企拓1部")}
            
            {renderInput("地点", "location", "text", "例如: 远程, 上海-实地")}
            {renderInput("形式", "format", "text", "例如: 走人事, 走项目")}
            
            {renderInput("周期时长", "duration", "text", "例如: 1个月, 4周")}
            <div className="hidden md:block"></div> {/* Spacer */}

            {/* Pricing Section */}
            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
               <div className="md:col-span-2 text-xs font-bold text-slate-400 uppercase">价格配置</div>
               {renderInput("官方指导价 (Standard)", "price_standard", "number")}
               {renderInput("底价/优惠价 (Floor)", "price_floor", "number")}
            </div>

          </div>

          {isBatchMode && (
            <div className="mt-6 flex items-start gap-2 text-amber-600 text-xs bg-amber-50 p-3 rounded-lg border border-amber-100">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <p>注意：批量修改将不可撤销。所有选中的项目将被统一更新为上述填写的值。</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} className="shadow-lg shadow-ivy-navy/10 px-8">
            {isBatchMode ? '确认批量应用' : '保存修改'}
          </Button>
        </div>
      </div>
    </div>
  );
};