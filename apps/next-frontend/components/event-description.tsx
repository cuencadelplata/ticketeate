'use client';

import { useState } from 'react';
import { FileText, Lightbulb, X, Brain, Briefcase, PartyPopper, Sparkles } from 'lucide-react';
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
}

type MoodType = 'creative' | 'professional' | 'fun';
type LengthType = 'short' | 'medium' | 'long';

export default function EventDescription({ onDescriptionChange }: EventDescriptionProps) {
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiConfig, setAIConfig] = useState({
    mood: 'creative' as MoodType,
    length: 'short' as LengthType,
    additionalInstructions: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    onDescriptionChange(description);
    setIsOpen(false);
  };

  const handleAISuggestion = () => {
    setIsOpen(false);
    setIsAIModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedDescription = generateDescriptionWithAI(aiConfig);
    setDescription(generatedDescription);
    
    setIsGenerating(false);
    setIsAIModalOpen(false);
    setIsOpen(false);
    onDescriptionChange(generatedDescription);
  };

  const generateDescriptionWithAI = (config: typeof aiConfig): string => {
    const moodTemplates = {
      creative: [
        "Sumérgete en una experiencia única donde la creatividad y la innovación se encuentran. Este evento está diseñado para mentes curiosas y espíritus aventureros que buscan explorar nuevas posibilidades y conectar con ideas revolucionarias.",
        "Descubre un mundo de inspiración y creatividad sin límites. Perfecto para artistas, diseñadores, innovadores y cualquier persona que quiera expandir sus horizontes creativos en un ambiente estimulante y colaborativo."
      ],
      professional: [
        "Un evento profesional diseñado para ejecutivos, emprendedores y profesionales que buscan expandir su red de contactos y adquirir conocimientos valiosos en un entorno sofisticado y estructurado.",
        "Una oportunidad excepcional para el desarrollo profesional y el networking estratégico. Ideal para líderes empresariales, consultores y profesionales que valoran la excelencia y la innovación en sus campos."
      ],
      fun: [
        "¡Prepárate para una experiencia llena de diversión, risas y momentos inolvidables! Este evento está diseñado para personas que aman la vida social, la música y crear recuerdos extraordinarios juntos.",
        "Una celebración vibrante y energética perfecta para extrovertidos, amantes de la diversión y cualquiera que quiera escapar de la rutina diaria para disfrutar de una noche mágica y llena de sorpresas."
      ]
    };

    const lengthMultipliers = {
      short: 0.6,
      medium: 1.0,
      long: 1.4
    };

    const baseDescription = moodTemplates[config.mood][Math.floor(Math.random() * 2)];
    const targetLength = Math.floor(baseDescription.length * lengthMultipliers[config.length]);
    
    let finalDescription = baseDescription;
    
    if (config.additionalInstructions) {
      finalDescription += ` ${config.additionalInstructions}`;
    }
    
    if (config.length === 'short' && finalDescription.length > targetLength) {
      finalDescription = finalDescription.substring(0, targetLength) + '...';
    } else if (config.length === 'long' && finalDescription.length < targetLength) {
      finalDescription += ' Ven y únete a nosotros para crear algo extraordinario juntos.';
    }
    
    return finalDescription;
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
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mx-auto">
            <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="h-4 w-4 text-pink-400" />
          </div>
          <div className="absolute -top-1 -left-1 animate-bounce" style={{ animationDelay: '1s' }}>
            <Sparkles className="h-3 w-3 text-blue-400" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-100 mb-2">
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-stone-600 animate-pulse"
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
        <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-stone-300">
            {isGenerating && (
              <span className="inline-block animate-pulse">
                {['Analizando instrucciones...', 'Configurando longitud...', 'Aplicando instrucciones...', 'Generando texto final...'][Math.floor((Date.now() / 500) % 4)]}
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
          <button className="group flex w-full items-start gap-3 rounded-lg border border-stone-700/50 bg-stone-900/80 p-3 text-left transition-all duration-200 hover:border-stone-600/70 hover:bg-stone-800/60 hover:shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-800/60 group-hover:bg-stone-700/60 transition-colors">
              <FileText className="h-4 w-4 text-stone-300" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-stone-100">
                {description ? 'Descripción del evento' : 'Agregar descripción'}
              </span>
              {description ? (
                <span className="line-clamp-2 mt-1 text-sm text-stone-400 leading-relaxed">
                  {description}
                </span>
              ) : (
                <span className="mt-1 text-sm text-stone-500">
                  Describe quién debería asistir y de qué trata el evento
                </span>
              )}
            </div>
            {description && (
              <Badge variant="secondary" className="ml-auto bg-stone-800 text-stone-300 border-stone-700">
                Completado
              </Badge>
            )}
          </button>
        </DialogTrigger>
        
        <DialogContent className="border-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] sm:max-w-[600px] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Descripción del evento</DialogTitle>
          <div className="relative">
            {/* Header */}
            <div className="p-6 pb-4">
              <h2 className="text-xl font-semibold text-stone-100">
                Descripción del evento
              </h2>
            </div>

            <div className="px-6 pb-6 space-y-6">
              {/* Área de texto mejorada */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-stone-200">
                  Descripción detallada
                </label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="¿Quién debería asistir? ¿De qué trata el evento? Describe los detalles importantes, el formato, y qué esperar de la experiencia..."
                  className="min-h-[160px] border-stone-700/50 bg-[#0F0F0F]/80 text-stone-100 placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/20 resize-none text-base leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Mínimo 50 caracteres recomendado</span>
                  <span className={description.length > 500 ? 'text-amber-400' : ''}>
                    {description.length}/1000
                  </span>
                </div>
              </div>

              {/* Opción de sugerencia con IA */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-stone-800/40 to-stone-700/40 border border-stone-600/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-100">Sugerir con IA</p>
                    <p className="text-xs text-stone-400">Obtén ideas creativas para tu descripción</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAISuggestion}
                  className="border-stone-600/50 bg-stone-800/50 text-stone-200 hover:bg-stone-700/50 hover:border-stone-500/50"
                >
                  Usar IA
                </Button>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-stone-600/50 bg-transparent text-stone-300 hover:bg-stone-800/50 hover:border-stone-500/50 hover:text-stone-200"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={description.trim().length < 10}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
        <DialogContent className="border-0 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] sm:max-w-[500px] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Sugerir descripción con IA</DialogTitle>
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <Brain className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-100">
                    Sugerir descripción
                  </h2>
                  <p className="text-sm text-stone-400 mt-1">
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
                      {(['creative', 'professional', 'fun'] as MoodType[]).map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setAIConfig(prev => ({ ...prev, mood }))}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                            aiConfig.mood === mood
                              ? `bg-gradient-to-r ${getMoodColor(mood)} border-current`
                              : 'border-stone-700/50 bg-stone-800/40 hover:border-stone-600/50'
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                            aiConfig.mood === mood ? 'text-white' : 'text-stone-400'
                          }`}>
                            {getMoodIcon(mood)}
                          </div>
                          <span className={`text-xs font-medium ${
                            aiConfig.mood === mood ? 'text-white' : 'text-stone-300'
                          }`}>
                            {mood === 'creative' ? 'Creativo' : mood === 'professional' ? 'Profesional' : 'Divertido'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Longitud */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-200">Longitud</label>
                    <div className="flex gap-3">
                      {(['short', 'medium', 'long'] as LengthType[]).map((length) => (
                        <button
                          key={length}
                          onClick={() => setAIConfig(prev => ({ ...prev, length }))}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                            aiConfig.length === length
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-stone-700/50 bg-stone-800/40 text-stone-300 hover:border-stone-600/50'
                          }`}
                        >
                          <span className="font-medium">
                            {length === 'short' ? 'C' : length === 'medium' ? 'M' : 'L'}
                          </span>
                          <span className="text-xs block mt-1 opacity-80">
                            {length === 'short' ? 'Corta' : length === 'medium' ? 'Mediana' : 'Larga'}
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
                      onChange={e => setAIConfig(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      placeholder="Por ejemplo, podrías pedirle a la IA que escriba solo en pentámetro yámbico."
                      className="min-h-[100px] border-stone-700/50 bg-[#0F0F0F]/80 text-stone-100 placeholder-stone-500 focus:border-stone-500 focus:ring-stone-500/20 resize-none"
                    />
                  </div>

                  {/* Botón Generar */}
                  <Button
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="w-full bg-white text-black hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-medium rounded-lg shadow-lg"
                  >
                    Generar
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
