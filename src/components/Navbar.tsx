import React, { useRef } from 'react';
import { HelpCircle, Shield, FileText } from 'lucide-react';
import { District } from '../types';

interface NavbarProps {
  districts: District[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
  onOpenGuideModal?: () => void;
  onOpenAboutModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  onOpenAboutModal,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollBy({
        left: e.deltaY > 0 ? 50 : -50,
        behavior: 'auto'
      });
    }
  };

  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 shrink-0 gap-4 xl:gap-8">
      {/* Brand */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm shrink-0">
          Г
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Интерактивная карта Гродно
            </h1>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100/80 leading-none">
              XXIX СОЗЫВ
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5 leading-none">
            Информационный портал • Паспорт территории
          </p>
        </div>
      </div>

      {/* District Switcher (Scrollable Pill List) */}
      <div className="flex-1 flex items-center overflow-hidden w-full">
        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 w-full" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2 shrink-0">
            Округа:
          </span>
          {districts.map((d) => {
            const isSelected = selectedDistrict?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDistrict(d)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
                }`}
                title={d.shortName}
              >
                №{d.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 text-sm font-medium">
        <button
          type="button"
          id="btn-about-portal"
          onClick={onOpenAboutModal}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold shadow-md shadow-blue-900/10 border border-blue-500/20"
        >
          <HelpCircle className="w-4 h-4 text-blue-100" />
          <span className="hidden sm:inline">О проекте</span>
        </button>
      </div>
    </header>
  );
};

