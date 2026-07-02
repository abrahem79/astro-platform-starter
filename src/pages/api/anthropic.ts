import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

const MAX_PROMPT_LENGTH = 4000;
const jsonHeaders = { 'Content-Type': 'application/json' };

export const POST: APIRoute = async ({ request }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }), { status: 500, headers: jsonHeaders });
    }

    let prompt: unknown;
    try {
        ({ prompt } = await request.json());
    } catch {
        return new Response(JSON.stringify({ error: 'Request body must be valid JSON' }), { status: 400, headers: jsonHeaders });
    }
    if (!prompt || typeof prompt !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing "prompt" string in request body' }), { status: 400, headers: jsonHeaders });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return new Response(JSON.stringify({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    try {
        const anthropic = new Anthropic();
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        });

        return new Response(JSON.stringify(message), { headers: jsonHeaders });
    } catch (error) {
        const status = error instanceof Anthropic.APIError && error.status ? error.status : 500;
        const message = error instanceof Error ? error.message : 'Anthropic API request failed';
        return new Response(JSON.stringify({ error: message }), { status, headers: jsonHeaders });
    }
};
