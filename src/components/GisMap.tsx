import React, { useEffect, useState, useRef, useCallback } from 'react';
import { District, Deputy, Institution, ReceptionScheduleItem } from '../types';
import { GRODNO_MAP_CONFIG } from '../data/mockData';
import { isValidLatLng } from '../utils/geoUtils';
import { Layers, Locate, Maximize2, Check, Compass, Sparkles, ChevronDown } from 'lucide-react';

// Declaration for Yandex Maps 2.1 global
declare global {
  interface Window {
    ymaps?: any;
  }
}

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'yandex#map' | 'yandex#satellite' | 'yandex#hybrid'>('yandex#map');

  // Layer toggles
  const [showReceptions, setShowReceptions] = useState<boolean>(true);
  const [showInstitutions, setShowInstitutions] = useState<boolean>(true);
  const [showParties, setShowParties] = useState<boolean>(true);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const layersDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close layers dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layersDropdownRef.current && !layersDropdownRef.current.contains(event.target as Node)) {
        setIsLayersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // GeoObject collections refs
  const institutionsGroupRef = useRef<any>(null);
  const partiesGroupRef = useRef<any>(null);
  const receptionsGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);

  // Initialize Yandex Map
  useEffect(() => {
    let isCancelled = false;

    const initYandexMap = () => {
      if (!window.ymaps || !mapContainerRef.current || mapInstanceRef.current) return;

      window.ymaps.ready(() => {
        if (isCancelled || !mapContainerRef.current || mapInstanceRef.current) return;

        try {
          const map = new window.ymaps.Map(
            mapContainerRef.current,
            {
              center: GRODNO_MAP_CONFIG.defaultCenter,
              zoom: GRODNO_MAP_CONFIG.defaultZoom,
              type: mapType,
              controls: [], // Using modern custom UI overlay
              behaviors: ['drag', 'scrollZoom', 'dblClickZoom', 'multiTouch'],
            },
            {
              suppressMapOpenBlock: true,
              yandexMapDisablePoiInteractivity: false,
              searchControlProvider: 'yandex#search',
            }
          );

          // Groups for collections
          const instGroup = new window.ymaps.GeoObjectCollection({}, {});
          const partyGroup = new window.ymaps.GeoObjectCollection({}, {});
          const recGroup = new window.ymaps.GeoObjectCollection({}, {});

          map.geoObjects.add(instGroup);
          map.geoObjects.add(partyGroup);
          map.geoObjects.add(recGroup);

          institutionsGroupRef.current = instGroup;
          partiesGroupRef.current = partyGroup;
          receptionsGroupRef.current = recGroup;
          mapInstanceRef.current = map;

          setIsMapReady(true);
        } catch (e) {
          console.error('Yandex Maps initialization error:', e);
        }
      });
    };

    if (window.ymaps) {
      initYandexMap();
    } else {
      // Fallback dynamic loader if script wasn't loaded in head
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=0a59849d-20dc-4962-bc60-6716e8436d1c&lang=ru_RU';
      script.type = 'text/javascript';
      script.onload = () => initYandexMap();
      document.head.appendChild(script);
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Update Map Type (Schema / Satellite / Hybrid)
  const handleChangeMapType = (newType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid') => {
    setMapType(newType);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setType(newType);
    }
  };

  // Render Authorities Placemarks
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !institutionsGroupRef.current) return;
    const group = institutionsGroupRef.current;
    group.removeAll();

    if (!showInstitutions) return;

    const ymaps = window.ymaps;
    if (!ymaps) return;

    institutions
      .filter((inst) => inst && inst.type !== 'party' && isValidLatLng(inst.coordinates))
      .forEach((inst) => {
        const iconLayout = ymaps.templateLayoutFactory.createClass(
          `<div class="ym-custom-inst cursor-pointer group" style="position:relative; width:32px; height:32px; transform:translate(-16px, -16px);" title="${inst.shortName}">
            <div style="width:32px; height:32px; background:#2563eb; border-radius:50%; box-shadow:0 4px 12px rgba(37,99,235,0.4); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
            </div>
          </div>`
        );

        const placemark = new ymaps.Placemark(
          inst.coordinates,
          {
            hintContent: `<strong>${inst.shortName}</strong><br/>${inst.address}`,
            balloonContentHeader: `<div class="font-bold text-slate-900 text-sm">${inst.name}</div>`,
            balloonContentBody: `
              <div class="text-xs text-slate-600 mt-1 space-y-1">
                <div>📍 <strong>Адрес:</strong> ${inst.address}</div>
                ${inst.headName ? `<div>👤 <strong>Руководитель:</strong> ${inst.headName}</div>` : ''}
                ${inst.phone ? `<div>📞 <strong>Телефон:</strong> ${inst.phone}</div>` : ''}
                ${inst.workSchedule ? `<div>🕒 <strong>Режим работы:</strong> ${inst.workSchedule}</div>` : ''}
              </div>
            `,
            balloonContentFooter: `<div class="text-[10px] text-blue-600 font-semibold mt-1">Орган исполнительной власти</div>`,
          },
          {
            iconLayout: iconLayout,
            iconShape: {
              type: 'Circle',
              coordinates: [0, 0],
              radius: 16,
            },
            hideIconOnBalloonOpen: false,
          }
        );

        placemark.events.add('click', () => {
          onSelectInstitution(inst);
        });

        group.add(placemark);
      });
  }, [isMapReady, institutions, showInstitutions, onSelectInstitution]);

  // Render Party Organizations Placemarks (Dedicated Distinct Icon)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !partiesGroupRef.current) return;
    const group = partiesGroupRef.current;
    group.removeAll();

    if (!showParties) return;

    const ymaps = window.ymaps;
    if (!ymaps) return;

    institutions
      .filter((inst) => inst && inst.type === 'party' && isValidLatLng(inst.coordinates))
      .forEach((inst) => {
        // Distinct Purple/Violet badge with Waving Flag Icon
        const iconLayout = ymaps.templateLayoutFactory.createClass(
          `<div class="ym-custom-party cursor-pointer group" style="position:relative; width:32px; height:32px; transform:translate(-16px, -16px);" title="${inst.shortName}">
            <div style="width:32px; height:32px; background:#7c3aed; border-radius:50%; box-shadow:0 4px 14px rgba(124,58,237,0.45); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
          </div>`
        );

        const placemark = new ymaps.Placemark(
          inst.coordinates,
          {
            hintContent: `<strong>${inst.shortName}</strong><br/>${inst.address}`,
            balloonContentHeader: `<div class="font-bold text-slate-900 text-sm flex items-center gap-1.5"><span style="color:#7c3aed;">🚩</span> ${inst.name}</div>`,
            balloonContentBody: `
              <div class="text-xs text-slate-600 mt-1 space-y-1">
                <div>📍 <strong>Адрес:</strong> ${inst.address}</div>
                ${inst.workSchedule ? `<div>🕒 <strong>Режим работы:</strong> ${inst.workSchedule}</div>` : ''}
                ${inst.siteUrl ? `<div>🌐 <strong>Сайт:</strong> <a href="${inst.siteUrl}" target="_blank" rel="noreferrer" class="text-violet-600 font-medium underline">${inst.siteUrl}</a></div>` : ''}
              </div>
            `,
            balloonContentFooter: `<div class="text-[10px] text-violet-700 font-semibold mt-1">Политическая партия / общественное объединение</div>`,
          },
          {
            iconLayout: iconLayout,
            iconShape: {
              type: 'Circle',
              coordinates: [0, 0],
              radius: 16,
            },
            hideIconOnBalloonOpen: false,
          }
        );

        placemark.events.add('click', () => {
          onSelectInstitution(inst);
        });

        group.add(placemark);
      });
  }, [isMapReady, institutions, showParties, onSelectInstitution]);

  // Render Reception Schedules Placemarks
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !receptionsGroupRef.current) return;
    const group = receptionsGroupRef.current;
    group.removeAll();

    if (!showReceptions) return;

    const ymaps = window.ymaps;
    if (!ymaps) return;

    deputies.forEach((deputy) => {
      if (!deputy) return;
      const district = districts.find((d) => d && d.id === deputy.districtId);
      if (!district) return;

      (deputy.receptionSchedules || [])
        .filter((schedule) => schedule && isValidLatLng(schedule.coordinates))
        .forEach((schedule) => {
          const iconLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="ym-custom-rec cursor-pointer group" style="position:relative; width:32px; height:32px; transform:translate(-16px, -16px);" title="Приёмная: ${deputy.shortName}">
              <div style="width:32px; height:32px; background:#f59e0b; border-radius:50%; box-shadow:0 4px 12px rgba(245,158,11,0.4); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
            </div>`
          );

          const placemark = new ymaps.Placemark(
            schedule.coordinates,
            {
              hintContent: `<strong>Приёмная депутата: ${deputy.shortName}</strong><br/>${schedule.locationName}`,
              balloonContentHeader: `<div class="font-bold text-slate-900 text-sm">Приёмная депутата: ${deputy.fullName}</div>`,
              balloonContentBody: `
                <div class="text-xs text-slate-600 mt-1 space-y-1">
                  <div>🏛️ <strong>Округ:</strong> ${district.shortName}</div>
                  <div>📍 <strong>Адрес:</strong> ${schedule.address}</div>
                  <div>📅 <strong>График:</strong> ${schedule.frequency} ${schedule.time}</div>
                  <div>📞 <strong>Телефон:</strong> ${schedule.phone || deputy.phone}</div>
                </div>
              `,
              balloonContentFooter: `<div class="text-[10px] text-amber-600 font-semibold mt-1">Место личного приёма избирателей</div>`,
            },
            {
              iconLayout: iconLayout,
              iconShape: {
                type: 'Circle',
                coordinates: [0, 0],
                radius: 16,
              },
              hideIconOnBalloonOpen: false,
            }
          );

          placemark.events.add('click', () => {
            onSelectReception(schedule, deputy, district);
          });

          group.add(placemark);
        });
    });
  }, [isMapReady, deputies, districts, showReceptions, onSelectReception]);

  // Render User Location Pin
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const ymaps = window.ymaps;
    if (!ymaps) return;

    if (userMarkerRef.current) {
      map.geoObjects.remove(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation && isValidLatLng(userLocation)) {
      const userLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="ym-custom-user" style="position:relative; width:28px; height:28px; transform:translate(-14px, -14px);">
          <div style="width:28px; height:28px; background:#2563eb; border-radius:50%; box-shadow:0 0 0 5px rgba(37,99,235,0.25); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center;">
            <div style="width:8px; height:8px; background:white; border-radius:50%;"></div>
          </div>
        </div>`
      );

      const placemark = new ymaps.Placemark(
        userLocation,
        {
          hintContent: 'Ваше текущее местоположение',
          balloonContent: '<div class="text-xs font-semibold p-1">📍 Ваше местоположение (GPS)</div>',
        },
        {
          iconLayout: userLayout,
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],
            radius: 14,
          },
        }
      );

      map.geoObjects.add(placemark);
      userMarkerRef.current = placemark;
    }
  }, [isMapReady, userLocation]);

  // Render Searched Location Pin
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const ymaps = window.ymaps;
    if (!ymaps) return;

    if (searchMarkerRef.current) {
      map.geoObjects.remove(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    if (searchedLocation && isValidLatLng(searchedLocation.coordinates)) {
      const searchLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="ym-custom-search" style="position:relative; width:34px; height:34px; transform:translate(-17px, -17px);">
          <div style="width:34px; height:34px; background:#e11d48; border-radius:50%; box-shadow:0 4px 14px rgba(225,29,72,0.45); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>`
      );

      const placemark = new ymaps.Placemark(
        searchedLocation.coordinates,
        {
          hintContent: searchedLocation.title,
          balloonContentHeader: `<div class="font-bold text-slate-900 text-sm">${searchedLocation.title}</div>`,
          balloonContentBody: `<div class="text-xs text-slate-600">${searchedLocation.subtitle || 'Найденный адрес'}</div>`,
        },
        {
          iconLayout: searchLayout,
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],
            radius: 17,
          },
        }
      );

      map.geoObjects.add(placemark);
      searchMarkerRef.current = placemark;
    }
  }, [isMapReady, searchedLocation]);

  // Smooth Camera Centering & Animation on State Changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    try {
      if (searchedLocation && isValidLatLng(searchedLocation.coordinates)) {
        map.setCenter(searchedLocation.coordinates, 16, { duration: 600, checkZoomRange: true });
      } else if (selectedReception && isValidLatLng(selectedReception.coordinates)) {
        map.setCenter(selectedReception.coordinates, 16, { duration: 600, checkZoomRange: true });
      } else if (selectedInstitution && isValidLatLng(selectedInstitution.coordinates)) {
        map.setCenter(selectedInstitution.coordinates, 16, { duration: 600, checkZoomRange: true });
      } else if (selectedDistrict && isValidLatLng(selectedDistrict.center)) {
        map.setCenter(selectedDistrict.center, 14, { duration: 600, checkZoomRange: true });
      } else if (userLocation && isValidLatLng(userLocation)) {
        map.setCenter(userLocation, 16, { duration: 600, checkZoomRange: true });
      }
    } catch (err) {
      console.warn('Yandex Map camera animation error:', err);
    }
  }, [isMapReady, searchedLocation, selectedReception, selectedInstitution, selectedDistrict, userLocation]);

  // Viewport action handlers
  const handleResetView = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(GRODNO_MAP_CONFIG.defaultCenter, GRODNO_MAP_CONFIG.defaultZoom, {
        duration: 600,
        checkZoomRange: true,
      });
    }
  }, []);

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const curZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(curZoom + 1, { duration: 250 });
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const curZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(curZoom - 1, { duration: 250 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-100 overflow-hidden select-none">
      {/* Map Container for Yandex Maps */}
      <div ref={mapContainerRef} id="yandex-map-container" className="w-full h-full z-0" />

      {/* Top Right: Layer & Map Type Controls */}
      <div ref={layersDropdownRef} className="absolute top-4 right-4 z-[400] pointer-events-auto">
        <button
          type="button"
          id="btn-map-layers"
          onClick={() => setIsLayersOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-md font-medium text-xs transition-all active:scale-95 ${
            isLayersOpen
              ? 'bg-blue-600 text-white border-blue-700 shadow-blue-900/20'
              : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300'
          }`}
          title="Настройка отображения слоёв карты"
        >
          <Layers className={`w-4 h-4 ${isLayersOpen ? 'text-white' : 'text-blue-600'}`} />
          <span className="font-bold">Слои карты</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLayersOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
        </button>

        {/* Dropdown Menu */}
        {isLayersOpen && (
          <div className="absolute right-0 mt-2 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-200/80 min-w-[220px]">
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
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
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                  Приёмные депутатов
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
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
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                  Органы управления
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={showParties}
                    onChange={(e) => setShowParties(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded-md border-2 border-slate-300 peer-checked:border-violet-600 peer-checked:bg-violet-600 transition-colors"></div>
                  <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-xs" />
                  Партийные организации
                </span>
              </label>
            </div>

            {/* Map Type switcher buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => handleChangeMapType('yandex#map')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapType === 'yandex#map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Схема
              </button>
              <button
                type="button"
                onClick={() => handleChangeMapType('yandex#satellite')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapType === 'yandex#satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Спутник
              </button>
              <button
                type="button"
                onClick={() => handleChangeMapType('yandex#hybrid')}
                className={`px-2 py-1 rounded transition-colors ${
                  mapType === 'yandex#hybrid' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Гибрид
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Controls on Bottom Right */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={zoomIn}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition text-lg border border-slate-100"
          title="Приблизить"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition text-lg border border-slate-100"
          title="Отдалить"
        >
          -
        </button>
        <button
          type="button"
          onClick={onTriggerGeolocation}
          disabled={isLocating}
          className="w-10 h-10 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          title="Определить мой избирательный округ по GPS"
        >
          <Locate className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition border border-slate-100"
          title="Сбросить вид к общему плану г. Гродно"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
