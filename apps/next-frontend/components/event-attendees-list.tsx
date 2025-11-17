'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Attendee {
  usuarioid: string;
  name: string;
  email: string;
  image?: string;
}

interface EventAttendeesListProps {
  eventId: string;
  maxDisplay?: number; // Cuántos avatares mostrar (default: 4)
}

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase();
}

function getBackgroundColor(email: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
}

export function EventAttendeesList({ eventId, maxDisplay = 4 }: EventAttendeesListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttendees() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/eventos/${eventId}/attendees`);

        if (!response.ok) {
          throw new Error('Failed to fetch attendees');
        }

        const data = await response.json();
        setAttendees(data.attendees || []);
      } catch (err) {
        console.error('Error fetching attendees:', err);
        setError('No se pudieron cargar los asistentes');
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchAttendees();
    }
  }, [eventId]);

  if (isLoading || !attendees.length) {
    return null;
  }

  const displayedAttendees = attendees.slice(0, maxDisplay);
  const remainingCount = Math.max(0, attendees.length - maxDisplay);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <div className="flex -space-x-2">
          <TooltipProvider>
            {displayedAttendees.map((attendee, index) => (
              <Tooltip key={attendee.usuarioid}>
                <TooltipTrigger asChild>
                  <div className="ring-2 ring-stone-900 rounded-full overflow-hidden w-10 h-10 flex-shrink-0 hover:ring-stone-700 transition-all">
                    {attendee.image ? (
                      <Image
                        src={attendee.image}
                        alt={attendee.name || attendee.email}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${getBackgroundColor(attendee.email)}`}
                      >
                        {getInitial(attendee.email)}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-stone-800 text-stone-100 border-stone-700">
                  <p className="font-medium">{attendee.name || 'Usuario'}</p>
                  <p className="text-xs text-stone-400">{attendee.email}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="ring-2 ring-stone-900 rounded-full overflow-hidden w-10 h-10 flex-shrink-0 bg-stone-700 flex items-center justify-center hover:ring-stone-700 transition-all">
                    <span className="text-xs font-bold text-stone-100">+{remainingCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-stone-800 text-stone-100 border-stone-700">
                  <p className="font-medium">{remainingCount} más</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col">
        <p className="text-sm font-medium text-stone-200 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {attendees.length} inscrito{attendees.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-stone-400">Personas que van a este evento</p>
      </div>
    </div>
  );
}
