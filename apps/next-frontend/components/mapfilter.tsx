import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

export default function LocationPicker() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      // Simulación de API de autocompletado (reemplázala con Mapbox o Google Places)
      const mockSuggestions: Location[] = [
        { name: 'Plaza Mayor, Madrid', lat: 40.4154, lng: -3.7074 },
        { name: 'Sagrada Familia, Barcelona', lat: 41.4036, lng: 2.1744 },
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectLocation = (place: Location) => {
    setLocation(place);
    setQuery(place.name);
    setSuggestions([]);
  };

  return (
    <div>
      <Label htmlFor="location" className="text-zinc-200">
        Ubicación
      </Label>
      <div
        className="relative cursor-pointer rounded-md border-[#2a2a2a] bg-[#1a1a1a] p-2 text-zinc-200"
        onClick={() => setShowSearch(!showSearch)}
      >
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <Input
          id="location"
          className="border-[#2a2a2a] bg-[#1a1a1a] pl-9 text-zinc-200"
          placeholder="Ubicación física o coordenadas"
          value={query}
          onChange={handleInputChange}
        />
      </div>
      {showSearch && suggestions.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full max-w-md border-[#2a2a2a] bg-[#1a1a1a] p-2 text-zinc-200">
          {suggestions.map((place, index) => (
            <div
              key={index}
              className="cursor-pointer p-2 hover:bg-[#2a2a2a]"
              onClick={() => handleSelectLocation(place)}
            >
              {place.name}
            </div>
          ))}
        </Card>
      )}
      {location && (
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          className="mt-3 h-48 w-full rounded-md"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[location.lat, location.lng]} />
        </MapContainer>
      )}
    </div>
  );
}
