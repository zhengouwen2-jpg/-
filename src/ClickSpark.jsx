import { useCallback, useEffect, useRef } from 'react';

function ClickSpark({
  sparkColor = '#ff2a19',
  sparkSize = 12,
  sparkRadius = 34,
  sparkCount = 12,
  duration = 520,
  easing = 'ease-out',
  extraScale = 1,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const frameRef = useRef(0);

  const ease = useCallback(
    (t) => {
      if (easing === 'linear') return t;
      if (easing === 'ease-in') return t * t;
      if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      return t * (2 - t);
    },
    [easing],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = ease(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const alpha = 1 - eased;
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        return true;
      });
      if (sparksRef.current.length && !document.hidden) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        frameRef.current = 0;
      }
    };

    const handleClick = (event) => {
      if (reducedMotion.matches || document.hidden) return;
      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }, (_, index) => ({
        x: event.clientX,
        y: event.clientY,
        angle: (2 * Math.PI * index) / sparkCount,
        startTime: now,
      }));

      sparksRef.current.push(...newSparks);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (!document.hidden || !frameRef.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      sparksRef.current = [];
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    window.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      sparksRef.current = [];
    };
  }, [duration, ease, extraScale, sparkColor, sparkCount, sparkRadius, sparkSize]);

  return <canvas className="clickSparkCanvas" ref={canvasRef} aria-hidden="true" />;
}

export default ClickSpark;
