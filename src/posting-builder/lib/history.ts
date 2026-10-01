import { useCallback, useRef, useState } from 'react';

type Updater<T> = T | ((current: T) => T);

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistoryState<T>(initial: T, maxHistory = 80) {
  const [state, setState] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const lastCoalescedAt = useRef(0);

  const update = useCallback((updater: Updater<T>, options: { coalesce?: boolean } = {}) => {
    const now = Date.now();
    const coalesce = options.coalesce ?? true;
    setState((current) => {
      const next = typeof updater === 'function' ? (updater as (value: T) => T)(current.present) : updater;
      if (Object.is(next, current.present)) return current;

      const shouldMerge = coalesce && now - lastCoalescedAt.current < 420;
      lastCoalescedAt.current = coalesce ? now : 0;

      return {
        past: shouldMerge ? current.past : [...current.past, current.present].slice(-maxHistory),
        present: next,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    lastCoalescedAt.current = 0;
    setState((current) => {
      if (!current.past.length) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, maxHistory),
      };
    });
  }, [maxHistory]);

  const redo = useCallback(() => {
    lastCoalescedAt.current = 0;
    setState((current) => {
      if (!current.future.length) return current;
      const next = current.future[0];
      return {
        past: [...current.past, current.present].slice(-maxHistory),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, [maxHistory]);

  const reset = useCallback((value: T) => {
    lastCoalescedAt.current = 0;
    setState({ past: [], present: value, future: [] });
  }, []);

  return {
    value: state.present,
    update,
    reset,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
