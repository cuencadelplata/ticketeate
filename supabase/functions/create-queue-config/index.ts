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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method === 'POST') {
      const { eventId, maxConcurrent = 5, maxUsers = 100 } = await req.json();

      if (!eventId) {
        return new Response(JSON.stringify({ error: 'eventId es requerido' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Verificar si ya existe configuración para este evento
      const { data: existingConfig, error: checkError } = await supabase
        .from('colas_evento')
        .select('*')
        .eq('eventoid', eventId)
        .single();

      if (existingConfig) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Configuración ya existe',
            config: existingConfig,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      }

      // Crear nueva configuración
      const colaid = `cola-${eventId}-${Date.now()}`;
      const { data: newConfig, error: insertError } = await supabase
        .from('colas_evento')
        .insert({
          colaid,
          eventoid: eventId,
          max_concurrentes: maxConcurrent,
          max_usuarios: maxUsers,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error al crear configuración: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Configuración creada exitosamente',
          config: newConfig,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    return new Response(JSON.stringify({ error: 'Método no soportado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error('Error en create-queue-config:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
