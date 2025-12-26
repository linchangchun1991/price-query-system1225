import { Product } from './types';

// 修改为相对路径，自动指向同域名的 /api/products
// Cloudflare Pages Functions 会自动接管 /api 路由
export const API_BASE_URL = "/api/products"; 

// Domain restriction configuration
export const ALLOWED_DOMAIN = "@highmark.com.cn";

// Keywords for "AI" recommendation simulation
export const INDUSTRY_KEYWORDS: Record<string, string> = {
  "finance": "金融",
  "bank": "金融",
  "investment": "金融",
  "tech": "互联网",
  "code": "互联网",
  "software": "互联网",
  "consulting": "咨询",
  "mbb": "咨询",
  "vip": "归国求职",
  "offer": "归国求职"
};

// AI Matching Logic: Major to Keywords/Industry
export const MAJOR_MAP: Record<string, { industry: string; keywords: string[] }> = {
  "cs": { industry: "互联网", keywords: ["科技", "数据", "开发"] },
  "computer": { industry: "互联网", keywords: ["科技", "数据", "开发"] },
  "计算机": { industry: "互联网", keywords: ["科技", "数据", "开发"] },
  "软件": { industry: "互联网", keywords: ["科技", "数据", "开发"] },
  
  "finance": { industry: "金融", keywords: ["投行", "证券", "分析"] },
  "金融": { industry: "金融", keywords: ["投行", "证券", "分析"] },
  "经济": { industry: "金融", keywords: ["投行", "证券", "咨询"] },
  "economics": { industry: "金融", keywords: ["投行", "证券", "咨询"] },
  
  "accounting": { industry: "咨询", keywords: ["审计", "财务", "四大"] },
  "会计": { industry: "咨询", keywords: ["审计", "财务", "四大"] },
  
  "marketing": { industry: "通用", keywords: ["市场", "运营", "快消"] },
  "市场": { industry: "通用", keywords: ["市场", "运营", "快消"] },
  
  "management": { industry: "咨询", keywords: ["管理", "咨询"] },
  "管理": { industry: "咨询", keywords: ["管理", "咨询"] },
};

// Simple keyword matching for school tier simulation
export const TARGET_SCHOOL_KEYWORDS = ["harvard", "yale", "oxford", "cambridge", "mit", "stanford", "columbia", "清华", "北大", "复旦", "交大", "ucl", "ic", "nus"];

// Initial seed data provided in requirements (Will only be used as fallback or initial seed if DB is empty)
export const INITIAL_DATA: Product[] = [
  {
    "id": "052",
    "type": "国内实习实训",
    "name": "【企拓2部】华泰联合-深圳",
    "industry": "券商投行",
    "role": "华泰联合-深圳",
    "location": "实地-深圳",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 29800,
    "delivery_dept": "企拓2部"
  },
  // ... (保留部分作为本地兜底，但主要依赖 API)
];