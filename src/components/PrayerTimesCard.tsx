import React from 'react';
import { PrayerTimesResult, PrayerTime } from '../utils/prayerTimes';
import { sounds } from '../utils/audio';
import {
  Clock,
  Bell,
  BellOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Compass,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface PrayerTimesCardProps {
  prayerData: PrayerTimesResult;
  locationName: string;
  onOpenCompass: () => void;
  onToggleNotification: (prayerId: string) => void;
}

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({
  prayerData,
  locationName,
  onOpenCompass,
  onToggleNotification,
}) => {
  const { times, nextPrayer, currentPrayer, formattedCountdown, hijriDate } = prayerData;

  const getPrayerIcon = (id: string, isNext: boolean) => {
    const iconClass = `w-5 h-5 ${isNext ? 'text-amber-300' : 'text-slate-400'}`;
    switch (id) {
      case 'fajr':
        return <Sunrise className={iconClass} />;
      case 'sunrise':
        return <Sun className={`${iconClass} text-amber-500`} />;
      case 'dhuhr':
        return <Sun className={iconClass} />;
      case 'asr':
        return <Sun className={iconClass} />;
      case 'maghrib':
        return <Sunset className={iconClass} />;
      case 'isha':
        return <Moon className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const handleTestChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPrayerChime();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 px-4 py-2">
      {/* Hero Next Prayer Card with Islamic Geometric Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 border border-emerald-500/30 p-5 shadow-2xl text-white">
        {/* Subtle decorative Islamic pattern watermark */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border-8 border-emerald-500/10 pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full border-4 border-amber-500/10 pointer-events-none" />

        <div className="relative z-10">
          {/* Header Row: Hijri Date & Audio Test */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 text-xs text-emerald-200/90">
            <div>
              <span className="font-semibold text-amber-300">{hijriDate.formatted}</span>
              <span className="mx-1.5 opacity-40">·</span>
              <span className="font-arabic text-emerald-300">{hijriDate.formattedArabic}</span>
            </div>

            <button
              onClick={handleTestChime}
              title="Test gentle Adhan chime"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-800/50 hover:bg-emerald-800 border border-emerald-500/30 text-emerald-200 transition text-[11px]"
            >
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>Chime</span>
            </button>
          </div>

          {/* Next Prayer Display */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-emerald-300/80 font-medium">
                  Next Prayer
                </span>
                <span className="font-arabic text-sm text-amber-300">
                  {nextPrayer?.arabicName}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
                {nextPrayer?.name}
              </h2>
              <p className="text-lg font-mono text-amber-400 font-semibold mt-0.5">
                {nextPrayer?.time}
              </p>
            </div>

            {/* Live Countdown Clock Ring */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/30 shadow-inner">
              <span className="text-[10px] text-emerald-300/80 font-medium uppercase tracking-wider mb-0.5">
                Starts In
              </span>
              <div className="font-mono text-xl font-bold tracking-wider text-emerald-400">
                {formattedCountdown}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {locationName}
              </span>
            </div>
          </div>

          {/* Quick Compass CTA */}
          <div className="mt-5 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Find Mecca for your prayer</span>
            </div>
            <button
              onClick={onOpenCompass}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-95 transition"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open Qibla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Prayer Timetable List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Prayers</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Tap bell for reminders
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          {times.map((prayer: PrayerTime) => {
            const isSunrise = prayer.id === 'sunrise';
            return (
              <div
                key={prayer.id}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 ${
                  prayer.isNext
                    ? 'bg-emerald-950/70 border border-emerald-500/40 shadow-md text-white'
                    : prayer.isPassed
                    ? 'bg-slate-950/40 text-slate-400 hover:bg-slate-950/70'
                    : 'bg-slate-800/40 text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {/* Left: Icon & Names */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      prayer.isNext
                        ? 'bg-emerald-600/30 border border-emerald-400/40 text-amber-300'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {getPrayerIcon(prayer.id, prayer.isNext)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {prayer.name}
                      </span>
                      {prayer.isNext && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                          Next
                        </span>
                      )}
                    </div>
                    <span className="font-arabic text-xs text-slate-400">
                      {prayer.arabicName}
                    </span>
                  </div>
                </div>

                {/* Right: Time & Notification Bell Toggle */}
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm font-semibold tracking-wide ${
                      prayer.isNext ? 'text-amber-400 text-base' : 'text-slate-200'
                    }`}
                  >
                    {prayer.time}
                  </span>

                  {!isSunrise && (
                    <button
                      onClick={() => onToggleNotification(prayer.id)}
                      title={prayer.notificationEnabled ? 'Mute alert' : 'Enable alert'}
                      className={`p-2 rounded-lg transition active:scale-90 ${
                        prayer.notificationEnabled
                          ? 'text-amber-400 hover:bg-amber-400/10'
                          : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {prayer.notificationEnabled ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Islamic Time Landmarks: Midnight & Tahajjud / Qiyam */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Islamic Midnight</span>
          </div>
          <div className="text-xs font-arabic text-slate-400">نصف الليل</div>
          <div className="font-mono text-sm font-bold text-slate-200 mt-1">
            {prayerData.sunsetTime && prayerData.sunriseTime
              ? 'Calculated'
              : 'Midnight'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Halfway from Sunset to Fajr
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tahajjud / Qiyam</span>
          </div>
          <div className="text-xs font-arabic text-slate-400">قيام الليل</div>
          <div className="font-mono text-sm font-bold text-amber-300 mt-1">
            Last 1/3 of Night
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Best time for voluntary prayer
          </div>
        </div>
      </div>
    </div>
  );
};
