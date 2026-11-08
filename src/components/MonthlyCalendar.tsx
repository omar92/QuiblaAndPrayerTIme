import React, { useState, useMemo } from 'react';
import {
  calculateRawTimes,
  CalculationMethodId,
  JuristicMethod,
  getHijriDate,
} from '../utils/prayerTimes';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface MonthlyCalendarProps {
  userLat: number;
  userLng: number;
  locationName: string;
  methodId: CalculationMethodId;
  juristic: JuristicMethod;
  is24Hour: boolean;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  userLat,
  userLng,
  locationName,
  methodId,
  juristic,
  is24Hour,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper to format decimal hours
  const formatTimeStr = (decimalHour: number): string => {
    const h = Math.floor(decimalHour);
    const m = Math.floor((decimalHour - h) * 60);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (is24Hour) {
      return `${pad(h)}:${pad(m)}`;
    }
    const period = h >= 12 ? 'p' : 'a';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${pad(m)}${period}`;
  };

  // Compute days for month
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const tzOffset = -currentDate.getTimezoneOffset() / 60;
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDateNum = today.getDate();

    const list = [];
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const raw = calculateRawTimes(d, userLat, userLng, tzOffset, methodId, juristic);
      const hijri = getHijriDate(d);
      const isToday = isCurrentMonth && day === todayDateNum;

      list.push({
        day,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hijriDay: `${hijri.day} ${hijri.monthName.slice(0, 3)}`,
        fajr: formatTimeStr(raw.fajr),
        sunrise: formatTimeStr(raw.sunrise),
        dhuhr: formatTimeStr(raw.dhuhr),
        asr: formatTimeStr(raw.asr),
        maghrib: formatTimeStr(raw.maghrib),
        isha: formatTimeStr(raw.isha),
        isToday,
      });
    }
    return list;
  }, [year, month, userLat, userLng, methodId, juristic, is24Hour]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3 px-3 py-2">
      {/* Month Navigator Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-center justify-between shadow-lg">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>
              {monthNames[month]} {year}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{locationName}</div>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Timetable Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto no-scrollbar max-h-[500px]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 z-10">
              <tr>
                <th className="py-2.5 px-2.5 text-center font-medium">Day</th>
                <th className="py-2.5 px-2 font-medium">Hijri</th>
                <th className="py-2.5 px-2 text-emerald-400 font-medium">Fajr</th>
                <th className="py-2.5 px-2 font-medium text-amber-500">Sun</th>
                <th className="py-2.5 px-2 font-medium">Dhuhr</th>
                <th className="py-2.5 px-2 font-medium">Asr</th>
                <th className="py-2.5 px-2 font-medium text-amber-400">Magh</th>
                <th className="py-2.5 px-2 font-medium">Isha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {daysInMonth.map((row) => (
                <tr
                  key={row.day}
                  className={`transition-colors ${
                    row.isToday
                      ? 'bg-emerald-950/80 text-white font-bold border-l-2 border-emerald-400'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-2.5 text-center">
                    <span className="font-sans font-medium">{row.day}</span>{' '}
                    <span className="text-[9px] text-slate-500 uppercase">{row.dayOfWeek}</span>
                  </td>
                  <td className="py-2 px-2 text-[10px] font-sans text-slate-400 whitespace-nowrap">
                    {row.hijriDay}
                  </td>
                  <td className="py-2 px-2 text-emerald-300 font-semibold">{row.fajr}</td>
                  <td className="py-2 px-2 text-amber-500/80">{row.sunrise}</td>
                  <td className="py-2 px-2">{row.dhuhr}</td>
                  <td className="py-2 px-2">{row.asr}</td>
                  <td className="py-2 px-2 text-amber-300 font-semibold">{row.maghrib}</td>
                  <td className="py-2 px-2 text-slate-200">{row.isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
