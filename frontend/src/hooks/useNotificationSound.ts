import { useCallback, useEffect, useRef, useState } from 'react';
import { loadStored, saveStored } from '../utils/intelligence/storage';

const SOUND_URL = '/sounds/notification.mp3';
const SOUND_KEY = 'soundEnabled';

/**
 * Plays a small bundled chime when the user's unread notification count
 * increases. Rules:
 *  - Never plays on initial load / login (no baseline => keep quiet).
 *  - Never plays for polls that return the same count, or when count drops
 *    (e.g. after the user reads notifications).
 *  - Mute preference lives in localStorage (careertrack:soundEnabled);
 *    the backend is never involved.
 *  - Browsers block audio until the user interacts with the page, so the
 *    Audio is unlocked on the first pointer/keyboard interaction.
 */
export function useNotificationSound(unread: number | undefined) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadStored<boolean>(SOUND_KEY, true));
  const prevRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const lastPlayedAtRef = useRef(0);

  useEffect(() => {
    saveStored(SOUND_KEY, soundEnabled);
  }, [soundEnabled]);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      audio.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, [unlock]);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = unread;
    if (prev === undefined || unread === undefined) return;
    if (unread <= prev) return;
    if (!soundEnabled) return;

    const now = Date.now();
    if (now - lastPlayedAtRef.current < 1500) return;
    lastPlayedAtRef.current = now;

    if (!audioRef.current) {
      audioRef.current = new Audio(SOUND_URL);
      audioRef.current.volume = 0.5;
    }
    if (unlockedRef.current) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.load();
    }
  }, [unread, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => !v);
  }, []);

  return { soundEnabled, toggleSound };
}