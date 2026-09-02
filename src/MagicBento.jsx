import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_GLOW_COLOR = '255, 42, 25';
const DEFAULT_SPOTLIGHT_RADIUS = 360;
const MOBILE_BREAKPOINT = 768;

function createParticle(x, y, color) {
  const particle = document.createElement('span');
  particle.className = 'magicParticle';
  particle.style.cssText = `
    left: ${x}px;
    top: ${y}px;
    background: rgba(${color}, 0.95);
    box-shadow: 0 0 12px rgba(${color}, 0.72);
  `;
  return particle;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isMobile;
}

function updateGlow(card, mouseX, mouseY, intensity, radius) {
  const rect = card.getBoundingClientRect();
  const x = ((mouseX - rect.left) / rect.width) * 100;
  const y = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty('--magic-glow-x', `${x}%`);
  card.style.setProperty('--magic-glow-y', `${y}%`);
  card.style.setProperty('--magic-glow-intensity', intensity.toString());
  card.style.setProperty('--magic-glow-radius', `${radius}px`);
}

function MagicBentoCard({
  item,
  index,
  disableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  enableMagnetism,
  clickEffect,
}) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timersRef = useRef([]);
  const isHoveredRef = useRef(false);

  const clearParticles = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.24,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const emitParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card || !isHoveredRef.current) return;
    const rect = card.getBoundingClientRect();

    Array.from({ length: particleCount }).forEach((_, particleIndex) => {
      const timer = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const particle = createParticle(Math.random() * rect.width, Math.random() * rect.height, glowColor);
        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.8)' });
        gsap.to(particle, {
          x: (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 120,
          opacity: 0.22,
          duration: 1.7 + Math.random() * 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }, particleIndex * 80);
      timersRef.current.push(timer);
    });
  }, [glowColor, particleCount]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || disableAnimations) return undefined;

    const onEnter = () => {
      isHoveredRef.current = true;
      emitParticles();
    };

    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      updateGlow(card, event.clientX, event.clientY, 1, DEFAULT_SPOTLIGHT_RADIUS);

      if (enableTilt) {
        gsap.to(card, {
          rotateX: ((y - centerY) / centerY) * -7,
          rotateY: ((x - centerX) / centerX) * 7,
          transformPerspective: 1000,
          duration: 0.16,
          ease: 'power2.out',
        });
      }

      if (enableMagnetism) {
        gsap.to(card, {
          x: (x - centerX) * 0.035,
          y: (y - centerY) * 0.035,
          duration: 0.24,
          ease: 'power2.out',
        });
      }
    };

    const onLeave = () => {
      isHoveredRef.current = false;
      card.style.setProperty('--magic-glow-intensity', '0');
      clearParticles();
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const onClick = (event) => {
      if (!clickEffect) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement('span');
      ripple.className = 'magicRipple';
      ripple.style.cssText = `
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.32) 0%, rgba(${glowColor}, 0.12) 34%, transparent 70%);
      `;
      card.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.72, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('click', onClick);

    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [clearParticles, clickEffect, disableAnimations, emitParticles, enableMagnetism, enableTilt, glowColor]);

  return (
    <article className="magicBentoCard" ref={cardRef}>
      <div className="magicBentoCardHeader">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <em>{item.meta}</em>
      </div>
      <div className="magicBentoCardBody">
        <p>{item.label}</p>
        <h3>{item.title}</h3>
        <span>{item.description}</span>
      </div>
    </article>
  );
}

function MagicBento({
  items,
  glowColor = DEFAULT_GLOW_COLOR,
  particleCount = 12,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  disableAnimations = false,
}) {
  const gridRef = useRef(null);
  const isMobile = useIsMobile();
  const shouldDisableAnimations = disableAnimations || isMobile;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || shouldDisableAnimations) return undefined;

    const onMouseMove = (event) => {
      const rect = grid.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      const cards = grid.querySelectorAll('.magicBentoCard');

      cards.forEach((card) => {
        if (!inside) {
          card.style.setProperty('--magic-glow-intensity', '0');
          return;
        }

        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
        const proximity = DEFAULT_SPOTLIGHT_RADIUS * 0.72;
        const intensity = Math.max(0, 1 - distance / proximity);
        updateGlow(card, event.clientX, event.clientY, intensity, DEFAULT_SPOTLIGHT_RADIUS);
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [shouldDisableAnimations]);

  return (
    <div className="magicBentoGrid" ref={gridRef}>
      {items.map((item, index) => (
        <MagicBentoCard
          key={`${item.title}-${item.meta}`}
          item={item}
          index={index}
          disableAnimations={shouldDisableAnimations}
          particleCount={particleCount}
          glowColor={glowColor}
          enableTilt={enableTilt}
          enableMagnetism={enableMagnetism}
          clickEffect={clickEffect}
        />
      ))}
    </div>
  );
}

function MagicBentoSurface({
  as: Component = 'div',
  children,
  className = '',
  glowColor = DEFAULT_GLOW_COLOR,
  particleCount = 10,
  clickEffect = true,
  disableAnimations = false,
}) {
  const surfaceRef = useRef(null);
  const particlesRef = useRef([]);
  const timersRef = useRef([]);
  const isHoveredRef = useRef(false);
  const isMobile = useIsMobile();
  const shouldDisableAnimations = disableAnimations || isMobile;

  const clearParticles = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.24,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const emitParticles = useCallback(() => {
    const surface = surfaceRef.current;
    if (!surface || !isHoveredRef.current) return;
    const rect = surface.getBoundingClientRect();

    Array.from({ length: particleCount }).forEach((_, index) => {
      const timer = setTimeout(() => {
        if (!isHoveredRef.current || !surfaceRef.current) return;
        const particle = createParticle(Math.random() * rect.width, Math.random() * rect.height, glowColor);
        surfaceRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.8)' });
        gsap.to(particle, {
          x: (Math.random() - 0.5) * 110,
          y: (Math.random() - 0.5) * 110,
          opacity: 0.2,
          duration: 1.6 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }, index * 80);
      timersRef.current.push(timer);
    });
  }, [glowColor, particleCount]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || shouldDisableAnimations) return undefined;

    const onEnter = () => {
      isHoveredRef.current = true;
      emitParticles();
    };

    const onMove = (event) => {
      updateGlow(surface, event.clientX, event.clientY, 1, DEFAULT_SPOTLIGHT_RADIUS);
    };

    const onLeave = () => {
      isHoveredRef.current = false;
      surface.style.setProperty('--magic-glow-intensity', '0');
      clearParticles();
    };

    const onClick = (event) => {
      if (!clickEffect) return;
      const rect = surface.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement('span');
      ripple.className = 'magicRipple';
      ripple.style.cssText = `
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.12) 34%, transparent 70%);
      `;
      surface.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.72, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    surface.addEventListener('mouseenter', onEnter);
    surface.addEventListener('mousemove', onMove);
    surface.addEventListener('mouseleave', onLeave);
    surface.addEventListener('click', onClick);

    return () => {
      surface.removeEventListener('mouseenter', onEnter);
      surface.removeEventListener('mousemove', onMove);
      surface.removeEventListener('mouseleave', onLeave);
      surface.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [clearParticles, clickEffect, emitParticles, glowColor, shouldDisableAnimations]);

  return (
    <Component className={`magicBentoSurface ${className}`.trim()} ref={surfaceRef}>
      {children}
    </Component>
  );
}

export { MagicBentoSurface };
export default MagicBento;
