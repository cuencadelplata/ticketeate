'use client';

import { useState } from 'react';

interface Attendee {
  id: string;
  nombre: string;
  email: string;
  scanned: boolean;
  timestamp?: string;
}

interface AttendeeListProps {
  eventId: string;
  attendees: Attendee[];
}

export default function AttendeeList({ eventId, attendees }: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const scannedCount = attendees.filter(a => a.scanned).length;
  const remainingCount = attendees.length - scannedCount;

  const filteredAttendees = attendees.filter(
    a =>
      a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4">Asistentes</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Escaneadas</p>
          <p className="text-2xl font-bold text-green-400">{scannedCount}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Restantes</p>
          <p className="text-2xl font-bold text-yellow-400">{remainingCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAttendees.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No hay asistentes</p>
        ) : (
          filteredAttendees.map((attendee) => (
            <div
              key={attendee.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                attendee.scanned
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-slate-700/30 border-slate-600/50'
              }`}
            >
              <div className="flex-1">
                <p className="text-white font-medium">{attendee.nombre}</p>
                <p className="text-slate-400 text-sm">{attendee.email}</p>
              </div>
              {attendee.scanned ? (
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-green-600/30 text-green-400 text-xs rounded-full font-medium">
                    ✓ Escaneado
                  </span>
                  {attendee.timestamp && (
                    <p className="text-slate-500 text-xs mt-1">{attendee.timestamp}</p>
                  )}
                </div>
              ) : (
                <span className="px-3 py-1 bg-yellow-600/30 text-yellow-400 text-xs rounded-full font-medium">
                  Pendiente
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
