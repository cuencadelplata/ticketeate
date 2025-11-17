import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }
    
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    
    // Verify cron secret
    const secret = request.headers.get('x-cron-secret');
    if (secret !== cronSecret) {
      console.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();
    console.log('Starting event state update...');
    const now = new Date();

    // Fetch all eventos with their states and dates
    const { data: eventosRaw, error: fetchError } = await supabaseClient.from('eventos').select(
      `
        eventoid,
        creadorid,
        fecha_publicacion,
        deleted_at,
        evento_estado(Estado, fecha_de_cambio),
        fechas_evento(fecha_hora, fecha_fin)
      `,
    );

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    const eventos = eventosRaw as any[];

    console.log(`Processing ${eventos?.length || 0} eventos`);

    if (!eventos || eventos.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No eventos found',
      });
    }

    const stateChanges: any[] = [];
    const transitions: any[] = [];

    for (const evento of eventos) {
      try {
        // Get current state (most recent)
        const currentState =
          evento.evento_estado?.sort(
            (a: any, b: any) =>
              new Date(b.fecha_de_cambio).getTime() - new Date(a.fecha_de_cambio).getTime(),
          )?.[0]?.Estado || null;

        console.log(`Event ${evento.eventoid}: current state = ${currentState}`);

        // Get final date (latest date from all event dates)
        let finalDate: Date | null = null;
        if (evento.fechas_evento && evento.fechas_evento.length > 0) {
          const dates = evento.fechas_evento
            .map((f: any) => new Date(f.fecha_fin || f.fecha_hora))
            .filter((d: Date) => !isNaN(d.getTime()));
          if (dates.length > 0) {
            finalDate = dates.reduce((max: Date, d: Date) => (d > max ? d : max));
          }
        }

        let newState: string | null = null;

        // Rule 1: Soft delete
        if (evento.deleted_at && currentState !== 'CANCELADO') {
          newState = 'CANCELADO';
          console.log(`  -> Soft delete detected, changing to CANCELADO`);
        }
        // Rule 2: Event ended
        else if (finalDate && finalDate <= now && currentState === 'ACTIVO') {
          newState = 'COMPLETADO';
          console.log(`  -> Event ended (${finalDate.toISOString()}), changing to COMPLETADO`);
        }
        // Rule 3: Publish date reached
        else if (
          evento.fecha_publicacion &&
          new Date(evento.fecha_publicacion) <= now &&
          currentState === 'OCULTO'
        ) {
          newState = 'ACTIVO';
          console.log(`  -> Publish date reached, changing to ACTIVO`);
        }

        if (newState) {
          stateChanges.push({
            stateventid: randomUUID(),
            eventoid: evento.eventoid,
            Estado: newState,
            usuarioid: evento.creadorid,
            fecha_de_cambio: now.toISOString(),
          });
          transitions.push({
            eventId: evento.eventoid,
            from: currentState,
            to: newState,
          });
        }
      } catch (itemError) {
        console.error(`Error processing event ${evento.eventoid}:`, itemError);
      }
    }

    console.log(`Total transitions to apply: ${stateChanges.length}`);

    if (stateChanges.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No state changes required',
      });
    }

    // Insert all state changes
    const { error: insertError } = await supabaseClient
      .from('evento_estado')
      .insert(stateChanges as any);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Successfully applied all state changes');
    return NextResponse.json({
      success: true,
      processed: stateChanges.length,
      transitions,
    });
  } catch (error) {
    console.error('Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST with x-cron-secret header to execute',
  });
}
