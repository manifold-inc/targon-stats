import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  refs: RefObject<T>[],
  handler: (event: MouseEvent) => void,
  enabled = true
) {
  const handlerRef = useRef(handler);
  const refsRef = useRef(refs);

  useEffect(() => {
    handlerRef.current = handler;
    refsRef.current = refs;
  }, [handler, refs]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideAll = refsRef.current.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (clickedOutsideAll) {
        handlerRef.current(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled]);
}
