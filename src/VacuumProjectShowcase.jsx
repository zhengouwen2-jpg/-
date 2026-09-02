import React from 'react';
import ProjectPassport from './ProjectPassport.jsx';
import './VacuumProjectShowcase.css';

const PARENT_SOURCE = 'owen-portfolio';
const VIEWER_SOURCE = 'vacuum-viewer';
const VIEWER_URL = '/vacuum-viewer/index.html?embed=1';

function clampWheelDelta(value) {
  return Math.max(-180, Math.min(180, Number(value) || 0));
}

export default function VacuumProjectShowcase({ project, index }) {
  const sectionRef = React.useRef(null);
  const viewerShellRef = React.useRef(null);
  const iframeRef = React.useRef(null);
  const desiredPlayingRef = React.useRef(false);
  const readyRef = React.useRef(false);
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [nativeFullscreen, setNativeFullscreen] = React.useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = React.useState(false);
  const fullscreenActive = nativeFullscreen || fallbackFullscreen;

  const postToViewer = React.useCallback((type, payload = {}) => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: PARENT_SOURCE, type, ...payload },
      window.location.origin,
    );
  }, []);

  const syncPlayback = React.useCallback(() => {
    if (!readyRef.current) return;
    const shouldPlay = desiredPlayingRef.current && !document.hidden;
    postToViewer(shouldPlay ? 'vacuum:play' : 'vacuum:pause');
  }, [postToViewer]);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loader.disconnect();
        }
      },
      { rootMargin: '720px 0px' },
    );
    loader.observe(section);
    return () => loader.disconnect();
  }, []);

  React.useEffect(() => {
    const viewerShell = viewerShellRef.current;
    if (!viewerShell) return undefined;
    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        desiredPlayingRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.18;
        syncPlayback();
      },
      { threshold: [0, 0.18, 0.55] },
    );
    playbackObserver.observe(viewerShell);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      playbackObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [syncPlayback]);

  React.useEffect(() => {
    const handleViewerMessage = (event) => {
      if (
        event.origin !== window.location.origin
        || event.source !== iframeRef.current?.contentWindow
        || event.data?.source !== VIEWER_SOURCE
      ) return;
      if (event.data.type === 'vacuum:ready') {
        readyRef.current = true;
        setReady(true);
        postToViewer('vacuum:fullscreen-state', { active: fullscreenActive });
        syncPlayback();
      }
      if (event.data.type === 'vacuum:scroll' && !fullscreenActive) {
        const scrollingElement = document.scrollingElement || document.documentElement;
        scrollingElement.scrollTop += clampWheelDelta(event.data.deltaY);
      }
      if (event.data.type === 'vacuum:request-fullscreen') {
        viewerShellRef.current?.querySelector('.vacuumFullscreenButton')?.click();
      }
    };
    window.addEventListener('message', handleViewerMessage);
    return () => window.removeEventListener('message', handleViewerMessage);
  }, [fullscreenActive, postToViewer, syncPlayback]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === viewerShellRef.current;
      setNativeFullscreen(active);
      postToViewer('vacuum:fullscreen-state', { active: active || fallbackFullscreen });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fallbackFullscreen, postToViewer]);

  React.useEffect(() => {
    document.body.classList.toggle('vacuumFullscreenOpen', fallbackFullscreen);
    postToViewer('vacuum:fullscreen-state', { active: fullscreenActive });
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && fallbackFullscreen) setFallbackFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('vacuumFullscreenOpen');
    };
  }, [fallbackFullscreen, fullscreenActive, postToViewer]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === viewerShellRef.current) {
      await document.exitFullscreen();
      return;
    }
    if (fallbackFullscreen) {
      setFallbackFullscreen(false);
      return;
    }
    try {
      if (!viewerShellRef.current?.requestFullscreen) throw new Error('Fullscreen API unavailable');
      await viewerShellRef.current.requestFullscreen();
    } catch {
      setFallbackFullscreen(true);
    }
  };

  return (
    <article className="vacuumProject" id="vacuum-project" ref={sectionRef}>
      <header className="vacuumProjectHeader">
        <div className="vacuumProjectIdentity">
          <span className="projectIndex">{String(index + 1).padStart(2, '0')}</span>
          <p className="projectMeta">PROJECT 02 / PRODUCT STRUCTURE</p>
          <h3>{project.title}</h3>
        </div>
        <div className="vacuumProjectSummary">
          <p className="vacuumProjectRole">{project.role}</p>
          <p>{project.summary}</p>
          <div className="tags">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </header>

      <ProjectPassport items={project.passport} />

      <div className="vacuumEvidence" aria-label="吸尘器结构设计结论">
        <article><span>01</span><div><strong>内部层级</strong><p>将 155 个 Brep 归并为可理解的装配组件。</p></div></article>
        <article><span>02</span><div><strong>过滤路径</strong><p>沿吸嘴、栅格、滤芯、叶轮与电机建立纵向关系。</p></div></article>
        <article><span>03</span><div><strong>装配表达</strong><p>使用基准矩阵驱动爆炸与复位，避免零件漂移。</p></div></article>
      </div>

      <div
        className={`vacuumViewerShell${fallbackFullscreen ? ' isFallbackFullscreen' : ''}`}
        ref={viewerShellRef}
        data-ready={ready ? 'true' : 'false'}
      >
        <div className="vacuumViewerToolbar">
          <span className={`vacuumViewerStatus${ready ? ' ready' : ''}`}>
            <i />{ready ? '交互模型已就绪' : '正在准备交互模型'}
          </span>
          <a
            className="vacuumToolButton"
            href="/vacuum-viewer/"
            target="_blank"
            rel="noreferrer"
            title="在独立页面打开"
            aria-label="在独立页面打开"
          >↗</a>
          <button
            className="vacuumToolButton vacuumFullscreenButton"
            type="button"
            onClick={toggleFullscreen}
            title={fullscreenActive ? '退出全屏' : '全屏查看'}
            aria-label={fullscreenActive ? '退出全屏' : '全屏查看'}
          >{fullscreenActive ? '×' : '⛶'}</button>
        </div>

        {!ready && (
          <div className="vacuumViewerLoading" aria-live="polite">
            <span />
            <p>LOADING STRUCTURE VIEW</p>
          </div>
        )}
        {shouldLoad && (
          <iframe
            ref={iframeRef}
            className="vacuumViewerFrame"
            src={VIEWER_URL}
            title="手持吸尘器交互式结构爆炸展示"
            allow="fullscreen"
          />
        )}
      </div>
    </article>
  );
}
