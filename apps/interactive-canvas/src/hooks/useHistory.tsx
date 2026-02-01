



// import { useMemo, useRef, useState } from "react";

// type HistoryOptions = {
//   limit?: number;
// };

// type Updater<T> = (prev: T) => T;

// function deepClone<T>(v: T): T {
//   try {
//     // @ts-ignore
//     if (typeof structuredClone === "function") return structuredClone(v);
//   } catch {
//     // ignore
//   }
//   return JSON.parse(JSON.stringify(v));
// }

// export default function useHistory<T>(initial: T, options: HistoryOptions = {}) {
//   const limit = options.limit ?? 100;

//   const past = useRef<T[]>([]);
//   const future = useRef<T[]>([]);

//   /**
//    * Coalesce state:
//    * - base: snapshot before coalesced interaction started
//    * - value: latest computed value during coalescing
//    */
//   const coalesceRef = useRef<{ key: string; base: T; value: T } | null>(null);

//   const [present, setPresent] = useState<T>(deepClone(initial));

//   function pushPast(snapshot: T) {
//     past.current.push(deepClone(snapshot));
//     if (past.current.length > limit) past.current.shift();
//     future.current = []; // new action clears redo stack
//   }

//   function set(next: T | Updater<T>) {
//     const nextValue =
//       typeof next === "function" ? (next as Updater<T>)(present) : next;

//     // normal action => push current present, clear redo
//     pushPast(present);
//     setPresent(deepClone(nextValue));
//   }

//   /**
//    * Coalesced set:
//    * - pushes base snapshot to past ONLY ONCE (first call per key)
//    * - updates present many times without growing history
//    */
//   function setWithCoalesce(key: string, updater: Updater<T>) {
//     // start new coalesce session (or switch keys)
//     if (!coalesceRef.current || coalesceRef.current.key !== key) {
//       // push base snapshot once
//       pushPast(present);

//       const nextValue = updater(present);
//       coalesceRef.current = {
//         key,
//         base: deepClone(present),
//         value: deepClone(nextValue),
//       };
//       setPresent(deepClone(nextValue));
//       return;
//     }

//     // continue existing coalesce session
//     const baseForUpdate = coalesceRef.current.value;
//     const nextValue = updater(baseForUpdate);
//     coalesceRef.current.value = deepClone(nextValue);
//     setPresent(deepClone(nextValue));
//   }

//   /**
//    * Commit coalesce:
//    * We already pushed base snapshot at the start, so commit just clears the session.
//    * Undo will revert to base snapshot in one step.
//    */
//   function commitCoalesce(_key?: string) {
//     if (!coalesceRef.current) return;
//     coalesceRef.current = null;
//   }

//   function undo() {
//     const prev = past.current.pop();
//     if (prev === undefined) return;
//     future.current.push(deepClone(present));
//     setPresent(deepClone(prev));
//   }

//   function redo() {
//     const next = future.current.pop();
//     if (next === undefined) return;
//     pushPast(present);
//     setPresent(deepClone(next));
//   }

//   // Attach coalesce helpers onto `set` so consumers that only receive setElements(fn)
//   // can still call (setElements as any).setWithCoalesce / commitCoalesce (SCALED v2 friendly).
//   const setFn = useMemo(() => {
//     const fn = set as any;
//     fn.setWithCoalesce = setWithCoalesce;
//     fn.commitCoalesce = commitCoalesce;
//     return fn as typeof set & {
//       setWithCoalesce?: typeof setWithCoalesce;
//       commitCoalesce?: typeof commitCoalesce;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [present]); // present changes rebinds fn, safe for our use

//   return {
//     present,
//     set: setFn,
//     setWithCoalesce,
//     commitCoalesce,
//     undo,
//     redo,
//   };
// }



import { useMemo, useRef, useState } from "react";

type HistoryOptions = {
  limit?: number;
};

type Updater<T> = (prev: T) => T;

function deepClone<T>(v: T): T {
  try {
    // @ts-ignore
    if (typeof structuredClone === "function") return structuredClone(v);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(v));
}

export default function useHistory<T>(initial: T, options: HistoryOptions = {}) {
  const limit = options.limit ?? 100;

  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  /**
   * Coalesce state:
   * - base: snapshot before coalesced interaction started
   * - value: latest computed value during coalescing
   */
  const coalesceRef = useRef<{ key: string; base: T; value: T } | null>(null);

  const [present, setPresent] = useState<T>(deepClone(initial));

  function pushPast(snapshot: T) {
    past.current.push(deepClone(snapshot));
    if (past.current.length > limit) past.current.shift();
    future.current = []; // new action clears redo stack
  }

  function set(next: T | Updater<T>) {
    const nextValue =
      typeof next === "function" ? (next as Updater<T>)(present) : next;

    // normal action => push current present, clear redo
    pushPast(present);
    setPresent(deepClone(nextValue));
  }

  /**
   * Coalesced set:
   * - pushes base snapshot to past ONLY ONCE (first call per key)
   * - updates present many times without growing history
   */
  function setWithCoalesce(key: string, updater: Updater<T>) {
    // start new coalesce session (or switch keys)
    if (!coalesceRef.current || coalesceRef.current.key !== key) {
      // push base snapshot once
      pushPast(present);

      const nextValue = updater(present);
      coalesceRef.current = {
        key,
        base: deepClone(present),
        value: deepClone(nextValue),
      };
      setPresent(deepClone(nextValue));
      return;
    }

    // continue existing coalesce session
    const baseForUpdate = coalesceRef.current.value;
    const nextValue = updater(baseForUpdate);
    coalesceRef.current.value = deepClone(nextValue);
    setPresent(deepClone(nextValue));
  }

  /**
   * Commit coalesce:
   * We already pushed base snapshot at the start, so commit just clears the session.
   * Undo will revert to base snapshot in one step.
   */
  function commitCoalesce(_key?: string) {
    if (!coalesceRef.current) return;
    coalesceRef.current = null;
  }

  function undo() {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(deepClone(present));
    setPresent(deepClone(prev));
  }

  function redo() {
    const next = future.current.pop();
    if (next === undefined) return;

    // redo is NOT a "new action" -> do NOT clear remaining future
    past.current.push(deepClone(present));
    if (past.current.length > limit) past.current.shift();

    setPresent(deepClone(next));
  }

  // Attach coalesce helpers onto `set` so consumers that only receive setElements(fn)
  // can still call (setElements as any).setWithCoalesce / commitCoalesce (SCALED v2 friendly).
  const setFn = useMemo(() => {
    const fn = set as any;
    fn.setWithCoalesce = setWithCoalesce;
    fn.commitCoalesce = commitCoalesce;
    return fn as typeof set & {
      setWithCoalesce?: typeof setWithCoalesce;
      commitCoalesce?: typeof commitCoalesce;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]); // present changes rebinds fn, safe for our use

  return {
    present,
    set: setFn,
    setWithCoalesce,
    commitCoalesce,
    undo,
    redo,
  };
}