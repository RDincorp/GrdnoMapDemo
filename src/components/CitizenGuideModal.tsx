import React, { useState } from 'react';
import { X, Copy, Check, FileText, AlertCircle, Clock, ShieldCheck, Phone } from 'lucide-react';

interface CitizenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  deputyName?: string;
  districtName?: string;
}

export const CitizenGuideModal: React.FC<CitizenGuideModalProps> = ({
  isOpen,
  onClose,
  deputyName,
  districtName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sampleTemplate = `Депутату Гродненского городского Совета депутатов
${deputyName || 'Кравченко Сергею Александровичу'}
(${districtName || 'Доваторский избирательный округ №3'})

От гражданина(ки): __________________________________
Проживающего(ей) по адресу: г. Гродно, ул. ____________, д. ___, кв. ___
Телефон: +375 (__) ___-__-__
Электронная почта: __________________________________

ОБРАЩЕНИЕ

Уважаемый(ая) ${deputyName ? deputyName.split(' ')[0] + ' ' + (deputyName.split(' ')[1] || '') : 'Сергей Александрович'}!

Обращаюсь к Вам как избиратель Вашего округа по следующему вопросу:
[Изложите суть проблемы: например, неудовлетворительное состояние дворового проезда, необходимость ремонта освещения или установки поручней].

Ранее по данному вопросу я обращался(ась) в [наименование организации / администрации района] (обращение №_____ от __.__.202_ г.), однако до настоящего времени действенных мер принято не было.

В соответствии с Законом Республики Беларусь «О статусе депутата местного Совета депутатов» и Законом «Об обращениях граждан и юридических лиц», прошу:
1. Оказать содействие в решении указанного вопроса.
2. При необходимости направить депутатский запрос в уполномоченные органы.
3. Проинформировать меня в установленный законом срок о принятых мерах.

Приложение: копия предыдущих обращений и фотоматериалы (на __ л.).

Дата: «___» ___________ 202_ г.                Подпись: ____________`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide">Памятка гражданину и образец обращения</h3>
              <p className="text-[10px] text-slate-400">Закон Республики Беларусь «Об обращениях граждан»</p>
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

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
          {/* Rules and Timelines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Сроки ответа</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                До <strong>15 дней</strong> (без проверки) или до <strong>1 месяца</strong> при выезде на место.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Реквизиты</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                ФИО, адрес проживания, суть требования, личная подпись и дата.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Депутатский запрос</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Депутат вправе направить официальный запрос в любые городские службы.
              </p>
            </div>
          </div>

          {/* Sample template box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-900 text-xs uppercase tracking-tight">
                Образец письменного обращения:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-md font-semibold transition active:scale-95 text-xs border border-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800 max-h-56 selection:bg-blue-600 selection:text-white">
              {sampleTemplate}
            </pre>
          </div>

          {/* Guidelines list */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Советы перед визитом на прием:</h4>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
              <li>Возьмите паспорт или вид на жительство — он обязателен для регистрации обращения.</li>
              <li>Сделайте фотографии проблемного объекта (дорога, фасад, кровля).</li>
              <li>Если вы уже направляли обращения в инстанции, укажите их номера и даты.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition active:scale-95"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
