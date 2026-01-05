
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

// === INSTANT IMAGE LIBRARY ===
// Pre-curated, high-quality Unsplash images (CORS enabled)
// Optimized with width=1200 and quality=80
const BASE_PARAMS = "?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

export const STOCK_IMAGES: Record<string, string[]> = {
  "金融": [
    `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab${BASE_PARAMS}`, // Skyscrapers looking up
    `https://images.unsplash.com/photo-1556761175-5973dc0f32e7${BASE_PARAMS}`, // Meeting room handshake
    `https://images.unsplash.com/photo-1611974765270-ca1258634369${BASE_PARAMS}`, // Stock tickers / Blur
    `https://images.unsplash.com/photo-1507679799987-c73779587ccf${BASE_PARAMS}`, // Business man suit
    `https://images.unsplash.com/photo-1535320903710-d9cf7605024e${BASE_PARAMS}`, // Hong Kong Skyline
  ],
  "券商投行": [
    `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab${BASE_PARAMS}`,
    `https://images.unsplash.com/photo-1559526324-4b87b5e36e44${BASE_PARAMS}`, // Financial reports
    `https://images.unsplash.com/photo-1526304640152-d4619684e484${BASE_PARAMS}`, // Money/Graph
    `https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f${BASE_PARAMS}`, // Stock Market
  ],
  "互联网": [
    `https://images.unsplash.com/photo-1497366216548-37526070297c${BASE_PARAMS}`, // Modern white office
    `https://images.unsplash.com/photo-1531482615713-2afd69097998${BASE_PARAMS}`, // Coding screen
    `https://images.unsplash.com/photo-1504384308090-c54be3855091${BASE_PARAMS}`, // Tech open plan
    `https://images.unsplash.com/photo-1522071820081-009f0129c71c${BASE_PARAMS}`, // Team working
    `https://images.unsplash.com/photo-1553877607-49d06f6c1bc4${BASE_PARAMS}`, // Matrix code
  ],
  "咨询": [
    `https://images.unsplash.com/photo-1552664730-d307ca884978${BASE_PARAMS}`, // Team brainstorming
    `https://images.unsplash.com/photo-1542744173-8e7e53415bb0${BASE_PARAMS}`, // Analytics screen
    `https://images.unsplash.com/photo-1497215728101-856f4ea42174${BASE_PARAMS}`, // Bright office
    `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40${BASE_PARAMS}`, // Strategy planning
  ],
  "default": [
    `https://images.unsplash.com/photo-1497366811353-6870744d04b2${BASE_PARAMS}`, // General Office
    `https://images.unsplash.com/photo-1497215728101-856f4ea42174${BASE_PARAMS}`, // Corporate
    `https://images.unsplash.com/photo-1568992687947-868a62a9f521${BASE_PARAMS}`, // Creative space
  ]
};

export const getRandomStockImage = (industry: string): string => {
  let pool = STOCK_IMAGES["default"];
  
  // Try to find a specific pool
  for (const key of Object.keys(STOCK_IMAGES)) {
    if (industry && industry.includes(key)) {
      pool = STOCK_IMAGES[key];
      break;
    }
  }
  
  // Return random image from pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

// Initial seed data - Rich Dataset for Demo
export const INITIAL_DATA: Product[] = [
  {
    "id": "052",
    "type": "国内实习实训",
    "name": "【企拓2部】华泰联合-深圳",
    "industry": "券商投行",
    "role": "行研分析师",
    "location": "实地-深圳",
    "format": "走人事",
    "duration": "1个月",
    "price_standard": 29800,
    "price_floor": 26800,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "103",
    "type": "远程PTA",
    "name": "【核心】Goldman Sachs 高盛远程项目",
    "industry": "金融",
    "role": "Investment Banking Analyst",
    "location": "Remote",
    "format": "PTA",
    "duration": "4周",
    "price_standard": 18000,
    "price_floor": 15000,
    "delivery_dept": "海外一部"
  },
  {
    "id": "205",
    "type": "名企科研",
    "name": "Google 谷歌 - 机器学习与数据挖掘",
    "industry": "互联网",
    "role": "Data Scientist",
    "location": "Remote",
    "format": "科研论文",
    "duration": "8周",
    "price_standard": 35000,
    "price_floor": 32000,
    "delivery_dept": "海外二部"
  },
  {
    "id": "301",
    "type": "国内实习",
    "name": "中信证券 - 投行委 (北京)",
    "industry": "券商投行",
    "role": "投行实习生",
    "location": "实地-北京",
    "format": "走人事",
    "duration": "3个月",
    "price_standard": 42000,
    "price_floor": 38000,
    "delivery_dept": "企拓1部"
  },
  {
    "id": "404",
    "type": "咨询PTA",
    "name": "McKinsey 麦肯锡 - 数字化转型咨询",
    "industry": "咨询",
    "role": "Business Analyst",
    "location": "Remote",
    "format": "PTA",
    "duration": "4周",
    "price_standard": 22000,
    "price_floor": 19800,
    "delivery_dept": "海外一部"
  },
  {
    "id": "505",
    "type": "实地实习",
    "name": "ByteDance 字节跳动 - 战略分析",
    "industry": "互联网",
    "role": "战略分析实习生",
    "location": "实地-上海",
    "format": "走人事",
    "duration": "2个月",
    "price_standard": 26000,
    "price_floor": 24000,
    "delivery_dept": "企拓3部"
  },
  {
    "id": "608",
    "type": "远程项目",
    "name": "JP Morgan 摩根大通 - 量化金融",
    "industry": "金融",
    "role": "Quantitative Researcher",
    "location": "Remote",
    "format": "项目制",
    "duration": "6周",
    "price_standard": 28000,
    "price_floor": 25000,
    "delivery_dept": "海外二部"
  },
  {
    "id": "712",
    "type": "审计实习",
    "name": "PwC 普华永道 - 审计鉴证",
    "industry": "咨询",
    "role": "Audit Intern",
    "location": "实地-广州",
    "format": "走人事",
    "duration": "2个月",
    "price_standard": 16000,
    "price_floor": 14000,
    "delivery_dept": "企拓2部"
  },
  {
    "id": "802",
    "type": "国内实习",
    "name": "腾讯 - 产品策划 (微信事业群)",
    "industry": "互联网",
    "role": "产品经理实习生",
    "location": "实地-深圳",
    "format": "走人事",
    "duration": "3个月",
    "price_standard": 35000,
    "price_floor": 32000,
    "delivery_dept": "企拓3部"
  },
  {
    "id": "909",
    "type": "远程实习",
    "name": "BCG 波士顿咨询 - 医疗健康专项",
    "industry": "咨询",
    "role": "PTA",
    "location": "Remote",
    "format": "PTA",
    "duration": "1个月",
    "price_standard": 19000,
    "price_floor": 17500,
    "delivery_dept": "海外一部"
  },
  {
    "id": "1001",
    "type": "量化",
    "name": "Jane Street - Algorithmic Trading",
    "industry": "金融",
    "role": "Trader Intern",
    "location": "Hong Kong",
    "format": "On-site",
    "duration": "10 Weeks",
    "price_standard": 88000,
    "price_floor": 85000,
    "delivery_dept": "VIP定制"
  },
  {
    "id": "1102",
    "type": "AI科研",
    "name": "OpenAI - NLP Research Assistant",
    "industry": "互联网",
    "role": "Research Assistant",
    "location": "Remote",
    "format": "Mentorship",
    "duration": "12 Weeks",
    "price_standard": 65000,
    "price_floor": 62000,
    "delivery_dept": "海外科研部"
  }
];
