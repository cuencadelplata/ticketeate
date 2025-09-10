'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@heroui/react';
import { X, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export interface EventSector {
  id: string;
  name: string;
  type: 'general' | 'vip' | 'premium' | 'custom';
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity?: number;
  price?: number;
  isGrid?: boolean;
  rows?: number;
  columns?: number;
}

export interface EventElement {
  id: string;
  name: string;
  type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking' | 'custom';
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface EventMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mapData: {
    sectors: EventSector[];
    elements: EventElement[];
    backgroundImage?: string;
  }) => void;
  initialMapData?: { sectors: EventSector[]; elements?: EventElement[]; backgroundImage?: string };
}

const sectorTypes = [
  { type: 'general', label: 'General', color: '#1E40AF' },
  { type: 'vip', label: 'VIP', color: '#D97706' },
  { type: 'premium', label: 'Premium', color: '#7C3AED' },
  { type: 'custom', label: 'Personalizado', color: '#059669' },
];

const elementTypes = [
  { type: 'stage', label: 'Escenario', icon: '🎭', color: '#DC2626' },
  { type: 'bathroom', label: 'Baños', icon: '🚻', color: '#0891B2' },
  { type: 'bar', label: 'Cantina/Bar', icon: '🍺', color: '#D97706' },
  { type: 'entrance', label: 'Entrada', icon: '🚪', color: '#059669' },
  { type: 'exit', label: 'Salida', icon: '🚪', color: '#DC2626' },
  { type: 'parking', label: 'Estacionamiento', icon: '🅿️', color: '#374151' },
];

export default function EventMapModal({
  isOpen,
  onClose,
  onSave,
  initialMapData,
}: EventMapModalProps) {
  const [sectors, setSectors] = useState<EventSector[]>(initialMapData?.sectors || []);
  const [elements, setElements] = useState<EventElement[]>(initialMapData?.elements || []);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedType, setSelectedType] = useState<'general' | 'vip' | 'premium' | 'custom'>(
    'general',
  );
  const [selectedElementType, setSelectedElementType] = useState<
    'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking'
  >('stage');
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(
    initialMapData?.backgroundImage,
  );
  const [activeTab, setActiveTab] = useState<'sectors' | 'elements' | 'grid'>('sectors');
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(20);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const snapToGridPosition = useCallback(
    (x: number, y: number) => {
      if (!snapToGrid) return { x, y };

      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      return { x: snappedX, y: snappedY };
    },
    [snapToGrid, gridSize],
  );

  const handleCanvasClick = useCallback(
    (_e: React.MouseEvent) => {
      // Solo deseleccionar sector o elemento si hay uno seleccionado
      if (selectedSector) {
        setSelectedSector(null);
      }
      if (selectedElement) {
        setSelectedElement(null);
      }
    },
    [selectedSector, selectedElement],
  );

  const handleSectorMouseDown = useCallback(
    (e: React.MouseEvent, sectorId: string) => {
      e.stopPropagation();
      setSelectedSector(sectorId);
      setSelectedElement(null);
      setIsDragging(true);

      const sector = sectors.find((s) => s.id === sectorId);
      if (!sector) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDragOffset({
        x: e.clientX - rect.left - sector.x,
        y: e.clientY - rect.top - sector.y,
      });
    },
    [sectors],
  );

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      setSelectedElement(elementId);
      setSelectedSector(null);
      setIsDragging(true);

      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
    },
    [elements],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const rawX = e.clientX - rect.left - dragOffset.x;
      const rawY = e.clientY - rect.top - dragOffset.y;

      const { x: newX, y: newY } = snapToGridPosition(rawX, rawY);

      if (selectedSector) {
        const sector = sectors.find((s) => s.id === selectedSector);
        if (sector) {
          setSectors((prev) =>
            prev.map((s) =>
              s.id === selectedSector
                ? {
                    ...s,
                    x: Math.max(0, Math.min(newX, 800 - s.width)),
                    y: Math.max(0, Math.min(newY, 600 - s.height)),
                  }
                : s,
            ),
          );
        }
      }

      if (selectedElement) {
        const element = elements.find((el) => el.id === selectedElement);
        if (element) {
          setElements((prev) =>
            prev.map((el) =>
              el.id === selectedElement
                ? {
                    ...el,
                    x: Math.max(0, Math.min(newX, 800 - el.width)),
                    y: Math.max(0, Math.min(newY, 600 - el.height)),
                  }
                : el,
            ),
          );
        }
      }
    },
    [
      isDragging,
      selectedSector,
      selectedElement,
      dragOffset,
      sectors,
      elements,
      snapToGridPosition,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSectorResize = useCallback(
    (sectorId: string, direction: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const sector = sectors.find((s) => s.id === sectorId);
      if (!sector) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = sector.width;
      const startHeight = sector.height;
      const startSectorX = sector.x;
      const startSectorY = sector.y;

      const handleMouseMove = (moveEvent: { clientX: number; clientY: number }) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startSectorX;
        let newY = startSectorY;

        if (direction.includes('right')) {
          newWidth = Math.max(50, startWidth + deltaX);
          if (snapToGrid) {
            newWidth = Math.round(newWidth / gridSize) * gridSize;
          }
        }
        if (direction.includes('left')) {
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startSectorX + deltaX;
          if (snapToGrid) {
            newWidth = Math.round(newWidth / gridSize) * gridSize;
            newX = Math.round(newX / gridSize) * gridSize;
          }
        }
        if (direction.includes('bottom')) {
          newHeight = Math.max(30, startHeight + deltaY);
          if (snapToGrid) {
            newHeight = Math.round(newHeight / gridSize) * gridSize;
          }
        }
        if (direction.includes('top')) {
          newHeight = Math.max(30, startHeight - deltaY);
          newY = startSectorY + deltaY;
          if (snapToGrid) {
            newHeight = Math.round(newHeight / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }
        }

        setSectors((prev) =>
          prev.map((s) =>
            s.id === sectorId ? { ...s, width: newWidth, height: newHeight, x: newX, y: newY } : s,
          ),
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [sectors, snapToGrid, gridSize],
  );

  const handleElementResize = useCallback(
    (elementId: string, direction: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = element.width;
      const startHeight = element.height;
      const startElementX = element.x;
      const startElementY = element.y;

      const handleMouseMove = (moveEvent: { clientX: number; clientY: number }) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startElementX;
        let newY = startElementY;

        if (direction.includes('right')) {
          newWidth = Math.max(40, startWidth + deltaX);
          if (snapToGrid) {
            newWidth = Math.round(newWidth / gridSize) * gridSize;
          }
        }
        if (direction.includes('left')) {
          newWidth = Math.max(40, startWidth - deltaX);
          newX = startElementX + deltaX;
          if (snapToGrid) {
            newWidth = Math.round(newWidth / gridSize) * gridSize;
            newX = Math.round(newX / gridSize) * gridSize;
          }
        }
        if (direction.includes('bottom')) {
          newHeight = Math.max(40, startHeight + deltaY);
          if (snapToGrid) {
            newHeight = Math.round(newHeight / gridSize) * gridSize;
          }
        }
        if (direction.includes('top')) {
          newHeight = Math.max(40, startHeight - deltaY);
          newY = startElementY + deltaY;
          if (snapToGrid) {
            newHeight = Math.round(newHeight / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }
        }

        setElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY }
              : el,
          ),
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [elements, snapToGrid, gridSize],
  );

  const updateSectorProperty = (sectorId: string, property: keyof EventSector, value: any) => {
    setSectors((prev) =>
      prev.map((sector) => {
        if (sector.id === sectorId) {
          const updatedSector = { ...sector, [property]: value };

          if (updatedSector.isGrid && (property === 'rows' || property === 'columns')) {
            const rows = property === 'rows' ? value : updatedSector.rows;
            const columns = property === 'columns' ? value : updatedSector.columns;
            if (rows && columns) {
              updatedSector.capacity = rows * columns;
            }
          }

          return updatedSector;
        }
        return sector;
      }),
    );
  };

  const deleteSector = (sectorId: string) => {
    setSectors((prev) => prev.filter((sector) => sector.id !== sectorId));
    if (selectedSector === sectorId) {
      setSelectedSector(null);
    }
  };

  const deleteElement = (elementId: string) => {
    setElements((prev) => prev.filter((element) => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const createGridSector = (rows: number, columns: number) => {
    const capacity = rows * columns;
    const newSector: EventSector = {
      id: Date.now().toString(),
      name: `Grid ${rows}x${columns}`,
      type: 'general',
      color: '#1E40AF',
      x: 50,
      y: 50,
      width: columns * 20,
      height: rows * 20,
      isGrid: true,
      rows,
      columns,
      capacity,
    };
    setSectors((prev) => [...prev, newSector]);
  };

  const addSectorToCanvas = (type: 'general' | 'vip' | 'premium' | 'custom') => {
    const { x, y } = snapToGridPosition(50, 50);
    const newSector: EventSector = {
      id: Date.now().toString(),
      name: `${sectorTypes.find((t) => t.type === type)?.label} ${sectors.length + 1}`,
      type: type,
      color: sectorTypes.find((t) => t.type === type)?.color || '#1E40AF',
      x,
      y,
      width: snapToGrid ? Math.round(100 / gridSize) * gridSize : 100,
      height: snapToGrid ? Math.round(50 / gridSize) * gridSize : 50,
    };
    setSectors((prev) => [...prev, newSector]);
  };

  const addElementToCanvas = (
    type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking',
  ) => {
    const elementType = elementTypes.find((t) => t.type === type);
    const { x, y } = snapToGridPosition(50, 50);
    const newElement: EventElement = {
      id: Date.now().toString(),
      name: elementType?.label || 'Elemento',
      type: type,
      icon: elementType?.icon || '📦',
      color: elementType?.color || '#6B7280',
      x,
      y,
      width: snapToGrid ? Math.round(60 / gridSize) * gridSize : 60,
      height: snapToGrid ? Math.round(60 / gridSize) * gridSize : 60,
    };
    setElements((prev) => [...prev, newElement]);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (sectors.length === 0 && elements.length === 0) {
      toast.error('Agrega al menos un sector o elemento al mapa');
      return;
    }
    onSave({ sectors, elements, backgroundImage });
    toast.success('Mapa de evento guardado exitosamente');
    onClose();
  };

  const handleReset = () => {
    setSectors([]);
    setElements([]);
    setBackgroundImage(undefined);
    setSelectedSector(null);
    setSelectedElement(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-6xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Diseñar Mapa del Evento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 space-y-4 overflow-y-auto border-r border-gray-700 p-4">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'sectors', label: 'Sectores' },
                { id: 'elements', label: 'Elementos' },
                { id: 'grid', label: 'Grid' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'sectors' && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Sectores Disponibles</h3>
                <p className="mb-3 text-xs text-gray-500">Haz clic para agregar al canvas</p>
                <div className="space-y-2">
                  {sectorTypes.map(({ type, label, color }) => (
                    <button
                      key={type}
                      onClick={() =>
                        addSectorToCanvas(type as 'general' | 'vip' | 'premium' | 'custom')
                      }
                      className={`w-full cursor-pointer rounded-md border-2 border-dashed p-3 text-left transition-all hover:shadow-md ${
                        selectedType === type
                          ? 'bg-stone-850 border-blue-500'
                          : 'border-gray-800 hover:border-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Haz clic para agregar</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Elementos de Infraestructura</h3>
                <p className="mb-3 text-xs text-gray-500">Haz clic para agregar al canvas</p>
                <div className="space-y-2">
                  {elementTypes.map(({ type, label, icon, color: _color }) => (
                    <button
                      key={type}
                      onClick={() =>
                        addElementToCanvas(
                          type as 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking',
                        )
                      }
                      className={`w-full cursor-pointer rounded-md border-2 border-dashed p-3 text-left transition-all hover:shadow-md ${
                        selectedElementType === type
                          ? 'bg-stone-850 border-blue-500'
                          : 'border-gray-800 hover:border-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Haz clic para agregar</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'grid' && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Crear Grid de Asientos</h3>
                <p className="mb-3 text-xs text-gray-500">Crea sectores con filas y columnas</p>
                <div className="space-y-3">
                  {[
                    { rows: 5, columns: 10, label: '5x10 (50 asientos)' },
                    { rows: 8, columns: 12, label: '8x12 (96 asientos)' },
                    { rows: 10, columns: 15, label: '10x15 (150 asientos)' },
                    { rows: 12, columns: 20, label: '12x20 (240 asientos)' },
                  ].map(({ rows, columns, label }) => (
                    <button
                      key={`${rows}x${columns}`}
                      onClick={() => createGridSector(rows, columns)}
                      className="hover:bg-stone-850 w-full rounded-md border border-gray-800 p-3 text-left transition-colors hover:border-gray-900"
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-gray-500">
                        Grid {rows} filas x {columns} columnas
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-medium">Fondo del Mapa</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="w-full text-sm"
              />
              {backgroundImage && (
                <div className="mt-2">
                  <img
                    src={backgroundImage}
                    alt="Fondo del mapa"
                    className="h-20 w-full rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Opciones de Alineación</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Mostrar grid</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Alinear al grid</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Elementos del Mapa</h3>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className={`cursor-pointer rounded-md border p-2 transition-colors ${
                      selectedSector === sector.id
                        ? 'bg-stone-850 border-blue-500'
                        : 'border-gray-800 hover:border-gray-900'
                    }`}
                    onClick={() => {
                      setSelectedSector(sector.id);
                      setSelectedElement(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: sector.color }}
                        />
                        <span className="text-sm font-medium">{sector.name}</span>
                        {sector.isGrid && (
                          <span className="text-xs text-gray-500">
                            ({sector.rows}x{sector.columns})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSector(sector.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`cursor-pointer rounded-md border p-2 transition-colors ${
                      selectedElement === element.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-800 hover:border-gray-900'
                    }`}
                    onClick={() => {
                      setSelectedElement(element.id);
                      setSelectedSector(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{element.icon}</span>
                        <span className="text-sm font-medium">{element.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSector && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Propiedades del Sector</h3>
                {(() => {
                  const sector = sectors.find((s) => s.id === selectedSector);
                  if (!sector) return null;

                  return (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Nombre</label>
                        <input
                          type="text"
                          value={sector.name}
                          onChange={(e) => updateSectorProperty(sector.id, 'name', e.target.value)}
                          className="w-full rounded border p-1 text-sm"
                        />
                      </div>
                      {sector.isGrid && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Filas</label>
                            <input
                              type="number"
                              value={sector.rows || ''}
                              onChange={(e) =>
                                updateSectorProperty(
                                  sector.id,
                                  'rows',
                                  parseInt(e.target.value) || undefined,
                                )
                              }
                              className="w-full rounded border p-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Columnas</label>
                            <input
                              type="number"
                              value={sector.columns || ''}
                              onChange={(e) =>
                                updateSectorProperty(
                                  sector.id,
                                  'columns',
                                  parseInt(e.target.value) || undefined,
                                )
                              }
                              className="w-full rounded border p-1 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-gray-600">Capacidad</label>
                        <input
                          type="number"
                          value={sector.capacity || ''}
                          onChange={(e) =>
                            updateSectorProperty(
                              sector.id,
                              'capacity',
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          className="w-full rounded border p-1 text-sm"
                          placeholder="Opcional"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Precio</label>
                        <input
                          type="number"
                          value={sector.price || ''}
                          onChange={(e) =>
                            updateSectorProperty(
                              sector.id,
                              'price',
                              parseFloat(e.target.value) || undefined,
                            )
                          }
                          className="w-full rounded border p-1 text-sm"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedElement && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Propiedades del Elemento</h3>
                {(() => {
                  const element = elements.find((el) => el.id === selectedElement);
                  if (!element) return null;

                  return (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Nombre</label>
                        <input
                          type="text"
                          value={element.name}
                          onChange={(e) => {
                            setElements((prev) =>
                              prev.map((el) =>
                                el.id === selectedElement ? { ...el, name: e.target.value } : el,
                              ),
                            );
                          }}
                          className="w-full rounded border p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Tipo</label>
                        <select
                          value={element.type}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            const elementType = elementTypes.find((t) => t.type === newType);
                            setElements((prev) =>
                              prev.map((el) =>
                                el.id === selectedElement
                                  ? {
                                      ...el,
                                      type: newType,
                                      icon: elementType?.icon || el.icon,
                                      color: elementType?.color || el.color,
                                    }
                                  : el,
                              ),
                            );
                          }}
                          className="w-full rounded border p-1 text-sm"
                        >
                          {elementTypes.map(({ type, label }) => (
                            <option key={type} value={type}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Haz clic en los elementos del panel para agregarlos al canvas. Arrastra para mover,
                redimensiona desde las esquinas.
              </span>
            </div>

            <div
              ref={canvasRef}
              className="relative h-96 w-full cursor-default overflow-hidden rounded-lg border-2 border-dashed border-gray-800"
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {showGrid && (
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <pattern
                        id="grid"
                        width={gridSize}
                        height={gridSize}
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                          fill="none"
                          stroke="#666"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}

              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className={`absolute cursor-move select-none border-2 ${
                    selectedSector === sector.id ? 'border-blue-500' : 'border-gray-400'
                  }`}
                  style={{
                    left: sector.x,
                    top: sector.y,
                    width: sector.width,
                    height: sector.height,
                    backgroundColor: sector.color + 'CC',
                  }}
                  onMouseDown={(e) => handleSectorMouseDown(e, sector.id)}
                >
                  <div className="p-1 text-center text-xs font-medium text-white">
                    {sector.name}
                  </div>

                  {sector.isGrid &&
                    sector.rows &&
                    sector.columns &&
                    (() => {
                      const rows = sector.rows!;
                      const columns = sector.columns!;
                      return (
                        <div className="absolute inset-0 opacity-30">
                          {Array.from({ length: rows }).map((_, rowIndex) =>
                            Array.from({ length: columns }).map((_, colIndex) => (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className="absolute border border-white/20"
                                style={{
                                  left: `${(colIndex / columns) * 100}%`,
                                  top: `${(rowIndex / rows) * 100}%`,
                                  width: `${100 / columns}%`,
                                  height: `${100 / rows}%`,
                                }}
                              />
                            )),
                          )}
                        </div>
                      );
                    })()}

                  <div
                    className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize bg-blue-500"
                    onMouseDown={(e) => handleSectorResize(sector.id, 'bottom-right', e)}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize bg-blue-500"
                    onMouseDown={(e) => handleSectorResize(sector.id, 'bottom-left', e)}
                  />
                  <div
                    className="absolute -right-1 -top-1 h-3 w-3 cursor-ne-resize bg-blue-500"
                    onMouseDown={(e) => handleSectorResize(sector.id, 'top-right', e)}
                  />
                  <div
                    className="absolute -left-1 -top-1 h-3 w-3 cursor-nw-resize bg-blue-500"
                    onMouseDown={(e) => handleSectorResize(sector.id, 'top-left', e)}
                  />
                </div>
              ))}

              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute z-10 cursor-move select-none rounded-lg border-2 ${
                    selectedElement === element.id ? 'border-green-500' : 'border-gray-400'
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    backgroundColor: element.color + 'CC',
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                >
                  <div className="flex h-full items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-lg">{element.icon}</div>
                      <div className="text-xs font-medium">{element.name}</div>
                    </div>
                  </div>

                  <div
                    className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize bg-green-500"
                    onMouseDown={(e) => handleElementResize(element.id, 'bottom-right', e)}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize bg-green-500"
                    onMouseDown={(e) => handleElementResize(element.id, 'bottom-left', e)}
                  />
                  <div
                    className="absolute -right-1 -top-1 h-3 w-3 cursor-ne-resize bg-green-500"
                    onMouseDown={(e) => handleElementResize(element.id, 'top-right', e)}
                  />
                  <div
                    className="absolute -left-1 -top-1 h-3 w-3 cursor-nw-resize bg-green-500"
                    onMouseDown={(e) => handleElementResize(element.id, 'top-left', e)}
                  />
                </div>
              ))}

              {sectors.length === 0 && elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Plus className="mx-auto mb-2 h-8 w-8" />
                    <p>Haz clic en los elementos del panel lateral</p>
                    <p className="mt-1 text-xs">para agregarlos al canvas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="light"
              onClick={handleReset}
              startContent={<RotateCcw className="h-4 w-4" />}
            >
              Reiniciar
            </Button>
            <Button variant="light" onClick={onClose} startContent={<X className="h-4 w-4" />}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              startContent={<Save className="h-4 w-4" />}
            >
              Guardar Mapa
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
