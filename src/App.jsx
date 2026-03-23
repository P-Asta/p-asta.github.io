import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useReducedMotion } from "motion/react";
import {
  ChevronRight,
  CircleDot,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Github,
  Globe,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Package,
  Paperclip,
  Sparkles,
  Tag,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { translations } from "./content";

function StatusIcon({ type }) {
  if (type === "status") {
    return <CircleDot className="field-icon" />;
  }

  if (type === "priority") {
    return <Sparkles className="field-icon" />;
  }

  if (type === "assignee") {
    return <UserRound className="field-icon" />;
  }

  return <Tag className="field-icon" />;
}

function ActivityIcon({ type }) {
  if (type === "create") return <Sparkles className="activity-icon" />;
  if (type === "progress") return <CircleDot className="activity-icon" />;
  if (type === "priority") return <TriangleAlert className="activity-icon" />;
  if (type === "assign") return <UserRound className="activity-icon" />;
  if (type === "label") return <Tag className="activity-icon" />;
  return <FileText className="activity-icon" />;
}

function LinkIcon({ type }) {
  if (type === "package") return <Package />;
  return <Github />;
}

function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  distance = 1.25,
  mode = "auto",
  style,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);
  const hiddenState = { opacity: 0, y: `${distance}rem`, filter: "blur(0.5rem)" };
  const visibleState = { opacity: 1, y: 0, filter: "blur(0rem)" };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    const element = elementRef.current;
    let observer;
    let timeoutId;

    const reveal = (nextDelay) => {
      timeoutId = window.setTimeout(() => {
        setIsVisible(true);
      }, nextDelay * 1000);
    };

    if (!element) {
      return undefined;
    }

    if (mode === "load") {
      reveal(delay);
      return () => window.clearTimeout(timeoutId);
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 0;
    const isInitiallyVisible =
      mode === "auto" && rect.top < viewportHeight * 0.96 && rect.bottom > 0;

    if (isInitiallyVisible) {
      const topRatio = viewportHeight > 0 ? Math.max(rect.top, 0) / viewportHeight : 0;
      reveal(delay + topRatio * 0.32);
      return () => window.clearTimeout(timeoutId);
    }

    observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting) {
          return;
        }

        reveal(delay);
        observer.disconnect();
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(element);

    return () => {
      if (observer) {
        observer.disconnect();
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delay, mode, prefersReducedMotion]);

  const animatedStyle =
    prefersReducedMotion || isVisible
      ? style
      : {
          opacity: 0,
          transform: `translateY(${distance}rem)`,
          filter: "blur(0.5rem)",
          ...style,
        };

  return (
    <MotionTag
      ref={elementRef}
      className={className}
      style={animatedStyle}
      initial={false}
      animate={prefersReducedMotion || isVisible ? visibleState : hiddenState}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      {...props}
    >
      {children}
    </MotionTag>
  );
}

function AnimatedCollapse({ open, children, className = "" }) {
  const wrapperRef = useRef(null);
  const innerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;

    if (!wrapper || !inner) {
      return undefined;
    }

    gsap.killTweensOf(wrapper);

    if (isFirstRender.current) {
      gsap.set(wrapper, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        display: open ? "block" : "none",
        overflow: "hidden",
      });
      isFirstRender.current = false;
      return undefined;
    }

    if (open) {
      gsap.set(wrapper, { display: "block", overflow: "hidden" });
      gsap.fromTo(
        wrapper,
        { height: 0, opacity: 0 },
        {
          height: inner.offsetHeight,
          opacity: 1,
          duration: 0.28,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(wrapper, { height: "auto", overflow: "visible" });
          },
        },
      );
      return undefined;
    }

    gsap.set(wrapper, { overflow: "hidden", height: wrapper.offsetHeight });
    gsap.to(wrapper, {
      height: 0,
      opacity: 0,
      duration: 0.24,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(wrapper, { display: "none" });
      },
    });

    return undefined;
  }, [open]);

  return (
    <div ref={wrapperRef} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

function App() {
  const rootRef = useRef(null);
  const commentRef = useRef(null);
  const projectSectionRef = useRef(null);
  const localeAnimationReadyRef = useRef(false);
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") return "ko";
    const saved = window.localStorage.getItem("asta-locale");
    if (saved === "ko" || saved === "en") return saved;
    return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
  });
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isSubIssuesOpen, setIsSubIssuesOpen] = useState(true);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("asta-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (!localeAnimationReadyRef.current) {
      localeAnimationReadyRef.current = true;
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-i18n-section]",
        {
          autoAlpha: 0,
          y: 10,
          filter: "blur(8px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.38,
          ease: "power2.out",
          stagger: 0.04,
          clearProps: "filter",
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [locale]);

  const visibleSubIssues = useMemo(() => t.subIssues, [t.subIssues]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("im@asta.rs");
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1600);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleScrollToComment = () => {
    commentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToProjects = () => {
    projectSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsTopMenuOpen(false);
    setIsProjectsOpen(true);
  };

  return (
    <main
      ref={rootRef}
      data-shell
      className="issue-page min-h-screen bg-[var(--bg)] text-white"
    >
      <div className="issue-layout min-h-screen">
        <section className="main-pane min-w-0">
          <header
            data-topbar
            className="issue-topbar sticky top-0 z-20 border-b border-white/5 backdrop-blur-md"
          >
            <Reveal className="crumbs" distance={0.8}>
              <span className="workspace-badge">A</span>
              <span className="crumb-text">{t.workspace}</span>
              <span className="crumb-sep">›</span>
              <span className="crumb-text">AST-1</span>
            </Reveal>

            <Reveal className="top-actions" delay={0.08} distance={0.8}>
              <div className="locale-switch" aria-label={t.controls.language}>
                <span
                  className={`locale-slider ${locale === "en" ? "is-en" : "is-ko"}`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className={`locale-button ${locale === "ko" ? "is-active" : ""}`}
                  onClick={() => setLocale("ko")}
                >
                  KO
                </button>
                <button
                  type="button"
                  className={`locale-button ${locale === "en" ? "is-active" : ""}`}
                  onClick={() => setLocale("en")}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                className="ghost-icon"
                aria-label={t.controls.openQuickMenu}
                aria-expanded={isTopMenuOpen}
                onClick={() => setIsTopMenuOpen((value) => !value)}
              >
                <MoreHorizontal />
              </button>

              {isTopMenuOpen ? (
                <div className="top-menu">
                  <a href="mailto:im@asta.rs" className="menu-item">
                    <Mail />
                    {t.topMenu.email}
                  </a>
                  <a
                    href="https://blog.asta.rs"
                    target="_blank"
                    rel="noreferrer"
                    className="menu-item"
                  >
                    <ExternalLink />
                    {t.topMenu.blog}
                  </a>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={handleScrollToProjects}
                  >
                    <FolderOpen />
                    {t.topMenu.projects}
                  </button>
                </div>
              ) : null}
            </Reveal>
          </header>

          <div className="content-wrap w-full">
            <section data-title data-i18n-section className="hero-block hero-surface mx-auto">
              <Reveal className="hero-kicker" delay={0.04}>
                {t.heroKicker}
              </Reveal>
              <Reveal className="hero-title-row" delay={0.1} distance={1.5}>
                <h1 className="issue-title">{t.heroTitle}</h1>
                <span className="hero-nickname">Asta</span>
              </Reveal>
              <Reveal as="p" className="summary-label hero-intro-label" delay={0.16} distance={1.2}>
                {t.summary.label}
              </Reveal>
              <Reveal as="p" className="issue-description" delay={0.22} distance={1.4}>
                {t.heroDescription}
              </Reveal>

              <Reveal className="hero-labels" delay={0.3} distance={1.2}>
                {t.heroLabels.map((label) => (
                  <span key={label.name} className={`issue-label ${label.tone}`}>
                    <span className="label-dot" />
                    {label.name}
                  </span>
                ))}
              </Reveal>

              <Reveal className="hero-actions" delay={0.38} distance={1.1}>
                <a className="hero-button primary" href="mailto:im@asta.rs">
                  <Mail />
                  {t.actions.contact}
                </a>
                <a
                  className="hero-button"
                  href="https://blog.asta.rs"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink />
                  {t.actions.visitBlog}
                </a>
              </Reveal>
            </section>

            <section data-section data-i18n-section className="section-block">
              <Reveal className="section-header" distance={1}>
                <div className="section-title-row">
                  <button
                    type="button"
                    className={`collapse-button ${isAchievementsOpen ? "is-open" : ""}`}
                    aria-label={t.controls.toggleAchievements}
                    aria-expanded={isAchievementsOpen}
                    onClick={() => setIsAchievementsOpen((value) => !value)}
                  >
                    <ChevronRight />
                  </button>
                  <span className="section-title">{t.sections.achievements}</span>
                  <span className="section-count">{t.achievements.length}</span>
                </div>
                <div className="section-tools" />
              </Reveal>

              <AnimatedCollapse open={isAchievementsOpen} className="collapse-shell">
                <div className="achievement-list">
                  {t.achievements.map((item, index) => (
                    <Reveal
                      key={`${item.date}-${item.title}`}
                      as="article"
                      className="achievement-row"
                      delay={index * 0.04}
                      distance={0.9}
                    >
                      <div className="achievement-date">{item.date}</div>
                      <div className="achievement-main">
                        <p className="achievement-title">{item.title}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="achievement-link"
                          >
                            <span>Open</span>
                            <ExternalLink />
                          </a>
                        ) : null}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </AnimatedCollapse>
            </section>

            <section
              ref={projectSectionRef}
              data-section
              data-i18n-section
              className="section-block"
            >
              <Reveal className="section-header" distance={1}>
                <div className="section-title-row">
                  <button
                    type="button"
                    className={`collapse-button ${isProjectsOpen ? "is-open" : ""}`}
                    aria-label={t.controls.toggleProjects}
                    aria-expanded={isProjectsOpen}
                    onClick={() => setIsProjectsOpen((value) => !value)}
                  >
                    <ChevronRight />
                  </button>
                  <FolderOpen className="section-leading-icon" />
                  <span className="section-title">{t.sections.projects}</span>
                  <span className="section-count">{t.projects.length}</span>
                </div>
                <div className="section-tools" />
              </Reveal>

              <AnimatedCollapse open={isProjectsOpen} className="collapse-shell">
              <div className="project-list">
                {t.projects.map((project, index) => (
                  <Reveal
                    key={project.name}
                    as="article"
                    className={`project-card ${project.accent}`}
                    delay={index * 0.05}
                    distance={1}
                  >
                    <div className="project-card-head">
                      <div>
                        <p className="project-name">{project.name}</p>
                        <p className="project-description">{project.description}</p>
                      </div>
                    </div>

                    <div className="project-links">
                      {project.links.map((link) => (
                        <a
                          key={`${project.name}-${link.label}`}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link"
                        >
                          <LinkIcon type={link.icon} />
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
              </AnimatedCollapse>
            </section>

            <section data-section data-i18n-section className="section-block">
              <Reveal className="section-header" distance={1}>
                <div className="section-title-row">
                  <button
                    type="button"
                    className={`collapse-button ${isSubIssuesOpen ? "is-open" : ""}`}
                    aria-label={t.controls.toggleSubIssues}
                    aria-expanded={isSubIssuesOpen}
                    onClick={() => setIsSubIssuesOpen((value) => !value)}
                  >
                    <ChevronRight />
                  </button>
                  <span className="section-title">{t.sections.subIssues}</span>
                  <span className="section-count">
                    {visibleSubIssues.length}/{t.subIssues.length}
                  </span>
                </div>
                <div className="section-tools" />
              </Reveal>

              <AnimatedCollapse open={isSubIssuesOpen} className="collapse-shell">
                <div className="subissue-list">
                  {visibleSubIssues.map((item, index) => (
                    <Reveal
                      key={item.id}
                      as="article"
                      className="subissue-row"
                      delay={index * 0.04}
                      distance={0.85}
                    >
                      <div className="subissue-main">
                        <span className={`todo-mark ${item.state}`} />
                        <span className="subissue-id">{item.id}</span>
                        <span className="subissue-title">{item.title}</span>
                      </div>
                      <div className="subissue-right">
                        {item.labels.map((label) => (
                          <span key={label} className="mini-label">
                            {label}
                          </span>
                        ))}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </AnimatedCollapse>
            </section>

            <section data-section data-i18n-section className="inline-details mobile-only">
              <Reveal className="inline-detail" distance={0.9}>
                <p className="summary-label">{t.sections.skills}</p>
                <div className="chip-row">
                  {t.skillHighlights.map((item) => (
                    <span key={item.name} className="mini-label soft">
                      {item.name}
                    </span>
                  ))}
                </div>
              </Reveal>

              <Reveal className="inline-detail" delay={0.06} distance={0.9}>
                <p className="summary-label">{t.sections.quickContact}</p>
                <div className="stacked-links">
                  {t.contacts.map((contact) => (
                    <a
                      key={contact.label}
                      href={contact.href}
                      target={contact.href.startsWith("http") ? "_blank" : undefined}
                      rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-contact"
                    >
                      <span>{contact.label}</span>
                      <span>{contact.value}</span>
                    </a>
                  ))}
                </div>
              </Reveal>
            </section>

            <section data-section data-i18n-section className="section-block">
              <Reveal className="activity-header" distance={1}>
                <div className="section-title-row">
                  <button
                    type="button"
                    className={`collapse-button ${isActivityOpen ? "is-open" : ""}`}
                    aria-label={t.controls.toggleActivity}
                    aria-expanded={isActivityOpen}
                    onClick={() => setIsActivityOpen((value) => !value)}
                  >
                    <ChevronRight />
                  </button>
                  <h2 className="activity-title">{t.sections.activity}</h2>
                </div>
                <div className="activity-tools">
                </div>
              </Reveal>

              <AnimatedCollapse open={isActivityOpen} className="collapse-shell">
                <div className="activity-list">
                  {t.timeline.map((item, index) => (
                    <Reveal
                      key={`${item.text}-${index}`}
                      as="article"
                      className="activity-row"
                      delay={index * 0.05}
                      distance={0.9}
                    >
                      <div className="activity-rail">
                        <span className={`activity-bullet activity-${item.icon}`}>
                          <ActivityIcon type={item.icon} />
                        </span>
                        {index !== t.timeline.length - 1 && <span className="activity-line" />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{item.text}</p>
                        <p className="activity-meta">{item.meta}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </AnimatedCollapse>
            </section>

            <section ref={commentRef} data-section data-i18n-section className="comment-shell">
              <Reveal className="comment-avatar" distance={0.9}>
                <img src="/profile.png" alt="Asta profile" className="avatar-image" />
              </Reveal>
              <Reveal className="comment-box discord-message" delay={0.05} distance={1}>
                <div className="discord-meta">
                  <span className="discord-author">{t.commentAuthor}</span>
                  <span className="discord-time">{t.commentTimestamp}</span>
                </div>
                <p className="discord-text">{t.commentText}</p>
              </Reveal>
            </section>
          </div>
        </section>

        <aside data-sidebar className="side-pane">
          <div data-i18n-section className="side-card">
            <Reveal className="side-head" distance={1}>
              <p className="side-issue-id">AST-1</p>
              <div className="side-head-right">
                <span className="avatar-frame">
                  <img src="/profile.png" alt="Asta profile" className="avatar-image" />
                </span>
                <div className="side-icons">
                  <button
                    type="button"
                    className="side-action"
                    data-tooltip={t.controls.language}
                    aria-label={t.controls.language}
                    onClick={() => setLocale((value) => (value === "ko" ? "en" : "ko"))}
                  >
                    <Globe />
                  </button>
                  <a
                    className="side-action"
                    data-tooltip={t.controls.openBlog}
                    href="https://blog.asta.rs"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.controls.openBlog}
                  >
                    <ExternalLink />
                  </a>
                  <button
                    type="button"
                    className="side-action"
                    data-tooltip={t.controls.copyEmail}
                    aria-label={t.controls.copyEmail}
                    onClick={handleCopyEmail}
                    title={copiedEmail ? t.copiedEmail : t.controls.copyEmail}
                  >
                    <Copy />
                  </button>
                  <a
                    className="side-action"
                    href="#projects"
                    data-tooltip={t.controls.openProjects}
                    aria-label={t.controls.openProjects}
                    onClick={(event) => {
                      event.preventDefault();
                      handleScrollToProjects();
                    }}
                  >
                    <FolderOpen />
                  </a>
                </div>
              </div>
            </Reveal>

            {copiedEmail ? <Reveal as="p" className="copy-feedback">{t.copiedEmail}</Reveal> : null}

            <div className="side-fields">
              {t.sidebarFields.map((field, index) => (
                <Reveal
                  key={field.label}
                  className="side-field"
                  delay={index * 0.04}
                  distance={0.8}
                >
                  <span className="side-label">{field.label}</span>
                  <div className="side-value">
                    <StatusIcon type={field.icon} />
                    <span>{field.value}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="divider-line" />

            <Reveal className="side-section desktop-only" distance={0.9}>
              <div className="side-section-head">
                <p className="side-section-title">{t.sections.skills}</p>
                <button
                  type="button"
                  className={`collapse-button subtle ${isSkillsOpen ? "is-open" : ""}`}
                  aria-label={t.controls.toggleSkills}
                  aria-expanded={isSkillsOpen}
                  onClick={() => setIsSkillsOpen((value) => !value)}
                >
                  <ChevronRight />
                </button>
              </div>

              <AnimatedCollapse open={isSkillsOpen} className="collapse-shell">
                <div className="label-stack">
                  {t.skillHighlights.map((item) => (
                    <span key={item.name} className={`issue-label ${item.tone ?? ""}`.trim()}>
                      {item.tone ? <span className="label-dot" /> : null}
                      {item.name}
                    </span>
                  ))}
                </div>
              </AnimatedCollapse>
            </Reveal>

            <div className="divider-line desktop-only" />

            <Reveal className="side-section" delay={0.06} distance={0.9}>
              <div className="side-section-head">
                <p className="side-section-title">{t.sections.contact}</p>
                <button
                  type="button"
                  className={`collapse-button subtle ${isContactOpen ? "is-open" : ""}`}
                  aria-label={t.controls.toggleContact}
                  aria-expanded={isContactOpen}
                  onClick={() => setIsContactOpen((value) => !value)}
                >
                  <ChevronRight />
                </button>
              </div>

              <AnimatedCollapse open={isContactOpen} className="collapse-shell">
                <div className="contact-stack">
                  {t.contacts.map((contact) => (
                    <a
                      key={contact.label}
                      href={contact.href}
                      target={contact.href.startsWith("http") ? "_blank" : undefined}
                      rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                      className="contact-item"
                    >
                      <span>{contact.label}</span>
                      <span>{contact.value}</span>
                    </a>
                  ))}
                </div>
              </AnimatedCollapse>
            </Reveal>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default App;
