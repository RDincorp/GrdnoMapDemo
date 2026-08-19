import React, { useState } from 'react';
import { DISTRICTS_DATA, DEPUTIES_DATA, INSTITUTIONS_DATA } from './data/mockData';
import { District, Deputy, Institution, ReceptionScheduleItem, SearchResult } from './types';
import { findDistrictByCoordinates } from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { SmartSearch } from './components/SmartSearch';
import { GisMap } from './components/GisMap';
import { TerritoryPassport } from './components/TerritoryPassport';
import { CitizenGuideModal } from './components/CitizenGuideModal';
import { AboutModal } from './components/AboutModal';
import { MapPin, CheckCircle, AlertCircle, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export default function App() {
  // Application Data States
  const [districts] = useState<District[]>(DISTRICTS_DATA);
  const [deputies] = useState<Deputy[]>(DEPUTIES_DATA);
  const [institutions] = useState<Institution[]>(INSTITUTIONS_DATA);

  // Active Selection States
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(districts[0]); // Default to District 3 (Доваторский)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedReception, setSelectedReception] = useState<ReceptionScheduleItem | null>(null);

  // Geolocation & UI States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>({
    text: 'Добро пожаловать! Выберите объект на карте или введите адрес в строке поиска.',
    type: 'info',
  });

  // Modals & UI States
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(true);
  const [searchedLocation, setSearchedLocation] = useState<{
    coordinates: [number, number];
    title: string;
    subtitle?: string;
  } | null>(null);

  // Find active deputy corresponding to selected district
  const activeDeputy = selectedDistrict
    ? deputies.find((d) => d.id === selectedDistrict.deputyId) || null
    : null;

  // Search Result Selection Handler
  const handleSelectSearchResult = (result: SearchResult) => {
    if (result.type === 'address' || result.type === 'district') {
      const dist = result.district || districts.find((d) => d.id === result.districtId);
      if (dist) {
        setSelectedDistrict(dist);
        setSelectedInstitution(null);
        setSelectedReception(null);
        setMobileDrawerOpen(true);

        if (result.coordinates) {
          setSearchedLocation({
            coordinates: result.coordinates,
            title: result.title,
            subtitle: result.subtitle,
          });
        } else {
          setSearchedLocation(null);
        }

        const dep = result.deputy || deputies.find((d) => d.id === dist.deputyId);
        showToast(
          `Адрес: ${result.title} • Депутат: ${dep?.fullName || '—'} (${dist.shortName})`,
          'success'
        );
      }
    } else if (result.type === 'deputy') {
      setSearchedLocation(null);
      const dep = result.deputy || deputies.find((d) => d.id === result.deputyId);
      if (dep) {
        const dist = result.district || districts.find((d) => d.id === dep.districtId);
        if (dist) {
          setSelectedDistrict(dist);
          setSelectedInstitution(null);
          setSelectedReception(null);
          setMobileDrawerOpen(true);
          showToast(`Депутат: ${dep.fullName} (${dist.shortName})`, 'success');
        }
      }
    } else if (result.type === 'institution') {
      setSearchedLocation(null);
      const inst = result.institution || institutions.find((i) => i.id === result.institutionId);
      if (inst) {
        setSelectedInstitution(inst);
        setSelectedDistrict(null);
        setSelectedReception(null);
        setMobileDrawerOpen(true);
        showToast(`Орган власти: ${inst.name}`, 'info');
      }
    }
  };

  // Direct Map Polygon Selection
  const handleSelectDistrict = (district: District) => {
    setSearchedLocation(null);
    setSelectedDistrict(district);
    setSelectedInstitution(null);
    setSelectedReception(null);
    setMobileDrawerOpen(true);
    const deputy = deputies.find((d) => d.id === district.deputyId);
    showToast(`Выбран ${district.shortName} • Депутат: ${deputy?.shortName || '—'}`, 'info');
  };

  // Direct Map Institution Marker Selection
  const handleSelectInstitution = (institution: Institution) => {
    setSearchedLocation(null);
    setSelectedInstitution(institution);
    setSelectedDistrict(null);
    setSelectedReception(null);
    setMobileDrawerOpen(true);
    showToast(`Орган власти: ${institution.shortName}`, 'info');
  };

  // Direct Map Reception Marker Selection
  const handleSelectReception = (
    reception: ReceptionScheduleItem,
    deputy: Deputy,
    district: District
  ) => {
    setSearchedLocation(null);
    setSelectedDistrict(district);
    setSelectedReception(reception);
    setSelectedInstitution(null);
    setMobileDrawerOpen(true);
    showToast(`Приемная депутата ${deputy.shortName}: ${reception.locationName}`, 'info');
  };

  // Geolocation Handler
  const handleTriggerGeolocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      // Fallback for simulation in environments where browser geolocation is unavailable
      simulateDemoGeolocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const coords: [number, number] = [userLat, userLng];
        setUserLocation(coords);
        setIsLocating(false);

        // Check if inside any Grodno district
        const matchedDist = findDistrictByCoordinates(coords, districts);
        if (matchedDist) {
          setSelectedDistrict(matchedDist);
          setSelectedInstitution(null);
          setMobileDrawerOpen(true);
          const dep = deputies.find((d) => d.id === matchedDist.deputyId);
          showToast(
            `GPS геолокация: Вы находитесь в ${matchedDist.shortName}! Депутат: ${dep?.fullName}`,
            'success'
          );
        } else {
          // If the user's real location is outside Grodno (e.g. other city/country in cloud sandbox)
          simulateDemoGeolocation(
            'Ваше текущее местоположение вне г. Гродно. Демонстрация установлена на точку в Округе №3 (БЛК / ул. Доватора).'
          );
        }
      },
      (error) => {
        setIsLocating(false);
        simulateDemoGeolocation(
          'Геолокация недоступна. Демонстрация установлена на тестовую точку в Округе №3 (ул. Пушкина).'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Simulation fallback for smooth testing in any sandbox
  const simulateDemoGeolocation = (customMessage?: string) => {
    setIsLocating(false);
    // Point on Pushkina st. in District 3
    const demoPoint: [number, number] = [53.6940, 23.8290];
    setUserLocation(demoPoint);
    const targetDistrict = districts.find((d) => d.id === 'district-3') || districts[0];
    setSelectedDistrict(targetDistrict);
    setSelectedInstitution(null);
    setMobileDrawerOpen(true);
    const dep = deputies.find((d) => d.id === targetDistrict.deputyId);
    showToast(
      customMessage || `Геолокация определена: ${targetDistrict.shortName} • Депутат: ${dep?.fullName}`,
      'success'
    );
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 6000);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-['Noto_Sans',sans-serif]">
      {/* Top High Density Header */}
      <Navbar
        districts={districts}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={handleSelectDistrict}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenAboutModal={() => setAboutModalOpen(true)}
      />

      {/* Main High Density Workspace */}
      <main className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden relative">
        {/* Left Panel: Territory Passport (w-[380px] - w-[420px]) */}
        <div
          className={`w-full lg:w-[400px] xl:w-[430px] h-[50vh] lg:h-full shrink-0 bg-white border-r border-slate-200 shadow-sm z-20 flex flex-col transition-all duration-200 ${
            mobileDrawerOpen ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Mobile Drawer Toggle handle */}
          <div className="lg:hidden p-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Паспорт территории</span>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-1 rounded bg-white shadow-2xs"
            >
              {mobileDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          <TerritoryPassport
            district={selectedDistrict}
            deputy={activeDeputy}
            institution={selectedInstitution}
            selectedReception={selectedReception}
            allDistricts={districts}
            allInstitutions={institutions}
            onSelectDistrict={handleSelectDistrict}
            onSelectInstitution={handleSelectInstitution}
            onSelectReception={handleSelectReception}
            onOpenGuideModal={() => setGuideModalOpen(true)}
          />
        </div>

        {/* Right Panel: Interactive GIS Map & Floating Smart Search */}
        <div className="flex-1 relative h-[50vh] lg:h-full flex flex-col overflow-hidden bg-slate-200">
          {/* Floating High Density Smart Search Bar */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[420px] z-30 pointer-events-auto shadow-md rounded-xl">
            <SmartSearch
              districts={districts}
              deputies={deputies}
              institutions={institutions}
              onSelectResult={handleSelectSearchResult}
              onTriggerGeolocation={handleTriggerGeolocation}
              isLocating={isLocating}
              selectedDistrict={selectedDistrict}
            />
          </div>

          {/* Interactive Leaflet GIS Map Engine */}
          <div className="flex-1 w-full h-full relative">
            <GisMap
              districts={districts}
              deputies={deputies}
              institutions={institutions}
              selectedDistrict={selectedDistrict}
              selectedInstitution={selectedInstitution}
              selectedReception={selectedReception}
              searchedLocation={searchedLocation}
              userLocation={userLocation}
              onSelectDistrict={handleSelectDistrict}
              onSelectInstitution={handleSelectInstitution}
              onSelectReception={handleSelectReception}
              onTriggerGeolocation={handleTriggerGeolocation}
              isLocating={isLocating}
            />
          </div>

          {/* Floating Toast */}
          {toastMessage && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div
                className={`p-3 rounded-lg shadow-xl border flex items-start gap-2.5 text-xs ${
                  toastMessage.type === 'success'
                    ? 'bg-slate-900 text-emerald-300 border-emerald-700/60'
                    : toastMessage.type === 'warn'
                    ? 'bg-slate-900 text-amber-300 border-amber-700/60'
                    : 'bg-slate-900 text-slate-100 border-slate-700'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed text-[11px]">{toastMessage.text}</div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* High Density Official Civic Footer */}
      <footer className="h-9 bg-slate-900 flex items-center justify-between px-4 sm:px-6 text-[10px] text-slate-400 shrink-0 border-t border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <span>&copy; 2024 Информационный портал</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-500">Гродненский городской Совет депутатов XXIX созыва</span>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-widest text-[9px] font-semibold">
          <button
            type="button"
            onClick={() => setGuideModalOpen(true)}
            className="hover:text-blue-400 transition"
          >
            Электронные обращения
          </button>
          <button
            type="button"
            onClick={() => setAboutModalOpen(true)}
            className="hover:text-blue-400 transition hidden sm:inline"
          >
            Контакты и регламент
          </button>
        </div>
      </footer>

      {/* Modals */}
      <CitizenGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        deputyName={activeDeputy?.fullName}
        districtName={selectedDistrict?.name}
      />

      <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
    </div>
  );
}
