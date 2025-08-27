'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      locale={es}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
        month: 'space-y-2',
        caption: 'flex justify-between pt-1 relative items-center px-2',
        caption_label: 'text-sm font-medium text-stone-200',
        nav: 'flex items-center gap-1',
        nav_button:
          'pl-1 h-7 w-7 bg-stone-800/50 rounded p-0 hover:bg-stone-700/50 transition-colors',
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'text-stone-500 w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-1',
        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-stone-700',
        day: 'h-9 w-9 p-0 font-normal hover:bg-stone-800/50 rounded-sm transition-colors',
        day_selected: 'bg-stone-700 text-stone-200 hover:bg-stone-600',
        day_today: 'bg-stone-800/30 text-stone-200',
        day_outside: 'text-stone-600 opacity-50',
        day_disabled: 'text-stone-600 opacity-50',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
