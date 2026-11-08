import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { RotateCcw, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';

interface DhikrItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  defaultTarget: number;
}

const DHIKR_LIST: DhikrItem[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    defaultTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    defaultTarget: 34,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    meaning: 'There is no deity worthy of worship except Allah',
    defaultTarget: 100,
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullah wa atubu ilayh',
    meaning: 'I seek forgiveness of Allah and repent to Him',
    defaultTarget: 100,
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma salli ala Muhammad',
    meaning: 'O Allah, send blessings upon Prophet Muhammad',
    defaultTarget: 100,
  },
];

export const TasbihCounter: React.FC = () => {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(DHIKR_LIST[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [rounds, setRounds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const handleTap = () => {
    const nextCount = count + 1;
    if (soundEnabled) {
      sounds.playTasbihClick();
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch (e) {
        // ignore
      }
    }

    if (target > 0 && nextCount >= target) {
      setCount(0);
      setRounds((prev) => prev + 1);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 100]);
        } catch (e) {
          // ignore
        }
      }
      sounds.playPrayerChime();
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    setRounds(0);
  };

  const handleSelectDhikr = (dhikr: DhikrItem) => {
    setSelectedDhikr(dhikr);
    setTarget(dhikr.defaultTarget);
    setCount(0);
  };

  const progressPercent = target > 0 ? Math.min(100, (count / target) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 px-4 py-2">
      {/* Active Dhikr Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="font-arabic text-3xl font-bold text-amber-300 tracking-wide py-1">
            {selectedDhikr.arabic}
          </div>
          <div className="text-base font-semibold text-slate-100">
            {selectedDhikr.transliteration}
          </div>
          <div className="text-xs text-slate-400 max-w-xs mx-auto">
            {selectedDhikr.meaning}
          </div>
        </div>

        {/* Progress bar */}
        {target > 0 && (
          <div className="mt-4 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Touch Counter Button */}
      <div className="flex flex-col items-center justify-center my-3">
        <button
          onClick={handleTap}
          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-4 border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-transform duration-100 group select-none cursor-pointer"
        >
          {/* Subtle Outer Pulsing Ring */}
          <div className="absolute inset-1 rounded-full border border-amber-500/20 pointer-events-none" />

          <div className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-wider group-active:text-amber-300 transition-colors">
            {count}
          </div>

          <div className="text-xs text-emerald-400 font-medium mt-1">
            {target > 0 ? `/ ${target} target` : 'Free Count'}
          </div>

          {rounds > 0 && (
            <div className="mt-2 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300">
              {rounds} {rounds === 1 ? 'Round' : 'Rounds'} Completed
            </div>
          )}
        </button>
        <span className="text-[11px] text-slate-500 mt-2">
          Tap circle to count · Vibrates on touch
        </span>
      </div>

      {/* Action Bar (Reset, Sound, Target Selector) */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle click sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Target Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {[33, 100, 0].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTarget(t);
                setCount(0);
              }}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition ${
                target === t
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 0 ? '∞' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Dhikr List Carousel */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
          Select Dhikr
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DHIKR_LIST.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectDhikr(item)}
              className={`p-2.5 rounded-xl text-left border transition ${
                selectedDhikr.id === item.id
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-white'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="font-arabic text-sm text-amber-300 truncate">
                {item.arabic}
              </div>
              <div className="text-xs font-semibold truncate mt-0.5">
                {item.transliteration}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
