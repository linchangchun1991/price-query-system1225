import React, { useState } from 'react';
import { Product } from '../types';
import { Button } from './Button';
import { X, Clipboard, CheckCircle, AlertCircle, UploadCloud, FileSpreadsheet } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProducts: Product[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave }) => {
  const [pasteContent, setPasteContent] = useState('');
  const [previewData, setPreviewData] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    try {
      const rows = pasteContent.trim().split('\n');
      const parsed: Product[] = [];
      
      rows.forEach((row, index) => {
        if (!row.trim()) return;

        // Use strict tab splitting for Excel data
        // Excel empty cells come as consecutive tabs
        const cols = row.split('\t').map(c => c.trim());
        
        // Validation: Expecting at least 11 columns
        if (cols.length < 11) {
           console.warn(`Row ${index} skipped: insufficient columns`, cols);
           return;
        }

        const product: Product = {
          id: cols[0] || `new-${Date.now()}-${index}`,
          type: cols[1] || '未知类型',
          name: cols[2] || '未命名产品',
          industry: cols[3] || '通用',
          role: cols[4] || '通用',
          location: cols[5] || '不限',
          format: cols[6] || '不限',
          duration: cols[7] || '不限',
          price_standard: parseFloat(cols[8].replace(/[^0-9.]/g, '')) || 0,
          price_floor: parseFloat(cols[9].replace(/[^0-9.]/g, '')) || 0,
          delivery_dept: cols[10] || '通用部门',
        };
        parsed.push(product);
      });

      if (parsed.length === 0) {
        setError('未能识别有效数据，请检查是否直接从 Excel 复制了包含数据的行。');
      } else {
        setPreviewData(parsed);
        setError(null);
      }
    } catch (err) {
      setError('解析错误，请确保数据格式正确 (Tab 分隔)。');
    }
  };

  const handleSave = () => {
    onSave(previewData);
    setPreviewData([]);
    setPasteContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ivy-navy/60 backdrop-blur-md transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="text-ivy-navy" size={24} />
              批量导入 Excel 数据
            </h2>
            <p className="text-sm text-slate-500 mt-1">支持连续多次上传，数据将追加到当前列表</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto bg-slate-50/50">
          {previewData.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  请在 Excel 中选中以下 11 列数据行 (不含表头) 并直接复制：
                </label>
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 min-w-max">
                    {['ID', '类型', '名称', '行业', '岗位', '地点', '形式', '时长', '标准价', '优惠价', '部门'].map((header, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 font-mono whitespace-nowrap">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                className="w-full h-64 p-5 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-ivy-navy focus:border-ivy-navy resize-none shadow-inner bg-white leading-relaxed whitespace-pre"
                placeholder={`052\t国内实习实训\t【企拓2部】华泰联合-深圳\t券商投行\t华泰联合-深圳\t实地-深圳\t走人事\t1个月\t29800\t29800\t企拓2部\n053\t国内实习实训\t【企拓2部】华泰联合-深圳\t券商投行\t华泰联合-深圳\t实地-深圳\t走人事\t2个月\t29800\t29800\t企拓2部`}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
              />
              
              <Button onClick={handleParse} fullWidth variant="primary" className="gap-2 flex items-center justify-center py-3 shadow-lg shadow-ivy-navy/20">
                <Clipboard size={18} /> 识别剪贴板数据
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                 <CheckCircle size={20} className="shrink-0" />
                 <span className="font-medium">成功解析 {previewData.length} 条数据，请确认无误后导入。</span>
               </div>
               
               <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs whitespace-nowrap">
                     <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                       <tr>
                         <th className="p-3 border-b">ID</th>
                         <th className="p-3 border-b">类型</th>
                         <th className="p-3 border-b">名称</th>
                         <th className="p-3 border-b">行业</th>
                         <th className="p-3 border-b">岗位</th>
                         <th className="p-3 border-b text-right">标准价</th>
                         <th className="p-3 border-b text-right text-red-600">优惠价</th>
                         <th className="p-3 border-b">部门</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {previewData.slice(0, 50).map((p, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="p-3 font-mono text-slate-400">{p.id}</td>
                           <td className="p-3 text-slate-600">{p.type}</td>
                           <td className="p-3 font-medium text-slate-900 max-w-xs truncate" title={p.name}>{p.name}</td>
                           <td className="p-3 text-slate-600">{p.industry}</td>
                           <td className="p-3 text-slate-600">{p.role}</td>
                           <td className="p-3 text-right font-mono">{p.price_standard}</td>
                           <td className="p-3 text-right text-red-600 font-mono font-medium">{p.price_floor}</td>
                           <td className="p-3 text-slate-500">{p.delivery_dept}</td>
                         </tr>
                       ))}
                       {previewData.length > 50 && (
                         <tr>
                           <td colSpan={8} className="p-3 text-center text-slate-400 bg-slate-50">... 还有 {previewData.length - 50} 条数据 ...</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
               
               <div className="flex justify-end">
                  <button onClick={() => setPreviewData([])} className="text-sm text-slate-500 hover:text-slate-800 underline mr-6 transition-colors">清空并重新粘贴</button>
               </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-3 text-red-700 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" /> 
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button disabled={previewData.length === 0} onClick={handleSave} className="shadow-md">
            确认追加导入 {previewData.length > 0 ? `(${previewData.length}条)` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};