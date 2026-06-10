import Groq from 'groq-sdk';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages array', code: 'INVALID_REQUEST' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GROQ_API_KEY || '';
    let groq: Groq | null = null;
    if (apiKey && apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
      groq = new Groq({ apiKey });
    }

    // Fallback logic when API key is missing
    if (!groq) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      let mockReply = 'Hello! I am EcoSense AI, operating in offline/demo mode. ';

      if (lastUserMsg.toLowerCase().includes('reduce') || lastUserMsg.toLowerCase().includes('what should i do')) {
        mockReply += `Here are 3 recommended actions for you:
1. **Reduce travel emissions**: Switch to Delhi Metro or train for short trips. (Saves ~28 kg CO₂/month)
2. **Optimize home cooling**: Adjust AC to 26°C and clean filters monthly. (Saves ~15 kg CO₂/month)
3. **Food choices**: Shift to a plant-based diet for 3 days a week. (Saves ~18 kg CO₂/month)
These are easy and highly effective in the Indian context!`;
      } else if (lastUserMsg.toLowerCase().includes('compare')) {
        mockReply += `Compared to the national average of 1.8 tonnes per year (India) and the global average of 4.8 tonnes per year, your projected footprint shows room for positive shifts. Try checking the comparison chart on the Dashboard or Insights pages!`;
      } else {
        mockReply += `I received your message: "${lastUserMsg}". To enable full real-world AI suggestions, please add your Groq API key (starts with "gsk_") to your Netlify environment variables.`;
      }

      if (!stream) {
        return new Response(
          JSON.stringify({
            choices: [{ message: { role: 'assistant', content: mockReply } }],
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          const words = mockReply.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = {
              choices: [
                {
                  delta: {
                    content: words[i] + (i === words.length - 1 ? '' : ' '),
                  },
                },
              ],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    if (!stream) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2,
      });
      return new Response(JSON.stringify(completion), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          const chatCompletionStream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            stream: true,
            max_tokens: 400,
            temperature: 0.7,
          });

          for await (const chunk of chatCompletionStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Serverless function error', code: 'SERVERLESS_FUNCTION_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = {
  path: '/api/chat',
};
