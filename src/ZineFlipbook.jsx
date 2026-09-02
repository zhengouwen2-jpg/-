import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './ZineFlipbook.css';

function ZineFlipbook({
  pages = [],
  title = 'Brand Zine',
  compact = false,
  hideNav = false,
  clickToNext = false,
  pageAspect = 'calc((1179 + 86) / 1253)',
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [turning, setTurning] = useState('');
  const [flipPage, setFlipPage] = useState(null);
  const dragRef = useRef({ active: false, startX: 0 });
  const timerRef = useRef(0);

  const safePages = useMemo(() => pages.filter((page) => page?.image), [pages]);
  const total = safePages.length;

  const goTo = useCallback((nextIndex, direction) => {
    if (!total) return;
    const normalizedIndex = ((nextIndex % total) + total) % total;
    if (normalizedIndex === pageIndex || turning) return;
    window.clearTimeout(timerRef.current);
    setFlipPage(safePages[pageIndex]);
    setPageIndex(normalizedIndex);
    setTurning(direction);
    timerRef.current = window.setTimeout(() => {
      setTurning('');
      setFlipPage(null);
    }, 860);
  }, [pageIndex, safePages, total, turning]);

  const goNext = useCallback(() => goTo(pageIndex + 1, 'next'), [goTo, pageIndex]);
  const goPrev = useCallback(() => goTo(pageIndex - 1, 'prev'), [goTo, pageIndex]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  if (!total) return null;

  const current = safePages[pageIndex];
  const stackPages = safePages.slice(0, 4);
  const prev = safePages[(pageIndex - 1 + total) % total];
  const turningPage = flipPage || current;

  const startDrag = (clientX) => {
    dragRef.current = { active: true, startX: clientX };
  };

  const endDrag = (clientX) => {
    if (!dragRef.current.active) return;
    const delta = clientX - dragRef.current.startX;
    dragRef.current.active = false;
    if (Math.abs(delta) < 46) {
      if (clickToNext) goNext();
      return;
    }
    if (delta < 0) goNext();
    if (delta > 0) goPrev();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
  };

  return (
    <div className={`zineFlipbook ${compact ? 'zineFlipbookCompact' : ''}`} aria-label={title}>
      <div className="zineStage">
        {!hideNav && (
          <button className="zineNav zineNavPrev" type="button" onClick={goPrev} aria-label="上一页">
            <span />
          </button>
        )}

        <div
          className={`zineBook ${turning ? `isTurning isTurning-${turning}` : ''}`}
          style={{ '--zine-aspect': pageAspect }}
          onMouseDown={(event) => {
            event.currentTarget.focus();
            startDrag(event.clientX);
          }}
          onMouseUp={(event) => endDrag(event.clientX)}
          onMouseLeave={(event) => endDrag(event.clientX)}
          onTouchStart={(event) => startDrag(event.touches[0].clientX)}
          onTouchEnd={(event) => endDrag(event.changedTouches[0].clientX)}
          onKeyDown={handleKeyDown}
          role="group"
          aria-roledescription="可翻页宣传手册"
          aria-label={`${title} 第 ${pageIndex + 1} 页，共 ${total} 页`}
          tabIndex={0}
        >
          <div className="zineBinding" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="zinePaperStack" aria-hidden="true">
            {stackPages.map((page, index) => (
              <span key={page.image} style={{ '--sheet': index }} />
            ))}
          </div>
          <figure className="zinePage zinePageBack" aria-hidden="true">
            <img src={prev.image} alt="" loading="lazy" decoding="async" />
          </figure>
          <figure className="zinePage zinePageCurrent" key={current.image}>
            <img src={current.image} alt={current.alt || current.label || `${title} 第 ${pageIndex + 1} 页`} draggable="false" loading="lazy" decoding="async" />
          </figure>
          <figure className="zinePage zinePageFlip" aria-hidden="true">
            <img src={turningPage.image} alt="" loading="lazy" decoding="async" />
          </figure>
          <span className="zinePageFold" aria-hidden="true" />
        </div>

        {!hideNav && (
          <button className="zineNav zineNavNext" type="button" onClick={goNext} aria-label="下一页">
            <span />
          </button>
        )}
      </div>

      <div className="zineMeta">
        <span>{String(pageIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <div className="zineProgress" aria-hidden="true">
          {safePages.map((page, index) => (
            <button
              key={page.image}
              type="button"
              className={index === pageIndex ? 'active' : ''}
              onClick={() => goTo(index, index > pageIndex ? 'next' : 'prev')}
              aria-label={`跳转到第 ${index + 1} 页`}
            />
          ))}
        </div>
        <em>CLICK / DRAG / ARROW KEYS</em>
      </div>
    </div>
  );
}

export default ZineFlipbook;
