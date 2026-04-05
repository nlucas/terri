import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'nodejs';

const BASE_SYSTEM_PROMPT = `You are Vinora's AI sommelier — a warm, knowledgeable wine teacher helping beginners discover wine through real drinking experiences. Your personality:

- Encouraging and excited about wine — never condescending
- Specific: name real bottles, producers, regions, and prices when helpful
- Conversational: you're a brilliant friend at a wine bar, not a textbook
- Concise: 2–4 short paragraphs max. Beginners don't need walls of text.
- Connect everything to what they can taste and experience in real life

When recommending wines, lean toward the $15–$45 range unless asked otherwise.

FORMATTING RULES — follow these strictly:
- Write in plain conversational prose only. No markdown whatsoever.
- No hashtags, no asterisks, no bullet points, no dashes, no bold or italic syntax.
- Separate thoughts with paragraph breaks (blank lines), not lists.
- Write exactly as you would speak out loud at a wine bar.`;

const BOTTLE_TEACHER_PROMPT = `${BASE_SYSTEM_PROMPT}

You are now in BOTTLE TEACHER mode. The user is about to taste or has just tasted a specific bottle. Your job:

Open with genuine excitement about the specific wine they chose — make them feel like they picked well. Then tell them what this wine is: where it comes from, why the region or producer matters, what makes this style distinctive. Help them understand what they're about to experience in the glass — the aromas, textures, and flavors to look for. Connect it to the broader section they're studying so the tasting reinforces what they're learning. Close with one thing to pay attention to that will make them a sharper taster.

Be warm, specific, and personal. This person is drinking something right now — speak to that moment.`;

export async function POST(req: Request) {
  try {
    const { question, context, bottleContext } = await req.json();

    // ── Bottle teacher mode (auto-initiation) ───────────────
    if (bottleContext) {
      const { wineName, producer, vintage, region, country, grapeVariety,
              sectionName, grapes, rating, notes,
              sweetness, acidity, tannin, body } = bottleContext;

      const tastingDetails = [
        sweetness !== null && `sweetness: ${sweetness}/5`,
        acidity !== null && `acidity: ${acidity}/5`,
        tannin !== null && `tannin: ${tannin}/5`,
        body !== null && `body: ${body}/5`,
      ].filter(Boolean).join(', ');

      const bottleDesc = [
        wineName,
        producer && `by ${producer}`,
        vintage && `(${vintage})`,
        region && `from ${region}`,
        country && country,
        grapeVariety && `— ${grapeVariety}`,
      ].filter(Boolean).join(' ');

      const userMessage = `I just logged a bottle: ${bottleDesc}.
${tastingDetails ? `My tasting notes — ${tastingDetails}.` : ''}
${rating ? `I rated it ${rating}/5 stars.` : ''}
${notes ? `My notes: "${notes}"` : ''}

I'm currently studying the "${sectionName}" section, exploring ${grapes?.join(', ')}.

Please tell me about this wine — what makes it what it is, what I likely experienced, and what I should know about it as I continue learning about this style.`;

      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: BOTTLE_TEACHER_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });

      return streamResponse(stream);
    }

    // ── Regular Q&A mode ────────────────────────────────────
    if (!question || typeof question !== 'string') {
      return new Response('Invalid question', { status: 400 });
    }

    const contextNote = context?.sectionName
      ? `The user is studying the "${context.sectionName}" section, focusing on: ${context.grapes?.join(', ')}.`
      : '';

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: BASE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextNote ? `${contextNote}\n\nMy question: ${question}` : question,
        },
      ],
    });

    return streamResponse(stream);

  } catch (error) {
    console.error('Sommelier API error:', error);
    return new Response('Something went wrong', { status: 500 });
  }
}

function streamResponse(stream: ReturnType<typeof client.messages.stream>) {
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
