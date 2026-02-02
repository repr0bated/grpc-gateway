import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-grpc-web, grpc-timeout',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'grpc-status, grpc-message',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const grpcAddr = Deno.env.get('OP_DBUS_GRPC_ADDR') || 'localhost:50051'
  
  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/grpc-proxy', '')
    
    // Forward the gRPC-Web request to the backend
    const targetUrl = `http://${grpcAddr}${path}`
    
    console.log(`Proxying request to: ${targetUrl}`)
    
    const headers = new Headers()
    req.headers.forEach((value, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })
    
    const body = await req.arrayBuffer()
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body.byteLength > 0 ? body : undefined,
    })
    
    const responseHeaders = new Headers(corsHeaders)
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value)
    })
    
    const responseBody = await response.arrayBuffer()
    
    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('gRPC proxy error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Failed to proxy request', 
        details: message 
      }),
      { 
        status: 502, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
