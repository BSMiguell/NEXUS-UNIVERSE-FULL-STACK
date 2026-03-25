import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/use-ui-store";

export function QuantumAmbience() {
  const enabled = useUIStore((state) => state.ambienceEnabled);
  const volume = useUIStore((state) => state.ambienceVolume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!enabled) {
      gainNodeRef.current?.gain.linearRampToValueAtTime(
        0,
        (audioContextRef.current?.currentTime ?? 0) + 0.2,
      );
      return;
    }

    const AudioContextCtor = window.AudioContext;

    if (!AudioContextCtor) {
      return;
    }

    if (!audioContextRef.current) {
      const context = new AudioContextCtor();
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);

      const lowOscillator = context.createOscillator();
      lowOscillator.type = "sine";
      lowOscillator.frequency.value = 55;

      const midOscillator = context.createOscillator();
      midOscillator.type = "triangle";
      midOscillator.frequency.value = 110;

      const shimmerOscillator = context.createOscillator();
      shimmerOscillator.type = "sine";
      shimmerOscillator.frequency.value = 220;

      const lowGain = context.createGain();
      lowGain.gain.value = 0.24;
      const midGain = context.createGain();
      midGain.gain.value = 0.08;
      const shimmerGain = context.createGain();
      shimmerGain.gain.value = 0.03;

      lowOscillator.connect(lowGain);
      midOscillator.connect(midGain);
      shimmerOscillator.connect(shimmerGain);
      lowGain.connect(masterGain);
      midGain.connect(masterGain);
      shimmerGain.connect(masterGain);

      lowOscillator.start();
      midOscillator.start();
      shimmerOscillator.start();

      audioContextRef.current = context;
      gainNodeRef.current = masterGain;
      oscillatorsRef.current = [lowOscillator, midOscillator, shimmerOscillator];
    }

    const context = audioContextRef.current;
    const gainNode = gainNodeRef.current;

    if (!context || !gainNode) {
      return;
    }

    void context.resume().catch(() => {});
    gainNode.gain.cancelScheduledValues(context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.4);
  }, [enabled, volume]);

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // no-op
        }
      });
      void audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return null;
}
