'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateSelectProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export function DateSelect({ value, onChange }: DateSelectProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'EEE, d MMM', { locale: es });
  };

  // currentMonth removed (unused)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 min-w-[120px] rounded border-0 bg-stone-700 px-3 text-white transition-colors hover:bg-stone-500/60"
        >
          {formatDate(value) || 'Seleccionar fecha'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border bg-stone-900 p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            className=""
            weekStartsOn={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
