'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EventDescriptionProps {
  onDescriptionChange: (description: string) => void;
}

export default function EventDescription({ onDescriptionChange }: EventDescriptionProps) {
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onDescriptionChange(description);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-start gap-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2 text-left transition-colors hover:bg-stone-800/50">
          <FileText className="mt-0.5 h-4 w-4 text-stone-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-100">
              {description ? 'Descripción' : 'Agregar descripción'}
            </span>
            {description && (
              <span className="line-clamp-2 text-sm text-stone-400">{description}</span>
            )}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-[#2A2A2A] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-stone-100">Descripción del evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu evento..."
            className="h-40 border-0 bg-[#1A1A1A] text-stone-100 placeholder-stone-400"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#1A1A1A]"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-stone-200">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
