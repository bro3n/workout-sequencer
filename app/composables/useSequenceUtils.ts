import type { WorkoutSequence } from "~/types/workout";

export const useSequenceUtils = () => {
  const estimateSequenceDuration = (sequence: WorkoutSequence): string => {
    const cycles = sequence.cycleRepetitions ?? 1;
    const breakDuration = sequence.breakDuration ?? 0;
    const cycleBreakDuration = sequence.cycleBreakDuration ?? 0;

    let cycleDuration = 0;
    for (const exercise of sequence.exercises) {
      if (exercise.type === "duration") {
        cycleDuration += exercise.duration ?? 0;
      } else {
        cycleDuration += (exercise.repetitions ?? 0) * 2;
      }
    }

    if (sequence.exercises.length > 1) {
      cycleDuration += (sequence.exercises.length - 1) * breakDuration;
    }

    const totalSeconds = cycles * cycleDuration + (cycles - 1) * cycleBreakDuration;

    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (seconds === 0) {
      return `${minutes}min`;
    }
    return `${minutes}min ${seconds}s`;
  };

  return { estimateSequenceDuration };
};
