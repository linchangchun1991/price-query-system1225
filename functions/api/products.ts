// Cloudflare Pages Functions - API Handler
// 路径: /api/products

interface Env {
  DB: any; // D1 Database Binding
}

// Define PagesFunction locally to avoid compilation errors when types are missing
type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: Record<string, any>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: any;
}) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // 通用响应头 (CORS)
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 检查数据库绑定
    if (!env.DB) {
      // 如果没有 DB 绑定，返回特定错误以便前端降级到 LocalStorage
      throw new Error("D1_NOT_CONFIGURED");
    }

    // === GET: 获取所有产品 ===
    if (request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM products ORDER BY created_at DESC"
        ).all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      } catch (e: any) {
         // 表可能不存在，返回空数组
         if (e.message && e.message.includes("no such table")) {
             return new Response(JSON.stringify([]), { headers: corsHeaders });
         }
         throw e;
      }
    }

    // === POST: 添加或更新产品 (Upsert) ===
    if (request.method === "POST") {
      const data: any = await request.json();
      const products = Array.isArray(data) ? data : [data];

      if (products.length === 0) {
        return new Response(JSON.stringify({ success: true, count: 0 }), { headers: corsHeaders });
      }

      // Upsert 逻辑
      const stmt = env.DB.prepare(`
        INSERT INTO products (id, type, name, industry, role, location, format, duration, price_standard, price_floor, delivery_dept, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type=excluded.type,
          name=excluded.name,
          industry=excluded.industry,
          role=excluded.role,
          location=excluded.location,
          format=excluded.format,
          duration=excluded.duration,
          price_standard=excluded.price_standard,
          price_floor=excluded.price_floor,
          delivery_dept=excluded.delivery_dept
      `);

      const batch = products.map((p: any) => stmt.bind(
        p.id || crypto.randomUUID(),
        p.type || '',
        p.name || 'Unnamed',
        p.industry || '',
        p.role || '',
        p.location || '',
        p.format || '',
        p.duration || '',
        p.price_standard || 0,
        p.price_floor || 0,
        p.delivery_dept || '',
        p.created_at || Date.now()
      ));

      await env.DB.batch(batch);
      
      return new Response(JSON.stringify({ success: true, count: products.length }), { headers: corsHeaders });
    }

    // === DELETE: 删除产品 ===
    if (request.method === "DELETE") {
      const singleId = url.searchParams.get('id');
      
      // 单个删除
      if (singleId) {
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(singleId).run();
        return new Response(JSON.stringify({ success: true, id: singleId }), { headers: corsHeaders });
      }

      // 批量删除
      try {
        const body: any = await request.json();
        if (body && Array.isArray(body.ids) && body.ids.length > 0) {
            // D1 batch delete
            const stmts = body.ids.map((delId: string) => env.DB.prepare("DELETE FROM products WHERE id = ?").bind(delId));
            await env.DB.batch(stmts);
            return new Response(JSON.stringify({ success: true, count: body.ids.length }), { headers: corsHeaders });
        }
      } catch (e) {
        // 忽略 JSON 错误，继续
      }
      
      return new Response(JSON.stringify({ error: "Missing ID or IDs" }), { status: 400, headers: corsHeaders });
    }

    // 不支持的方法
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500, headers: corsHeaders });
  }
};