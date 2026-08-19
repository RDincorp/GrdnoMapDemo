import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, User, Building2, Layers, X, Locate, Sparkles, ArrowRight } from 'lucide-react';
import { District, Deputy, Institution, SearchResult } from '../types';
import { searchEverything } from '../utils/geoUtils';

interface SmartSearchProps {
  districts: District[];
  deputies: Deputy[];
  institutions: Institution[];
  onSelectResult: (result: SearchResult) => void;
  onTriggerGeolocation: () => void;
  isLocating: boolean;
  selectedDistrict: District | null;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  districts,
  deputies,
  institutions,
  onSelectResult,
  onTriggerGeolocation,
  isLocating,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = searchEverything(query, districts, deputies, institutions);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelectResult(result);
    setQuery(result.title);
    setIsOpen(false);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'address':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'deputy':
        return <User className="w-4 h-4 text-emerald-600" />;
      case 'district':
        return <Layers className="w-4 h-4 text-purple-600" />;
      case 'institution':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeClass = (type: SearchResult['type']) => {
    switch (type) {
      case 'address':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'deputy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'district':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'institution':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getBadgeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'address':
        return 'Адрес & Округ';
      case 'deputy':
        return 'Депутат';
      case 'district':
        return 'Округ';
      case 'institution':
        return 'Госорган';
    }
  };

  return (
    <div className="w-full relative z-30">
      {/* Search Input Bar - High Density */}
      <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-xl shadow-md border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
        <div className="pl-4 text-blue-600">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="smart-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Поиск адреса, улицы, депутата..."
          className="w-full py-3.5 px-3 text-[15px] font-medium text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="pr-1.5 flex items-center pl-1">
          <button
            type="button"
            id="btn-search-locate"
            onClick={onTriggerGeolocation}
            disabled={isLocating}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition active:scale-95 disabled:opacity-50"
            title="Определить мой округ по GPS"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown - High Density Intelligent Suggestions */}
      {isOpen && query.trim().length >= 3 && (
        <div
          ref={dropdownRef}
          id="search-autocomplete-dropdown"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-100 z-50"
        >
          {results.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Умные подсказки: адреса и ответственные депутаты ({results.length})
                </span>
                <span className="text-slate-400 font-normal">Enter / клик для выбора</span>
              </div>
              {results.map((result, idx) => {
                const isSelected = idx === selectedIndex;
                const isAddress = result.type === 'address';
                const deputy = result.deputy;
                const district = result.district;

                return (
                  <div
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 cursor-pointer transition flex flex-col gap-2 ${
                      isSelected ? 'bg-blue-50/95 text-blue-950 ring-1 ring-inset ring-blue-300' : 'hover:bg-slate-50/90 text-slate-800'
                    }`}
                  >
                    {/* Top Row: Address / Main Title */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {result.title}
                        </div>
                        {district && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                            Округ №{district.number}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getBadgeClass(
                          result.type
                        )}`}
                      >
                        {getBadgeLabel(result.type)}
                      </span>
                    </div>

                    {/* Rich Deputy Mini-Card for Address Matches (No Photos) */}
                    {isAddress && deputy && (
                      <div className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-slate-200 shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
                            <span>Депутат округа:</span>
                            <span className="font-extrabold text-slate-900 text-xs">
                              {deputy.fullName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5">
                            {deputy.mainJob}
                          </div>
                          {deputy.receptionSchedules[0] && (
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <span className="font-medium text-slate-700">Прием:</span>
                              <span className="truncate">{deputy.receptionSchedules[0].frequency}, {deputy.receptionSchedules[0].address}</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                    )}

                    {/* Direct Deputy result (No Photos) */}
                    {result.type === 'deputy' && deputy && (
                      <div className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-slate-200 shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-900">
                            {deputy.fullName}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5">
                            {deputy.mainJob}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            {district?.name || 'Округ'}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                    )}

                    {/* Highlight / Status & Typo Note */}
                    {result.highlightText && (
                      <div
                        className={`text-[11px] px-2 py-1 rounded font-medium flex items-center justify-between ${
                          result.didYouMean
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : result.houseStatus === 'out_of_range'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-blue-50/80 text-blue-900'
                        }`}
                      >
                        <span>{result.highlightText}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-slate-500 space-y-1">
              <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-4 h-4" />
              </div>
              <p className="font-bold text-slate-800 text-xs">Ничего не найдено по запросу «{query}»</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Введите название улицы или номер дома для поиска ответственного депутата и округа.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
