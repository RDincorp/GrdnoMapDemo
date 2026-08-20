import React from 'react';
import { X, Landmark } from 'lucide-react';

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
              Интерактивная политическая карта Беларуси – проект, нацеленный на картографическое сведение в одном интерфейсе структур государственного управления и представительной власти (на начальном этапе – исполкомы, депутаты Палаты представителей и местных Советов депутатов) в привязке к территории их ответственности, а также с предоставлением информации о возможностях и правах граждан в сфере взаимодействия с органами управления и представителями на всех уровнях. Технически это оформлено как «паспорт территории»: ветви представительной и исполнительной власти в одном интерфейсе, а в деталях – депутаты и учреждения/должностные лица со своими округами, приёмными и компетенциями.
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
