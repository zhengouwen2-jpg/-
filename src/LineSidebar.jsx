import { useEffect, useRef } from 'react';
import './LineSidebar.css';

function LineSidebar({
  items = [],
  activeIndex = 0,
  accentColor = '#ff2a19',
  textColor = '#c4cbd0',
  markerColor = 'rgba(255,255,255,0.28)',
  markerLength = 46,
  itemGap = 22,
  fontSize = 1,
  hoverDelay = 180,
  onActiveChange,
  className = '',
}) {
  const hoverTimerRef = useRef(null);
  const hoverTokenRef = useRef(0);
  const hoveredIndexRef = useRef(null);

  const cancelHover = () => {
    hoverTokenRef.current += 1;
    hoveredIndexRef.current = null;
    if (hoverTimerRef.current == null) return;
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  const activateNow = (index) => {
    cancelHover();
    onActiveChange?.(index);
  };

  const scheduleActivation = (index, pointerType, target) => {
    if (pointerType !== 'mouse') return;
    cancelHover();
    hoveredIndexRef.current = index;
    if (index === activeIndex) return;
    const token = hoverTokenRef.current;
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      if (token === hoverTokenRef.current && hoveredIndexRef.current === index && target.matches(':hover')) onActiveChange?.(index);
    }, hoverDelay);
  };

  useEffect(() => () => cancelHover(), []);

  return (
    <nav
      className={`lineSidebar ${className}`}
      style={{
        '--line-accent': accentColor,
        '--line-text': textColor,
        '--line-marker': markerColor,
        '--line-marker-length': `${markerLength}px`,
        '--line-item-gap': `${itemGap}px`,
        '--line-font-size': `${fontSize}rem`,
      }}
      aria-label="方太项目图片导航"
    >
      <ul className="lineSidebarList" onPointerLeave={cancelHover}>
        {items.map((item, index) => (
          <li
            key={item.label}
            className="lineSidebarItem"
            aria-current={activeIndex === index ? 'true' : undefined}
          >
            <button
              type="button"
              onPointerEnter={(event) => scheduleActivation(index, event.pointerType, event.currentTarget)}
              onPointerMove={(event) => {
                if (event.pointerType === 'mouse') scheduleActivation(index, event.pointerType, event.currentTarget);
              }}
              onPointerLeave={cancelHover}
              onFocus={() => activateNow(index)}
              onClick={() => activateNow(index)}
            >
              <span className="lineSidebarMarker" aria-hidden="true" />
              <span className="lineSidebarLabel">
                <span className="lineSidebarIndex">{String(index + 1).padStart(2, '0')}</span>
                <span className="lineSidebarText">{item.label}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default LineSidebar;
