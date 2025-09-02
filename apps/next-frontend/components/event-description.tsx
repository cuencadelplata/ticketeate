'use client';

import { useState } from 'react';
import { FileText, Lightbulb, X, Brain, Briefcase, PartyPopper, Sparkles, AlertCircle } from 'lucide-react';
import { useDescriptionGenerator } from '@/hooks/use-description-generator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface EventDescriptionProps {
  onDescriptionChange: (description: string) => void;
  eventTitle?: string;
  eventType?: string;
}

type MoodType = 'creative' | 'professional' | 'fun';
type LengthType = 'short' | 'medium' | 'long';

export default function EventDescription({ onDescriptionChange, eventTitle, eventType }: EventDescriptionProps) {
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiConfig, setAIConfig] = useState({
    mood: 'creative' as MoodType,
    length: 'short' as LengthType,
    additionalInstructions: '',
  });
  
  const { generateDescription, isLoading: isGenerating, error, clearError } = useDescriptionGenerator();

  const handleSave = () => {
    onDescriptionChange(description);
    setIsOpen(false);
  };

  const handleAISuggestion = () => {
    clearError();
    setIsOpen(false);
    setIsAIModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    const generatedDescription = await generateDescription({
      mood: aiConfig.mood,
      length: aiConfig.length,
      additionalInstructions: aiConfig.additionalInstructions,
      eventTitle,
      eventType,
    });

    if (generatedDescription) {
      setDescription(generatedDescription);
      setIsAIModalOpen(false);
      setIsOpen(false);
      onDescriptionChange(generatedDescription);
    }
  };



  const getMoodIcon = (mood: MoodType) => {
    switch (mood) {
      case 'creative':
        return <PartyPopper className="h-5 w-5" />;
      case 'professional':
        return <Briefcase className="h-5 w-5" />;
      case 'fun':
        return <span className="text-2xl">🎉</span>;
      default:
        return <PartyPopper className="h-5 w-5" />;
    }
  };

  const getMoodColor = (mood: MoodType) => {
    switch (mood) {
      case 'creative':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'professional':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
      case 'fun':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default:
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
    }
  };

  const LoadingAnimation = () => (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <Brain className="h-8 w-8 animate-pulse text-blue-400" />
          </div>
          <div className="absolute -right-2 -top-2 animate-bounce">
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <div
            className="absolute -bottom-2 -left-2 animate-bounce"
            style={{ animationDelay: '0.5s' }}
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
          </div>
          <div className="absolute -left-1 -top-1 animate-bounce" style={{ animationDelay: '1s' }}>
            <Sparkles className="h-3 w-3 text-blue-400" />
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-stone-100">
            Generando descripción con IA
          </h3>
          <p className="text-sm text-stone-400">
            Analizando tu configuración y creando algo mágico...
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 bg-stone-700" />
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-2 w-2 animate-pulse rounded-full bg-stone-600"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-stone-700" />
          <Skeleton className="h-4 w-3/4 bg-stone-700" />
          <Skeleton className="h-4 w-5/6 bg-stone-700" />
          <Skeleton className="h-4 w-2/3 bg-stone-700" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2 bg-stone-700" />
          <Skeleton className="h-4 w-3/4 bg-stone-700" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex text-xs text-stone-400">
          <span>Procesando...</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-800">
          <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-700/50 bg-stone-800/50 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="text-sm text-stone-300">
            {isGenerating && (
              <span className="inline-block animate-pulse">
                {
                  [
                    'Analizando instrucciones...',
                    'Configurando longitud...',
                    'Aplicando instrucciones...',
                    'Generando texto final...',
                  ][Math.floor((Date.now() / 500) % 4)]
                }
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="group flex w-full items-start gap-2 rounded-md border bg-stone-900 bg-opacity-60 p-2 text-left transition-colors hover:bg-stone-800/50">
            <div className="h-4.5 w-4.5 flex items-center justify-center rounded-md">
              <FileText className="mt-0.5 h-4 w-4 text-stone-400" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-stone-100">
                {description ? 'Descripción del evento' : 'Agregar descripción'}
              </span>
              {description ? (
                <span className="line-clamp-1 text-sm leading-relaxed text-stone-400">
                  {description}
                </span>
              ) : (
                <span className="text-xs text-stone-400">
                  Describe quién debería asistir y de qué trata el evento
                </span>
              )}
            </div>
            {description && (
              <Badge
                variant="secondary"
                className="ml-auto border-stone-700 bg-stone-800 text-stone-300"
              >
                Completado
              </Badge>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-0 sm:max-w-[500px]">
          <DialogTitle className="sr-only">Descripción del evento</DialogTitle>
          <div className="relative">
            {/* Header */}
            <div className="p-6 pb-4">
              <h2 className="text-xl font-semibold text-stone-100">Descripción del evento</h2>
            </div>

            <div className="space-y-6 px-6 pb-6">
              {/* Área de texto mejorada */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-stone-200">Descripción detallada</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="¿Quién debería asistir? ¿De qué trata el evento? Describe los detalles importantes, el formato, y qué esperar de la experiencia..."
                  className="min-h-[160px] resize-none border-stone-700/50 bg-[#0F0F0F]/80 text-base leading-relaxed text-stone-100 placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/20"
                />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Mínimo 50 caracteres recomendado</span>
                  <span className={description.length > 500 ? 'text-amber-400' : ''}>
                    {description.length}/1000
                  </span>
                </div>
              </div>

              {/* Opción de sugerencia con IA */}
              <div className="flex items-center justify-between rounded-lg border border-stone-600/30 bg-gradient-to-r from-stone-800/40 to-stone-700/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-100">Sugerir con IA</p>
                    <p className="text-xs text-stone-400">
                      Obtén ideas creativas para tu descripción
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAISuggestion}
                  className="border-stone-600/50 bg-stone-800/50 text-stone-200 hover:border-stone-500/50 hover:bg-stone-700/50"
                >
                  Usar IA
                </Button>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-stone-600/50 bg-transparent text-stone-300 hover:border-stone-500/50 hover:bg-stone-800/50 hover:text-stone-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={description.trim().length < 10}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Listo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sugerir con IA */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-0 sm:max-w-[500px]">
          <DialogTitle className="sr-only">Sugerir descripción con IA</DialogTitle>
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <Brain className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-100">Sugerir descripción</h2>
                  <p className="mt-1 text-sm text-stone-400">
                    Genera una descripción para tu evento con IA
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              {isGenerating ? (
                <LoadingAnimation />
              ) : (
                <div className="space-y-6">
                  {/* Estado de ánimo */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-200">Estado de ánimo</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['creative', 'professional', 'fun'] as MoodType[]).map(mood => (
                        <button
                          key={mood}
                          onClick={() => setAIConfig(prev => ({ ...prev, mood }))}
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200 ${
                            aiConfig.mood === mood
                              ? `bg-gradient-to-r ${getMoodColor(mood)} border-current`
                              : 'border-stone-700/50 bg-stone-800/40 hover:border-stone-600/50'
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md ${
                              aiConfig.mood === mood ? 'text-white' : 'text-stone-400'
                            }`}
                          >
                            {getMoodIcon(mood)}
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              aiConfig.mood === mood ? 'text-white' : 'text-stone-300'
                            }`}
                          >
                            {mood === 'creative'
                              ? 'Creativo'
                              : mood === 'professional'
                                ? 'Profesional'
                                : 'Divertido'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Longitud */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-200">Longitud</label>
                    <div className="flex gap-3">
                      {(['short', 'medium', 'long'] as LengthType[]).map(length => (
                        <button
                          key={length}
                          onClick={() => setAIConfig(prev => ({ ...prev, length }))}
                          className={`flex-1 rounded-lg border-2 px-4 py-2 transition-all duration-200 ${
                            aiConfig.length === length
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-stone-700/50 bg-stone-800/40 text-stone-300 hover:border-stone-600/50'
                          }`}
                        >
                          <span className="font-medium">
                            {length === 'short' ? 'C' : length === 'medium' ? 'M' : 'L'}
                          </span>
                          <span className="mt-1 block text-xs opacity-80">
                            {length === 'short'
                              ? 'Corta'
                              : length === 'medium'
                                ? 'Mediana'
                                : 'Larga'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instrucciones adicionales */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-200">
                      Instrucciones adicionales
                    </label>
                    <Textarea
                      value={aiConfig.additionalInstructions}
                      onChange={e =>
                        setAIConfig(prev => ({ ...prev, additionalInstructions: e.target.value }))
                      }
                      placeholder="Por ejemplo, podrías pedirle a la IA que escriba solo en pentámetro yámbico."
                      className="min-h-[100px] resize-none border-stone-700/50 bg-[#0F0F0F]/80 text-stone-100 placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/20"
                    />
                  </div>

                  {/* Mostrar error si existe */}
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-300">{error}</span>
                    </div>
                  )}

                  {/* Botón Generar */}
                  <Button
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="w-full rounded-lg bg-white py-3 text-base font-medium text-black shadow-lg hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? 'Generando...' : 'Generar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
