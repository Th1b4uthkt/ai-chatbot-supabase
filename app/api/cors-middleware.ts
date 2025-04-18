export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent',
  };
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders(),
  });
} 