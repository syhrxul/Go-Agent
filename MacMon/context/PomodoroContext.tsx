import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type PomodoroContextType = {
  timeLeft: number;
  isActive: boolean;
  isBreak: boolean;
  isLongBreak: boolean; // Tambahan: Biar tahu sedang Long Break atau Short Break
  completedCycles: number; // Tambahan: Menghitung Lap saat ini
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  cycles: number; 
  toggleTimer: () => void;
  resetTimer: () => void;
  updateSettings: (focus: number, shortBreak: number, longBreak: number, cycleCount: number) => void;
};

const PomodoroContext = createContext<PomodoroContextType>({
  timeLeft: 25 * 60,
  isActive: false,
  isBreak: false,
  isLongBreak: false,
  completedCycles: 0,
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  cycles: 4,
  toggleTimer: () => {},
  resetTimer: () => {},
  updateSettings: () => {},
});

export const usePomodoro = () => useContext(PomodoroContext);

export const PomodoroProvider = ({ children }: { children: React.ReactNode }) => {
  // Settings
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [cycles, setCycles] = useState(4); 

  // Timer State
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false); // State baru
  const [completedCycles, setCompletedCycles] = useState(0); // State baru

  // --- LOAD SETTINGS ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('pomodoro_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setFocusDuration(parsed.focus);
          setBreakDuration(parsed.shortBreak);
          setLongBreakDuration(parsed.longBreak);
          setCycles(parsed.cycles);
          setTimeLeft(parsed.focus * 60);
        }
      } catch (error) {
        console.log("Gagal memuat setting:", error);
      }
    };
    loadSettings();
  }, []);

  // --- LOGIC TIMER OTOMATIS ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      // --- WAKTU HABIS, TENTUKAN LANGKAH SELANJUTNYA ---
      
      if (!isBreak) {
        // ==> FOKUS SELESAI
        const newCompleted = completedCycles + 1;
        setCompletedCycles(newCompleted);

        // Cek apakah saatnya Long Break (Setiap 2 Laps)
        // Contoh: Lap 2, 4, 6 akan trigger Long Break
        if (newCompleted % 2 === 0 && newCompleted !== 0) {
            setIsBreak(true);
            setIsLongBreak(true);
            setTimeLeft(longBreakDuration * 60);
        } else {
            // Short Break
            setIsBreak(true);
            setIsLongBreak(false);
            setTimeLeft(breakDuration * 60);
        }
        
      } else {
        // ==> ISTIRAHAT SELESAI (Short atau Long)
        // Kembali ke Fokus
        setIsBreak(false);
        setIsLongBreak(false);
        setTimeLeft(focusDuration * 60);
      }
      
      // PENTING: Jangan set isActive(false) agar timer jalan terus (Auto-start)
    }

    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, isBreak, completedCycles, focusDuration, breakDuration, longBreakDuration]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setIsLongBreak(false);
    setCompletedCycles(0); // Reset lap
    setTimeLeft(focusDuration * 60);
  };

  const updateSettings = async (focus: number, shortBreak: number, longBreak: number, cycleCount: number) => {
    setFocusDuration(focus);
    setBreakDuration(shortBreak);
    setLongBreakDuration(longBreak);
    setCycles(cycleCount);

    if (!isActive) {
        setTimeLeft(focus * 60);
    }

    try {
        const settingsToSave = { focus, shortBreak, longBreak, cycles: cycleCount };
        await AsyncStorage.setItem('pomodoro_settings', JSON.stringify(settingsToSave));
    } catch (error) {
        console.log("Gagal menyimpan setting:", error);
    }
  };

  return (
    <PomodoroContext.Provider value={{
      timeLeft, isActive, isBreak, isLongBreak, completedCycles,
      focusDuration, breakDuration, longBreakDuration, cycles,
      toggleTimer, resetTimer, updateSettings
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};