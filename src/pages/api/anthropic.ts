import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }), { status: 500 });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing "prompt" string in request body' }), { status: 400 });
    }

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
    });

    return new Response(JSON.stringify(message), {
        headers: { 'Content-Type': 'application/json' }
    });
};
