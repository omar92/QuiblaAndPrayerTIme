/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculatePrayerTimes,
  CalculationMethodId,
  JuristicMethod,
  PrayerTimesResult,
} from './utils/prayerTimes';
import { DEFAULT_LOCATION, POPULAR_CITIES } from './utils/cities';
import { reverseGeocode } from './utils/geolocation';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { PrayerTimesCard } from './components/PrayerTimesCard';
import { QiblaCompass } from './components/QiblaCompass';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { TasbihCounter } from './components/TasbihCounter';
import { LocationPickerModal } from './components/LocationPickerModal';
import { SettingsModal } from './components/SettingsModal';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('prayers');

  // Location state
  const [lat, setLat] = useState<number>(() => {
    const saved = localStorage.getItem('qibla_lat');
    return saved ? parseFloat(saved) : DEFAULT_LOCATION.latitude;
  });
  const [lng, setLng] = useState<number>(() => {
    const saved = localStorage.getItem('qibla_lng');
    return saved ? parseFloat(saved) : DEFAULT_LOCATION.longitude;
  });
  const [locationName, setLocationName] = useState<string>(() => {
    return localStorage.getItem('qibla_location_name') || `${DEFAULT_LOCATION.name}, ${DEFAULT_LOCATION.country}`;
  });

  // Settings state
  const [methodId, setMethodId] = useState<CalculationMethodId>(() => {
    return (localStorage.getItem('qibla_method') as CalculationMethodId) || 'MWL';
  });
  const [juristic, setJuristic] = useState<JuristicMethod>(() => {
    return (localStorage.getItem('qibla_juristic') as JuristicMethod) || 'Standard';
  });
  const [is24Hour, setIs24Hour] = useState<boolean>(() => {
    return localStorage.getItem('qibla_24h') === 'true';
  });
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(() => {
    const saved = localStorage.getItem('qibla_hijri_adj');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('qibla_notifs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // GPS loading state
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Android Shell frame toggle for desktop view
  const [isDeviceFrameEnabled, setIsDeviceFrameEnabled] = useState<boolean>(false);
  const [showAndroidBar, setShowAndroidBar] = useState<boolean>(true);

  // Live timer tick
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format current time for status bar
  const currentTimeStr = useMemo(() => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (is24Hour) {
      return `${pad(h)}:${pad(m)}`;
    }
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${pad(m)} ${period}`;
  }, [currentTime, is24Hour]);

  // Save location to localStorage
  const handleSelectLocation = useCallback(
    (loc: { name: string; latitude: number; longitude: number }) => {
      setLat(loc.latitude);
      setLng(loc.longitude);
      setLocationName(loc.name);
      localStorage.setItem('qibla_lat', loc.latitude.toString());
      localStorage.setItem('qibla_lng', loc.longitude.toString());
      localStorage.setItem('qibla_location_name', loc.name);
    },
    []
  );

  // Save calculation settings
  const handleSelectMethod = (id: CalculationMethodId) => {
    setMethodId(id);
    localStorage.setItem('qibla_method', id);
  };

  const handleSelectJuristic = (j: JuristicMethod) => {
    setJuristic(j);
    localStorage.setItem('qibla_juristic', j);
  };

  const handleToggle24Hour = (val: boolean) => {
    setIs24Hour(val);
    localStorage.setItem('qibla_24h', val ? 'true' : 'false');
  };

  const handleSetHijriAdj = (val: number) => {
    setHijriAdjustment(val);
    localStorage.setItem('qibla_hijri_adj', val.toString());
  };

  const handleToggleNotification = (prayerId: string) => {
    setNotifications((prev) => {
      const updated = { ...prev, [prayerId]: !(prev[prayerId] ?? true) };
      localStorage.setItem('qibla_notifs', JSON.stringify(updated));
      return updated;
    });
  };

  // GPS Detection with reverse geocoding
  const handleUseGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const detectedName = await reverseGeocode(userLat, userLng);

        handleSelectLocation({
          name: detectedName,
          latitude: userLat,
          longitude: userLng,
        });

        setIsGpsLoading(false);
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location permission was denied. Please select your city manually.');
        } else {
          setGpsError('Unable to retrieve GPS coordinates. Please select your city manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [handleSelectLocation]);

  // Request GPS once on first load if user hasn't explicitly set a custom location before
  useEffect(() => {
    const hasSaved = localStorage.getItem('qibla_location_name');
    if (!hasSaved && navigator.geolocation) {
      handleUseGps();
    }
  }, [handleUseGps]);

  // Calculate prayer times
  const prayerData: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(currentTime, lat, lng, {
      methodId,
      juristic,
      is24Hour,
      hijriAdjustment,
      notifications,
    });
  }, [currentTime, lat, lng, methodId, juristic, is24Hour, hijriAdjustment, notifications]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center selection:bg-emerald-500 selection:text-white">
      {/* Top Desktop Controls Bar (Only shows on screens wider than md) */}
      <div className="hidden md:flex w-full max-w-4xl items-center justify-between px-6 py-2 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            Android Progressive Web App
          </span>
          <span>·</span>
          <span>Offline Prayer Engine & Real-Time Qibla Compass</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            {isDeviceFrameEnabled ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>Standard Layout</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Android Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container / Mobile Device Frame */}
      <div
        className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          isDeviceFrameEnabled
            ? 'my-6 max-w-[420px] rounded-[44px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden min-h-[820px]'
            : 'max-w-md'
        }`}
      >
        {/* Android Punch Hole Camera in Device Frame mode */}
        {isDeviceFrameEnabled && (
          <div className="w-full flex justify-center pt-2 pb-1 bg-slate-950 select-none">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>
        )}

        {/* Mobile Header Bar */}
        <Header
          locationName={locationName}
          onOpenLocationPicker={() => setIsLocationModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onUseGps={handleUseGps}
          isGpsLoading={isGpsLoading}
          showAndroidBar={showAndroidBar}
          onToggleAndroidBar={() => setShowAndroidBar(!showAndroidBar)}
          currentTimeStr={currentTimeStr}
        />

        {/* Tab Content Area */}
        <main className="flex-1 pb-20 pt-1 overflow-y-auto no-scrollbar">
          {activeTab === 'prayers' && (
            <PrayerTimesCard
              prayerData={prayerData}
              locationName={locationName}
              onOpenCompass={() => setActiveTab('compass')}
              onToggleNotification={handleToggleNotification}
            />
          )}

          {activeTab === 'compass' && (
            <QiblaCompass
              userLat={lat}
              userLng={lng}
              locationName={locationName}
            />
          )}

          {activeTab === 'calendar' && (
            <MonthlyCalendar
              userLat={lat}
              userLng={lng}
              locationName={locationName}
              methodId={methodId}
              juristic={juristic}
              is24Hour={is24Hour}
            />
          )}

          {activeTab === 'tasbih' && <TasbihCounter />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Modals */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLat={lat}
        currentLng={lng}
        currentLocationName={locationName}
        onSelectLocation={handleSelectLocation}
        onUseGps={handleUseGps}
        isGpsLoading={isGpsLoading}
        gpsError={gpsError}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        methodId={methodId}
        onSelectMethod={handleSelectMethod}
        juristic={juristic}
        onSelectJuristic={handleSelectJuristic}
        is24Hour={is24Hour}
        onToggle24Hour={handleToggle24Hour}
        hijriAdjustment={hijriAdjustment}
        onSetHijriAdjustment={handleSetHijriAdj}
      />
    </div>
  );
}
