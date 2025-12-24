import { useState } from "react";

export function useHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = (next: T | ((prev: T) => T)) => {
    setPresent((current) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(current)
          : next;

      setPast((p) => [...p, current]);
      setFuture([]);
      return resolved;
    });
  };

  const undo = () => {
    setPast((p) => {
      if (p.length === 0) return p;

      const previous = p[p.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(previous);

      return p.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;

      const next = f[0];
      setPast((p) => [...p, present]);
      setPresent(next);

      return f.slice(1);
    });
  };

  return {
    present,
    set,
    undo,
    redo,
  };
}
