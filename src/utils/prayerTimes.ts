/**
 * Islamic Prayer Times and Hijri Calendar Calculation Engine
 * Implements astronomical algorithms based on solar coordinates and zenith angles.
 */

export type CalculationMethodId =
  | 'MWL'
  | 'ISNA'
  | 'Egypt'
  | 'Makkah'
  | 'Karachi'
  | 'Tehran'
  | 'Gulf'
  | 'Moonsighting';

export type JuristicMethod = 'Standard' | 'Hanafi';
export type HighLatitudeRule = 'AngleBased' | 'OneSeventh' | 'Midnight' | 'None';

export interface MethodConfig {
  id: CalculationMethodId;
  name: string;
  description: string;
  fajrAngle: number;
  maghribAngle?: number;
  maghribMinutes?: number;
  ishaAngle?: number;
  ishaMinutes?: number;
}

export const CALCULATION_METHODS: Record<CalculationMethodId, MethodConfig> = {
  MWL: {
    id: 'MWL',
    name: 'Muslim World League',
    description: 'Europe, Far East, parts of America (Fajr 18°, Isha 17°)',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  ISNA: {
    id: 'ISNA',
    name: 'Islamic Society of North America',
    description: 'North America (USA & Canada) (Fajr 15°, Isha 15°)',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  Makkah: {
    id: 'Makkah',
    name: 'Umm Al-Qura University, Makkah',
    description: 'Saudi Arabia & Arabian Peninsula (Fajr 18.5°, Isha +90 min)',
    fajrAngle: 18.5,
    ishaMinutes: 90,
  },
  Egypt: {
    id: 'Egypt',
    name: 'Egyptian General Authority of Survey',
    description: 'Egypt, Africa, Syria, Iraq, Lebanon (Fajr 19.5°, Isha 17.5°)',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  Karachi: {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Pakistan, India, Bangladesh, Afghanistan (Fajr 18°, Isha 18°)',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  Gulf: {
    id: 'Gulf',
    name: 'Gulf Region / Dubai',
    description: 'United Arab Emirates & Gulf States (Fajr 19.5°, Isha +90 min)',
    fajrAngle: 19.5,
    ishaMinutes: 90,
  },
  Tehran: {
    id: 'Tehran',
    name: 'Institute of Geophysics, University of Tehran',
    description: 'Iran & Shia communities (Fajr 17.7°, Maghrib 4.5°, Isha 14°)',
    fajrAngle: 17.7,
    maghribAngle: 4.5,
    ishaAngle: 14,
  },
  Moonsighting: {
    id: 'Moonsighting',
    name: 'Moonsighting Committee Worldwide',
    description: 'Global standard based on seasonal twilight (Fajr 18°, Isha 18°)',
    fajrAngle: 18,
    ishaAngle: 18,
  },
};

export interface PrayerTime {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight' | 'tahajjud';
  name: string;
  arabicName: string;
  time: string; // "05:14"
  date: Date;
  isPassed: boolean;
  isNext: boolean;
  isCurrent: boolean;
  notificationEnabled: boolean;
}

export interface PrayerTimesResult {
  times: PrayerTime[];
  nextPrayer: PrayerTime | null;
  currentPrayer: PrayerTime | null;
  secondsToNext: number;
  formattedCountdown: string;
  hijriDate: {
    day: number;
    month: number;
    monthName: string;
    monthNameArabic: string;
    year: number;
    formatted: string;
    formattedArabic: string;
  };
  solarNoon: string;
  sunriseTime: string;
  sunsetTime: string;
}

// Trigonometric helpers
function dsin(d: number): number {
  return Math.sin((d * Math.PI) / 180);
}
function dcos(d: number): number {
  return Math.cos((d * Math.PI) / 180);
}
function dtan(d: number): number {
  return Math.tan((d * Math.PI) / 180);
}
function darcsin(x: number): number {
  return (Math.asin(x) * 180) / Math.PI;
}
function darccos(x: number): number {
  return (Math.acos(x) * 180) / Math.PI;
}
function darctan(x: number): number {
  return (Math.atan(x) * 180) / Math.PI;
}
function darctan2(y: number, x: number): number {
  return (Math.atan2(y, x) * 180) / Math.PI;
}
function darccot(x: number): number {
  return (Math.atan(1 / x) * 180) / Math.PI;
}
function fixAngle(a: number): number {
  let b = a - 360 * Math.floor(a / 360);
  return b < 0 ? b + 360 : b;
}
function fixHour(a: number): number {
  let b = a - 24 * Math.floor(a / 24);
  return b < 0 ? b + 24 : b;
}

// Julian date calculation
function getJulianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

// Sun coordinates: declination and equation of time
function sunPosition(jd: number): { declination: number; equationOfTime: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));

  const e = 23.439 - 0.00000036 * D;
  const d = darcsin(dsin(e) * dsin(L));
  let RA = darctan2(dcos(e) * dsin(L), dcos(L)) / 15;
  RA = fixHour(RA);
  const EqT = q / 15 - RA;

  return { declination: d, equationOfTime: EqT };
}

// Midday time in hours
function midDay(time: number, eqt: number, lng: number): number {
  const noon = fixHour(12 + time - lng / 15 - eqt);
  return noon;
}

// Time for given sun altitude angle
function sunAngleTime(
  angle: number,
  time: number,
  direction: 'ccw' | 'cw',
  lat: number,
  decl: number,
  noon: number
): number {
  const val = (-dsin(angle) - dsin(lat) * dsin(decl)) / (dcos(lat) * dcos(decl));
  if (val > 1) return noon; // Sun never reaches angle
  if (val < -1) return noon;
  const ha = darccos(val) / 15;
  return noon + (direction === 'ccw' ? -ha : ha);
}

// Asr time based on shadow ratio
function asrTime(
  shadowFactor: number,
  lat: number,
  decl: number,
  noon: number
): number {
  const angle = -darccot(shadowFactor + dtan(Math.abs(lat - decl)));
  return sunAngleTime(angle, noon, 'cw', lat, decl, noon);
}

/**
 * Computes raw prayer times (in hours from 0 to 24)
 */
export function calculateRawTimes(
  date: Date,
  lat: number,
  lng: number,
  timezoneOffsetHours: number,
  methodId: CalculationMethodId = 'MWL',
  juristic: JuristicMethod = 'Standard'
) {
  const method = CALCULATION_METHODS[methodId] || CALCULATION_METHODS.MWL;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = getJulianDate(year, month, day);
  const { declination: decl, equationOfTime: eqt } = sunPosition(jd);

  // Solar noon
  const noon = fixHour(12 + timezoneOffsetHours - lng / 15 - eqt);

  // Sunrise and Sunset (zenith angle 90.833° accounts for atmospheric refraction)
  const sunrise = sunAngleTime(0.833, noon, 'ccw', lat, decl, noon);
  const sunset = sunAngleTime(0.833, noon, 'cw', lat, decl, noon);

  // Fajr
  let fajr = sunAngleTime(method.fajrAngle, noon, 'ccw', lat, decl, noon);

  // Asr
  const shadowFactor = juristic === 'Hanafi' ? 2 : 1;
  let asr = asrTime(shadowFactor, lat, decl, noon);

  // Maghrib
  let maghrib = sunset;
  if (method.maghribAngle !== undefined) {
    maghrib = sunAngleTime(method.maghribAngle, noon, 'cw', lat, decl, noon);
  } else if (method.maghribMinutes !== undefined) {
    maghrib = sunset + method.maghribMinutes / 60;
  }

  // Isha
  let isha: number;
  if (method.ishaAngle !== undefined) {
    isha = sunAngleTime(method.ishaAngle, noon, 'cw', lat, decl, noon);
  } else if (method.ishaMinutes !== undefined) {
    isha = maghrib + method.ishaMinutes / 60;
  } else {
    isha = sunset + 1.5;
  }

  // Add 1-2 minutes safety buffer for Dhuhr
  const dhuhr = noon + 2 / 60;

  return {
    fajr: fixHour(fajr),
    sunrise: fixHour(sunrise),
    dhuhr: fixHour(dhuhr),
    asr: fixHour(asr),
    sunset: fixHour(sunset),
    maghrib: fixHour(maghrib),
    isha: fixHour(isha),
  };
}

/**
 * Converts decimal hours to Date object on given date
 */
function hoursToDate(baseDate: Date, hours: number, dayOffset = 0): Date {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  d.setHours(h, m, s, 0);
  return d;
}

function formatTime(date: Date, is24Hour: boolean = false): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (is24Hour) {
    return `${pad(h)}:${pad(m)}`;
  }

  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${displayHours}:${pad(m)} ${period}`;
}

export const HIJRI_MONTHS = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: "Rabi' al-Awwal", ar: 'ربيع الأول' },
  { en: "Rabi' al-Thani", ar: 'ربيع الثاني' },
  { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  { en: 'Rajab', ar: 'رجب' },
  { en: "Sha'ban", ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: "Dhu al-Qi'dah", ar: 'ذو القعدة' },
  { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
];

/**
 * Kuwaiti Algorithm / Umm Al-Qura astronomical approximation for Hijri calendar.
 * Supports manual adjustment (-2 to +2 days).
 */
export function getHijriDate(date: Date, adjustmentDays: number = 0) {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + adjustmentDays);

  const day = adjustedDate.getDate();
  const month = adjustedDate.getMonth();
  const year = adjustedDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524;

  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  let bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);

  let iDay = bb - dd - Math.floor(30.6001 * ee);
  let iMonth = ee - 1;
  if (ee > 13) {
    cc += 1;
    iMonth = ee - 13;
  }
  let iYear = cc - 4716;

  let wd = (jd + 1) % 7;

  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  // Bound check for month index
  const monthIdx = Math.max(0, Math.min(11, hMonth - 1));
  const monthObj = HIJRI_MONTHS[monthIdx];

  return {
    day: hDay,
    month: hMonth,
    monthName: monthObj.en,
    monthNameArabic: monthObj.ar,
    year: hYear,
    formatted: `${hDay} ${monthObj.en} ${hYear} AH`,
    formattedArabic: `${hDay} ${monthObj.ar} ${hYear} هـ`,
  };
}

/**
 * Calculates complete prayer times list, countdown, next prayer, and tahajjud/midnight.
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  options: {
    methodId?: CalculationMethodId;
    juristic?: JuristicMethod;
    is24Hour?: boolean;
    hijriAdjustment?: number;
    notifications?: Record<string, boolean>;
  } = {}
): PrayerTimesResult {
  const methodId = options.methodId || 'MWL';
  const juristic = options.juristic || 'Standard';
  const is24Hour = options.is24Hour || false;
  const hijriAdj = options.hijriAdjustment || 0;
  const notifs = options.notifications || {};

  const tzOffset = -date.getTimezoneOffset() / 60;

  const todayRaw = calculateRawTimes(date, lat, lng, tzOffset, methodId, juristic);

  // Tomorrow raw times for next day calculations (e.g. if today's Isha has passed, next is tomorrow Fajr)
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowRaw = calculateRawTimes(tomorrow, lat, lng, tzOffset, methodId, juristic);

  const fajrDate = hoursToDate(date, todayRaw.fajr);
  const sunriseDate = hoursToDate(date, todayRaw.sunrise);
  const dhuhrDate = hoursToDate(date, todayRaw.dhuhr);
  const asrDate = hoursToDate(date, todayRaw.asr);
  const maghribDate = hoursToDate(date, todayRaw.maghrib);
  const ishaDate = hoursToDate(date, todayRaw.isha);

  // Tomorrow's Fajr
  const tomorrowFajrDate = hoursToDate(tomorrow, tomorrowRaw.fajr);

  // Midnight (Islamic midpoint between sunset and next fajr)
  const nightDurationMs = tomorrowFajrDate.getTime() - maghribDate.getTime();
  const midnightDate = new Date(maghribDate.getTime() + nightDurationMs / 2);

  // Last third of night (Tahajjud / Qiyam) = Fajr - (Night duration / 3)
  const tahajjudDate = new Date(tomorrowFajrDate.getTime() - nightDurationMs / 3);

  const nowMs = date.getTime();

  // Create list of prayers
  const mainPrayers: Array<{
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    name: string;
    arabicName: string;
    date: Date;
  }> = [
    { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', date: fajrDate },
    { id: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', date: sunriseDate },
    { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', date: dhuhrDate },
    { id: 'asr', name: 'Asr', arabicName: 'العصر', date: asrDate },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', date: maghribDate },
    { id: 'isha', name: 'Isha', arabicName: 'العشاء', date: ishaDate },
  ];

  // Find next and current prayer
  let nextPrayerItem: { id: string; name: string; arabicName: string; date: Date } | null = null;
  let currentPrayerItem: { id: string; name: string; arabicName: string; date: Date } | null = null;

  for (let i = 0; i < mainPrayers.length; i++) {
    const p = mainPrayers[i];
    if (nowMs < p.date.getTime()) {
      nextPrayerItem = p;
      currentPrayerItem = i > 0 ? mainPrayers[i - 1] : {
        id: 'isha',
        name: 'Isha (Previous)',
        arabicName: 'العشاء',
        date: new Date(ishaDate.getTime() - 24 * 3600 * 1000),
      };
      break;
    }
  }

  // If all prayers today have passed, next is tomorrow Fajr
  if (!nextPrayerItem) {
    nextPrayerItem = {
      id: 'fajr',
      name: 'Fajr (Tomorrow)',
      arabicName: 'الفجر',
      date: tomorrowFajrDate,
    };
    currentPrayerItem = mainPrayers[mainPrayers.length - 1]; // Isha
  }

  // Format all items
  const times: PrayerTime[] = mainPrayers.map((p) => {
    const isPassed = nowMs >= p.date.getTime();
    const isNext = nextPrayerItem?.id === p.id && !nextPrayerItem.name.includes('Tomorrow');
    const isCurrent = currentPrayerItem?.id === p.id;
    return {
      id: p.id,
      name: p.name,
      arabicName: p.arabicName,
      time: formatTime(p.date, is24Hour),
      date: p.date,
      isPassed,
      isNext,
      isCurrent,
      notificationEnabled: notifs[p.id] ?? true,
    };
  });

  // Calculate countdown
  const diffMs = Math.max(0, nextPrayerItem.date.getTime() - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formattedCountdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const nextPrayerObj: PrayerTime = {
    id: nextPrayerItem.id as any,
    name: nextPrayerItem.name,
    arabicName: nextPrayerItem.arabicName,
    time: formatTime(nextPrayerItem.date, is24Hour),
    date: nextPrayerItem.date,
    isPassed: false,
    isNext: true,
    isCurrent: false,
    notificationEnabled: notifs[nextPrayerItem.id] ?? true,
  };

  const currentPrayerObj: PrayerTime | null = currentPrayerItem
    ? {
        id: currentPrayerItem.id as any,
        name: currentPrayerItem.name,
        arabicName: currentPrayerItem.arabicName,
        time: formatTime(currentPrayerItem.date, is24Hour),
        date: currentPrayerItem.date,
        isPassed: true,
        isNext: false,
        isCurrent: true,
        notificationEnabled: notifs[currentPrayerItem.id] ?? true,
      }
    : null;

  return {
    times,
    nextPrayer: nextPrayerObj,
    currentPrayer: currentPrayerObj,
    secondsToNext: totalSeconds,
    formattedCountdown,
    hijriDate: getHijriDate(date, hijriAdj),
    solarNoon: formatTime(dhuhrDate, is24Hour),
    sunriseTime: formatTime(sunriseDate, is24Hour),
    sunsetTime: formatTime(maghribDate, is24Hour),
  };
}
