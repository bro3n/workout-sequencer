import type { WorkoutSequence, WorkoutLaunch } from "~/types/workout";

/**
 * Composable pour gérer le stockage local des séquences de workout
 */
export const useWorkoutStorage = () => {
  const STORAGE_KEY = "workout-sequences";
  const LAUNCH_HISTORY_KEY = "workout-launch-history";
  const MAX_LAUNCH_HISTORY = 3;

  /**
   * Récupère toutes les séquences depuis le localStorage
   */
  const getSequences = (type?: "workout" | "warmup"): WorkoutSequence[] => {
    if (typeof window === "undefined" || !window.localStorage) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const sequences = JSON.parse(stored) as WorkoutSequence[];
      // Reconvertir les dates depuis les strings
      const allSequences = sequences.map((seq) => ({
        ...seq,
        type: seq.type || "workout", // Par défaut, les anciennes séquences sont de type 'workout'
        createdAt: new Date(seq.createdAt),
        updatedAt: new Date(seq.updatedAt),
      }));

      // Filtrer par type si spécifié
      if (type) {
        return allSequences.filter((seq) => seq.type === type);
      }

      return allSequences;
    } catch (error) {
      console.error("Erreur lors de la récupération des séquences:", error);
      return [];
    }
  };

  /**
   * Sauvegarde une nouvelle séquence dans le localStorage
   */
  const saveSequence = (sequence: WorkoutSequence): boolean => {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      const existingSequences = getSequences();
      const updatedSequences = [...existingSequences, sequence];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSequences));
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la séquence:", error);
      return false;
    }
  };

  /**
   * Met à jour une séquence existante
   */
  const updateSequence = (updatedSequence: WorkoutSequence): boolean => {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      const sequences = getSequences();
      const index = sequences.findIndex((seq) => seq.id === updatedSequence.id);

      if (index === -1) return false;

      sequences[index] = {
        ...updatedSequence,
        updatedAt: new Date(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sequences));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la séquence:", error);
      return false;
    }
  };

  /**
   * Supprime une séquence par son ID
   */
  const deleteSequence = (id: string): boolean => {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      const sequences = getSequences();
      const filteredSequences = sequences.filter((seq) => seq.id !== id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSequences));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la séquence:", error);
      return false;
    }
  };

  /**
   * Récupère une séquence par son ID
   */
  const getSequenceById = (id: string): WorkoutSequence | null => {
    const sequences = getSequences();
    return sequences.find((seq) => seq.id === id) || null;
  };

  /**
   * Vide complètement le localStorage des séquences
   */
  const clearAllSequences = (): boolean => {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les séquences:", error);
      return false;
    }
  };

  /**
   * Récupère uniquement les séquences de type workout (normales)
   */
  const getWorkoutSequences = (): WorkoutSequence[] => {
    return getSequences("workout");
  };

  /**
   * Récupère uniquement les séquences de type warmup (échauffements)
   */
  const getWarmupSequences = (): WorkoutSequence[] => {
    return getSequences("warmup");
  };

  /**
   * Enregistre un lancement de séquence dans l'historique
   */
  const recordLaunch = (sequenceId: string, sequenceName: string): boolean => {
    if (typeof window === "undefined" || !window.localStorage) return false;

    try {
      const launches = getLaunchHistory();
      const newLaunch: WorkoutLaunch = {
        sequenceId,
        sequenceName,
        launchedAt: new Date(),
      };

      // Ajouter le nouveau lancement au début
      const updatedLaunches = [newLaunch, ...launches];

      // Garder seulement les 3 derniers lancements
      const trimmedLaunches = updatedLaunches.slice(0, MAX_LAUNCH_HISTORY);

      localStorage.setItem(LAUNCH_HISTORY_KEY, JSON.stringify(trimmedLaunches));
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du lancement:", error);
      return false;
    }
  };

  /**
   * Récupère l'historique des lancements
   */
  const getLaunchHistory = (): WorkoutLaunch[] => {
    if (typeof window === "undefined" || !window.localStorage) return [];

    try {
      const stored = localStorage.getItem(LAUNCH_HISTORY_KEY);
      if (!stored) return [];

      const launches = JSON.parse(stored) as WorkoutLaunch[];
      // Reconvertir les dates depuis les strings
      return launches.map((launch) => ({
        ...launch,
        launchedAt: new Date(launch.launchedAt),
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      return [];
    }
  };

  /**
   * Récupère les détails des séquences récemment lancées
   * Retourne uniquement la dernière occurrence de chaque séquence
   */
  const getRecentLaunches = (): Array<WorkoutLaunch & { sequence: WorkoutSequence | null }> => {
    const launches = getLaunchHistory();

    // Utiliser un Map pour garder uniquement la dernière occurrence de chaque séquence
    const uniqueLaunches = new Map<string, WorkoutLaunch>();

    // Parcourir les lancements (déjà triés du plus récent au plus ancien)
    launches.forEach((launch) => {
      // Si la séquence n'est pas encore dans le Map, l'ajouter
      if (!uniqueLaunches.has(launch.sequenceId)) {
        uniqueLaunches.set(launch.sequenceId, launch);
      }
    });

    // Convertir le Map en tableau et ajouter les détails de la séquence
    return Array.from(uniqueLaunches.values()).map((launch) => ({
      ...launch,
      sequence: getSequenceById(launch.sequenceId),
    }));
  };

  return {
    getSequences,
    getWorkoutSequences,
    getWarmupSequences,
    saveSequence,
    updateSequence,
    deleteSequence,
    getSequenceById,
    clearAllSequences,
    recordLaunch,
    getLaunchHistory,
    getRecentLaunches,
  };
};
