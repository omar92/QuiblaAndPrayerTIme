import React from 'react';
import { Clock, Compass, Calendar, Sparkles } from 'lucide-react';

export type NavTab = 'prayers' | 'compass' | 'calendar' | 'tasbih';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: Array<{
    id: NavTab;
    label: string;
    arabicLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'prayers',
      label: 'Prayers',
      arabicLabel: 'مواقيت',
      icon: Clock,
    },
    {
      id: 'compass',
      label: 'Qibla',
      arabicLabel: 'القبلة',
      icon: Compass,
    },
    {
      id: 'calendar',
      label: 'Monthly',
      arabicLabel: 'الشهر',
      icon: Calendar,
    },
    {
      id: 'tasbih',
      label: 'Tasbih',
      arabicLabel: 'تسبيح',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 safe-area-bottom">
      <div className="w-full max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative py-1 transition-colors select-none"
            >
              {/* Active pill background aura */}
              {isActive && (
                <div className="absolute top-1 w-10 h-6 bg-emerald-500/20 rounded-full blur-xs" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-150 relative z-10 ${
                  isActive
                    ? 'text-emerald-400 scale-110'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              />

              <span
                className={`text-[10px] font-medium tracking-tight mt-1 relative z-10 transition-colors ${
                  isActive ? 'text-emerald-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
