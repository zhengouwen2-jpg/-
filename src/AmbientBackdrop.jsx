import { useEffect, useRef } from 'react';

function AmbientBackdrop() {
  const backdropRef = useRef(null);

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => backdrop.classList.toggle('is-active', entry.isIntersecting),
      { rootMargin: '-18% 0px -68% 0px', threshold: 0 },
    );
    observer.observe(backdrop);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="ambientBackdrop" ref={backdropRef} aria-hidden="true">
      <div className="ambientBackdropViewport">
        <span className="ambientRibbon ambientRibbonRed" />
        <span className="ambientRibbon ambientRibbonSilver" />
        <span className="ambientTexture ambientGrid" />
        <span className="ambientTexture ambientGrain" />
      </div>
    </div>
  );
}

export default AmbientBackdrop;
