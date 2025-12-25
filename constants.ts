import { Product } from './types';

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

// Initial seed data provided in requirements
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
  {
    "id": "054",
    "type": "国内实习实训",
    "name": "【企拓2部】中信-上海",
    "industry": "券商投行",
    "role": "中信-上海",
    "location": "实地-北京",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 25800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "056",
    "type": "国内实习实训",
    "name": "【企拓2部】中金",
    "industry": "券商投行",
    "role": "中金",
    "location": "实地-北京",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 25800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "058",
    "type": "国内实习实训",
    "name": "【企拓2部】JPMorgan",
    "industry": "券商投行",
    "role": "JPMorgan",
    "location": "实地-上海",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 29800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "060",
    "type": "国内实习实训",
    "name": "【企拓2部】西南证券",
    "industry": "券商投行",
    "role": "西南证券",
    "location": "实地-上海",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 25800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "062",
    "type": "国内实习实训",
    "name": "【企拓2部】浙商证券",
    "industry": "券商投行",
    "role": "浙商证券",
    "location": "实地-上海",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 25800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "043",
    "type": "PTA",
    "name": "【项目运营部】华通证券国际（内地）-PTA实习生",
    "industry": "券商投行",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 19800,
    "price_floor": 17800,
    "delivery_dept": "项目运营部"
  },
  {
    "id": "044",
    "type": "PTA",
    "name": "【项目运营部】华通证券国际（内地）-PTA实习生",
    "industry": "券商投行",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走人事",
    "duration": "2个月",
    "price_standard": 23800,
    "price_floor": 21800,
    "delivery_dept": "项目运营部"
  },
  {
    "id": "045",
    "type": "PTA",
    "name": "【项目运营部】华通证券国际（内地）-PTA实习生",
    "industry": "券商投行",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走人事",
    "duration": "3个月",
    "price_standard": 26800,
    "price_floor": 24800,
    "delivery_dept": "项目运营部"
  },
  {
    "id": "046",
    "type": "PTA",
    "name": "【项目运营部】华通证券国际（香港）-PTA实习生",
    "industry": "券商投行",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 19800,
    "price_floor": 17800,
    "delivery_dept": "项目运营部"
  },
  {
    "id": "049",
    "type": "PTA",
    "name": "【项目运营部】华通证券国际（新加坡）-PTA实习生",
    "industry": "券商投行",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 19800,
    "price_floor": 17800,
    "delivery_dept": "项目运营部"
  },
  {
    "id": "001",
    "type": "归国求职服务",
    "name": "【服务部】陪跑服务",
    "industry": "通用",
    "role": "通用",
    "location": "通用",
    "format": "通用",
    "duration": "1个月",
    "price_standard": 2000,
    "price_floor": 2000,
    "delivery_dept": "服务部"
  },
  {
    "id": "003",
    "type": "归国求职服务",
    "name": "【服务部】千里马计划冲刺版",
    "industry": "通用",
    "role": "通用",
    "location": "通用",
    "format": "通用",
    "duration": "6个月",
    "price_standard": 16800,
    "price_floor": 16464,
    "delivery_dept": "服务部"
  },
  {
    "id": "006",
    "type": "归国求职服务",
    "name": "【服务部】千里马计划旗舰版",
    "industry": "通用",
    "role": "通用",
    "location": "通用",
    "format": "通用",
    "duration": "12个月",
    "price_standard": 49800,
    "price_floor": 47310,
    "delivery_dept": "服务部"
  },
  {
    "id": "013",
    "type": "PTA",
    "name": "【项目运营部】麦肯锡-PTA实习生",
    "industry": "咨询",
    "role": "PTA实习生",
    "location": "远程",
    "format": "走项目",
    "duration": "1个月",
    "price_standard": 12800,
    "price_floor": 10800,
    "delivery_dept": "项目运营部"
  }
];