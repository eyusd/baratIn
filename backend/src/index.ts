const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Env {
  REACTIONS: KVNamespace;
}

async function handleGet(postId: string, env: Env): Promise<Response> {
  // Fetch from KV (returns null if key doesn't exist)
  const count = await env.REACTIONS.get(postId);
  
  return new Response(JSON.stringify({ 
    postId: postId,
    count: parseInt(count || "0") 
  }), {
    headers: { 
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

async function handlePost(postId: string, env: Env): Promise<Response> {
  const current = await env.REACTIONS.get(postId);
  const nextValue = parseInt(current || "0") + 1;
  await env.REACTIONS.put(postId, nextValue.toString());

  return new Response(JSON.stringify({ 
    postId: postId, 
    count: nextValue,
    status: "incremented"
  }), {
    headers: { 
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

		const url = new URL(request.url);
    const postId = url.pathname.slice(1);

    if (!postId) {
      return new Response("Error: Missing Post ID in URL", { 
        status: 400,
        headers: corsHeaders
      });
    }

		switch (request.method) {
			case "GET":
				return handleGet(postId, env);
			case "POST":
				return handlePost(postId, env);
			default:
				return new Response("Method not allowed", { 
          status: 405,
          headers: corsHeaders
        });
		}
	},
} satisfies ExportedHandler<Env>;
