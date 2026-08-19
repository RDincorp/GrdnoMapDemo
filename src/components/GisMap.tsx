import React, { useEffect, useRef, useState } from 'react';
import { load } from '@2gis/mapgl';
import { District, Deputy, Institution, ReceptionScheduleItem } from '../types';
import { GRODNO_MAP_CONFIG } from '../data/mockData';
import { Layers, Locate, Maximize2, Building2, Check } from 'lucide-react';

interface GisMapProps {
  districts: District[];
  deputies: Deputy[];
  institutions: Institution[];
  selectedDistrict: District | null;
  selectedInstitution: Institution | null;
  selectedReception: ReceptionScheduleItem | null;
  searchedLocation?: { coordinates: [number, number]; title: string; subtitle?: string } | null;
  userLocation: [number, number] | null;
  onSelectDistrict: (district: District) => void;
  onSelectInstitution: (institution: Institution) => void;
  onSelectReception: (reception: ReceptionScheduleItem, deputy: Deputy, district: District) => void;
  onTriggerGeolocation: () => void;
  isLocating: boolean;
}

export const GisMap: React.FC<GisMapProps> = ({
  districts,
  deputies,
  institutions,
  selectedDistrict,
  selectedInstitution,
  selectedReception,
  searchedLocation,
  userLocation,
  onSelectDistrict,
  onSelectInstitution,
  onSelectReception,
  onTriggerGeolocation,
  isLocating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // mapglAPI.Map
  const mapglApiRef = useRef<any>(null); // mapglAPI reference
  const markersRef = useRef<any[]>([]); // To store created markers
  const userMarkerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);

  // Layer Visibility Toggles
  const [showReceptions, setShowReceptions] = useState<boolean>(true);
  const [showInstitutions, setShowInstitutions] = useState<boolean>(true);

  // Helper to convert internal [lat, lng] to 2GIS [lon, lat]
  const toMapGLCoords = (coords: [number, number]): [number, number] => [coords[1], coords[0]];

  // Initialize Map
  useEffect(() => {
    let map: any;

    load().then((mapglAPI) => {
      if (!mapContainerRef.current) return;
      
      mapglApiRef.current = mapglAPI;

      map = new mapglAPI.Map(mapContainerRef.current, {
        center: toMapGLCoords(GRODNO_MAP_CONFIG.defaultCenter),
        zoom: GRODNO_MAP_CONFIG.defaultZoom,
        key: 'a1893935-6834-4445-8d76-13a40e41f4b2',
        zoomControl: false,
      });
      
      mapInstanceRef.current = map;
    });

    return () => {
      if (map) {
        map.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Markers (Receptions & Institutions)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapglApiRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.destroy());
    markersRef.current = [];

    // 1. Institutions Markers
    if (showInstitutions) {
      institutions.forEach((inst) => {
        const isSelected = selectedInstitution?.id === inst.id;
        const iconHtml = `
          <div class="relative group cursor-pointer" style="pointer-events: auto;">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-md border-2 transition-transform transform ${
              isSelected
                ? 'bg-blue-600 border-white text-white scale-125 shadow-blue-500/50'
                : 'bg-white border-blue-600 text-blue-700 hover:scale-110'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            </div>
            <div class="custom-map-hover-label absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              ${inst.shortName}
            </div>
          </div>
        `;

        const marker = new mapglApiRef.current.HtmlMarker(mapInstanceRef.current, {
          coordinates: toMapGLCoords(inst.coordinates),
          html: iconHtml,
        });

        // Add click listener
        marker.getContent().addEventListener('click', () => onSelectInstitution(inst));
        
        markersRef.current.push(marker);
      });
    }

    // 2. Deputy Public Reception Points Markers
    if (showReceptions) {
      districts.forEach((district) => {
        const deputy = deputies.find((d) => d.id === district.deputyId);
        if (!deputy) return;

        deputy.receptionSchedules.forEach((schedule) => {
          const isSelected = selectedReception?.id === schedule.id;
          const iconHtml = `
            <div class="relative group cursor-pointer" style="pointer-events: auto;">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 transition-transform transform ${
                isSelected
                  ? 'bg-amber-500 border-white text-white scale-125 shadow-amber-500/50'
                  : 'bg-white border-amber-500 text-amber-600 hover:scale-110'
              }">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="custom-map-hover-label absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                Приемная депутата: ${deputy.shortName}
              </div>
            </div>
          `;

          const marker = new mapglApiRef.current.HtmlMarker(mapInstanceRef.current, {
            coordinates: toMapGLCoords(schedule.coordinates),
            html: iconHtml,
          });

          marker.getContent().addEventListener('click', () => onSelectReception(schedule, deputy, district));
          markersRef.current.push(marker);
        });
      });
    }
  }, [
    districts,
    deputies,
    institutions,
    selectedInstitution,
    selectedReception,
    showInstitutions,
    showReceptions,
    onSelectInstitution,
    onSelectReception,
  ]);

  // Render User Location Geolocation Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !mapglApiRef.current) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setCoordinates(toMapGLCoords(userLocation));
      } else {
        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `;
        userMarkerRef.current = new mapglApiRef.current.HtmlMarker(mapInstanceRef.current, {
          coordinates: toMapGLCoords(userLocation),
          html: iconHtml,
        });
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.destroy();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Render Searched Address/Location Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !mapglApiRef.current) return;

    if (searchedLocation) {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setCoordinates(toMapGLCoords(searchedLocation.coordinates));
      } else {
        const iconHtml = `
          <div class="relative flex items-center justify-center" style="transform: translate(0, -50%);">
            <div class="absolute -top-1 w-9 h-9 bg-rose-500/30 rounded-full animate-ping"></div>
            <div class="w-8 h-8 bg-rose-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white z-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `;
        
        searchMarkerRef.current = new mapglApiRef.current.HtmlMarker(mapInstanceRef.current, {
          coordinates: toMapGLCoords(searchedLocation.coordinates),
          html: iconHtml,
        });
      }

      // Center map on searched location
      mapInstanceRef.current.setCenter(toMapGLCoords(searchedLocation.coordinates), { duration: 800 });
      mapInstanceRef.current.setZoom(16, { duration: 800 });
    } else if (searchMarkerRef.current) {
      searchMarkerRef.current.destroy();
      searchMarkerRef.current = null;
    }
  }, [searchedLocation]);

  // Center/Fly to Selected District or Element
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (searchedLocation) {
        mapInstanceRef.current.setCenter(toMapGLCoords(searchedLocation.coordinates), { duration: 800 });
        mapInstanceRef.current.setZoom(16, { duration: 800 });
    } else if (selectedReception) {
        mapInstanceRef.current.setCenter(toMapGLCoords(selectedReception.coordinates), { duration: 800 });
        mapInstanceRef.current.setZoom(16, { duration: 800 });
    } else if (selectedInstitution) {
        mapInstanceRef.current.setCenter(toMapGLCoords(selectedInstitution.coordinates), { duration: 800 });
        mapInstanceRef.current.setZoom(16, { duration: 800 });
    } else if (selectedDistrict) {
        mapInstanceRef.current.setCenter(toMapGLCoords(selectedDistrict.center), { duration: 800 });
        mapInstanceRef.current.setZoom(14.5, { duration: 800 });
    }
  }, [selectedDistrict, selectedInstitution, selectedReception, searchedLocation]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(toMapGLCoords(GRODNO_MAP_CONFIG.defaultCenter), { duration: 800 });
    mapInstanceRef.current.setZoom(GRODNO_MAP_CONFIG.defaultZoom, { duration: 800 });
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-100 overflow-hidden select-none">
      {/* Map DOM container */}
      <div id="gis-map-canvas" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* High Density Map Legend & Layer Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg border border-slate-200/80 pointer-events-auto min-w-[220px]">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-600" />
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
            Слои карты
          </h4>
        </div>
        
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={showReceptions}
                onChange={(e) => setShowReceptions(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded-md border-2 border-slate-300 peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-colors"></div>
              <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              Места приёма
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={showInstitutions}
                onChange={(e) => setShowInstitutions(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-colors"></div>
              <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
              Органы власти
            </span>
          </label>
        </div>
      </div>

      {/* Floating Action Controls (Bottom Right Circular Buttons) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1, { duration: 300 });
            }
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition text-lg border border-slate-100"
          title="Приблизить"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1, { duration: 300 });
            }
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition text-lg border border-slate-100"
          title="Отдалить"
        >
          -
        </button>
        <button
          type="button"
          id="btn-map-locate-me"
          onClick={onTriggerGeolocation}
          disabled={isLocating}
          className="w-10 h-10 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          title="Определить мой избирательный округ по GPS"
        >
          <Locate className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          id="btn-map-reset-view"
          onClick={handleResetView}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition border border-slate-100"
          title="Сбросить вид к общему плану г. Гродно"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Banner at Bottom Left */}
      <div className="absolute bottom-6 left-4 z-20 bg-white/95 backdrop-blur px-3 py-1.5 rounded-md shadow border border-slate-200 text-[11px] text-slate-600 flex items-center gap-3">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">г. Гродно</span>
        <div className="h-3 w-px bg-slate-300"></div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="font-medium text-slate-700">Ленинский район</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="font-medium text-slate-700">Октябрьский район</span>
        </div>
      </div>
    </div>
  );
};
