
interface Env {
  // If you set DASHSCOPE_API_KEY in Cloudflare dashboard, use it here.
  // For this fix, we will use the key provided in the prompt.
}

export const onRequest: any = async (context: any) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // CORS Headers to allow frontend access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // HARDCODED KEY AS REQUESTED
  const API_KEY = 'sk-5efd0a3d158b47989e167fc1ab2a4ce1';
  
  const type = url.searchParams.get('type'); // 'text', 'image_submit', 'image_poll'

  try {
    // 1. TEXT GENERATION (Qwen)
    if (type === 'text') {
      const body = await request.json();
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // 2. IMAGE SUBMISSION (Wanx)
    if (type === 'image_submit') {
      const body = await request.json();
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/image-synthesis', {
        method: 'POST',
        headers: {
          'X-DashScope-Async': 'enable',
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // 3. IMAGE POLLING
    if (type === 'image_poll') {
      const taskId = url.searchParams.get('taskId');
      if (!taskId) throw new Error('Missing taskId');

      const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Invalid type parameter' }), { status: 400, headers: corsHeaders });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};
