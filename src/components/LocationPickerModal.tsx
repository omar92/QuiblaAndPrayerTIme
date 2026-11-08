import React, { useState } from 'react';
import { POPULAR_CITIES, CityLocation } from '../utils/cities';
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Globe2,
  Navigation,
} from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLng: number;
  currentLocationName: string;
  onSelectLocation: (loc: { name: string; latitude: number; longitude: number }) => void;
  onUseGps: () => void;
  isGpsLoading: boolean;
  gpsError: string | null;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLat,
  currentLng,
  currentLocationName,
  onSelectLocation,
  onUseGps,
  isGpsLoading,
  gpsError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customLat, setCustomLat] = useState(currentLat.toString());
  const [customLng, setCustomLng] = useState(currentLng.toString());
  const [customName, setCustomName] = useState('');
  const [showCustomCoords, setShowCustomCoords] = useState(false);

  if (!isOpen) return null;

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onSelectLocation({
        name: customName.trim() || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
        latitude: lat,
        longitude: lng,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Set Location</h3>
              <p className="text-[11px] text-slate-400">
                For accurate prayer times and Qibla compass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onUseGps}
            disabled={isGpsLoading}
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
          >
            <Crosshair className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{isGpsLoading ? 'Detecting GPS...' : 'Use My Exact Location (GPS)'}</span>
          </button>

          {gpsError && (
            <p className="text-[11px] text-amber-400 text-center mt-2">
              {gpsError}
            </p>
          )}
        </div>

        {/* City Search Bar */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search worldwide city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* City List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40 flex-1 no-scrollbar">
          {filteredCities.map((city: CityLocation) => {
            const isSelected =
              currentLocationName.toLowerCase().includes(city.name.toLowerCase()) ||
              (Math.abs(currentLat - city.latitude) < 0.05 &&
                Math.abs(currentLng - city.longitude) < 0.05);

            return (
              <button
                key={`${city.name}-${city.country}`}
                onClick={() => {
                  onSelectLocation({
                    name: `${city.name}, ${city.country}`,
                    latitude: city.latitude,
                    longitude: city.longitude,
                  });
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                  isSelected
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-slate-100">
                    {city.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{city.country}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">
                    {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching city found. Use custom coordinates below.
            </div>
          )}
        </div>

        {/* Custom Coordinates Collapsible Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          {!showCustomCoords ? (
            <button
              onClick={() => setShowCustomCoords(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium w-full text-center py-1"
            >
              + Enter Custom Coordinates (Lat / Lng)
            </button>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City/Area name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude (-90 to 90)"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude (-180 to 180)"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomCoords(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white"
                >
                  Set Location
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
