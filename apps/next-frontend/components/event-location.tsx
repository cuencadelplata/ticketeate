'use client';

import { useState, useEffect } from 'react';
import { MapPin, Map, Trash, Eye } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@heroui/react';
import EventMapModal, { EventSector } from './EventMapModal';

export interface EventLocationData {
  address: string;
  lat: number;
  lng: number;
  eventMap?: {
    sectors: EventSector[];
    elements?: Array<{
      id: string;
      name: string;
      type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking' | 'custom';
      icon: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
    backgroundImage?: string;
  };
}

interface EventLocationProps {
  onLocationSelect: (location: EventLocationData | null) => void;
}

const EventLocation = ({ onLocationSelect }: EventLocationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<EventLocationData | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'AR' },
    },
    debounce: 300,
  });

  const [storedRecentLocations, setStoredRecentLocations] = useState<EventLocationData[]>([]);

  const isCoordinate = (input: string) => /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(input);

  const handleSelect = async (addressOrCoords: string) => {
    setValue(addressOrCoords, false);
    clearSuggestions();

    let location: EventLocationData | null = null;
    if (isCoordinate(addressOrCoords)) {
      const [lat, lng] = addressOrCoords.split(',').map(Number);
      location = { address: addressOrCoords, lat, lng };
    } else {
      try {
        const results = await getGeocode({ address: addressOrCoords });
        const { lat, lng } = await getLatLng(results[0]);
        location = { address: addressOrCoords, lat, lng };
      } catch (error) {
        console.error('Error: ', error);
      }
    }

    if (location) {
      setSelectedLocation(location);
      onLocationSelect(location);
      setIsOpen(false);
      saveRecentLocation(location);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      if (status === 'OK' && data.length > 0) {
        handleSelect(data[0].description);
      } else {
        handleSelect(value);
      }
    }
  };

  const saveRecentLocation = (location: EventLocationData) => {
    const recents: EventLocationData[] = JSON.parse(
      localStorage.getItem('recentLocations') || '[]',
    );
    const updated = [location, ...recents.filter((loc) => loc.address !== location.address)].slice(
      0,
      5,
    );
    localStorage.setItem('recentLocations', JSON.stringify(updated));
    setStoredRecentLocations(updated);
  };

  useEffect(() => {
    const recents: EventLocationData[] = JSON.parse(
      localStorage.getItem('recentLocations') || '[]',
    );
    setStoredRecentLocations(recents);
  }, []);

  const handleMapSave = (mapData: {
    sectors: EventSector[];
    elements?: any[];
    backgroundImage?: string;
  }) => {
    if (selectedLocation) {
      const updatedLocation = {
        ...selectedLocation,
        eventMap: mapData,
      };
      setSelectedLocation(updatedLocation);
      onLocationSelect(updatedLocation);
    }
    setIsMapModalOpen(false);
  };

  const handleRemoveMap = () => {
    if (selectedLocation) {
      const updatedLocation = {
        ...selectedLocation,
        eventMap: undefined,
      };
      setSelectedLocation(updatedLocation);
      onLocationSelect(updatedLocation);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="group cursor-pointer">
            <div className="flex w-full items-start gap-2 rounded-md border bg-stone-900 bg-opacity-60 p-2 transition-colors hover:bg-stone-800/50">
              <MapPin className="mt-0.5 h-4 w-4 text-stone-400" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium text-stone-100">
                  {selectedLocation ? selectedLocation.address : 'Agregar ubicación del evento'}
                </span>
                {!selectedLocation && (
                  <span className="text-xs text-stone-400">Ubicación física o coordenada</span>
                )}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="order-0 mt-0 w-[502px] rounded-b-md border bg-stone-900 p-0">
          <div className="space-y-1 p-1">
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                disabled={!ready}
                placeholder="Busca un lugar, dirección o coordenada..."
                className="w-full bg-stone-800 text-stone-100 focus:border-stone-800 focus:outline-none focus:ring-0 focus:ring-offset-0"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>

            {status === 'OK' && (
              <Card className="absolute left-0 z-10 mt-1 w-full border-0 bg-stone-900">
                <ul className="py-2">
                  {data.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSelect(suggestion.description)}
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 text-stone-100 hover:bg-stone-800"
                    >
                      <MapPin className="h-4 w-4 text-stone-400" />
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="space-y-2">
              <h3 className="pl-1 text-xs text-stone-400">Lugares recientes</h3>
              {storedRecentLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue(location.address, false);
                    handleSelect(location.address);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left transition-colors hover:bg-stone-800"
                >
                  <MapPin className="h-4 w-4 text-stone-400" />
                  <span className="text-xs text-stone-100">{location.address}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedLocation && (
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-lg border border-stone-800">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '200px' }}
              center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              zoom={14}
              options={{
                styles: [
                  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                  {
                    featureType: 'administrative.locality',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }],
                  },
                  {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }],
                  },
                  {
                    featureType: 'poi.park',
                    elementType: 'geometry',
                    stylers: [{ color: '#263c3f' }],
                  },
                  {
                    featureType: 'poi.park',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#6b9a76' }],
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#38414e' }],
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#212a37' }],
                  },
                  {
                    featureType: 'road',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#9ca5b3' }],
                  },
                  {
                    featureType: 'road.highway',
                    elementType: 'geometry',
                    stylers: [{ color: '#746855' }],
                  },
                  {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#1f2835' }],
                  },
                  {
                    featureType: 'road.highway',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#f3d19c' }],
                  },
                  {
                    featureType: 'transit',
                    elementType: 'geometry',
                    stylers: [{ color: '#2f3948' }],
                  },
                  {
                    featureType: 'transit.station',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }],
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#17263c' }],
                  },
                  {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#515c6d' }],
                  },
                  {
                    featureType: 'water',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#17263c' }],
                  },
                ],
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              <Marker
                position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                icon={{
                  url:
                    'data:image/svg+xml;charset=UTF-8,' +
                    encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#f97316" stroke="#fff" stroke-width="3"/>
                      <circle cx="16" cy="16" r="6" fill="#fff"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 16),
                }}
              />
            </GoogleMap>
          </div>

          <div className="flex items-center">
            {!selectedLocation.eventMap ? (
              <Button
                size="sm"
                variant="faded"
                startContent={<Map className="h-4 w-4" />}
                onClick={() => setIsMapModalOpen(true)}
                className="!bg-stone-700 !bg-opacity-60 text-stone-200 hover:!bg-stone-800/50"
              >
                Crear mapa de sectores
              </Button>
            ) : (
              <div className="flex items-center">
                <Button
                  size="sm"
                  variant="faded"
                  startContent={<Map className="h-4 w-4" />}
                  onClick={() => setIsMapModalOpen(true)}
                  className="!bg-stone-700 !bg-opacity-60 text-stone-200 hover:!bg-stone-800/50"
                >
                  Editar mapa ({selectedLocation.eventMap.sectors.length} sectores)
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={handleRemoveMap}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            )}
          </div>

          {selectedLocation.eventMap && (
            <div className="rounded-lg border border-stone-800 bg-stone-900/30 p-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-stone-400" />
                  <span className="text-sm font-medium text-stone-200">Vista previa del mapa</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>{selectedLocation.eventMap.sectors.length} sectores</span>
                  {selectedLocation.eventMap.elements && (
                    <span>{selectedLocation.eventMap.elements.length} elementos</span>
                  )}
                  {selectedLocation.eventMap.sectors.reduce(
                    (total, sector) => total + (sector.capacity || 0),
                    0,
                  ) > 0 && (
                    <span>
                      {selectedLocation.eventMap.sectors.reduce(
                        (total, sector) => total + (sector.capacity || 0),
                        0,
                      )}{' '}
                      personas
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-48 w-full overflow-hidden rounded border border-stone-700">
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <pattern
                        id="preview-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#666" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-grid)" />
                  </svg>
                </div>

                {selectedLocation.eventMap.backgroundImage ? (
                  <img
                    src={selectedLocation.eventMap.backgroundImage}
                    alt="Mapa del evento"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-800/50">
                    <span className="text-xs text-stone-400">Sin imagen de fondo</span>
                  </div>
                )}
                {selectedLocation.eventMap.sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="absolute border-2 border-white/70 text-xs font-medium text-white shadow-sm"
                    style={{
                      left: `${(sector.x / 800) * 100}%`,
                      top: `${((sector.y + 90) / 600) * 100}%`, // Mover 40px más abajo para centrar
                      width: `${(sector.width / 800) * 100}%`,
                      height: `${(sector.height / 600) * 100}%`,
                      backgroundColor: sector.color + 'DD',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="px-1 text-center">
                      <div className="font-semibold">{sector.name}</div>
                      {sector.capacity && (
                        <div className="text-xs opacity-80">{sector.capacity} personas</div>
                      )}
                    </div>
                  </div>
                ))}
                {selectedLocation.eventMap.elements?.map((element) => (
                  <div
                    key={element.id}
                    className="absolute rounded border-2 border-white/70 text-xs font-medium text-white shadow-sm"
                    style={{
                      left: `${(element.x / 800) * 100}%`,
                      top: `${((element.y + 90) / 600) * 100}%`, // Mover 40px más abajo para centrar
                      width: `${(element.width / 800) * 100}%`,
                      height: `${(element.height / 600) * 100}%`,
                      backgroundColor: element.color + 'DD',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="px-1 text-center">
                      <div className="text-xs">{element.icon}</div>
                      <div className="text-xs font-semibold">{element.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <EventMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSave={handleMapSave}
        initialMapData={selectedLocation?.eventMap}
      />
    </>
  );
};

export default EventLocation;
