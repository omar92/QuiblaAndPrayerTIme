import React from 'react';
import {
  CALCULATION_METHODS,
  CalculationMethodId,
  JuristicMethod,
} from '../utils/prayerTimes';
import { sounds } from '../utils/audio';
import {
  Sliders,
  X,
  Volume2,
  Calendar,
  Clock,
  Compass,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  methodId: CalculationMethodId;
  onSelectMethod: (id: CalculationMethodId) => void;
  juristic: JuristicMethod;
  onSelectJuristic: (j: JuristicMethod) => void;
  is24Hour: boolean;
  onToggle24Hour: (val: boolean) => void;
  hijriAdjustment: number;
  onSetHijriAdjustment: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  methodId,
  onSelectMethod,
  juristic,
  onSelectJuristic,
  is24Hour,
  onToggle24Hour,
  hijriAdjustment,
  onSetHijriAdjustment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Settings & Calculation</h3>
              <p className="text-[11px] text-slate-400">
                Islamic astronomical conventions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-5 flex-1 no-scrollbar text-xs">
          {/* Calculation Method */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Calculation Method (Convention)
            </label>
            <div className="space-y-1.5">
              {Object.values(CALCULATION_METHODS).map((m) => {
                const isSelected = methodId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMethod(m.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-start justify-between ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-100">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {m.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asr Juristic Method */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Asr Juristic Method (Madhab)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectJuristic('Standard')}
                className={`p-3 rounded-xl border text-left transition ${
                  juristic === 'Standard'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-white'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold text-xs">Standard</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Shafi'i, Maliki, Hanbali (Shadow 1x)
                </div>
              </button>

              <button
                onClick={() => onSelectJuristic('Hanafi')}
                className={`p-3 rounded-xl border text-left transition ${
                  juristic === 'Hanafi'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-white'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold text-xs">Hanafi</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Hanafi school (Shadow 2x)
                </div>
              </button>
            </div>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Time Format
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle24Hour(false)}
                className={`flex-1 py-2 rounded-xl border font-medium transition ${
                  !is24Hour
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                12-Hour (AM / PM)
              </button>
              <button
                onClick={() => onToggle24Hour(true)}
                className={`flex-1 py-2 rounded-xl border font-medium transition ${
                  is24Hour
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                24-Hour (14:30)
              </button>
            </div>
          </div>

          {/* Hijri Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                Hijri Date Manual Adjustment
              </label>
              <span className="font-mono text-emerald-400 font-bold">
                {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment} Days
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={hijriAdjustment}
              onChange={(e) => onSetHijriAdjustment(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-2 Days</span>
              <span>0 (Astronomical)</span>
              <span>+2 Days</span>
            </div>
          </div>

          {/* Test Adhan Audio */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-slate-200">
                Adhan & Reminder Tone
              </div>
              <div className="text-[10px] text-slate-400">
                Gentle harmonic bell chime (Web Audio API)
              </div>
            </div>
            <button
              onClick={() => sounds.playPrayerChime()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Offline & Private</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
