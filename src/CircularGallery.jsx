import { useEffect, useMemo, useRef, useState } from 'react';
import './CircularGallery.css';

function CircularGallery({ items = [], bend = 28, scrollSpeed = 0.22, textColor = '#ffffff' }) {
  const viewportRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0 });
  const [offset, setOffset] = useState(0);

  const normalizedItems = useMemo(() => (items.length ? items : []), [items]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      setOffset((value) => value + delta * scrollSpeed);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [scrollSpeed]);

  const startDrag = (clientX) => {
    dragRef.current = { active: true, startX: clientX, startOffset: offset };
  };

  const moveDrag = (clientX) => {
    if (!dragRef.current.active) return;
    const delta = dragRef.current.startX - clientX;
    setOffset(dragRef.current.startOffset + delta * 0.9);
  };

  const endDrag = () => {
    dragRef.current.active = false;
  };

  return (
    <div
      className="circularGallery"
      ref={viewportRef}
      onMouseDown={(event) => startDrag(event.clientX)}
      onMouseMove={(event) => moveDrag(event.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(event) => startDrag(event.touches[0].clientX)}
      onTouchMove={(event) => moveDrag(event.touches[0].clientX)}
      onTouchEnd={endDrag}
      style={{ '--gallery-text': textColor }}
    >
      <div className="circularGalleryTrack" aria-label="实习作品画廊">
        {normalizedItems.map((item, index) => {
          const slotWidth = 250;
          const rawPosition = index - offset / slotWidth;
          const half = normalizedItems.length / 2;
          const loopedPosition = ((rawPosition + half) % normalizedItems.length) - half;
          const distance = Math.abs(loopedPosition);
          const clamped = Math.max(-4, Math.min(4, loopedPosition));
          const x = clamped * 270;
          const y = 34 + distance * distance * 12 + distance * 5;
          const rotate = Math.max(-18, Math.min(18, clamped * -4.8));
          const rotateY = Math.max(-10, Math.min(10, clamped * -2.2));
          const scale = Math.max(0.62, 1.08 - distance * 0.12);
          const opacity = Math.max(0.28, 1 - Math.max(0, distance - 3) * 0.22);

          return (
            <article
              className="circularGalleryItem"
              key={`${item.text}-${item.image}`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${-distance * 26}px) rotateY(${rotateY}deg) rotateZ(${rotate}deg) scale(${scale})`,
                opacity,
                zIndex: Math.round(1000 - distance * 10),
              }}
            >
              <div className="circularGalleryImage">
                <img src={item.image} alt={item.text} draggable="false" />
              </div>
              <h3>{item.text}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </article>
          );
        })}
      </div>
      <div className="circularGalleryHint">SCROLL / DRAG</div>
    </div>
  );
}

export default CircularGallery;
