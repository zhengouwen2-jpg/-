import { useCallback, useEffect, useMemo, useRef } from 'react';

const distance = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const mapDistance = (d, maxDist, minVal, maxVal) => {
  const pressure = Math.max(0, 1 - d / maxDist);
  return minVal + pressure * (maxVal - minVal);
};

const sweepPlayedKey = '__owenTextPressureSweepPlayed';

function TextPressure({ text, className = '', textColor = '#ff2a19', autoSweep = false }) {
  const titleRef = useRef(null);
  const charsRef = useRef([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const easedRef = useRef({ x: 0, y: 0 });
  const sweepRef = useRef({
    active: false,
    start: 0,
    duration: 2600,
    completed: false,
  });
  const visibilityRef = useRef({ inViewport: true, pageVisible: !document.hidden });

  const chars = useMemo(() => text.split(''), [text]);

  const primeCursor = useCallback(() => {
    if (!titleRef.current) return;
    const rect = titleRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    cursorRef.current = center;
    easedRef.current = center;
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    primeCursor();

    const handleMove = (event) => {
      if (!visibilityRef.current.inViewport || !visibilityRef.current.pageVisible) return;
      sweepRef.current.active = false;
      cursorRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleTouch = (event) => {
      if (!visibilityRef.current.inViewport || !visibilityRef.current.pageVisible) return;
      sweepRef.current.active = false;
      const touch = event.touches[0];
      if (touch) cursorRef.current = { x: touch.clientX, y: touch.clientY };
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('resize', primeCursor);

    let sweepTimer;
    if (autoSweep && !sweepRef.current.completed && !window[sweepPlayedKey]) {
      sweepTimer = window.setTimeout(() => {
        window[sweepPlayedKey] = true;
        sweepRef.current = {
          ...sweepRef.current,
          active: true,
          start: performance.now(),
        };
      }, 450);
    }

    return () => {
      window.clearTimeout(sweepTimer);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', primeCursor);
    };
  }, [autoSweep, primeCursor]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const title = titleRef.current;
    if (!title) return undefined;
    let frameId = 0;

    const animate = () => {
      const now = performance.now();

      if (sweepRef.current.active && titleRef.current) {
        const elapsed = now - sweepRef.current.start;
        const progress = Math.min(elapsed / sweepRef.current.duration, 1);
        const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        const rect = titleRef.current.getBoundingClientRect();
        const padding = rect.width * 0.08;

        cursorRef.current = {
          x: rect.left + padding + (rect.width - padding * 2) * easedProgress,
          y: rect.top + rect.height * 0.48,
        };

        if (progress >= 1) {
          sweepRef.current.active = false;
          sweepRef.current.completed = true;
          cursorRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }

      easedRef.current.x += (cursorRef.current.x - easedRef.current.x) / 18;
      easedRef.current.y += (cursorRef.current.y - easedRef.current.y) / 18;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 2, 1);

        charsRef.current.forEach((charEl) => {
          if (!charEl) return;
          const rect = charEl.getBoundingClientRect();
          const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          const d = distance(easedRef.current, center);
          const pressure = Math.max(0, 1 - d / maxDist);
          const width = Math.floor(mapDistance(d, maxDist, 90, 126));
          const weight = Math.floor(mapDistance(d, maxDist, 680, 920));
          const italic = mapDistance(d, maxDist, 0.08, 0.24).toFixed(2);

          const stretch = (0.94 + pressure * 0.22).toFixed(2);
          const skew = (-1.5 + pressure * 5.5).toFixed(2);
          const lift = pressure * -4.5;

          charEl.style.fontVariationSettings = `'wght' ${weight}, 'wdth' ${width}, 'ital' ${italic}`;
          charEl.style.transform = `translateY(${lift.toFixed(2)}px) scaleX(${stretch}) skewX(${skew}deg)`;
        });
      }

      frameId = visibilityRef.current.inViewport && visibilityRef.current.pageVisible
        ? requestAnimationFrame(animate)
        : 0;
    };

    const start = () => {
      if (!visibilityRef.current.inViewport || !visibilityRef.current.pageVisible || frameId) return;
      frameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visibilityRef.current.inViewport = entry.isIntersecting;
      if (entry.isIntersecting) {
        primeCursor();
        start();
      } else {
        stop();
      }
    }, { threshold: 0.01 });

    const handleVisibility = () => {
      visibilityRef.current.pageVisible = !document.hidden;
      if (visibilityRef.current.pageVisible) start();
      else stop();
    };

    observer.observe(title);
    document.addEventListener('visibilitychange', handleVisibility);
    start();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [autoSweep, primeCursor]);

  return (
    <span
      ref={titleRef}
      className={`textPressure ${className}`}
      style={{ color: textColor }}
      aria-label={text}
    >
      {chars.map((char, index) => (
        <span
          className="textPressureChar"
          data-char={char}
          key={`${char}-${index}`}
          ref={(el) => {
            charsRef.current[index] = el;
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default TextPressure;
