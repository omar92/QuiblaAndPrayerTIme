import React, { useState } from 'react';
import { useCompass } from '../hooks/useCompass';
import { calculateDistanceToMecca, MECCA_COORDINATES } from '../utils/qibla';
import {
  Compass as CompassIcon,
  Navigation,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Globe2,
} from 'lucide-react';

interface QiblaCompassProps {
  userLat: number;
  userLng: number;
  locationName: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  userLat,
  userLng,
  locationName,
}) => {
  const [viewMode, setViewMode] = useState<'compass' | 'map'>('compass');
  const [showCalibrationHelp, setShowCalibrationHelp] = useState(false);
  const [showManualControls, setShowManualControls] = useState(false);

  const {
    heading,
    qiblaBearing,
    relativeAngle,
    isAligned,
    diffFromTarget,
    hasSensor,
    permissionGranted,
    needsPermission,
    isSimulated,
    sensorAccuracy,
    requestOrientationPermission,
    setSimulatedHeading,
    resetToSensor,
  } = useCompass(userLat, userLng);

  const distance = calculateDistanceToMecca(userLat, userLng);

  // Compass cardinal points
  const getCardinalDirection = (angle: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((angle % 360) / 22.5)) % 16;
    return directions[idx];
  };

  const currentHeadingDirection = getCardinalDirection(heading);
  const qiblaHeadingDirection = getCardinalDirection(qiblaBearing);

  return (
    <div className="flex flex-col items-center justify-between min-h-[640px] w-full max-w-md mx-auto px-4 py-3">
      {/* Top Info Banner */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-200 truncate max-w-[170px]">
            {locationName}
          </span>
          <span>·</span>
          <span className="font-mono text-emerald-300">
            {distance.km.toLocaleString()} km to Kaaba
          </span>
        </div>

        {/* View toggle (Compass vs Map) */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('compass')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition ${
              viewMode === 'compass'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Compass
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition ${
              viewMode === 'map'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Alignment / Direction Guidance Banner */}
      <div
        className={`w-full p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
          isAligned
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-900/30'
            : 'bg-slate-900/80 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
              isAligned
                ? 'bg-emerald-500 text-slate-950 scale-110 shadow-md shadow-emerald-500/40'
                : 'bg-slate-800 text-amber-400'
            }`}
          >
            {isAligned ? (
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Navigation
                className="w-5 h-5 transition-transform duration-200"
                style={{
                  transform: `rotate(${diffFromTarget > 0 ? 90 : -90}deg)`,
                }}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {isAligned
                  ? 'Facing Mecca (Qibla Aligned!)'
                  : diffFromTarget > 0
                  ? `Turn ${Math.abs(diffFromTarget)}° Right`
                  : `Turn ${Math.abs(diffFromTarget)}° Left`}
              </span>
              <span className="text-[11px] font-arabic opacity-75">
                {isAligned ? 'أنت باتجاه القبلة' : 'وجّه الهاتف'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Qibla is at{' '}
              <strong className="text-amber-400 font-mono">
                {qiblaBearing.toFixed(1)}° {qiblaHeadingDirection}
              </strong>{' '}
              · Current heading:{' '}
              <span className="font-mono text-slate-300">
                {heading.toFixed(0)}° {currentHeadingDirection}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCalibrationHelp(true)}
          title="Compass calibration help"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* iOS Permission Prompt Notice if needed */}
      {needsPermission && !permissionGranted && (
        <div className="w-full mt-3 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Enable motion sensors for real-time compass</span>
          </div>
          <button
            onClick={requestOrientationPermission}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
          >
            Allow
          </button>
        </div>
      )}

      {/* Compass View */}
      {viewMode === 'compass' ? (
        <div className="relative my-4 flex items-center justify-center">
          {/* Outer glow ring when aligned */}
          <div
            className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full transition-all duration-500 pointer-events-none ${
              isAligned
                ? 'bg-emerald-500/20 blur-xl scale-105'
                : 'bg-emerald-900/5 blur-lg scale-95'
            }`}
          />

          {/* Fixed Outer Frame & North Indicator */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/80 border-4 border-slate-800 shadow-2xl flex items-center justify-center p-3 select-none">
            {/* Top Phone Direction Indicator Arrow */}
            <div className="absolute -top-3 z-30 flex flex-col items-center">
              <div
                className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] ${
                  isAligned ? 'border-b-emerald-400' : 'border-b-amber-400'
                }`}
              />
            </div>

            {/* Rotating Compass Dial: Rotates opposite of phone heading (-heading) */}
            <div
              className="w-full h-full rounded-full relative flex items-center justify-center compass-transition"
              style={{
                transform: `rotate(${-heading}deg)`,
              }}
            >
              {/* Outer Ticks Ring */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/20">
                {Array.from({ length: 72 }).map((_, i) => {
                  const deg = i * 5;
                  const isMajor = deg % 30 === 0;
                  const isCardinal = deg % 90 === 0;
                  return (
                    <div
                      key={deg}
                      className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
                      style={{
                        height: '50%',
                        transform: `rotate(${deg}deg)`,
                      }}
                    >
                      <div
                        className={`w-0.5 mx-auto rounded-full ${
                          isCardinal
                            ? 'h-3 bg-amber-400'
                            : isMajor
                            ? 'h-2 bg-emerald-400/80'
                            : 'h-1 bg-slate-600'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Cardinal Labels on Dial */}
              <div className="absolute top-2 text-xs font-bold text-red-500 tracking-wider">
                N
              </div>
              <div className="absolute right-3 text-xs font-semibold text-emerald-400/90">
                E
              </div>
              <div className="absolute bottom-2 text-xs font-semibold text-emerald-400/90">
                S
              </div>
              <div className="absolute left-3 text-xs font-semibold text-emerald-400/90">
                W
              </div>

              {/* Degrees numbers at every 30 deg */}
              {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0 flex items-start justify-center pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span className="text-[9px] font-mono text-slate-500 mt-5">
                    {deg}°
                  </span>
                </div>
              ))}

              {/* Inner Decorative Golden Ring */}
              <div className="w-48 h-48 rounded-full border border-amber-500/30 flex items-center justify-center bg-slate-950/40">
                <div className="w-36 h-36 rounded-full border border-emerald-500/20 flex items-center justify-center">
                  {/* Subtle Islamic 8-point geometric star */}
                  <div className="w-24 h-24 border border-emerald-500/10 rotate-45 absolute" />
                  <div className="w-24 h-24 border border-emerald-500/10 rotate-0 absolute" />
                </div>
              </div>

              {/* Dynamic Qibla Pointer Needle fixed on the dial at qiblaBearing! */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `rotate(${qiblaBearing}deg)`,
                }}
              >
                {/* Pointer to Kaaba */}
                <div className="absolute top-4 flex flex-col items-center">
                  {/* Glowing Kaaba Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${
                      isAligned
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-300 text-white shadow-emerald-500/50 scale-110'
                        : 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300 text-slate-950 shadow-amber-500/30'
                    }`}
                  >
                    {/* Isometric Kaaba SVG */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z" fill="#1e293b" />
                      <path d="M12 2L21 6.5L12 11L3 6.5L12 2Z" fill="#334155" />
                      <path d="M3 6.5L12 11V22L3 17.5V6.5Z" fill="#0f172a" />
                      <path d="M12 11L21 6.5V17.5L12 22V11Z" fill="#020617" />
                      {/* Golden Kiswah Band */}
                      <path d="M3 9.5L12 14L21 9.5V11L12 15.5L3 11V9.5Z" fill="#f59e0b" />
                    </svg>
                  </div>
                  {/* Arrow stem pointing to Kaaba */}
                  <div
                    className={`w-1 h-14 ${
                      isAligned ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <div className="text-[10px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded mt-0.5 whitespace-nowrap">
                    MECCA
                  </div>
                </div>

                {/* Counter balance needle pointing opposite direction */}
                <div className="absolute bottom-6 flex flex-col items-center opacity-40">
                  <div className="w-1 h-8 bg-slate-500" />
                </div>
              </div>
            </div>

            {/* Center Hub Overlay (Doesn't spin) */}
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md z-20 transition-all ${
                isAligned
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <CompassIcon
                className={`w-6 h-6 ${isAligned ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Direct Map Line View */
        <div className="w-full my-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Great-Circle Qibla Path
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {qiblaBearing.toFixed(1)}° True Azimuth
            </span>
          </div>

          {/* Visual Vector Arc Diagram */}
          <div className="relative w-full h-56 my-3 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 flex items-center justify-center overflow-hidden">
            {/* Latitude / Longitude grid lines */}
            <div className="absolute inset-0 opacity-15">
              <div className="w-full h-full grid grid-cols-6 grid-rows-4 divide-x divide-y divide-emerald-500" />
            </div>

            {/* Arc Path SVG */}
            <svg
              className="absolute inset-0 w-full h-full p-6"
              viewBox="0 0 300 160"
            >
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="50%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>

              {/* Dashed Great Circle Curve */}
              <path
                d="M 40 120 Q 150 20 260 50"
                fill="none"
                stroke="url(#arcGrad)"
                stroke-width="3"
                stroke-dasharray="6 4"
                className="animate-pulse"
              />

              {/* User Position Node */}
              <circle cx="40" cy="120" r="7" fill="#10b981" />
              <circle cx="40" cy="120" r="14" fill="#10b981" opacity="0.3" />
              <text x="40" y="145" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif">
                Your Location
              </text>

              {/* Kaaba Mecca Node */}
              <circle cx="260" cy="50" r="9" fill="#f59e0b" />
              <circle cx="260" cy="50" r="18" fill="#f59e0b" opacity="0.3" />
              <text x="260" y="30" text-anchor="middle" fill="#f59e0b" font-weight="bold" font-size="11" font-family="sans-serif">
                Holy Kaaba
              </text>
            </svg>

            {/* Distance badge in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow text-center">
              <div className="text-[10px] text-slate-400">Direct Distance</div>
              <div className="text-xs font-bold text-amber-300 font-mono">
                {distance.km.toLocaleString()} km ({distance.miles.toLocaleString()} mi)
              </div>
            </div>
          </div>

          {/* Coordinates Details */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Your Coordinates</div>
              <div className="font-mono text-slate-200 mt-0.5">
                {userLat.toFixed(4)}°N, {userLng.toFixed(4)}°E
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Kaaba Coordinates</div>
              <div className="font-mono text-amber-300 mt-0.5">
                {MECCA_COORDINATES.latitude}°N, {MECCA_COORDINATES.longitude}°E
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Info & Manual Test Slider */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasSensor ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>
              {hasSensor
                ? `Compass active (${sensorAccuracy} accuracy)`
                : 'No compass sensor detected (Desktop / Emulator)'}
            </span>
          </div>

          <button
            onClick={() => setShowManualControls(!showManualControls)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showManualControls ? 'Hide Controls' : 'Test Rotation'}</span>
          </button>
        </div>

        {/* Manual Rotation Slider for Testing */}
        {showManualControls && (
          <div className="w-full p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Simulate Device Rotation:
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {heading.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={Math.round(heading)}
              onChange={(e) => setSimulatedHeading(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>0° (North)</span>
              <button
                onClick={() => setSimulatedHeading(Math.round(qiblaBearing))}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Snap to Qibla ({Math.round(qiblaBearing)}°)
              </button>
              <span>359°</span>
            </div>
            {isSimulated && (
              <button
                onClick={resetToSensor}
                className="w-full py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Return to Live Sensor</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Calibration Help Modal */}
      {showCalibrationHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              <CompassIcon className="w-4 h-4 text-emerald-400" />
              Compass Calibration Guide
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              For best accuracy on Android and iPhone:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>Hold your phone flat horizontally parallel to the ground.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>Move your device in a <strong>figure-8</strong> motion twice to calibrate the magnetometer sensor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Keep away from strong magnetic interference like laptops, thick metal desks, or magnetic phone cases.</span>
              </li>
            </ul>

            <button
              onClick={() => setShowCalibrationHelp(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
