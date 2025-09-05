'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface EventLocationData {
  address: string;
  lat: number;
  lng: number;
}

interface EventLocationProps {
  onLocationSelect: (location: EventLocationData | null) => void;
}

const EventLocation = ({ onLocationSelect }: EventLocationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<EventLocationData | null>(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['address'],
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
        <PopoverContent className="order-0 mt-0 w-[535px] rounded-b-md border bg-stone-900 p-0">
          <div className="space-y-2 p-2">
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                disabled={!ready}
                placeholder="Ingresa ubicación o coordenadas (ej: -34.6037, -58.3816)"
                className="w-full border-0 bg-stone-800 text-stone-100 placeholder-stone-400"
              />
              <MapPin className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-stone-400" />
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
              <h3 className="pl-1 text-sm text-stone-400">Ubicaciones recientes</h3>
              {storedRecentLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue(location.address, false);
                    handleSelect(location.address);
                  }}
                  className="flex w-full items-center gap-2 rounded px-4 py-2 text-left transition-colors hover:bg-stone-800"
                >
                  <MapPin className="h-4 w-4 text-stone-400" />
                  <span className="text-sm text-stone-100">{location.address}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedLocation && (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-800">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '200px' }}
            center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            zoom={14}
            options={{
              styles: [
                {
                  featureType: 'all',
                  elementType: 'all',
                  stylers: [
                    { invert_lightness: true },
                    { saturation: 10 },
                    { lightness: 30 },
                    { gamma: 0.5 },
                    { hue: '#00ff00' },
                  ],
                },
              ],
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <Marker
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
          </GoogleMap>
        </div>
      )}
    </>
  );
};

export default EventLocation;
