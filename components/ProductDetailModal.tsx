import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { GoogleGenAI } from "@google/generative-ai";
import { X, MapPin, Briefcase, Loader2, Quote, Copy, Check, Download, RefreshCw, ImagePlus } from 'lucide-react';
import { Button } from './Button';
import html2canvas from 'html2canvas';
import { getRandomStockImage } from '../constants';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [textLoading, setTextLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref for the modal content to capture
  const modalContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to clean name
  const getCleanName = (name: string) => {
    return name.replace(/^【.*?】/, '').replace(/^\[.*?\]/, '').trim();
  };

  useEffect(() => {
    if (isOpen && product) {
      // Reset states
      setAiDescription(null);
      setCopied(false);
      setTextLoading(true);
      
      // 1. INSTANT IMAGE LOADING (No API waiting)
      loadInstantImage(product);

      // 2. Text Generation (Async)
      generateDescription(product);
    }
  }, [isOpen, product]);

  const loadInstantImage = (p: Product) => {
    setImageLoading(true);
    // Directly pull a high-quality stock image
    const instantUrl = getRandomStockImage(p.industry);
    setImageUrl(instantUrl);
    // imageLoading will be set to false by the <img onLoad> handler
  };

  const generateDescription = async (p: Product) => {
    setTextLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const isPTA = p.type.includes('PTA') || p.name.includes('PTA');
      const deliverablesText = isPTA 
        ? "项目证明、留学/求职背调、申学链接5封"
        : "实习证明、留学生/求职背调，申学链接5封";

      // Use 'gemini-flash-lite-latest' for fastest possible text gen
      const textPrompt = `Role: ${p.role}. Industry: ${p.industry}.
      Write a JD in Chinese. Plain text.
      【核心职责】
      - 2 professional bullet points.
      【能力提升】
      - 2 professional bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: textPrompt
      });
      
      let generatedText = response.text || "";
      generatedText = generatedText.replace(/\*\*/g, '').replace(/##/g, '').trim();
      const finalText = `${generatedText}\n\n【核心交付物】\n- ${deliverablesText}`;
      
      setAiDescription(finalText);
    } catch (error) {
      console.error("Gemini Text Gen failed:", error);
      setAiDescription("内容生成超时，请手动编辑。");
    } finally {
      setTextLoading(false);
    }
  };

  const handleCopy = () => {
    if (aiDescription && product) {
      const cleanName = getCleanName(product.name);
      const textToCopy = `【${cleanName}】\n岗位：${product.role}\n价格：${product.price_floor}\n\n${aiDescription}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPoster = async () => {
    if (!modalContentRef.current || !product) return;
    setIsExporting(true);

    try {
        const cleanName = getCleanName(product.name);
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(modalContentRef.current, {
            useCORS: true, 
            allowTaint: true,
            scale: 2, 
            backgroundColor: '#ffffff',
            logging: false,
            ignoreElements: (element) => {
               return element.hasAttribute('data-html2canvas-ignore');
            }
        });

        const link = document.createElement('a');
        link.download = `${cleanName}_Poster.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    } catch (err) {
        console.error("Poster generation failed", err);
        alert("海报生成失败，请重试");
    } finally {
        setIsExporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageUrl(reader.result as string);
              setImageLoading(false); 
          };
          reader.readAsDataURL(file);
      }
  };

  if (!isOpen || !product) return null;

  const cleanName = getCleanName(product.name);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-slate-900/90 backdrop-blur-md transition-all animate-in fade-in duration-300">
      
      {/* Container for Capture */}
      <div 
        ref={modalContentRef}
        className="relative w-full max-w-6xl h-full md:h-[90vh] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* Close Button (Ignored in Screenshot) */}
        <button 
            onClick={onClose}
            data-html2canvas-ignore="true"
            className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all"
        >
            <X size={24} />
        </button>

        {/* Left: Poster / Visuals */}
        <div className="w-full md:w-5/12 lg:w-1/2 relative bg-slate-900 flex flex-col justify-end min-h-[300px] md:min-h-full overflow-hidden group">
           
           {/* Background Image */}
           <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
              {/* The Image Element */}
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  crossOrigin="anonymous" 
                  alt="Office Context" 
                  className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoading ? 'opacity-0' : 'opacity-90'} group-hover:scale-105 transition-transform duration-1000`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              )}
              
              {/* Loading State Overlay */}
              {imageLoading && (
                 <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-white/40 flex flex-col items-center gap-2">
                      <Loader2 size={32} className="animate-spin" />
                      <span className="text-xs font-medium tracking-wider uppercase">匹配行业场景...</span>
                    </div>
                 </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent mix-blend-multiply pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
           </div>
           
           {/* Image Actions (Ignored in Screenshot) */}
           <div className="absolute top-4 left-4 z-50 flex gap-2" data-html2canvas-ignore="true">
               <button 
                 onClick={() => loadInstantImage(product)} 
                 className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur text-white rounded-lg transition-all"
                 title="换一张 (随机匹配)"
               >
                 <RefreshCw size={18} className={imageLoading ? 'animate-spin' : ''} />
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur text-white rounded-lg transition-all"
                 title="上传自定义图片"
               >
                 <ImagePlus size={18} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageUpload} 
               />
           </div>

           {/* Poster Content Overlay */}
           <div className="relative z-10 p-8 md:p-12 text-white">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight text-shadow-lg break-words">
                  {cleanName}
                </h1>
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-slate-200 font-light border-r border-slate-500 pr-3">
                    {product.role}
                  </span>
                  <span className="text-xl font-bold text-yellow-400">
                     {formatPrice(product.price_floor)}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
                 <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/5">
                   <Briefcase size={16} className="text-indigo-300" /> {product.industry}
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/5">
                   <MapPin size={16} className="text-indigo-300" /> {product.location}
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Content & JD */}
        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col bg-white h-full overflow-hidden">
           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">Project Overview</h2>
                    <div className="text-3xl font-bold text-slate-900 mt-1">项目实训大纲</div>
                 </div>
                 <div className="text-right hidden md:block">
                     <div className="text-xs text-slate-400">官方指导价</div>
                     <div className="text-lg text-slate-400 line-through decoration-slate-300">{formatPrice(product.price_standard)}</div>
                 </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-1">项目形式</div>
                   <div className="text-slate-900 font-semibold">{product.format}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-1">项目时长</div>
                   <div className="text-slate-900 font-semibold">{product.duration}</div>
                </div>
              </div>

              {/* Editable AI Text Content */}
              <div className="relative min-h-[200px] group/text">
                 {textLoading ? (
                    <div className="space-y-6 py-4">
                       <div className="flex items-center gap-3 text-indigo-600">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="font-medium text-sm">AI 正在极速撰写 JD...</span>
                       </div>
                       <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                          <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                          <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse" />
                       </div>
                    </div>
                 ) : (
                    <div className="relative animate-in slide-in-from-bottom-2 duration-500">
                       <div className="absolute -top-2 -left-2 text-slate-100 -z-10 pointer-events-none">
                          <Quote size={80} />
                       </div>
                       {/* Textarea for Editing */}
                       <textarea
                         value={aiDescription || ''}
                         onChange={(e) => setAiDescription(e.target.value)}
                         className="w-full h-[400px] resize-none bg-transparent border-0 focus:ring-0 p-0 text-slate-700 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line focus:bg-slate-50/50 rounded-lg transition-colors custom-scrollbar"
                         placeholder="可以在这里直接修改 AI 生成的文案..."
                       />
                       <div className="absolute top-0 right-0 opacity-0 group-hover/text:opacity-100 transition-opacity text-xs text-slate-300 pointer-events-none">
                          点击文字即可编辑
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* Footer Actions (Ignored in Screenshot) */}
           <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-3" data-html2canvas-ignore="true">
               <Button 
                 variant="secondary" 
                 className="bg-white"
                 onClick={handleDownloadPoster}
                 disabled={isExporting || imageLoading}
               >
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                  <span className="ml-2 hidden md:inline">保存海报</span>
               </Button>
               
               <Button 
                  variant="primary" 
                  disabled={textLoading} 
                  onClick={handleCopy}
                  className={`flex-[2] py-3 text-base shadow-xl transition-all ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
               >
                  {copied ? (
                    <>
                      <Check size={18} className="mr-2" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="mr-2" /> 复制文案
                    </>
                  )}
               </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
