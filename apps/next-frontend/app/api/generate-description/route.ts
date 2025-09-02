import { NextRequest, NextResponse } from 'next/server';

interface GenerateDescriptionRequest {
  mood: 'creative' | 'professional' | 'fun';
  length: 'short' | 'medium' | 'long';
  additionalInstructions?: string;
  eventTitle?: string;
  eventType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDescriptionRequest = await request.json();
    const { mood, length, additionalInstructions, eventTitle, eventType } = body;

    // Validar que tenemos las credenciales necesarias
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Construir el prompt para Grok
    const moodDescriptions = {
      creative: 'creativo e innovador, enfocado en la inspiración y la exploración de nuevas ideas',
      professional: 'profesional y estructurado, ideal para networking y desarrollo empresarial',
      fun: 'divertido y energético, perfecto para eventos sociales y entretenimiento',
    };

    const lengthDescriptions = {
      short: 'breve y concisa (máximo 100 palabras)',
      medium: 'de longitud media (150-200 palabras)',
      long: 'detallada y extensa (250-300 palabras)',
    };

    const prompt = `Eres un experto en marketing de eventos. Genera una descripción atractiva para un evento en español.

Contexto del evento:
- Título: ${eventTitle || 'Evento especial'}
- Tipo: ${eventType || 'Evento general'}
- Estado de ánimo: ${moodDescriptions[mood]}
- Longitud: ${lengthDescriptions[length]}
${additionalInstructions ? `- Instrucciones adicionales: ${additionalInstructions}` : ''}

Requisitos:
- Escribe en español
- Usa un tono ${mood === 'creative' ? 'inspirador y creativo' : mood === 'professional' ? 'profesional y confiable' : 'divertido y entusiasta'}
- Incluye quién debería asistir
- Menciona qué esperar del evento
- Haz que sea atractivo y persuasivo
- Usa emojis apropiados (máximo 3)
- Evita clichés excesivos

Genera solo la descripción, sin explicaciones adicionales.`;

    // grok-3
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate description' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedDescription = data.choices?.[0]?.message?.content?.trim();

    if (!generatedDescription) {
      return NextResponse.json({ error: 'No description generated' }, { status: 500 });
    }

    return NextResponse.json({
      description: generatedDescription,
      success: true,
    });
  } catch (error) {
    console.error('Error generating description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
