import { useEffect, useMemo, useRef, useState } from 'react';
import './CircularGallery.css';

function wrapCentered(value, span) {
  if (!span) return value;
  const half = span / 2;
  return ((((value + half) % span) + span) % span) - half;
}

function CircularGallery({
  items = [],
  bend = 28,
  scrollSpeed = 0.22,
  textColor = '#ffffff',
  variant = 'default',
  className = '',
  autoPlay = false,
  autoPlaySpeed = 10,
  pauseOnHover = true,
  initialOffset = 0,
  showCaptions = true,
}) {
  const viewportRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startOffset: initialOffset });
  const interactionRef = useRef({ hovering: false, dragging: false });
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [offset, setOffset] = useState(initialOffset);

  const normalizedItems = useMemo(() => (items.length ? items : []), [items]);
  const isCompact = variant === 'compact';
  const slotWidth = isCompact ? 210 : 250;
  const rootClassName = ['circularGallery', `circularGallery--${variant}`, className].filter(Boolean).join(' ');

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const onWheel = (event) => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      setOffset((value) => value + delta * scrollSpeed);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [scrollSpeed]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (
      !autoPlay
      || !viewport
      || window.matchMedia('(max-width: 980px)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return undefined;

    let isVisible = false;
    let isPageVisible = !document.hidden;

    const tick = (time) => {
      const lastTime = lastTimeRef.current || time;
      const delta = Math.min(time - lastTime, 64);
      lastTimeRef.current = time;

      const shouldPause = interactionRef.current.dragging || (pauseOnHover && interactionRef.current.hovering);
      if (!shouldPause) {
        setOffset((value) => value + (autoPlaySpeed * delta) / 1000);
      }

      frameRef.current = isVisible && isPageVisible ? window.requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!isVisible || !isPageVisible || frameRef.current) return;
      lastTimeRef.current = 0;
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastTimeRef.current = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    }, { rootMargin: '160px 0px', threshold: 0.01 });

    const handleVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) start();
      else stop();
    };

    observer.observe(viewport);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [autoPlay, autoPlaySpeed, pauseOnHover]);

  const startDrag = (clientX) => {
    interactionRef.current.dragging = true;
    dragRef.current = { active: true, startX: clientX, startOffset: offset };
  };

  const moveDrag = (clientX) => {
    if (!dragRef.current.active) return;
    const delta = dragRef.current.startX - clientX;
    setOffset(dragRef.current.startOffset + delta * 0.9);
  };

  const endDrag = () => {
    dragRef.current.active = false;
    interactionRef.current.dragging = false;
  };

  const loopWidth = normalizedItems.length * slotWidth;
  const visibleOffset = loopWidth ? ((offset % loopWidth) + loopWidth) % loopWidth : offset;

  return (
    <div
      className={rootClassName}
      ref={viewportRef}
      onMouseEnter={() => {
        interactionRef.current.hovering = true;
      }}
      onMouseDown={(event) => startDrag(event.clientX)}
      onMouseMove={(event) => moveDrag(event.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={() => {
        interactionRef.current.hovering = false;
        endDrag();
      }}
      onTouchStart={(event) => {
        interactionRef.current.hovering = true;
        startDrag(event.touches[0].clientX);
      }}
      onTouchMove={(event) => moveDrag(event.touches[0].clientX)}
      onTouchEnd={() => {
        interactionRef.current.hovering = false;
        endDrag();
      }}
      style={{ '--gallery-text': textColor, '--gallery-bend': bend }}
    >
      <div className="circularGalleryTrack" aria-label="实习作品画廊">
        {normalizedItems.map((item, index) => {
          const rawPosition = index - visibleOffset / slotWidth;
          const loopedPosition = wrapCentered(rawPosition, normalizedItems.length);
          const distance = Math.abs(loopedPosition);
          const clamped = Math.max(-4, Math.min(4, loopedPosition));
          const x = loopedPosition * (isCompact ? 225 : 270);
          const y = isCompact ? 20 + distance * distance * 8 + distance * 4 : 34 + distance * distance * 12 + distance * 5;
          const rotate = Math.max(-18, Math.min(18, clamped * -4.8));
          const rotateY = Math.max(-10, Math.min(10, clamped * -2.2));
          const scale = isCompact ? Math.max(0.64, 1.02 - distance * 0.09) : Math.max(0.62, 1.08 - distance * 0.12);
          const opacity = Math.max(0.28, 1 - Math.max(0, distance - 3) * 0.22);

          return (
            <article
              className="circularGalleryItem"
              key={`${item.text}-${item.image}`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${-distance * (isCompact ? 18 : 26)}px) rotateY(${rotateY}deg) rotateZ(${rotate}deg) scale(${scale})`,
                opacity,
                zIndex: Math.round(1000 - distance * 10),
              }}
            >
              <div className="circularGalleryImage">
                <img src={item.image} alt={item.text} draggable="false" loading="lazy" decoding="async" />
              </div>
              {showCaptions ? (
                <>
                  <h3>{item.text}</h3>
                  {item.description ? <p>{item.description}</p> : null}
                </>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="circularGalleryHint">SCROLL / DRAG</div>
    </div>
  );
}

export default CircularGallery;
