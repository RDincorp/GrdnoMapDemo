import React from 'react';
import { X, Landmark, Compass, CheckCircle2, Shield, Map, Search, Users, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide">Интерактивная политическая карта Беларуси</h3>
              <p className="text-[10px] text-slate-400">Демонстрационный прототип «Паспорт территории» (г. Гродно)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight text-slate-900 mb-1">
              Миссия и концепция проекта
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              «Паспорт территории» — единый картографический интерфейс для граждан, объединяющий структуры исполнительной власти (горисполком, администрации районов) и представительной власти (депутаты городского Совета). Портал решает ключевую проблему отсутствия быстрой и наглядной связи между адресом жителя и ответственным за его дом депутатом.
            </p>
          </div>

          {/* Key Functions */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Реализованный функционал:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Умный адресный поиск</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Мгновенно сопоставляет адрес (включая сокращения вроде «БЛК 25» или «ул. Пушкина 18») с границами округа.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Map className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Интерактивная GIS-карта</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Векторные полигоны округов г. Гродно, точки общественных приемных, поддержка GPS геолокации.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Карточки депутатов</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Графики личного приема, прямые телефоны, комиссии горсовета, наказные инициативы и контакты помощников.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Навигатор обращений</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Помогает быстро сориентироваться, с какими вопросами обращаться в администрацию района, горисполком или к депутату.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 space-y-0.5 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-tight text-blue-700">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Технологический стек прототипа:</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug">
              React 19 + TypeScript, Tailwind CSS, Leaflet GIS Engine (с геопространственным алгоритмом Ray-Casting для определения округов по координатам), адаптивный дизайн для мобильных устройств и десктопа.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition active:scale-95 shadow-2xs"
          >
            Понятно, перейти к карте
          </button>
        </div>
      </div>
    </div>
  );
};
