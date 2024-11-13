export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

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
            const requestBody = await request.json();
            if (!requestBody.email) {
                throw new Error('Email content is required');
            }

            // Create a prompt based on the selected tone
            const toneInstructions = {
                'growth mindset': 'growth mindset',
                'passive aggressive': 'passive aggressive',
                'hard boiled detective': 'an american hard boiled detective',
                'melodramatic': '19th century melodramatic character',
                'business': 'jargon packed business email', 
                'meow like a cat': 'Meow',
                'pompous': 'Pompous',
                'Mr. Mistoffelees': 'Mr. Mistoffelees', 
                'dungeons and dragons': 'dungeons and dragons',
                'professional': 'professional', 
                'friendly': 'friendly', 
                'formal': 'formal', 
                'casual': 'casual'  
            };

            const toneInstruction = toneInstructions[requestBody.tone] //|| toneInstructions.professional;

            // Updated GROQ API endpoint URL
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [{
                        role: "user",
                        content: `Using British English, rewrite the following email in a ${toneInstruction} tone:\n\n${requestBody.email}`
                    }],
                    temperature: 0.7,
                    max_tokens: 2000,
                })
            });

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