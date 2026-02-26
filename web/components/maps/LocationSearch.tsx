"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Loader2, AlertTriangle } from "lucide-react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface LocationSearchProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  initialValue?: string;
  autoDetect?: boolean;
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Enter location...", 
  initialValue = "",
  autoDetect = false
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [apiError, setApiError] = useState(false);
  
  const placesLib = useMapsLibrary("places");
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!placesLib) return;
    setAutocompleteService(new placesLib.AutocompleteService());
    // PlacesService needs a dummy element
    setPlacesService(new placesLib.PlacesService(document.createElement("div")));
  }, [placesLib]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!autocompleteService) {
      setApiError(true);
      return;
    }

    try {
        autocompleteService.getPlacePredictions(
          { input: value, componentRestrictions: { country: "br" } },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setApiError(false);
            } else {
              setApiError(true);
            }
          }
        );
    } catch (err) {
        setApiError(true);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    if (!placesService) return;

    setLoading(true);
    placesService.getDetails(
      { placeId: suggestion.place_id, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || suggestion.description;
          setInputValue(address);
          setSuggestions([]);
          onLocationSelect(address, lat, lng);
        }
      }
    );
  };

  const detectLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode if API available
          if (placesLib && google.maps.Geocoder) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              setLoading(false);
              if (status === "OK" && results?.[0]) {
                const address = results[0].formatted_address;
                setInputValue(address);
                onLocationSelect(address, lat, lng);
              } else {
                onLocationSelect("Current Location", lat, lng);
              }
            });
          } else {
            setLoading(false);
            setInputValue("Current Location Detected");
            onLocationSelect("Current Location", lat, lng);
          }
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLoading(false);
    }
  };

  // Manual fallback if API is dead
  const handleManualEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.length > 5) {
        // Fallback: Use dummy coords/SP center if API is failing but user typed a real address
        onLocationSelect(inputValue, -23.561414, -46.655881);
        setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-1 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
        <Search className="h-4 w-4 text-primary" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleManualEnter}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none py-3 text-sm w-full font-bold text-white placeholder:text-white/20"
        />
        <button 
          onClick={detectLocation}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Navigation className="h-4 w-4 text-primary" />
          )}
        </button>
      </div>

      {apiError && (
        <div className="mt-2 flex items-start gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <AlertTriangle className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-500/80 leading-tight">
                Google Maps API not activated yet. <br/> Press ENTER to use manual address.
            </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A3D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelectSuggestion(s)}
              className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-start gap-3 border-b border-white/5 last:border-0"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{s.structured_formatting.main_text}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{s.structured_formatting.secondary_text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
