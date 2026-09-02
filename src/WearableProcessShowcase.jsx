import React, { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectPassport from './ProjectPassport.jsx';
import './WearableProcessShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    code: '01 / DESIGN BRIEF',
    short: '项目引子',
    title: '把感知转化为可执行的舒缓',
    body: '不只记录状态，而是在通勤、午休与睡前的碎片时间里，给出可被立即感知的放松反馈。',
    facts: ['情绪感知', '温热舒缓', '碎片时间'],
  },
  {
    code: '02 / CONTEXT',
    short: '问题调研',
    title: '焦虑之外，更普遍的是持续的日常压力',
    body: '焦虑障碍是临床概念，日常压力不是诊断；但中国职场压力仍处高位，并在年轻化、管理责任和工作边界模糊的情境中形成碎片化调节需求。',
    facts: ['全球焦虑障碍：4.4%', '中国员工日常压力：48%', '压力需要轻量、及时地被回应'],
  },
  {
    code: '03 / PERSONA',
    short: '核心人群',
    title: '职场奋斗族：高压、碎片化、愿为效率买单',
    body: '核心用户集中在 25–45 岁的一二线城市职场人群。他们承受久坐与高压工作，也更需要随取随用、低学习成本的舒缓方式。',
    facts: ['核心年龄 28–40 岁', '通勤 · 午休 · 睡前 · 加班间隙', '偏好一物多用与简单操作'],
  },
  {
    code: '04 / APP ECOSYSTEM',
    short: 'APP生态',
    title: '从设备连接，到可被理解的健康反馈',
    body: 'App 将头戴端与后脑端连接、温度与按摩调节，以及每日健康报告和情绪趋势汇聚为一条清晰体验链路。',
    facts: ['双模块连接与状态总览', '温度调节与耳后按摩控制', '每日健康报告与情绪日历'],
  },
  {
    code: '05 / OUTCOME',
    short: '最终成果',
    title: '感知情绪 · 温热舒缓 · 静谧放松',
    body: '最终形成由耳机、眼罩、后脑模块与 App 组成的概念穿戴系统，兼顾日常感知与集中放松。',
    facts: ['产品设计与三维表现', '团队调研与系统定义', '消费级概念设计'],
  },
];

const appPanels = [
  {
    id: 'headwear-link',
    index: '01',
    title: '头戴端连接',
    description: '查看头戴端的连接、电量与功能入口。',
    src: '/assets/wearable-process/app-headwear-link.webp',
    group: 'connection',
    ratio: 1000 / 1870,
    delay: 0,
  },
  {
    id: 'rear-link',
    index: '02',
    title: '后脑端连接',
    description: '查看后脑端的连接、电量与功能入口。',
    src: '/assets/wearable-process/app-rear-link.webp',
    group: 'connection',
    ratio: 1000 / 1747,
    delay: 70,
  },
  {
    id: 'temperature',
    index: '03',
    title: '温度调节',
    description: '独立设置加热位置、温度与使用时长。',
    src: '/assets/wearable-process/app-temperature.webp',
    group: 'control',
    ratio: 1000 / 1773,
    delay: 150,
  },
  {
    id: 'massage',
    index: '04',
    title: '耳后按摩',
    description: '选择按摩类型、力度和持续时间。',
    src: '/assets/wearable-process/app-massage.webp',
    group: 'control',
    ratio: 1000 / 1798,
    delay: 220,
  },
  {
    id: 'health-report',
    index: '05',
    title: '健康报告',
    description: '将每日综合状态整理为可回顾的视觉反馈。',
    src: '/assets/wearable-process/app-health-report.webp',
    group: 'report',
    ratio: 1180 / 2029,
    delay: 310,
  },
  {
    id: 'emotion-calendar',
    index: '06',
    title: '情绪日历',
    description: '按日期回看情绪变化与反馈趋势。',
    src: '/assets/wearable-process/app-emotion-calendar.webp',
    group: 'report',
    ratio: 528 / 1158,
    delay: 380,
  },
];

const researchData = {
  global: {
    people: '3.59',
    unit: '亿人',
    rate: '4.4%',
    source: 'WHO · 2025',
    detail: 'WHO 估计全球约 4.4% 的人口正在经历焦虑障碍；3.59 亿人的估计基准年为 2021。该指标是临床障碍估计，不等同于一般紧张或压力。',
    href: 'https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders',
  },
  chinaTrend: {
    source: 'GALLUP · 2026',
    detail: '指标为“前一天大部分时间感到压力”的员工比例。中国数据采用截至各年份的三年滚动均值；2025 年为 48%，东亚同期为 46%，全球为 40%。',
    href: 'https://www.gallup.com/workplace/704906/state-global-workplace-china-country-level-data.aspx',
    eastAsia: 46,
    global: 40,
    values: [
      { year: 2010, value: 38 }, { year: 2011, value: 36 },
      { year: 2012, value: 38 }, { year: 2013, value: 40 },
      { year: 2014, value: 40 }, { year: 2015, value: 42 },
      { year: 2016, value: 44 }, { year: 2017, value: 48 },
      { year: 2018, value: 46 }, { year: 2019, value: 42 },
      { year: 2020, value: 45 }, { year: 2021, value: 50 },
      { year: 2022, value: 55 }, { year: 2023, value: 53 },
      { year: 2024, value: 50 }, { year: 2025, value: 48 },
    ],
  },
  workforce: {
    source: 'GALLUP · 2026',
    detail: '数据来自 2026 年《全球职场状况》报告，反映 2025 年全球受雇成年人自报日常压力。年龄、职位和工作地点是彼此独立的维度，不能相加。',
    href: 'https://www.gallup.com/workplace/697904/state-of-the-global-workplace-global-data.aspx',
    groups: [
      { id: 'young', label: '<35 岁', note: '年轻员工', value: 42 },
      { id: 'manager', label: '管理者', note: '工作角色', value: 45 },
      { id: 'hybrid', label: '混合办公', note: '工作边界', value: 46 },
    ],
  },
};

const trendChart = (() => {
  const width = 520;
  const height = 210;
  const padding = { left: 28, right: 38, top: 24, bottom: 30 };
  const minValue = 34;
  const maxValue = 56;
  const values = researchData.chinaTrend.values;
  const points = values.map((item, itemIndex) => {
    const x = padding.left + (itemIndex / (values.length - 1)) * (width - padding.left - padding.right);
    const y = padding.top + ((maxValue - item.value) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    return { ...item, x, y };
  });
  const line = points.map((point, pointIndex) => `${pointIndex ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const area = `${line} L ${points.at(-1).x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`;
  const yForValue = (value) => padding.top + ((maxValue - value) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
  return { width, height, points, line, area, yForValue };
})();

function ResearchSource({ label, detail, href }) {
  return (
    <details className="researchSource">
      <summary>{label}<span>来源</span></summary>
      <div className="researchSourceDetail">
        <p>{detail}</p>
        <a href={href} target="_blank" rel="noreferrer">查看官方资料</a>
      </div>
    </details>
  );
}

function ResearchDataStory() {
  const peak = trendChart.points.find((point) => point.year === 2022);
  const latest = trendChart.points.at(-1);

  return (
    <section className="researchComposition" aria-label="焦虑障碍与职场压力数据调研">
      <article className="researchPanel researchGlobal">
        <header><span>01 / GLOBAL SCALE</span><strong>全球焦虑障碍规模</strong></header>
        <div className="globalMetric">
          <strong>{researchData.global.people}</strong><span>{researchData.global.unit}</span>
          <small>2021 ESTIMATE</small>
        </div>
        <div className="anxietyDotMatrix" aria-hidden="true">
          {Array.from({ length: 100 }, (_, dotIndex) => (
            <i
              className={dotIndex < 4 ? 'is-active' : dotIndex === 4 ? 'is-partial' : ''}
              key={dotIndex}
              style={{ '--dot-index': dotIndex }}
            />
          ))}
        </div>
        <p className="globalRate"><strong>{researchData.global.rate}</strong><span>全球人口正在经历焦虑障碍</span></p>
        <ResearchSource {...researchData.global} label={researchData.global.source} />
      </article>

      <article className="researchPanel researchTrend">
        <header><span>02 / CHINA WORKPLACE</span><strong>压力回落，但尚未消失</strong></header>
        <p className="trendDefinition">中国员工中，前一天大部分时间感到压力的比例</p>
        <svg className="stressTrendChart" viewBox={`0 0 ${trendChart.width} ${trendChart.height}`} role="img" aria-label="中国员工日常压力三年滚动均值从2010年至2025年的变化">
          {[40, 46].map((value) => (
            <g className="trendReference" key={value}>
              <line x1="28" x2="482" y1={trendChart.yForValue(value)} y2={trendChart.yForValue(value)} />
              <text x="488" y={trendChart.yForValue(value) + 3}>{value === 46 ? '东亚 46' : '全球 40'}</text>
            </g>
          ))}
          <path className="trendArea" d={trendChart.area} />
          <path className="trendLine" d={trendChart.line} pathLength="1" />
          <line className="trendBaseline" x1="28" x2="482" y1="180" y2="180" />
          {[trendChart.points[0], peak, latest].map((point) => (
            <g className={`trendKeyPoint trendKeyPoint${point.year}`} key={point.year} transform={`translate(${point.x} ${point.y})`}>
              <circle r="5" />
              <text className="trendValue" x={point.year === 2025 ? -4 : 0} y="-14" textAnchor={point.year === 2025 ? 'end' : 'middle'}>{point.value}%</text>
              <text className="trendYear" x="0" y="20" textAnchor="middle">{point.year}</text>
            </g>
          ))}
        </svg>
        <div className="trendLatest"><span>2025</span><strong>48%</strong><small>三年滚动均值</small></div>
        <ResearchSource {...researchData.chinaTrend} label={researchData.chinaTrend.source} />
      </article>

      <article className="researchPanel researchWorkforce">
        <header><span>03 / PRESSURE PROFILE</span><strong>高压并非单一人群标签</strong></header>
        <div className="workforceBars">
          {researchData.workforce.groups.map((group, groupIndex) => (
            <div className="workforceBar" key={group.id} style={{ '--bar-value': group.value, '--bar-index': groupIndex }}>
              <span><strong>{group.label}</strong><small>{group.note}</small></span>
              <i><b /></i>
              <em>{group.value}%</em>
            </div>
          ))}
        </div>
        <p className="workforceConclusion"><span>DESIGN FOCUS</span><strong>25–45 岁高压职场人群</strong></p>
        <ResearchSource {...researchData.workforce} label={researchData.workforce.source} />
      </article>

      <p className="researchDisclaimer">焦虑障碍为临床统计；日常压力为自报感受，二者不可直接换算。</p>
    </section>
  );
}

function ResponsiveImage({ name, alt, className = '', eager = false }) {
  const base = `/assets/wearable-process/${name}`;
  return (
    <picture className={className}>
      <source media="(max-width: 760px)" srcSet={`${base}-mobile.webp`} />
      <img
        src={`${base}-desktop.webp`}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}

function PersonaProfile() {
  const pressureSignals = [
    { label: '颈肩劳损', value: 70 },
    { label: '眼疲劳 / 头痛', value: 60 },
    { label: '睡眠焦虑', value: 40 },
  ];

  return (
    <section className="personaProfileComposition" aria-label="职场奋斗族核心用户画像">
      <div className="personaProfileContent">
        <header className="personaProfileHeader">
          <div>
            <span>CORE PERSONA / 01</span>
            <h4>职场奋斗族</h4>
            <p>一二线城市 · 高压伏案工作 · 可支配收入较高</p>
          </div>
          <div className="personaProfileAge">
            <strong>25–45</strong>
            <small>主力年龄 28–40 岁</small>
          </div>
        </header>

        <div className="personaProfileSections">
          <article className="personaProfileSection personaBasics">
            <span>01 / BASIC PROFILE</span>
            <h5>基本属性</h5>
            <p>互联网、金融、教育、设计及程序开发等久坐岗位，月收入约 8,000–30,000 元。</p>
          </article>

          <article className="personaProfileSection personaPain">
            <span>02 / PRESSURE SIGNALS</span>
            <h5>核心痛点</h5>
            <div className="personaSignalList">
              {pressureSignals.map((signal) => (
                <div className="personaSignal" key={signal.label} style={{ '--signal-value': signal.value }}>
                  <small>{signal.label}</small>
                  <i><b /></i>
                  <em>{signal.value}%</em>
                </div>
              ))}
            </div>
            <small className="personaEstimate">用户画像推定</small>
          </article>

          <article className="personaProfileSection personaScenes">
            <span>03 / USE SCENARIOS</span>
            <h5>使用场景</h5>
            <ol>
              <li><b>01</b>通勤路上</li>
              <li><b>02</b>办公午休</li>
              <li><b>03</b>睡前放松</li>
              <li><b>04</b>加班间隙 · 10 min</li>
            </ol>
          </article>

          <article className="personaProfileSection personaAttitude">
            <span>04 / CONSUMPTION</span>
            <h5>消费态度</h5>
            <p>追求一物多用，愿为节省时间和提升舒适度买单；接受智能功能，但反感复杂操作。</p>
          </article>
        </div>
      </div>

      <figure className="personaProfilePortrait">
        <img src="/assets/wearable-process/persona-office.webp" alt="高压办公场景中的职场用户" loading="lazy" decoding="async" />
        <figcaption><span>URBAN PROFESSIONAL</span><strong>高效不等于透支</strong></figcaption>
      </figure>
    </section>
  );
}

function AppEcosystem({ active }) {
  const [activePanel, setActivePanel] = useState('health-report');

  useEffect(() => {
    if (!active) setActivePanel('health-report');
  }, [active]);

  return (
    <div
      className="appEcosystemComposition"
      data-active-panel={activePanel}
      onMouseLeave={() => setActivePanel('health-report')}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActivePanel('health-report');
      }}
    >
      <div className="appPanelDeck">
        {appPanels.map((panel) => (
          <button
            type="button"
            className={`appPanel${activePanel === panel.id ? ' is-active' : ''}`}
            data-panel={panel.id}
            data-group={panel.group}
            aria-pressed={activePanel === panel.id}
            aria-label={`${panel.title}：${panel.description}`}
            key={panel.id}
            style={{ '--screen-ratio': panel.ratio, '--app-enter-delay': `${panel.delay}ms` }}
            onMouseEnter={() => setActivePanel(panel.id)}
            onFocus={() => setActivePanel(panel.id)}
            onClick={() => setActivePanel(panel.id)}
          >
            <span className="appPhoneShell">
              <img src={panel.src} alt={`${panel.title} App 界面`} loading="lazy" decoding="async" />
            </span>
            <span className="appPanelCaption">
              <small>{panel.index}</small>
              <strong>{panel.title}</strong>
            </span>
          </button>
        ))}
      </div>

      <p className="appEcosystemDisclaimer">概念界面，健康反馈不作为医疗诊断依据。</p>
    </div>
  );
}

function StoryFrame({ index, active, loaded }) {
  const frameClass = `wearableFrame wearableFrame${index}${active ? ' is-active' : ''}`;

  if (!loaded) return <div className={frameClass} aria-hidden="true" />;

  return (
    <div className={frameClass} aria-hidden={!active}>
      {index === 0 && (
        <>
          <div className="wearableIntroScene">
            <ResponsiveImage
              name="intro-wearer"
              alt="女生佩戴慧心耳康仪进行放松体验"
              className="wearableIntroPortrait"
            />
          </div>
          <div className="wearableIntroLockup">
            <small>HUAWEI DESIGN BRIEF / STUDENT PROJECT</small>
            <strong>慧心耳康仪</strong>
            <span>情绪感知与温热舒缓概念穿戴设备</span>
          </div>
        </>
      )}

      {index === 1 && (
        <ResearchDataStory />
      )}

      {index === 2 && (
        <PersonaProfile />
      )}

      {index === 3 && <AppEcosystem active={active} />}

      {index === 4 && (
        <div className="outcomeComposition outcomeTechnical outcomeSixViewOnly">
          <a
            className="outcomeTechnicalLink"
            href="/assets/wearable-process/six-view.png"
            target="_blank"
            rel="noreferrer"
            aria-label="打开慧心耳康仪4K尺寸六视图"
          >
            <img
              className="outcomeTechnicalSheet"
              src="/assets/wearable-process/six-view.png"
              alt="慧心耳康仪带人机尺寸标注的六视图"
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      )}

      <div className="wearableStaticCopy">
        <span>{stages[index].code}</span>
        <h4>{stages[index].title}</h4>
        <p>{stages[index].body}</p>
      </div>
    </div>
  );
}

export default function WearableProcessShowcase({ project, index }) {
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadedStages, setLoadedStages] = useState(() => new Set([0]));

  const progressLabel = useMemo(
    () => `${String(activeStage + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`,
    [activeStage],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    setLoadedStages((current) => {
      const next = new Set(current);
      next.add(activeStage);
      if (activeStage > 0 && activeStage < stages.length - 1) next.add(activeStage + 1);
      if (activeStage > 0) next.add(activeStage - 1);
      return next;
    });
  }, [activeStage]);

  useEffect(() => {
    if (reducedMotion || !storyRef.current || !stageRef.current) return undefined;

    const story = storyRef.current;
    const stage = stageRef.current;
    const trigger = ScrollTrigger.create({
      trigger: story,
      start: () => `top ${window.innerWidth <= 760 ? 74 : 88}px`,
      end: 'bottom bottom',
      scrub: 0.45,
      pin: stage,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const rawStage = self.progress * (stages.length - 1);
        const nextStage = Math.min(stages.length - 1, Math.max(0, Math.round(rawStage)));
        const localProgress = rawStage - Math.floor(rawStage);
        stage.style.setProperty('--story-progress', self.progress.toFixed(4));
        stage.style.setProperty('--stage-local', localProgress.toFixed(4));
        setActiveStage((current) => current === nextStage ? current : nextStage);
      },
    });

    window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => trigger.kill();
  }, [reducedMotion]);

  const scrollToStage = (stageIndex) => {
    if (reducedMotion) {
      const target = storyRef.current?.querySelector(`[data-static-stage="${stageIndex}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const story = storyRef.current;
    if (!story) return;
    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const scrollDistance = Math.max(1, story.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: storyTop + scrollDistance * (stageIndex / (stages.length - 1)),
      behavior: 'smooth',
    });
  };

  const handleRailKeyDown = (event, stageIndex) => {
    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight'
      ? 1
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
        ? -1
        : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = Math.min(stages.length - 1, Math.max(0, stageIndex + direction));
    const buttons = event.currentTarget.parentElement?.querySelectorAll('button');
    buttons?.[nextIndex]?.focus();
    scrollToStage(nextIndex);
  };

  return (
    <article className="wearableProject" id="wearable-project">
      <div className="wearableCasePassport">
        <div>
          <span>PROJECT 01 / RESEARCH TO SYSTEM</span>
          <strong>个人贡献：产品设计与三维表现</strong>
          <small>团队共同完成调研与系统定义，个人负责产品形态、建模渲染与成果表达。</small>
        </div>
        <ProjectPassport items={project.passport} />
      </div>
      <div className="wearableStory" ref={storyRef}>
        <section className={`wearableStage${activeStage === 4 ? ' is-outcome-only' : ''}`} ref={stageRef} aria-label="慧心耳康仪设计过程">
          <header className="wearableTopline">
            <div className="wearableProjectIdentity">
              <span className="wearableProjectNumber">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <small>HUAWEI DESIGN BRIEF / STUDENT PROJECT</small>
                <strong>{project.title}</strong>
              </div>
            </div>
            <div className="wearableRole">
              <span>{project.subtitle}</span>
              <small>{project.role}</small>
            </div>
          </header>

          <nav className="wearableRail" aria-label="慧心耳康仪设计过程阶段">
            {stages.map((stage, stageIndex) => (
              <button
                type="button"
                key={stage.code}
                className={activeStage === stageIndex ? 'is-active' : ''}
                aria-current={activeStage === stageIndex ? 'step' : undefined}
                onClick={() => scrollToStage(stageIndex)}
                onKeyDown={(event) => handleRailKeyDown(event, stageIndex)}
              >
                <i />
                <span>{String(stageIndex + 1).padStart(2, '0')}</span>
                <small>{stage.short}</small>
              </button>
            ))}
          </nav>

          <div className="wearableCanvas" aria-live="polite">
            {stages.map((stage, stageIndex) => (
              <div
                data-static-stage={stageIndex}
                className={activeStage === stageIndex ? 'is-active-stage' : ''}
                key={stage.code}
              >
                <StoryFrame
                  index={stageIndex}
                  active={activeStage === stageIndex}
                  loaded={reducedMotion || loadedStages.has(stageIndex)}
                />
              </div>
            ))}
          </div>

          {activeStage !== 4 && (
            <aside className="wearableNarrative">
              <span className="wearableStageCode">{stages[activeStage].code}</span>
              <h3>{stages[activeStage].title}</h3>
              <p>{stages[activeStage].body}</p>
              <ul>
                {stages[activeStage].facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            </aside>
          )}

          <footer className="wearableStageFooter">
            <span>PRODUCT DESIGN / RESEARCH TO OUTCOME</span>
            <strong>{progressLabel}</strong>
            <i><span style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }} /></i>
          </footer>
        </section>
      </div>
    </article>
  );
}
