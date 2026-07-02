import type { APIRoute } from 'astro';

export const prerender = false;

const jsonHeaders = { 'Content-Type': 'application/json' };
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export const GET: APIRoute = async ({ url }) => {
    if (!process.env.SIM_API_KEY) {
        return new Response(JSON.stringify({ error: 'SIM_API_KEY is not configured' }), { status: 500, headers: jsonHeaders });
    }

    const address = url.searchParams.get('address');
    if (!address || !ADDRESS_PATTERN.test(address)) {
        return new Response(JSON.stringify({ error: 'Missing or invalid "address" query parameter (expected 0x-prefixed EVM address)' }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    const apiUrl = new URL(`https://api.sim.dune.com/v1/evm/balances/${address}`);
    apiUrl.searchParams.set('exclude_spam_tokens', 'true');
    apiUrl.searchParams.set('limit', '100');

    try {
        const response = await fetch(apiUrl, { headers: { 'X-Sim-Api-Key': process.env.SIM_API_KEY } });
        const body = await response.text();
        return new Response(body, { status: response.status, headers: jsonHeaders });
    } catch {
        return new Response(JSON.stringify({ error: 'Failed to reach the Sim API' }), { status: 502, headers: jsonHeaders });
    }
};
