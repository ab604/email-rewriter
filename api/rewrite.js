export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        try {
            // Validate request body
            const requestBody = await request.json();
            if (!requestBody.email) {
                throw new Error('Email content is required');
            }

            // Log for debugging (these will appear in Cloudflare Workers logs)
            console.log('Received email content:', requestBody.email);
            console.log('GROQ API Key present:', !!env.GROQ_API_KEY);

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
                            content: requestBody.email
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024,
                })
            });

            // Log GROQ API response status
            console.log('GROQ API response status:', groqResponse.status);

            if (!groqResponse.ok) {
                const errorText = await groqResponse.text();
                console.error('GROQ API error:', errorText);
                throw new Error(`GROQ API error: ${groqResponse.status} ${errorText}`);
            }

            const groqData = await groqResponse.json();
            
            if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
                console.error('Unexpected GROQ API response:', groqData);
                throw new Error('Invalid response from GROQ API');
            }

            const rewrittenEmail = groqData.choices[0].message.content;

            return new Response(JSON.stringify({ rewrittenEmail }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ 
                error: 'Failed to process request',
                details: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};
