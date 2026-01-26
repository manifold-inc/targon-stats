import { useEffect, useMemo, useRef, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  isReady?: boolean;
}

function getFormatString(end: number, decimals: number): string {
  if (decimals === 0) {
    if (end === 0) {
      return "0000000";
    }
    const endStr = Math.round(end).toString();
    return "0".repeat(endStr.length);
  }

  if (end === 0) {
    if (decimals === 2) {
      return "000.00";
    }
    if (decimals === 4) {
      return "0000.0000";
    }
    return "0".repeat(3) + "." + "0".repeat(decimals);
  }

  const endStr = end.toFixed(decimals);
  const parts = endStr.split(".");
  const integerPart = parts[0] || "0";
  const decimalPart = parts[1] || "0";

  return "0".repeat(integerPart.length) + "." + "0".repeat(decimalPart.length);
}

function formatValue(
  value: number,
  formatStr: string,
  decimals: number,
): string {
  if (decimals === 0) {
    const rounded = Math.round(value);
    const formatLength = formatStr.length;
    return rounded.toString().padStart(formatLength, "0");
  }

  const formatted = value.toFixed(decimals);
  const parts = formatted.split(".");
  const formatParts = formatStr.split(".");
  const integerPart = parts[0] || "0";
  const decimalPart = parts[1] || "0";
  const formatInteger = formatParts[0] || "0";

  const paddedInteger = integerPart.padStart(formatInteger.length, "0");
  return `${paddedInteger}.${decimalPart}`;
}

export function useCountUp({
  end,
  duration = 1000,
  decimals = 0,
  isReady = true,
}: UseCountUpOptions): string {
  const [count, setCount] = useState(0);
  const formatStr = useMemo(
    () => getFormatString(end, decimals),
    [end, decimals],
  );
  const animationRef = useRef<number | null>(null);
  const countRef = useRef(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const targetValueRef = useRef(0);
  const isReadyRef = useRef(isReady);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!isReady) {
      const currentCount = countRef.current;
      startValueRef.current = currentCount;
      startTimeRef.current = Date.now();
      targetValueRef.current = currentCount + (end > 0 ? end * 0.3 : 100);

      const loadingDuration = 3000;

      const animate = () => {
        if (!startTimeRef.current || isReadyRef.current) {
          return;
        }

        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / loadingDuration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentValue =
          startValueRef.current +
          (targetValueRef.current - startValueRef.current) * easeOut;
        countRef.current = currentValue;
        setCount(currentValue);

        if (progress < 1 && !isReadyRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        } else if (!isReadyRef.current) {
          startValueRef.current = currentValue;
          startTimeRef.current = Date.now();
          targetValueRef.current = currentValue + 50;
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }

    if (end === 0) {
      setCount(0);
      countRef.current = 0;
      return;
    }

    startValueRef.current = countRef.current;
    startTimeRef.current = Date.now();
    targetValueRef.current = end;

    const animate = () => {
      if (!startTimeRef.current) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue =
        startValueRef.current +
        (targetValueRef.current - startValueRef.current) * easeOut;
      countRef.current = currentValue;
      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        countRef.current = end;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [end, duration, decimals, isReady]);

  return formatValue(count, formatStr, decimals);
}
