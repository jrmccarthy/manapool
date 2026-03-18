import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ limit?: number, offset?: number, minQuantity?: number}>}) {
  const proxyURL = new URL('https://manapool.com/api/v1/seller/inventory')
  request?.nextUrl?.searchParams.forEach((value, key) => proxyURL.searchParams.append(key, value))
  const proxyRequest = new Request(proxyURL, request)

  try {
    return fetch(proxyRequest)
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : 'Unexpected exception'
 
    return new Response(message, { status: 500 })
  }
}
