// Stato locale (AsyncStorage): nessun login, solo un nome studente, l'elenco delle materie
// aperte su questo dispositivo e il colore scelto per ciascuna. Il backend non ha un concetto
// di "elenco materie di uno studente": è solo una cartella per materia, quindi la lista resta
// locale.

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { subjectPalette } from '@/constants/theme';

const STUDENT_KEY = 'pupo:student';
const SUBJECTS_KEY = 'pupo:subjects';
const SUBJECT_COLORS_KEY = 'pupo:subjectColors';
const DEFAULT_STUDENT = 'demo';
const DEFAULT_SUBJECTS = ['analisi1'];
const DEFAULT_SUBJECT_COLOR: string = subjectPalette[0];

export function useStudent() {
  const [loading, setLoading] = useState(true);
  const [student, setStudentState] = useState(DEFAULT_STUDENT);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [savedStudent, savedSubjects, savedColors] = await Promise.all([
          AsyncStorage.getItem(STUDENT_KEY),
          AsyncStorage.getItem(SUBJECTS_KEY),
          AsyncStorage.getItem(SUBJECT_COLORS_KEY),
        ]);
        if (savedStudent) setStudentState(savedStudent);
        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
        if (savedColors) setSubjectColors(JSON.parse(savedColors));
      } catch {
        // storage non disponibile: restano i default
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setStudent = useCallback((name: string) => {
    const trimmed = name.trim() || DEFAULT_STUDENT;
    setStudentState(trimmed);
    AsyncStorage.setItem(STUDENT_KEY, trimmed).catch(() => {});
  }, []);

  const addSubject = useCallback((name: string, color: string = DEFAULT_SUBJECT_COLOR) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubjects((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setSubjectColors((prev) => {
      if (prev[trimmed]) return prev;
      const next = { ...prev, [trimmed]: color };
      AsyncStorage.setItem(SUBJECT_COLORS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const colorFor = useCallback(
    (subject: string) => subjectColors[subject] ?? DEFAULT_SUBJECT_COLOR,
    [subjectColors]
  );

  return { loading, student, setStudent, subjects, addSubject, colorFor };
}
