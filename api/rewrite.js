export default {
    async fetch(request, env, ctx) {
        // Add CORS headers to handle preflight requests
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle OPTIONS request for CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { 
                status: 405,
                headers: corsHeaders
            });
        }

        try {
            const { email } = await request.json();

            const groqResponse = await fetch('https://api.groq.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional email editor. Rewrite the following email to be more professional and effective while maintaining the same message.'
                        },
                        {
                            role: 'user',
                            content: email
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024,
                })
            });

            const groqData = await groqResponse.json();
            const rewrittenEmail = groqData.choices[0].message.content;

            return new Response(JSON.stringify({ rewrittenEmail }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to process request' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};