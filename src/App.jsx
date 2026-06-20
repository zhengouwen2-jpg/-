import React from 'react';
import CircularGallery from './CircularGallery.jsx';
import ClickSpark from './ClickSpark.jsx';
import Grainient from './Grainient.jsx';
import ScrollStack, { ScrollStackItem } from './ScrollStack.jsx';
import TextPressure from './TextPressure.jsx';

const profile = {
  name: '郑欧文',
  title: 'Product Designer',
  role: '产品设计师',
  location: '浙江衢州',
  phone: '195-7172-0085',
  email: '2474291270@qq.com',
  education: '武汉理工大学（211） 产品设计 · GPA 4.084 / 前 15%',
  intro:
    '我关注用户真实情绪、场景与商业落地之间的连接，擅长把复杂需求转译成清晰的产品形态、体验闭环与具有记忆点的视觉表达。',
};

const navItems = [
  ['个人经历', '#about'],
  ['重点项目', '#projects'],
  ['实习作品', '#strengths'],
  ['其他作品', '#contact'],
];

const projects = [
  {
    title: '华为智能穿戴设备',
    time: '2025.01',
    role: '产品经理',
    image: '/assets/project-wearable.png',
    summary:
      '围绕职场焦虑、睡眠障碍与颈肩疲劳，定义“耳机检测 + 后脑按摩热敷 + 眼罩舒缓”的智能穿戴产品形态。',
    tags: ['用户调研', '产品定义', '体验闭环', '硬件 + APP'],
    points: [
      '梳理职场人与中老年人群画像，提炼情绪识别、即时舒缓、便捷护理三类核心需求。',
      '拆解“检测 - 提醒 - 舒缓 - 反馈”旅程，将痛点转化为功能优先级与多端体验。',
      '输出覆盖通勤、午休、加班、睡前等场景的“三端硬件 + APP生态”概念方案。',
    ],
  },
  {
    title: 'Mouse Dumpling IP 形象设计',
    time: '2024.09 - 2025.03',
    role: '项目主导',
    image: '/assets/mouse-dumpling-main-poster.jpg',
    summary:
      '主导原创 IP 从角色概念、品牌命名、视觉识别到衍生品应用的完整开发流程。',
    tags: ['原创 IP', '品牌视觉', '衍生品', '商业场景'],
    points: [
      '定位面向儿童及年轻消费群体的萌系治愈角色，建立云朵造型、紫黄配色与闪电符号记忆点。',
      '完成 Logo、角色形象、包装视觉、产品海报及系列衍生品设计。',
      '覆盖盲盒、水杯、果冻饮品、童装等多种商业应用场景。',
    ],
  },
];

const mouseShowcaseSlides = [
  {
    eyebrow: '01 / IP MAIN VISUAL',
    title: 'Mouse Dumpling 品牌主视觉',
    body: '以盲盒系列海报建立完整的品牌第一印象，集中呈现 Logo、角色、包装与收集机制。',
    image: '/assets/mouse-dumpling-main-poster.jpg',
    tags: ['Blind Box', 'Poster', 'Collectible'],
    accent: 'primary',
  },
  {
    eyebrow: '02 / CHARACTER SYSTEM',
    title: '12 款换装角色体系',
    body: '通过厨师、街头、海盗、宇航员等换装设定，让角色具备系列化收藏与商业延展能力。',
    image: '/assets/mouse-dumpling-fashion-design.jpg',
    tags: ['Character', 'Fashion', 'Series'],
    accent: 'lilac',
  },
  {
    eyebrow: '03 / PRODUCT APPLICATION',
    title: '果冻饮品包装系统',
    body: '将角色视觉延展到袋装饮品、杯装果冻与组合包装，形成更完整的货架识别语言。',
    image: '/assets/mouse-dumpling-product-system.jpg',
    tags: ['Packaging', 'Jelly Drink', 'Shelf Visual'],
    accent: 'gold',
  },
  {
    eyebrow: '04 / FASHION EXTENSION',
    title: '童装睡衣图案应用',
    body: '把云朵角色、帽子与闪电符号转换为服装印花，展示 IP 在软性商品上的应用可能。',
    image: '/assets/mouse-dumpling-pajamas.jpg',
    tags: ['Pajamas', 'Pattern', 'Kids'],
    accent: 'cyan',
  },
  {
    eyebrow: '05 / PERIPHERAL PRODUCT',
    title: '儿童水杯周边设计',
    body: '以角色头部作为瓶盖造型，将 IP 从平面视觉进一步延展为可触摸的日用品形态。',
    image: '/assets/mouse-dumpling-water-bottle-poster.jpg',
    tags: ['Bottle', 'Peripheral', 'Product Form'],
    accent: 'blue',
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
    desc: 'Word、Excel、PPT、PS、AI、Rhino、KeyShot、主流 AI 大模型、Codex 智能体；CET4、计算机二级、普通话二甲。',
  },
];

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

function MouseDumplingShowcase({ project, index }) {
  return (
    <article className="projectCard projectCardShowcase">
      <div className="mouseShowcaseColumn">
        <ScrollStack className="mouseStack">
          {mouseShowcaseSlides.map((slide) => (
            <ScrollStackItem key={slide.eyebrow} itemClassName={`mouseSceneCard ${slide.accent}`}>
              <div className="mouseSceneVisual">
                <img src={slide.image} alt={`${slide.title} 展示图`} />
                <span className="mouseGlow mouseGlowOne" />
                <span className="mouseGlow mouseGlowTwo" />
                <span className="mouseCloud mouseCloudLarge" />
                <span className="mouseCloud mouseCloudSmall" />
              </div>
              <div className="mouseSceneCopy">
                <p>{slide.eyebrow}</p>
                <h4>{slide.title}</h4>
                <span>{slide.body}</span>
                <div className="mouseSceneTags" aria-label={`${slide.title} 关键词`}>
                  {slide.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>

      <div className="projectIntroPanel">
        <img className="mouseProjectLogo" src="/assets/mouse-dumpling-logo-smooth.png" alt="Mouse Dumpling 标志" />
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
        <a className="contactButton" href="#about">
          关于我
        </a>
      </header>

      <section className="hero" id="top" aria-label="首页">
        <div className="heroMedia" aria-hidden="true">
          <video className="heroVideo heroVideoFill" autoPlay muted loop playsInline poster="/assets/hero-source.png">
            <source src="/assets/hero-reference.mp4" type="video/mp4" />
            <source src="/assets/hero-loop.webm" type="video/webm" />
          </video>
          <video className="heroVideo heroVideoFocus" autoPlay muted loop playsInline poster="/assets/hero-source.png">
            <source src="/assets/hero-reference.mp4" type="video/mp4" />
            <source src="/assets/hero-loop.webm" type="video/webm" />
          </video>
        </div>
        <div className="heroShade" />

        <div className="heroInner">
          <div className="heroDeck">
            <p className="heroMicro">PORTFOLIO / PRODUCT DESIGN / 2026</p>
            <h1 aria-label={`${profile.name} ${profile.role}`}>
              <span className="heroName">
                <TextPressure text="OWEN" textColor="#ff2a19" autoSweep />
              </span>
              <span className="heroRole">PRODUCT DESIGNER</span>
            </h1>
            <p className="heroCaption">
              {profile.name} · 在用户情绪、产品形态与商业表达之间建立清晰秩序。
            </p>
          </div>

          <div className="heroBoard">
            <div className="heroStat">
              <span className="slashMark">///</span>
              <strong>15%+</strong>
              <p>专业 GPA 排名前列，持续把研究、表达与交付压进同一套设计判断。</p>
            </div>
            <div className="heroActions">
              <a href="#projects" className="primaryCta">
                查看精选项目
              </a>
              <a href={`mailto:${profile.email}`} className="ghostCta">
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
        <Grainient />
        <section className="section about" id="about">
          <div className="sectionHeader">
            <p className="eyebrow">ABOUT ME</p>
            <h2>从用户场景出发，构建设计判断。</h2>
          </div>
          <div className="aboutGrid">
            <div className="portraitPanel">
              <img src="/assets/owen-ip-character.jpg" alt="郑欧文 IP 形象" />
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.title}</span>
              </div>
            </div>
            <div className="bioPanel">
              <p>{profile.intro}</p>
              <div className="contactGrid" aria-label="联系方式">
                <span>电话</span>
                <a href={`tel:${profile.phone.replaceAll('-', '')}`}>{profile.phone}</a>
                <span>邮箱</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <span>所在地</span>
                <strong>{profile.location}</strong>
                <span>教育</span>
                <strong>{profile.education}</strong>
              </div>
            </div>
            <div className="timeline">
              {experience.map((item) => (
                <article key={item.title}>
                  <time>{item.meta}</time>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects" id="projects">
          <div className="sectionHeader wide">
            <p className="eyebrow">SELECTED PROJECTS</p>
            <h2>用大图呈现关键作品，用结构说明设计价值。</h2>
          </div>
          <div className="projectList">
            {projects.map((project, index) => (
              project.title.includes('Mouse Dumpling') ? (
                <MouseDumplingShowcase project={project} index={index} key={project.title} />
              ) : (
                <article className="projectCard" key={project.title}>
                  <div className="projectImage">
                    <img src={project.image} alt={`${project.title} 项目视觉`} />
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
          <div className="internshipGalleryFrame">
            <CircularGallery items={internshipWorks} bend={30} scrollSpeed={0.28} textColor="#eff3f6" />
          </div>
        </section>

        <section className="contactFinal" id="contact">
          <div className="contactHalo" />
          <p className="eyebrow">LET'S CONNECT</p>
          <h2>期待把下一个想法，推进成可被体验的作品。</h2>
          <div className="finalLinks">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={`tel:${profile.phone.replaceAll('-', '')}`}>{profile.phone}</a>
            <span>{profile.location}</span>
          </div>
          <a className="primaryCta" href={`mailto:${profile.email}`}>
            发送邮件
          </a>
        </section>
      </div>
    </main>
  );
}

export default App;
