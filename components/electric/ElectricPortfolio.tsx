"use client";

import { useEffect, useRef } from "react";
import {
  Curtain,
  Cursor,
  Dossiers,
  Drawer,
  Grain,
  LiveRegion,
  SiteFooter,
  SkipLink,
  TopBar,
} from "./ElectricChrome";
import { ElectricSections } from "./ElectricSections";
import { ContentProvider } from "./ContentContext";
import type { ElectricContent } from "./content";

export function ElectricPortfolio({ content }: { content: ElectricContent }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const container: ParentNode = root;

    const docEl = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    function $<T extends Element>(selector: string, scope: ParentNode = container) {
      return scope.querySelector<T>(selector);
    }
    function $$<T extends Element>(selector: string, scope: ParentNode = container) {
      return Array.from(scope.querySelectorAll<T>(selector));
    }

    let cancelled = false;
    const listeners: Array<() => void> = [];
    const observers: IntersectionObserver[] = [];
    const rafIds = new Set<number>();
    const timeoutIds = new Set<number>();

    const on = (
      target: EventTarget,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler, options);
      listeners.push(() => target.removeEventListener(type, handler, options));
    };

    const raf = (callback: FrameRequestCallback) => {
      const id = window.requestAnimationFrame((time) => {
        rafIds.delete(id);
        if (!cancelled) callback(time);
      });
      rafIds.add(id);
      return id;
    };

    const later = (callback: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeoutIds.delete(id);
        if (!cancelled) callback();
      }, ms);
      timeoutIds.add(id);
      return id;
    };

    const observe = (observer: IntersectionObserver) => {
      observers.push(observer);
      return observer;
    };

    docEl.classList.add("electric-html");

    /* ------------------------------------------------------------------ live */
    const liveRegion = $<HTMLElement>("#liveRegion");
    let liveTimer: number | null = null;

    const announce = (message: string) => {
      if (!liveRegion) return;
      liveRegion.textContent = message;
      liveRegion.classList.add("is-visible");
      if (liveTimer) window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => {
        liveRegion.classList.remove("is-visible");
      }, 4200);
    };

    /* ------------------------------------------------- progress + parallax */
    const progressBar = $<HTMLElement>("#progressBar");
    const heroArt = $<HTMLElement>(".hero-art");
    let progressTicking = false;

    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      if (progressBar) {
        progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      }
      if (heroArt && !reduceMotion && window.innerWidth > 900) {
        const shift = Math.max(-22, Math.min(22, doc.scrollTop * -0.035));
        heroArt.style.transform = `translate3d(0,${shift.toFixed(2)}px,0)`;
      }
    };

    const onScroll = () => {
      if (progressTicking) return;
      progressTicking = true;
      raf(() => {
        updateProgress();
        progressTicking = false;
      });
    };

    on(window, "scroll", onScroll, { passive: true });
    on(window, "resize", updateProgress);
    updateProgress();

    /* --------------------------------------------------------------- nav spy */
    const navLinks = $$<HTMLAnchorElement>("[data-nav]");
    if ("IntersectionObserver" in window && navLinks.length) {
      const spyTargets = navLinks
        .map((link) => $<HTMLElement>(link.getAttribute("href") ?? ""))
        .filter((target): target is HTMLElement => Boolean(target));

      const spy = observe(
        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const id = `#${entry.target.id}`;
              navLinks.forEach((link) => {
                if (link.getAttribute("href") === id) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
              });
            });
          },
          { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
        ),
      );
      spyTargets.forEach((target) => spy.observe(target));
    }

    /* ---------------------------------------------------------------- drawer */
    const menuBtn = $<HTMLButtonElement>("#menuBtn");
    const drawer = $<HTMLElement>("#drawer");
    const drawerLinks = $$<HTMLAnchorElement>("[data-drawer-link]");
    let drawerTimer: number | null = null;

    const drawerOpen = () => Boolean(drawer && !drawer.hidden);

    const openDrawer = () => {
      if (!drawer || !menuBtn) return;
      if (drawerTimer) window.clearTimeout(drawerTimer);
      drawer.hidden = false;
      // Force a style flush so the opening transition runs without depending on a frame.
      void drawer.offsetHeight;
      drawer.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
      const first = drawer.querySelector<HTMLElement>("a, button");
      first?.focus();
    };

    const closeDrawer = (restore: boolean) => {
      if (!drawer || !menuBtn || drawer.hidden) return;
      drawer.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
      drawerTimer = window.setTimeout(() => {
        drawer.hidden = true;
      }, 200);
      if (restore) menuBtn.focus();
    };

    if (menuBtn) {
      on(menuBtn, "click", () => {
        if (drawerOpen()) closeDrawer(false);
        else openDrawer();
      });
    }

    if (drawer) {
      on(drawer, "click", (event) => {
        if (event.target === drawer) closeDrawer(true);
      });
      drawerLinks.forEach((link) => {
        on(link, "click", () => closeDrawer(false));
      });
    }

    on(document, "keydown", (event) => {
      const key = (event as KeyboardEvent).key;
      if (key === "Escape" && drawerOpen()) {
        closeDrawer(true);
        return;
      }
      if (key !== "Tab" || !drawerOpen() || !drawer) return;
      const items = Array.from(drawer.querySelectorAll<HTMLElement>("a, button"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if ((event as KeyboardEvent).shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!(event as KeyboardEvent).shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const desktop = window.matchMedia("(min-width: 881px)");
    const onDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer(false);
    };
    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", onDesktopChange);
      listeners.push(() => desktop.removeEventListener("change", onDesktopChange));
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(onDesktopChange);
      listeners.push(() => desktop.removeListener(onDesktopChange));
    }

    /* ------------------------------------------------------- hero name split */
    const nameEl = $<HTMLElement>(".hero-name");
    let splitRestore: (() => void) | null = null;
    if (nameEl && !reduceMotion) {
      const lines = $$<HTMLElement>(".line", nameEl);
      const originals = lines.map((line) => line.textContent ?? "");
      try {
        let charIndex = 0;
        lines.forEach((line) => {
          const text = line.textContent ?? "";
          line.textContent = "";
          for (let i = 0; i < text.length; i += 1) {
            const character = text.charAt(i);
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = character;
            span.style.setProperty("--d", `${charIndex * 18}ms`);
            line.appendChild(span);
            charIndex += 1;
          }
        });
        nameEl.classList.add("split");
        raf(() => {
          raf(() => nameEl.classList.add("is-in"));
        });
        // Safety net: show the name even if animation frames never run (background tab).
        later(() => nameEl.classList.add("is-in"), 600);
        splitRestore = () => {
          lines.forEach((line, index) => {
            line.textContent = originals[index];
          });
          nameEl.classList.remove("split", "is-in");
        };
      } catch {
        nameEl.classList.remove("split");
      }
    }

    /* --------------------------------------------------------------- counters */
    const counters = $$<HTMLElement>("[data-count]");
    const counterFinals = new Map<HTMLElement, string>();
    if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
      const animateCount = (element: HTMLElement) => {
        const target = Number.parseFloat(element.getAttribute("data-count") ?? "");
        if (Number.isNaN(target)) return;
        const suffix = element.getAttribute("data-suffix") ?? "";
        const duration = 1100;
        let startTime: number | null = null;
        const finish = () => {
          element.textContent = `${target}${suffix}`;
        };
        const frame = (timestamp: number) => {
          if (startTime === null) startTime = timestamp;
          const progress = Math.min(1, (timestamp - startTime) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) raf(frame);
          else finish();
        };
        raf(frame);
        // Safety net: land on the real value if animation frames never run.
        later(finish, duration + 300);
      };

      const counterObserver = observe(
        new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              animateCount(entry.target as HTMLElement);
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.5 },
        ),
      );

      counters.forEach((element) => {
        counterFinals.set(element, element.textContent ?? "");
        element.textContent = `0${element.getAttribute("data-suffix") ?? ""}`;
        counterObserver.observe(element);
      });
    }

    /* ---------------------------------------------------------------- reveals */
    const revealTargets = $$<HTMLElement>(
      ".section-head, .sheet, .stack-card, .log-row, .cred, .contact-copy, .contact-sticker, .footer-inner",
    );
    if (revealTargets.length && !reduceMotion && "IntersectionObserver" in window) {
      revealTargets.forEach((element) => {
        element.classList.add("rv");
        const rect = element.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (!inView) element.classList.add("rv-wait");
      });

      const revealObserver = observe(
        new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.remove("rv-wait");
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
        ),
      );

      revealTargets.forEach((element) => revealObserver.observe(element));

      // Safety net: never leave content hidden if observation is throttled.
      later(() => {
        revealTargets.forEach((element) => element.classList.remove("rv-wait"));
      }, 2600);
    }

    /* ------------------------------------------------------- magnetic buttons */
    if (!reduceMotion && finePointer) {
      $$<HTMLElement>(".magnetic").forEach((element) => {
        let rect: DOMRect | null = null;
        on(element, "pointerenter", () => {
          rect = element.getBoundingClientRect();
        });
        on(element, "pointermove", (event) => {
          const pointer = event as PointerEvent;
          if (!rect) rect = element.getBoundingClientRect();
          const dx = (pointer.clientX - (rect.left + rect.width / 2)) / rect.width;
          const dy = (pointer.clientY - (rect.top + rect.height / 2)) / rect.height;
          element.style.setProperty("--mx", `${(dx * 6).toFixed(2)}px`);
          element.style.setProperty("--my", `${(dy * 6).toFixed(2)}px`);
        });
        on(element, "pointerleave", () => {
          element.style.setProperty("--mx", "0px");
          element.style.setProperty("--my", "0px");
          rect = null;
        });
      });
    }

    /* ---------------------------------------------------------- custom cursor */
    const cursorEl = $<HTMLElement>("#cursor");
    if (cursorEl && !reduceMotion && finePointer) {
      let shown = false;
      on(
        window,
        "pointermove",
        (event) => {
          const pointer = event as PointerEvent;
          if (pointer.pointerType && pointer.pointerType !== "mouse") return;
          cursorEl.style.transform = `translate3d(${pointer.clientX}px,${pointer.clientY}px,0)`;
          if (!shown) {
            shown = true;
            cursorEl.classList.add("is-visible");
            docEl.classList.add("has-cursor");
          }
        },
        { passive: true },
      );

      on(document, "pointerover", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const view = target.closest("[data-cursor='view']");
        const interactive = target.closest("a, button, .chips span, .sticker");
        cursorEl.classList.toggle("is-view", Boolean(view));
        cursorEl.classList.toggle("is-link", !view && Boolean(interactive));
      });

      on(document, "mouseleave", () => {
        cursorEl.classList.remove("is-visible");
        shown = false;
      });
    }

    /* --------------------------------------------------------- case dossiers */
    const dialogs = $$<HTMLDialogElement>("dialog.dossier");
    let activeTrigger: HTMLElement | null = null;

    $$<HTMLElement>("[data-case]").forEach((trigger) => {
      on(trigger, "click", () => {
        const dialog = $<HTMLDialogElement>(
          `#case-${trigger.getAttribute("data-case") ?? ""}`,
        );
        if (!dialog) return;
        activeTrigger = trigger;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });

    dialogs.forEach((dialog) => {
      on(dialog, "click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      on(dialog, "close", () => {
        if (activeTrigger && document.contains(activeTrigger)) activeTrigger.focus();
        activeTrigger = null;
      });
      $$<HTMLButtonElement>("[data-close]", dialog).forEach((button) => {
        on(button, "click", () => dialog.close());
      });
    });

    /* ------------------------------------------------------- copy to clipboard */
    const copyText = async (text: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          /* fall back below */
        }
      }
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch {
        return false;
      }
    };

    $$<HTMLButtonElement>("[data-copy]").forEach((button) => {
      const originalLabel = button.getAttribute("aria-label") || "Copy";
      on(button, "click", () => {
        const value = button.getAttribute("data-copy") || "";
        void copyText(value).then((ok) => {
          if (cancelled) return;
          if (!ok) {
            announce(`Couldn't copy automatically. The value is ${value}`);
            return;
          }
          button.classList.add("is-copied");
          button.setAttribute("aria-label", "Copied");
          announce(`Copied ${value} to your clipboard.`);
          later(() => {
            button.classList.remove("is-copied");
            button.setAttribute("aria-label", originalLabel);
          }, 1800);
        });
      });
    });

    /* --------------------------------------------------------- resume download */
    const resumeController = new AbortController();
    $$<HTMLAnchorElement>("[data-resume]").forEach((link) => {
      on(link, "click", (event) => {
        if (window.location.protocol === "file:") return;
        const href = link.getAttribute("href");
        if (!href) return;
        event.preventDefault();
        const missing = () => {
          if (cancelled) return;
          announce(
            "The resume PDF isn't attached yet. Add assets/Babafemi-Adojutelegan-Resume.pdf to enable the download.",
          );
        };
        fetch(href, { method: "HEAD", cache: "no-store", signal: resumeController.signal })
          .then((response) => {
            if (!response.ok) {
              missing();
              return;
            }
            const temp = document.createElement("a");
            temp.href = href;
            temp.setAttribute("download", "");
            document.body.appendChild(temp);
            temp.click();
            temp.remove();
          })
          .catch(missing);
      });
    });

    /* ---------------------------------------------------------------- cleanup */
    return () => {
      cancelled = true;

      listeners.forEach((remove) => remove());
      observers.forEach((observer) => observer.disconnect());
      rafIds.forEach((id) => window.cancelAnimationFrame(id));
      timeoutIds.forEach((id) => window.clearTimeout(id));
      if (drawerTimer) window.clearTimeout(drawerTimer);
      if (liveTimer) window.clearTimeout(liveTimer);

      resumeController.abort();

      if (liveRegion) {
        liveRegion.classList.remove("is-visible");
        liveRegion.textContent = "";
      }

      if (drawer && !drawer.hidden) {
        drawer.hidden = true;
        drawer.classList.remove("is-open");
      }
      if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
      }
      document.body.style.overflow = "";

      dialogs.forEach((dialog) => {
        if (dialog.open) dialog.close();
      });

      if (splitRestore) splitRestore();
      counters.forEach((element) => {
        const original = counterFinals.get(element);
        if (original !== undefined) element.textContent = original;
      });
      revealTargets.forEach((element) => element.classList.remove("rv", "rv-wait"));

      if (heroArt) heroArt.style.transform = "";
      if (progressBar) progressBar.style.transform = "";
      if (cursorEl) {
        cursorEl.classList.remove("is-visible", "is-view", "is-link");
        cursorEl.style.transform = "";
      }

      docEl.classList.remove("electric-html", "has-cursor");
    };
  }, []);

  return (
    <ContentProvider value={content}>
    <div className="electric" ref={rootRef}>
      <SkipLink />
      <Curtain />
      <Grain />
      <TopBar />
      <Drawer />
      <ElectricSections />
      <SiteFooter />
      <Dossiers />
      <LiveRegion />
      <Cursor />
    </div>
    </ContentProvider>
  );
}
