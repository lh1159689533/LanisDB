import { useRef } from 'react';

export default function usePersistFn(fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const persistFn = useRef<(...args: any[]) => any>();

  if (!persistFn.current) {
    persistFn.current = function (...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return persistFn.current;
}
