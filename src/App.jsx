import React from 'react';
import AccordionGallery from './AccordionGallery.jsx';
import AmbientBackdrop from './AmbientBackdrop.jsx';
import CircularGallery from './CircularGallery.jsx';
import ClickSpark from './ClickSpark.jsx';
import LineSidebar from './LineSidebar.jsx';
import MagicBento, { MagicBentoSurface } from './MagicBento.jsx';
import ProjectPassport from './ProjectPassport.jsx';
import TextPressure from './TextPressure.jsx';
import VacuumProjectShowcase from './VacuumProjectShowcase.jsx';
import WearableProcessShowcase from './WearableProcessShowcase.jsx';
import ZineFlipbook from './ZineFlipbook.jsx';

const profile = {
  name: '郑欧文',
  title: 'Product Designer',
  role: '产品设计师',
  location: '浙江衢州',
  phone: '195-7172-0085',
  email: '2474291270@qq.com',
  education: '武汉理工大学（211） 产品设计 · GPA 4.08 / 专业前 15%',
  intro:
    '我关注用户真实情绪、场景与商业落地之间的连接，擅长把复杂需求转译成清晰的产品形态、体验闭环与具有记忆点的视觉表达。',
};

const navItems = [
  ['个人经历', '#about'],
  ['项目速览', '#project-scan'],
  ['深入案例', '#projects'],
  ['实习作品', '#strengths'],
];

const projects = [
  {
    id: 'wearable-project',
    type: 'wearable',
    title: '慧心耳康仪',
    subtitle: '情绪感知与温热舒缓概念穿戴设备',
    role: '产品设计与三维表现 / 团队项目',
    tags: ['用户洞察', '智能穿戴', '系统设计'],
    quickImage: '/assets/wearable-process/intro-wearer-desktop.webp',
    quickKicker: 'RESEARCH TO SYSTEM',
    quickChallenge: '高压人群需要一种不打断日常节奏的轻量舒缓方式。',
    quickContribution: '负责产品设计、三维建模与视觉呈现；参与系统定义。',
    quickDecision: '将持续感知与集中舒缓拆分为耳机、头戴模块和 App。',
    quickOutcome: '完成用户画像、产品系统、APP 生态与六视图表达。',
    passport: [
      { label: '周期', value: '2026' },
      { label: '性质', value: '消费级概念设计' },
      { label: '协作', value: '团队项目' },
      { label: '我负责', value: '产品设计 · 三维表现' },
      { label: '工具', value: 'Rhino · KeyShot · PPT' },
      { label: '交付', value: '用户画像 · APP生态 · 六视图' },
      { label: '验证', value: '系统叙事与概念原型' },
    ],
  },
  {
    id: 'vacuum-project',
    type: 'vacuum',
    title: '手持吸尘器结构设计',
    role: '产品设计 / 独立完成',
    summary:
      '围绕一体化外壳、分离过滤、电机驱动与电池布局建立完整产品层级，并通过交互式爆炸动画呈现内部组件关系与装配逻辑。',
    tags: ['便携清洁', '结构拆解', '交互展示'],
    quickImage: '/vacuum-viewer/assets/scene_desktop.jpg',
    quickKicker: 'STRUCTURE TO INTERACTION',
    quickChallenge: '在紧凑手持包络中建立清晰、可信的内部组件层级。',
    quickContribution: '独立完成产品造型、结构整理与网页交互展示。',
    quickDecision: '用分层爆炸与固定基准矩阵解释过滤、电机和电池关系。',
    quickOutcome: '完成 155 个 Brep 的结构归类与交互式爆炸 Viewer。',
    passport: [
      { label: '周期', value: '2026' },
      { label: '性质', value: '独立结构项目' },
      { label: '协作', value: '独立完成' },
      { label: '我负责', value: '产品结构 · 三维交互' },
      { label: '工具', value: 'Rhino · Three.js · Codex' },
      { label: '交付', value: '装配清单 · 爆炸动画 · Viewer' },
      { label: '验证', value: '矩阵循环与响应式测试' },
    ],
  },
  {
    id: 'fotile-project',
    type: 'fotile',
    title: '方太模块化移动厨房',
    time: '2025.01',
    role: '产品设计 / 独立完成',
    image: '/assets/fotile-process.png',
    summary:
      '以模块化结构重塑家庭厨房使用边界，将烹饪、备餐、收纳与移动切换整合到一台可适配多场景的移动厨房中。',
    tags: ['模块化结构', '生活场景', '产品细节', '结构表达'],
    quickImage: '/assets/fotile-scenarios.png',
    quickKicker: 'SCENARIO TO MODULE',
    quickChallenge: '固定厨房难以覆盖临时扩展、聚会协作与移动烹饪。',
    quickContribution: '独立完成产品定义、模块策略、三维表现与成果板。',
    quickDecision: '以可移动主体承载烹饪核心，用侧桌和收纳模块扩展场景。',
    quickOutcome: '完成使用流程、细节、场景、爆炸图与尺寸多视图。',
    passport: [
      { label: '周期', value: '2025.01' },
      { label: '性质', value: '模块化概念产品' },
      { label: '协作', value: '独立完成' },
      { label: '我负责', value: '产品定义 · 三维表现' },
      { label: '工具', value: 'Rhino · KeyShot · Photoshop' },
      { label: '交付', value: '流程 · 场景 · 爆炸图 · 尺寸图' },
      { label: '验证', value: '结构关系与尺度表达' },
    ],
    points: [
      '梳理收纳、烹饪、扩展、移动四段使用流程，明确从固定厨房到自由生活场景的转换路径。',
      '围绕双灶电磁炉、圆形木质砧板、侧桌板、收纳抽屉和静音万向轮，建立清晰的产品细节表达。',
      '通过爆炸图、尺寸图和多视图说明结构关系，让产品从概念视觉落到可理解的工程尺度。',
    ],
  },
  {
    id: 'brand-project',
    type: 'zine',
    title: '品牌视觉设计',
    role: '平面设计 / 独立完成',
    tags: ['品牌手册', '版式设计', '企业视觉', '翻阅交互'],
    passport: [
      { label: '性质', value: '品牌视觉延展' },
      { label: '协作', value: '独立完成' },
      { label: '我负责', value: '视觉系统 · 版式设计' },
      { label: '工具', value: 'Illustrator · Photoshop' },
      { label: '交付', value: '2 本品牌手册 · 网页翻阅' },
      { label: '验证', value: '跨媒介版式一致性' },
    ],
  },
];

const fotileGalleryItems = [
  {
    image: '/assets/fotile-process.png',
    label: '使用流程',
    alt: '方太模块化移动厨房使用流程展示',
  },
  {
    image: '/assets/fotile-details.png',
    label: '产品细节',
    alt: '方太模块化移动厨房产品细节展示',
  },
  {
    image: '/assets/fotile-scenarios.png',
    label: '生活场景',
    alt: '方太模块化移动厨房生活场景展示',
  },
  {
    image: '/assets/fotile-exploded.png',
    label: '爆炸图解析',
    alt: '方太模块化移动厨房爆炸图解析',
  },
  {
    image: '/assets/fotile-dimensions.png',
    label: '尺寸与多视图',
    alt: '方太模块化移动厨房尺寸与多视图展示',
  },
];

const experience = [
  {
    meta: '2023.09 - 2027.06',
    title: '武汉理工大学 · 产品设计',
    desc: '211 高校在读，GPA 4.084，专业排名前 15%。',
  },
  {
    meta: '2025.06 - 2025.09',
    title: '衢州市五星健身 · 平面设计师',
    desc: '完成门店宣传海报、课程推广图、会员活动物料等设计，并使用 AI 工具辅助图片处理与版式排版。',
  },
  {
    meta: '技能证书',
    title: '设计工具与跨域能力',
    desc: '研究与定义：用户洞察、产品策略；三维：Rhino、KeyShot；视觉：Photoshop、Illustrator、PPT；AI 协作：ChatGPT、Codex。',
  },
];

const aboutBentoItems = experience.map((item, index) => ({
  meta: item.meta,
  label: ['Education', 'Internship', 'Toolbox'][index] || 'Experience',
  title: item.title,
  description: item.desc,
}));

const strengths = [
  ['01', '用户洞察', '从受众视角理解需求，提炼人群画像、核心痛点与真实使用场景。'],
  ['02', '产品定义', '能从 0 到 1 梳理产品定位、功能优先级、体验路径与落地边界。'],
  ['03', '视觉表达', '把抽象概念转化为有温度、有记忆点且可商业延展的视觉语言。'],
  ['04', 'AI 协作', '熟悉使用 ChatGPT、主流 AI 大模型与智能体提升图像处理、排版和创意效率。'],
  ['05', '整合推进', '在硬件、APP、品牌、物料之间建立一致体验，并推动方案成型。'],
  ['06', '执行交付', '保持自律积极的工作节奏，能在多方反馈中快速调整并按时交付。'],
];

const internshipWorks = [
  {
    image: '/assets/internship-full-effort.jpg',
    text: '全力以赴',
    description: '以健身房器械与暗调空间为底，强化行动感与自我承诺的训练传播海报。',
  },
  {
    image: '/assets/internship-start-training.jpg',
    text: '即刻开练',
    description: '用大字书法标题叠加器械背景，形成直接、有力量的开练号召。',
  },
  {
    image: '/assets/internship-coach-system.jpg',
    text: '教练团队',
    description: '围绕私教售卖信息建立版式层级，突出年卡优惠、力量训练与专业背书。',
  },
  {
    image: '/assets/internship-kettlebell-coach.jpg',
    text: '壶铃训练',
    description: '黑白摄影与局部荧光强调结合，呈现力量训练课程的专业感。',
  },
  {
    image: '/assets/internship-equipment-complete.jpg',
    text: '器械齐全',
    description: '用人物运动姿态、线性图形和高亮色块组织门店设备优势信息。',
  },
  {
    image: '/assets/internship-fatloss-camp.jpg',
    text: '燃脂训练营',
    description: '训练营招募海报，使用强对比标题与价格模块完成活动转化表达。',
  },
  {
    image: '/assets/internship-fight-start-01.jpg',
    text: 'Fight Start 01',
    description: '橙色大标题与黑白人物摄影结合，建立系列化运动视觉识别。',
  },
  {
    image: '/assets/internship-fight-start-02.jpg',
    text: 'Fight Start 02',
    description: '以绳索训练动作为核心画面，延续系列海报的速度感与张力。',
  },
  {
    image: '/assets/internship-fight-start-03.jpg',
    text: 'Fight Start 03',
    description: '低照度人物海报，突出肌肉线条与训练氛围，保持品牌系列一致性。',
  },
  {
    image: '/assets/internship-price-list.jpg',
    text: '课程价目表',
    description: '普拉提团课与私教课程价目表，强调表格信息清晰度与门店落地使用。',
  },
];

const internshipWorksSecondary = [
  {
    image: '/assets/secondary-gallery-01-kyrie.jpg',
    text: 'Kyrie 版式海报',
    description: '用多层图像叠加和蓝白色块，建立运动人物的编辑感版式。',
  },
  {
    image: '/assets/secondary-gallery-02-own-street.jpg',
    text: 'Own Every Street',
    description: '以低机位运动影像和大字标题，强化速度、街头和品牌广告感。',
  },
  {
    image: '/assets/secondary-gallery-03-tennis-spin.jpg',
    text: 'Feel The Spin',
    description: '用网球运动轨迹与高饱和撞色，突出球类海报的动势表达。',
  },
  {
    image: '/assets/secondary-gallery-04-anthony-edwards.jpg',
    text: 'Anthony Edwards',
    description: '黑白分割和纵向大字标题组合，塑造球星人物海报张力。',
  },
  {
    image: '/assets/secondary-gallery-05-last-dance.jpg',
    text: 'The Last Dance',
    description: '颗粒质感、红黑对比和信息层级，形成纪录片式体育视觉。',
  },
  {
    image: '/assets/secondary-gallery-06-air-mail.jpg',
    text: 'Air Mail',
    description: '以红黑视觉系统和人物腾跃姿态，强化篮球主题的冲击力。',
  },
  {
    image: '/assets/secondary-gallery-07-rush.jpg',
    text: 'Rush',
    description: '赛车海报的斜向排版与橙色主调，建立速度和电影感。',
  },
  {
    image: '/assets/secondary-gallery-08-lewis.jpg',
    text: 'Lewis Hamilton',
    description: '拼贴、噪点和红色文字系统，呈现 F1 人物专题视觉。',
  },
  {
    image: '/assets/secondary-gallery-09-auto-show.jpg',
    text: 'Auto Show',
    description: '俯视城市道路和巨型文字结合，表达车展传播的空间感。',
  },
  {
    image: '/assets/secondary-gallery-10-venice.jpg',
    text: 'Venice Poster',
    description: '旅行图文海报，用大字遮罩和版面分割组织城市信息。',
  },
  {
    image: '/assets/secondary-gallery-11-tokyo.jpg',
    text: 'Tokyo Poster',
    description: '复古旅游海报语言，突出地标建筑和城市记忆点。',
  },
];

const kadakataZinePages = Array.from({ length: 8 }, (_, index) => ({
  image: `/assets/kadakata-zine/kadakata-${String(index + 1).padStart(2, '0')}.jpg`,
  label: `KADAKATA Brand Zine ${String(index + 1).padStart(2, '0')}`,
  alt: `KADAKATA 公司宣传手册第 ${index + 1} 页`,
}));

const evodrillZinePages = Array.from({ length: 6 }, (_, index) => ({
  image: `/assets/evodrill-zine/evodrill-${String(index + 1).padStart(2, '0')}.jpg`,
  label: `EVODRILL Brand Zine ${String(index + 1).padStart(2, '0')}`,
  alt: `EVODRILL 公司宣传手册第 ${index + 1} 页`,
}));

function HeroMedia() {
  const videoRef = React.useRef(null);
  const [videoActive, setVideoActive] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const media = video.closest('.heroMedia');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inViewport = true;
    let disposed = false;
    let retryTimer = null;
    let stalledChecks = 0;
    let lastTime = -1;

    const shouldPlay = () => !reducedMotion.matches && !document.hidden && inViewport;
    const clearRetry = () => {
      if (!retryTimer) return;
      window.clearTimeout(retryTimer);
      retryTimer = null;
    };
    const scheduleRetry = (delay = 650) => {
      if (disposed || retryTimer || !shouldPlay()) return;
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        attemptPlayback();
      }, delay);
    };
    const attemptPlayback = async () => {
      if (disposed) return;
      if (!shouldPlay()) {
        video.pause();
        setVideoActive(false);
        return;
      }

      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
        if (!disposed && !video.paused) setVideoActive(true);
      } catch {
        if (!disposed) setVideoActive(false);
        scheduleRetry();
      }
    };
    const sync = () => {
      if (!shouldPlay()) {
        clearRetry();
        video.pause();
        setVideoActive(false);
        return;
      }
      attemptPlayback();
    };
    const handlePlaying = () => {
      stalledChecks = 0;
      lastTime = video.currentTime;
      setVideoActive(true);
    };
    const handleInterruption = () => {
      setVideoActive(false);
      scheduleRetry(420);
    };
    const handleError = () => {
      setVideoActive(false);
      clearRetry();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      sync();
    }, { threshold: [0, 0.01] });

    const watchdog = window.setInterval(() => {
      if (!shouldPlay()) {
        lastTime = video.currentTime;
        stalledChecks = 0;
        return;
      }

      const progressed = lastTime < 0 || Math.abs(video.currentTime - lastTime) > 0.08;
      if (progressed && !video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        stalledChecks = 0;
        setVideoActive(true);
      } else {
        stalledChecks += 1;
        setVideoActive(false);
        attemptPlayback();
        if (stalledChecks >= 3) {
          stalledChecks = 0;
          video.load();
        }
      }
      lastTime = video.currentTime;
    }, 1500);

    observer.observe(media || video);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('online', sync);
    window.addEventListener('pointerdown', sync, { passive: true });
    video.addEventListener('loadedmetadata', sync);
    video.addEventListener('canplay', sync);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleInterruption);
    video.addEventListener('stalled', handleInterruption);
    video.addEventListener('error', handleError);
    sync();
    return () => {
      disposed = true;
      clearRetry();
      window.clearInterval(watchdog);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('online', sync);
      window.removeEventListener('pointerdown', sync);
      video.removeEventListener('loadedmetadata', sync);
      video.removeEventListener('canplay', sync);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleInterruption);
      video.removeEventListener('stalled', handleInterruption);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div
      className={`heroMedia${videoActive ? ' is-video-active' : ''}`}
      data-video-state={videoActive ? 'playing' : 'poster'}
      aria-hidden="true"
    >
      <img className="heroPoster" src="/assets/hero-video-poster.webp" alt="" fetchPriority="high" />
      <video
        ref={videoRef}
        className={`heroVideo${videoActive ? ' is-ready' : ''}`}
        src="/assets/hero-reference.mp4"
        poster="/assets/hero-video-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}

function ProjectQuickScan() {
  const featured = projects.filter((project) => project.type !== 'zine');
  return (
    <section className="section quickScan" id="project-scan" aria-labelledby="quick-scan-title">
      <div className="quickScanHeader">
        <div>
          <p className="eyebrow">60 SECOND PROJECT SCAN</p>
          <h2 id="quick-scan-title">先看判断，再看过程。</h2>
        </div>
        <p>三项核心项目分别证明系统设计、结构表达与场景创新。每项先给出问题、职责、决策和产出，再进入完整案例。</p>
      </div>
      <div className="quickScanGrid">
        {featured.map((project, index) => (
          <a className="quickProject" href={`#${project.id}`} key={project.id}>
            <figure>
              <img
                src={project.quickImage}
                alt={`${project.title} 项目速览`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'low'}
              />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </figure>
            <div className="quickProjectBody">
              <small>{project.quickKicker}</small>
              <h3>{project.title}</h3>
              <dl>
                <div><dt>问题</dt><dd>{project.quickChallenge}</dd></div>
                <div><dt>我负责</dt><dd>{project.quickContribution}</dd></div>
                <div><dt>关键决策</dt><dd>{project.quickDecision}</dd></div>
                <div><dt>产出</dt><dd>{project.quickOutcome}</dd></div>
              </dl>
              <strong>进入完整案例 <span aria-hidden="true">↘</span></strong>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function FotileProjectShowcase({ project, index }) {
  const noteLabels = ['使用流程', '产品细节', '结构与尺寸'];
  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState(2);

  return (
    <article className="projectCard projectCardFotile" id={project.id}>
      <div className="fotileProjectHeader">
        <div className="fotileProjectTitle">
          <span className="projectIndex">{String(index + 1).padStart(2, '0')}</span>
          <p className="projectMeta">
            {project.time} / {project.role}
          </p>
          <h3>{project.title}</h3>
        </div>
        <div className="fotileProjectSummary">
          <p>{project.summary}</p>
          <div className="tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <ProjectPassport items={project.passport} />

      <div className="fotileDecisionStrip" aria-label="方太项目设计推导">
        {[
          ['01', '场景问题', '固定厨房难覆盖临时扩展与多人协作。'],
          ['02', '设计约束', '烹饪、备餐、收纳和移动必须共存。'],
          ['03', '模块策略', '核心主体保持完整，侧桌与收纳按需展开。'],
          ['04', '结构验证', '以爆炸图和多视图确认层级与尺度。'],
        ].map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span><h4>{title}</h4><p>{copy}</p>
          </article>
        ))}
      </div>

      <div className="fotileProjectGallery">
        <LineSidebar
          className="fotileLineSidebar"
          items={fotileGalleryItems}
          activeIndex={activeGalleryIndex}
          onActiveChange={setActiveGalleryIndex}
          accentColor="#ff2a19"
          hoverDelay={180}
        />
        <div className="fotileAccordionWrap">
          <AccordionGallery
            items={fotileGalleryItems}
            activeIndex={activeGalleryIndex}
            onActiveChange={setActiveGalleryIndex}
            defaultIndex={2}
            accentColor="#ff2a19"
            height={680}
            gap={12}
            radius={8}
            expandRatio={6}
            duration={0.74}
            ease="power2.out"
          />
        </div>
      </div>

      <div className="fotileProjectNotes">
        {project.points.map((point, pointIndex) => (
          <article className="fotileNote" key={point}>
            <span>{String(pointIndex + 1).padStart(2, '0')} / {noteLabels[pointIndex]}</span>
            <p>{point}</p>
          </article>
        ))}
      </div>
    </article>
  );
}

function ZineProjectShowcase({ project, index }) {
  return (
    <article className="projectCard projectCardZine" id={project.id}>
      <div className="zineProjectHeader">
        <div>
          <span className="projectIndex">{String(index + 1).padStart(2, '0')}</span>
          <p className="projectMeta">{project.role}</p>
          <h3>{project.title}</h3>
          <p className="zineProjectHint">(点击翻阅)</p>
        </div>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <ProjectPassport items={project.passport} compact />

      <div className="zinePairGrid">
        <article className="zinePairItem">
          <div className="zinePairHeader">
            <span>01</span>
            <h3>KADAKATA</h3>
            <p>Brand identity booklet</p>
            <small>以高对比黑白系统建立锐利、前卫的品牌秩序。</small>
          </div>
          <ZineFlipbook
            pages={kadakataZinePages}
            title="KADAKATA 公司宣传手册"
            compact
            hideNav
            clickToNext
          />
        </article>
        <article className="zinePairItem">
          <div className="zinePairHeader">
            <span>02</span>
            <h3>EVODRILL</h3>
            <p>Industrial brand booklet</p>
            <small>以工业影像、橙色识别和信息网格传达可靠效率。</small>
          </div>
          <ZineFlipbook
            pages={evodrillZinePages}
            title="EVODRILL 公司宣传手册"
            compact
            hideNav
            clickToNext
          />
        </article>
      </div>
    </article>
  );
}

function DesignerClosing({ email }) {
  const sectionRef = React.useRef(null);
  const lightFrameRef = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: [0.18, 0.42] },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      if (lightFrameRef.current) cancelAnimationFrame(lightFrameRef.current);
    };
  }, []);

  const updateLight = (event) => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = section.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    if (lightFrameRef.current) cancelAnimationFrame(lightFrameRef.current);
    lightFrameRef.current = requestAnimationFrame(() => {
      section.style.setProperty('--closing-light-x', `${x.toFixed(2)}px`);
      section.style.setProperty('--closing-light-y', `${y.toFixed(2)}px`);
    });
  };

  const resetLight = () => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty('--closing-light-x', '0px');
    section.style.setProperty('--closing-light-y', '0px');
  };

  return (
    <section
      ref={sectionRef}
      className={`contactFinal designerClosing${isVisible ? ' is-visible' : ''}`}
      id="connect"
      onPointerMove={updateLight}
      onPointerLeave={resetLight}
    >
      <div className="closingAtmosphere" aria-hidden="true">
        <span className="closingLight" />
        <span className="closingGhostWord">OWEN</span>
      </div>

      <div className="closingStatement">
        <p className="closingEyebrow">PERSONAL NOTE</p>
        <h2 aria-label="在日常中，寻找更好的答案。">
          <span className="closingLine">
            <span>在日常中，</span>
          </span>
          <span className="closingLine closingLineSecondary">
            <span>寻找更好的答案。</span>
          </span>
        </h2>
        <span className="closingRule" aria-hidden="true" />
      </div>

      <footer className="closingFooter">
        <a className="closingEmail" href={`mailto:${email}`}>
          <span className="closingEmailMark" aria-hidden="true">@</span>
          <span>{email}</span>
        </a>
        <p className="closingSignature">OWEN DESIGN</p>
        <a className="closingTop" href="#top" aria-label="返回顶部" title="返回顶部">
          <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </section>
  );
}

function App() {
  return (
    <main>
      <ClickSpark sparkColor="#ff2a19" sparkSize={14} sparkRadius={38} sparkCount={12} duration={520} />
      <header className="nav">
        <a className="brand" href="#top" aria-label="返回首页">
          <span>OWEN</span>
          <small>design</small>
        </a>
        <nav>
          {navItems.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="contactButton" href="#connect">
          联系我
        </a>
      </header>

      <section className="hero" id="top" aria-label="首页">
        <HeroMedia />
        <div className="heroShade" />

        <div className="heroInner">
          <div className="heroDeck">
            <p className="heroMicro">2027 GRAD / PRODUCT &amp; INTEGRATED DESIGN</p>
            <h1 aria-label={`${profile.name} ${profile.role}`}>
              <span className="heroName">
                <TextPressure text="OWEN" textColor="#ff2a19" autoSweep />
              </span>
              <span className="heroRole">PRODUCT DESIGNER</span>
            </h1>
            <div className="heroPositioning" aria-label="求职定位">
              <span>用户洞察</span><span>产品与结构</span><span>三维表现</span><span>视觉与交互</span>
            </div>
          </div>

          <div className="heroBoard">
            <div className="heroStat">
              <span className="slashMark">///</span>
              <strong>前 15%</strong>
              <p>武汉理工大学产品设计在读，将研究、结构、三维与视觉表达组织成完整设计判断。</p>
            </div>
            <div className="heroActions">
              <a href="#project-scan" className="primaryCta">
                60 秒看项目
              </a>
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent('简历索取｜郑欧文 产品设计实习')}`} className="ghostCta">
                {profile.email}
              </a>
            </div>
            <p className="heroStatement">
              <span>DESIGN</span> IS NOT
              <br />
              DECORATION
            </p>
          </div>
        </div>
      </section>

      <div className="afterHeroBackdrop">
        <AmbientBackdrop />
        <ProjectQuickScan />
        <section className="section about" id="about">
          <div className="sectionHeader">
            <p className="eyebrow">ABOUT ME</p>
            <h2>从用户场景出发，构建设计判断。</h2>
          </div>
          <div className="aboutGrid">
            <MagicBentoSurface className="portraitPanel" glowColor="255, 42, 25" particleCount={10} clickEffect>
              <img src="/assets/owen-portrait-red.jpg" alt="郑欧文形象照" loading="lazy" decoding="async" />
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.title}</span>
              </div>
            </MagicBentoSurface>
            <MagicBentoSurface className="bioPanel" glowColor="255, 42, 25" particleCount={10} clickEffect>
              <p>{profile.intro}</p>
              <div className="contactGrid" aria-label="联系方式">
                <span>邮箱</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <span>毕业时间</span>
                <strong>2027年6月</strong>
                <span>所在地</span>
                <strong>{profile.location}</strong>
                <span>教育</span>
                <strong>{profile.education}</strong>
              </div>
            </MagicBentoSurface>
            <MagicBento
              items={aboutBentoItems}
              glowColor="255, 42, 25"
              particleCount={10}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect
            />
          </div>
        </section>

        <section className="section projects" id="projects">
          <div className="sectionHeader wide">
            <p className="eyebrow">SELECTED PROJECTS</p>
            <h2>用大图呈现关键作品，用结构说明设计价值。</h2>
          </div>
          <div className="projectList">
            {projects.map((project, index) => (
              project.type === 'fotile' ? (
                <FotileProjectShowcase project={project} index={index} key={project.title} />
              ) : project.type === 'vacuum' ? (
                <VacuumProjectShowcase project={project} index={index} key={project.title} />
              ) : project.type === 'wearable' ? (
                <WearableProcessShowcase project={project} index={index} key={project.title} />
              ) : project.type === 'zine' ? (
                <ZineProjectShowcase project={project} index={index} key={project.title} />
              ) : (
                <article className="projectCard" key={project.title}>
                  <div className="projectImage">
                    <img src={project.image} alt={`${project.title} 项目视觉`} loading="lazy" decoding="async" />
                  </div>
                  <div className="projectContent">
                    <span className="projectIndex">{String(index + 1).padStart(2, '0')}</span>
                    <p className="projectMeta">
                      {project.time} / {project.role}
                    </p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <div className="tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <ul>
                      {project.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              )
            ))}
          </div>
        </section>

        <section className="section strengths" id="strengths">
          <div className="sectionHeader">
            <p className="eyebrow">INTERNSHIP WORKS</p>
            <h2>实习与延展作品，以视觉系统呈现。</h2>
          </div>
          <div className="internshipStageStack">
            <header className="gallerySectionLabel">
              <span>01 / COMMERCIAL DELIVERY</span>
              <div><h3>商业实习交付</h3><p>门店传播、课程推广与会员活动物料</p></div>
            </header>
            <div className="internshipGalleryFrame">
              <CircularGallery
                items={internshipWorks}
                bend={30}
                scrollSpeed={0.28}
                textColor="#eff3f6"
                variant="compact"
                autoPlay
                autoPlaySpeed={9}
                pauseOnHover
                showCaptions
              />
            </div>
            <header className="gallerySectionLabel">
              <span>02 / SELF-INITIATED STUDIES</span>
              <div><h3>个人视觉练习</h3><p>运动、人物与城市主题的版式探索</p></div>
            </header>
            <div className="internshipGalleryFrame internshipGalleryFrameSecondary">
              <CircularGallery
                items={internshipWorksSecondary}
                bend={30}
                scrollSpeed={0.28}
                textColor="#eff3f6"
                variant="compact"
                autoPlay
                autoPlaySpeed={10}
                pauseOnHover
                initialOffset={96}
                showCaptions
              />
            </div>
          </div>
        </section>

        <DesignerClosing email={profile.email} />
      </div>
    </main>
  );
}

export default App;
