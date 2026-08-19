import React, { useState } from 'react';
import {
  District,
  Deputy,
  Institution,
  ReceptionScheduleItem,
  CitizenProblemRoute,
} from '../types';
import {
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building2,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  ArrowUpRight,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { CITIZEN_PROBLEM_ROUTES } from '../data/mockData';

interface TerritoryPassportProps {
  district: District | null;
  deputy: Deputy | null;
  institution: Institution | null;
  selectedReception?: ReceptionScheduleItem | null;
  allDistricts: District[];
  allInstitutions: Institution[];
  onSelectDistrict: (district: District) => void;
  onSelectInstitution: (institution: Institution) => void;
  onSelectReception?: (schedule: ReceptionScheduleItem, deputy: Deputy, district: District) => void;
  onOpenGuideModal: () => void;
}

type PassportTab = 'deputy' | 'reception' | 'streets' | 'authorities' | 'navigator';

export const TerritoryPassport: React.FC<TerritoryPassportProps> = ({
  district,
  deputy,
  institution,
  selectedReception,
  allDistricts,
  allInstitutions,
  onSelectDistrict,
  onSelectInstitution,
  onSelectReception,
  onOpenGuideModal,
}) => {
  const [activeTab, setActiveTab] = useState<PassportTab>('deputy');
  const [streetFilter, setStreetFilter] = useState<string>('');
  const [streetScopeFilter, setStreetScopeFilter] = useState<'all' | 'all-houses' | 'partial'>('all');
  const [houseCheckInput, setHouseCheckInput] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<CitizenProblemRoute | null>(null);

  // If an institution was directly selected from map/search
  if (institution && !district) {
    return (
      <div className="h-full flex flex-col bg-white overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            {institution.type === 'party' ? (
              <Flag className="w-3.5 h-3.5" />
            ) : (
              <Building2 className="w-3.5 h-3.5" />
            )}
            <span>{institution.categoryTitle}</span>
          </div>
          <h2 className="text-xl font-bold leading-tight">{institution.name}</h2>
          <p className="text-slate-300 text-xs mt-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{institution.address}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key details */}
          <div className="grid grid-cols-1 gap-3">
            {(institution.headName || institution.headPosition) && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Руководитель</div>
                {institution.headName && <div className="text-sm font-bold text-slate-900 mt-0.5">{institution.headName}</div>}
                {institution.headPosition && <div className="text-xs text-slate-600">{institution.headPosition}</div>}
              </div>
            )}

            {(institution.workSchedule || institution.receptionHours || institution.hotline) && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                {institution.workSchedule && (
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Режим работы:</strong> {institution.workSchedule}
                    </span>
                  </div>
                )}
                {institution.receptionHours && (
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Личный прием:</strong> {institution.receptionHours}
                    </span>
                  </div>
                )}
                {institution.hotline && (
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Горячая линия:</strong> {institution.hotline}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Competencies */}
          {institution.competencies && institution.competencies.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Сфера компетенций и вопросов
              </h3>
              <ul className="space-y-2">
                {institution.competencies.map((comp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {institution.siteUrl && (
              <a
                href={institution.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
              >
                <span>Сайт учреждения</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {institution.phone && (
              <a
                href={`tel:${institution.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <Phone className="w-4 h-4" />
                <span>Позвонить ({institution.phone})</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no district is selected yet
  if (!district) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Выберите объект или найдите адрес</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Воспользуйтесь строкой поиска вверху или кликните по любому объекту или приёмной на карте г. Гродно.
        </p>

        <div className="mt-6 w-full space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">
            Быстрый выбор округов:
          </div>
          <div className="grid grid-cols-1 gap-2">
            {allDistricts.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDistrict(d)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {d.shortName}
                    </div>
                    <div className="text-[11px] text-slate-500">{d.districtAdministration}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filtered streets within the active district
  const allStreetsCount = district.streets.length;
  const allHousesStreetsCount = district.streets.filter((s) => s.houseType === 'all').length;
  const partialStreetsCount = allStreetsCount - allHousesStreetsCount;

  const filteredStreets = district.streets.filter((s) => {
    // 1. Text filter
    if (streetFilter) {
      const filterNorm = String(streetFilter).toLowerCase().trim();
      const matchesText =
        (s.streetName && String(s.streetName).toLowerCase().includes(filterNorm)) ||
        (s.aliases && s.aliases.some((a) => a && String(a).toLowerCase().includes(filterNorm))) ||
        (s.notes && String(s.notes).toLowerCase().includes(filterNorm));
      if (!matchesText) return false;
    }

    // 2. Scope filter
    if (streetScopeFilter === 'all-houses') {
      return s.houseType === 'all';
    }
    if (streetScopeFilter === 'partial') {
      return s.houseType !== 'all';
    }

    return true;
  });

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden border-r border-slate-200">
      {/* High Density Header */}
      <div className="p-4 bg-blue-50 border-b border-blue-100 shrink-0">
        <div className="flex justify-between items-start mb-1.5">
          <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
            ОКРУГ №{district.number}
          </span>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            {district.shortName.replace(/.*\(|\)/g, '')}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Паспорт территории</h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Гродненская область, г. Гродно, {district.districtAdministration}
        </p>

        {/* Tab Navigation - High Density */}
        <div className="flex items-center gap-1 mt-3 p-0.5 bg-white rounded-md border border-blue-200 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('deputy')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'deputy'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Депутат</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reception')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'reception'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Прием граждан</span>
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. DEPUTY TAB */}
        {activeTab === 'deputy' && deputy && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Deputy Profile Card - Exact High Density Layout */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Депутат горсовета
              </h3>
              <div className="flex gap-3.5 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0 flex items-center justify-center border border-blue-200 shadow-2xs">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{deputy.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{deputy.mainJob}</p>
                  {deputy.party && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium border border-blue-200">
                        {deputy.party}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Reception Quick Preview */}
            {deputy.receptionSchedules[0] && (
              <section className="space-y-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Прием граждан
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">День приема</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {deputy.receptionSchedules[0].frequency}
                    </p>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Время</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {deputy.receptionSchedules[0].time}
                    </p>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">Адрес приемной:</p>
                      <p className="text-slate-600 mt-0.5">
                        {deputy.receptionSchedules[0].address} ({deputy.receptionSchedules[0].room})
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Direct Contacts */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Контакты
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${deputy.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-xs font-semibold text-slate-800"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Приемная</div>
                    <div className="truncate text-xs">{deputy.phone}</div>
                  </div>
                </a>

                <a
                  href={`mailto:${deputy.email}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-xs font-semibold text-slate-800 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Email</div>
                    <div className="truncate text-xs">{deputy.email}</div>
                  </div>
                </a>
              </div>

              {deputy.assistant && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px]">Помощник:</span>{' '}
                    <strong className="text-slate-800 text-xs">{deputy.assistant.name}</strong>
                  </div>
                  <a
                    href={`tel:${deputy.assistant.phone.replace(/[^0-9+]/g, '')}`}
                    className="text-blue-600 hover:underline font-semibold text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{deputy.assistant.phone}</span>
                  </a>
                </div>
              )}
            </section>

            {/* Initiatives */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Наказы избирателей
              </h3>
              <div className="space-y-1.5">
                {deputy.initiatives.map((init, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{init}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 2. RECEPTION SCHEDULE TAB */}
        {activeTab === 'reception' && deputy && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                График личного приема граждан
              </h3>
              <div className="space-y-2">
                {deputy.receptionSchedules.map((schedule) => {
                  const isSelected = selectedReception?.id === schedule.id;
                  return (
                    <div
                      key={schedule.id}
                      onClick={() => district && onSelectReception && onSelectReception(schedule, deputy, district)}
                      className={`p-3 border rounded-lg transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          isSelected ? 'bg-amber-500 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {schedule.frequency}
                        </span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {schedule.time}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{schedule.locationName}</span>
                          <span className="text-[10px] text-blue-600 font-normal hover:underline flex items-center gap-0.5">
                            Показать на карте <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{schedule.address}, {schedule.room}</span>
                        </div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Запись: {schedule.phone}</span>
                        </div>
                      </div>

                      {schedule.notes && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                          {schedule.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1 text-[11px] mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Регламент приема:</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                При себе необходимо иметь документ, удостоверяющий личность. Срок рассмотрения обращений — до 15 дней.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action - High Density Style */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('reception')}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition active:scale-98"
        >
          Записаться на личный прием
        </button>
      </div>
    </div>
  );
};
