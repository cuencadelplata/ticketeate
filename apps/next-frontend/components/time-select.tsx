'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimeSelect({ value, onChange }: TimeSelectProps) {
  const times = React.useMemo(() => {
    const result = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        result.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return result;
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 min-w-[80px] rounded border-0 bg-stone-700 px-3 text-white transition-colors hover:bg-stone-500/60"
        >
          {value || '00:00'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[80px] p-0">
        <ScrollArea className="h-[200px] bg-stone-900">
          <div className="grid">
            {times.map(time => (
              <Button
                key={time}
                variant="ghost"
                className={`h-8 w-full justify-center rounded-none px-0 text-center font-normal transition-colors ${
                  value === time
                    ? 'bg-stone-700 text-stone-200'
                    : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
                }`}
                onClick={() => onChange(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
