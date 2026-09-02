import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './AccordionGallery.css';

function clampIndex(index, length) {
  if (!length) return 0;
  return (index + length) % length;
}

function AccordionGallery({
  items = [],
  defaultIndex = 2,
  activeIndex: controlledActiveIndex,
  onActiveChange,
  accentColor = '#ff2a19',
  height = 620,
  gap = 12,
  radius = 8,
  expandRatio = 11,
  duration = 0.62,
  ease = 'power3.out',
  grayscale = true,
  className = '',
}) {
  const galleryRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(clampIndex(defaultIndex, items.length));
  const isControlled = controlledActiveIndex !== undefined;
  const activeIndex = isControlled ? clampIndex(controlledActiveIndex, items.length) : uncontrolledActiveIndex;

  const setPanelRef = useCallback((node, index) => {
    panelRefs.current[index] = node;
  }, []);

  const setMediaRef = useCallback((node, index) => {
    mediaRefs.current[index] = node;
  }, []);

  useEffect(() => {
    if (!items.length) return undefined;

    const activeGrow = expandRatio;
    const inactiveGrow = 1;
    const tweens = [];

    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      const isActive = index === activeIndex;
      tweens.push(gsap.to(panel, {
        flexGrow: isActive ? activeGrow : inactiveGrow,
        filter: grayscale && !isActive ? 'grayscale(0.62) brightness(0.66)' : 'grayscale(0) brightness(1)',
        rotateZ: 0,
        opacity: isActive ? 1 : 0.8,
        duration,
        ease,
        overwrite: 'auto',
      }));
    });

    mediaRefs.current.forEach((media, index) => {
      if (!media) return;
      const isActive = index === activeIndex;
      tweens.push(gsap.to(media, {
        scale: isActive ? 1 : 1.012,
        xPercent: 0,
        duration,
        ease,
        overwrite: 'auto',
      }));
    });

    return () => tweens.forEach((tween) => tween.kill());
  }, [activeIndex, duration, ease, expandRatio, grayscale, items.length]);

  const shift = useCallback((step) => {
    const nextIndex = clampIndex(activeIndex + step, items.length);
    if (!isControlled) setUncontrolledActiveIndex(nextIndex);
    onActiveChange?.(nextIndex);
  }, [activeIndex, isControlled, items.length, onActiveChange]);

  const activate = useCallback((index) => {
    const nextIndex = clampIndex(index, items.length);
    if (!isControlled) setUncontrolledActiveIndex(nextIndex);
    onActiveChange?.(nextIndex);
  }, [isControlled, items.length, onActiveChange]);

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      shift(1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      shift(-1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate(index);
    }
  };

  if (!items.length) return null;

  return (
    <div
      ref={galleryRef}
      className={`accordionGallery ${className}`}
      style={{
        '--ag-height': `${height}px`,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        '--ag-accent': accentColor,
      }}
      aria-label="方太项目图片手风琴展示"
    >
      {items.map((item, index) => (
        <div
          className={`agPanel${index === activeIndex ? ' isActive' : ''}`}
          key={item.image}
          ref={(node) => setPanelRef(node, index)}
          role="button"
          tabIndex={0}
          aria-label={`查看${item.label}`}
          onMouseEnter={() => activate(index)}
          onFocus={() => activate(index)}
          onClick={() => activate(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <div className="agPanelMedia" ref={(node) => setMediaRef(node, index)}>
            <img src={item.image} alt={item.alt || item.label} loading="lazy" decoding="async" />
          </div>
          <div className="agPanelShade" />
          <div className="agPanelLabel">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item.label}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AccordionGallery;
