import { Children, useLayoutEffect, useRef } from 'react';
import './ScrollStack.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

function ScrollStack({ children, className = '' }) {
  const stackRef = useRef(null);
  const scrollerRef = useRef(null);
  const cardsRef = useRef([]);
  const stackItems = Children.toArray(children);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    let frameId = 0;

    const updateCards = () => {
      const availableScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      const progress = clamp(scroller.scrollTop / availableScroll, 0, 1);
      const activePosition = progress * Math.max(1, stackItems.length - 1);
      const frontY = (stackItems.length - 1) * 56;

      stackRef.current?.style.setProperty('--stack-progress', progress.toFixed(4));

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const offset = index - activePosition;
        const isPast = offset < -0.08;
        const futureIndex = clamp(Math.ceil(offset), 0, stackItems.length - 1);
        const futureY = frontY - futureIndex * 56;
        const entering = clamp(1 - Math.abs(offset), 0, 1);
        const y = isPast ? -96 - Math.abs(offset) * 32 : futureY + (1 - entering) * 4;
        const scale = isPast ? 0.94 : 1 - futureIndex * 0.018;
        const opacity = isPast ? clamp(1 + offset * 0.55, 0, 1) : 1;
        const rotate = isPast ? -2 : 0;
        const z = isPast ? index : Math.round(100 + (stackItems.length - futureIndex) * 10 + entering);

        card.style.setProperty('--stack-y', `${y.toFixed(2)}px`);
        card.style.setProperty('--stack-scale', scale.toFixed(3));
        card.style.setProperty('--stack-opacity', opacity.toFixed(3));
        card.style.setProperty('--stack-rotate', `${rotate.toFixed(2)}deg`);
        card.style.zIndex = String(Math.round(z));
      });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateCards);
    };

    updateCards();
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [stackItems.length]);

  return (
    <div
      className={`scroll-stack ${className}`.trim()}
      ref={stackRef}
      style={{
        '--stack-count': stackItems.length,
        '--stack-scroll-length': `${Math.max(0, stackItems.length - 1) * 52}vh`,
      }}
    >
      <div className="scroll-stack-scroller" ref={scrollerRef} aria-label="Mouse Dumpling project stack">
        <div className="scroll-stack-stage">
          {stackItems.map((child, index) => (
            <div
              className="scroll-stack-card-shell"
              key={child.key ?? index}
              style={{
                '--stack-index': index,
                '--stack-initial-y': `${(stackItems.length - 1 - index) * 56}px`,
              }}
              ref={(node) => {
                cardsRef.current[index] = node;
              }}
            >
              {child}
            </div>
          ))}
        </div>
        <div className="scroll-stack-spacer" aria-hidden="true" />
      </div>
      <div className="scroll-stack-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export default ScrollStack;
