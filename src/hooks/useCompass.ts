import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateRelativeQibla, calculateQiblaDirection } from '../utils/qibla';
import { sounds } from '../utils/audio';

export interface CompassState {
  heading: number; // Device heading in degrees (0 - 360, 0 is North)
  qiblaBearing: number; // Qibla angle from North (0 - 360)
  relativeAngle: number; // Angle to rotate compass needle/dial
  isAligned: boolean; // Device points directly towards Mecca (±3°)
  diffFromTarget: number; // -180 to +180
  hasSensor: boolean;
  permissionGranted: boolean;
  needsPermission: boolean;
  isSimulated: boolean;
  sensorAccuracy: 'high' | 'medium' | 'low' | 'unknown';
}

export function useCompass(userLat: number, userLng: number) {
  const [heading, setHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [sensorAccuracy, setSensorAccuracy] = useState<'high' | 'medium' | 'low' | 'unknown'>('unknown');

  const prevAlignedRef = useRef<boolean>(false);
  const lastVibrateTime = useRef<number>(0);

  // Calculate target Qibla bearing from North
  const qiblaBearing = calculateQiblaDirection(userLat, userLng);

  // Relative calculation
  const { relativeAngle, isAligned, diffFromTarget } = calculateRelativeQibla(
    heading,
    qiblaBearing
  );

  // Trigger haptic feedback and chime on transition to aligned state
  useEffect(() => {
    if (isAligned && !prevAlignedRef.current) {
      const now = Date.now();
      if (now - lastVibrateTime.current > 1200) {
        lastVibrateTime.current = now;
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([60, 40, 60]);
          } catch (e) {
            // ignore
          }
        }
        sounds.playQiblaAligned();
      }
    }
    prevAlignedRef.current = isAligned;
  }, [isAligned]);

  // Request permission for iOS 13+ devices
  const requestOrientationPermission = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setNeedsPermission(false);
          return true;
        } else {
          setPermissionGranted(false);
          return false;
        }
      } catch (err) {
        console.error('Permission request failed:', err);
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    // Check if permission is required (iOS)
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      setNeedsPermission(true);
    } else {
      setPermissionGranted(true);
    }

    let sensorEventReceived = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isSimulated) return;

      let compassHeading: number | null = null;

      // iOS Safari provides webkitCompassHeading directly relative to magnetic/true north
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        compassHeading = (e as any).webkitCompassHeading;
        sensorEventReceived = true;
        setHasSensor(true);
        if ((e as any).webkitCompassAccuracy !== undefined) {
          const acc = (e as any).webkitCompassAccuracy;
          setSensorAccuracy(acc < 15 ? 'high' : acc < 30 ? 'medium' : 'low');
        } else {
          setSensorAccuracy('high');
        }
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Android / Chrome standard alpha
        sensorEventReceived = true;
        setHasSensor(true);
        // Alpha is counter-clockwise rotation around Z-axis
        let compass = 360 - e.alpha;

        // Correct for screen orientation (landscape/portrait)
        if (window.screen && window.screen.orientation && window.screen.orientation.angle) {
          compass += window.screen.orientation.angle;
        }
        compassHeading = (compass + 360) % 360;
        setSensorAccuracy(e.absolute ? 'high' : 'medium');
      }

      if (compassHeading !== null) {
        setHeading(compassHeading);
      }
    };

    // Listen to absolute orientation if supported (Android Chrome)
    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    // Timeout to check if sensor exists
    const timeout = setTimeout(() => {
      if (!sensorEventReceived) {
        setHasSensor(false);
      }
    }, 2500);

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
      clearTimeout(timeout);
    };
  }, [isSimulated]);

  // Handler for manual rotation / simulation
  const setSimulatedHeading = useCallback((newHeading: number) => {
    setIsSimulated(true);
    setHeading((newHeading + 360) % 360);
  }, []);

  const resetToSensor = useCallback(() => {
    setIsSimulated(false);
  }, []);

  return {
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
  };
}
