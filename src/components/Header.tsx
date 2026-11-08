import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import {
  MapPin,
  Crosshair,
  Sliders,
  Wifi,
  BatteryMedium,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  locationName: string;
  onOpenLocationPicker: () => void;
  onOpenSettings: () => void;
  onUseGps: () => void;
  isGpsLoading: boolean;
  showAndroidBar: boolean;
  onToggleAndroidBar: () => void;
  currentTimeStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  locationName,
  onOpenLocationPicker,
  onOpenSettings,
  onUseGps,
  isGpsLoading,
  showAndroidBar,
  onToggleAndroidBar,
  currentTimeStr,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full max-w-md mx-auto bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Android System Status Bar Simulation (Optional toggle for native look & feel) */}
      {showAndroidBar && (
        <div className="w-full px-5 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
          <span className="font-semibold text-slate-200">{currentTimeStr}</span>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] font-sans font-bold text-slate-300">5G</span>
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Main Top App Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: App Identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-400/30 flex items-center justify-center text-amber-300 shadow-md">
            {/* Kaaba / Crescent SVG */}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z" fill="#042f24" />
              <path d="M12 2L21 6.5L12 11L3 6.5L12 2Z" fill="#065f46" />
              <path d="M3 6.5L12 11V22L3 17.5V6.5Z" fill="#022c22" />
              <path d="M12 11L21 6.5V17.5L12 22V11Z" fill="#011b15" />
              <path d="M3 9.5L12 14L21 9.5V11L12 15.5L3 11V9.5Z" fill="#f59e0b" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>QiblaTimes</span>
              <span className="text-[10px] font-arabic font-normal text-emerald-400">
                الصلاة والقبلة
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Location Pill (Clickable) */}
        <button
          onClick={onOpenLocationPicker}
          title="Change location"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white transition max-w-[150px] sm:max-w-[180px] shadow-sm"
        >
          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium truncate">{locationName}</span>
        </button>

        {/* Right: Install & Settings */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton compact />

          <button
            onClick={onUseGps}
            disabled={isGpsLoading}
            title="Refresh GPS location"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Crosshair className={`w-4 h-4 ${isGpsLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
