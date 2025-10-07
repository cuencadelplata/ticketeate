import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    
    // Buscar eventos que están programados para publicarse y aún están ocultos
    const { data: scheduledEvents, error: fetchError } = await supabase
      .from('eventos')
      .select(`
        eventoid,
        titulo,
        creadorid,
        fecha_publicacion,
        evento_estado!inner(
          Estado,
          fecha_de_cambio
        )
      `)
      .eq('evento_estado.Estado', 'OCULTO')
      .lte('fecha_publicacion', now.toISOString())
      .order('fecha_publicacion', { ascending: true });

    if (fetchError) {
      console.error('Error fetching scheduled events:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Error fetching scheduled events', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!scheduledEvents || scheduledEvents.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No scheduled events to publish',
          published: 0,
          errors: 0,
          timestamp: now.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let published = 0;
    let errors = 0;
    const results = [];

    for (const evento of scheduledEvents) {
      try {
        // Crear nuevo estado ACTIVO
        const { error: stateError } = await supabase
          .from('evento_estado')
          .insert({
            stateventid: crypto.randomUUID(),
            eventoid: evento.eventoid,
            Estado: 'ACTIVO',
            usuarioid: evento.creadorid,
            fecha_de_cambio: now.toISOString(),
          });

        if (stateError) {
          throw new Error(stateError.message);
        }

        published++;
        results.push({
          eventoid: evento.eventoid,
          titulo: evento.titulo,
          published: true,
        });
        
        console.log(`Published scheduled event: ${evento.titulo} (${evento.eventoid})`);
      } catch (error) {
        errors++;
        results.push({
          eventoid: evento.eventoid,
          titulo: evento.titulo,
          published: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Error publishing event ${evento.eventoid}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Scheduled events processing completed',
        published,
        errors,
        totalProcessed: scheduledEvents.length,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in publish-scheduled-events function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
