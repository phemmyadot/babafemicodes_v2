"use client";

import { useEffect, useRef } from "react";
import {
  Cursors,
  Dossiers,
  Drawer,
  Frame,
  HudReadout,
  HudScroll,
  LiveRegion,
  TopBar,
} from "./KineticChrome";
import { Hero, Marquees, Modules, SiteFooter, Stack, Timeline, Uplink } from "./KineticSections";

export function KineticPortfolio() {
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
    const intervalIds = new Set<number>();

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

    const every = (callback: () => void, ms: number) => {
      const id = window.setInterval(() => {
        if (!cancelled) callback();
      }, ms);
      intervalIds.add(id);
      return id;
    };

    const observe = (observer: IntersectionObserver) => {
      observers.push(observer);
      return observer;
    };

    docEl.classList.add("kinetic-html");

    /* ------------------------------------------------------------------ clock */
    const clock = $<HTMLElement>("#clock");
    if (clock) {
      const tickClock = () => {
        const now = new Date();
        clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((value) => String(value).padStart(2, "0"))
          .join(":");
      };
      tickClock();
      every(tickClock, 1000);
    }

    /* -------------------------------------------------------- scroll progress */
    const progressBar = $<HTMLElement>("#progressBar");
    const scrollHint = $<HTMLElement>(".hud-scroll");
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      if (progressBar) {
        progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      }
      if (scrollHint) scrollHint.classList.toggle("is-hidden", doc.scrollTop > 120);
    };
    let progressTicking = false;
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

    /* ------------------------------------------------------------ hud readout */
    const hudReadout = $<HTMLElement>(".hud-readout");
    const pageFooter = $<HTMLElement>(".site-footer");
    if (hudReadout && pageFooter && "IntersectionObserver" in window) {
      const footerObserver = observe(
        new IntersectionObserver(
          (entries) => hudReadout.classList.toggle("is-hidden", entries[0].isIntersecting),
          { rootMargin: "0px 0px -20px 0px" },
        ),
      );
      footerObserver.observe(pageFooter);
    }

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
      if (menuBtn) items.unshift(menuBtn);
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

    const desktop = window.matchMedia("(min-width: 921px)");
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
      const lines = $$<HTMLElement>(".split-line", nameEl);
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
            span.textContent = character === " " ? "\u00A0" : character;
            span.style.transitionDelay = `${charIndex * 16}ms`;
            line.appendChild(span);
            charIndex += 1;
          }
        });
        nameEl.classList.add("split-ready");
        raf(() => {
          raf(() => nameEl.classList.add("is-in"));
        });
        // Safety net: show the name even if animation frames never run (background tab).
        later(() => nameEl.classList.add("is-in"), 500);
        splitRestore = () => {
          lines.forEach((line, index) => {
            line.textContent = originals[index];
          });
          nameEl.classList.remove("split-ready", "is-in");
        };
      } catch {
        nameEl.classList.remove("split-ready");
      }
    }

    /* --------------------------------------------------------------- scramble */
    const scrambleTargets = $$<HTMLElement>("[data-scramble]");
    const scrambleFinals = new Map<HTMLElement, string>();
    const scrambleText = (element: HTMLElement, finalText: string, duration: number) => {
      const glyphs = "!<>-_\\/[]{}=+*^?#01ABCDEF";
      let startTime: number | null = null;
      const frame = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min(1, (timestamp - startTime) / duration);
        const revealed = Math.floor(progress * finalText.length);
        let output = "";
        for (let i = 0; i < finalText.length; i += 1) {
          const character = finalText.charAt(i);
          if (i < revealed || character === " " || character === "·") output += character;
          else output += glyphs.charAt(Math.floor(Math.random() * glyphs.length));
        }
        element.textContent = output;
        if (progress < 1) raf(frame);
        else element.textContent = finalText;
      };
      raf(frame);
    };

    if (!reduceMotion) {
      scrambleTargets.forEach((element) => {
        const finalText = element.textContent ?? "";
        scrambleFinals.set(element, finalText);
        later(() => scrambleText(element, finalText, 1100), 420);
        // Safety net: reveal the final text even if animation frames never run (background tab).
        later(() => {
          element.textContent = finalText;
        }, 1800);
      });
    }

    /* ---------------------------------------------------------------- counters */
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
        // Safety net: land on the real value if animation frames never run (background tab).
        later(finish, duration + 250);
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
          { threshold: 0.55 },
        ),
      );

      counters.forEach((element) => {
        counterFinals.set(element, element.textContent ?? "");
        element.textContent = `0${element.getAttribute("data-suffix") ?? ""}`;
        counterObserver.observe(element);
      });
    }

    /* ---------------------------------------------------------------- reveals */
    const reveals = $$<HTMLElement>(".reveal");
    if (reveals.length && !reduceMotion && "IntersectionObserver" in window) {
      const revealObserver = observe(
        new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.remove("reveal-wait");
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
        ),
      );

      reveals.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (!inView) element.classList.add("reveal-wait");
        revealObserver.observe(element);
      });
    }

    /* --------------------------------------------------------------- starfield */
    if (!reduceMotion) {
      const canvas = $<HTMLCanvasElement>("#field");
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        let width = 0;
        let height = 0;
        let points: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];
        let frameId: number | null = null;
        let running = false;
        const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          width = window.innerWidth;
          height = window.innerHeight;
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const count = Math.max(30, Math.min(92, Math.round((width * height) / 24000)));
          points = [];
          for (let i = 0; i < count; i += 1) {
            points.push({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * 0.22,
              vy: (Math.random() - 0.5) * 0.22,
              r: Math.random() * 1.3 + 0.4,
            });
          }
        };

        const step = () => {
          if (!running) return;
          ctx.clearRect(0, 0, width, height);
          pointer.x += (pointer.targetX - pointer.x) * 0.05;
          pointer.y += (pointer.targetY - pointer.y) * 0.05;
          const offsetX = (pointer.x - 0.5) * 26;
          const offsetY = (pointer.y - 0.5) * 26;

          for (let i = 0; i < points.length; i += 1) {
            const point = points[i];
            point.x += point.vx;
            point.y += point.vy;
            if (point.x < -24) point.x = width + 24;
            if (point.x > width + 24) point.x = -24;
            if (point.y < -24) point.y = height + 24;
            if (point.y > height + 24) point.y = -24;
          }

          ctx.save();
          ctx.translate(offsetX, offsetY);

          for (let a = 0; a < points.length; a += 1) {
            for (let b = a + 1; b < points.length; b += 1) {
              const dx = points[a].x - points[b].x;
              const dy = points[a].y - points[b].y;
              const dist2 = dx * dx + dy * dy;
              if (dist2 < 15000) {
                const alpha = (1 - dist2 / 15000) * 0.15;
                ctx.strokeStyle = `rgba(95, 243, 240, ${alpha.toFixed(3)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(points[a].x, points[a].y);
                ctx.lineTo(points[b].x, points[b].y);
                ctx.stroke();
              }
            }
          }

          for (let c = 0; c < points.length; c += 1) {
            ctx.fillStyle = "rgba(160, 235, 238, 0.5)";
            ctx.beginPath();
            ctx.arc(points[c].x, points[c].y, points[c].r, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          frameId = window.requestAnimationFrame(step);
        };

        const start = () => {
          if (running) return;
          running = true;
          // Paint one frame synchronously so the field is visible even when
          // animation frames are throttled (hidden or background tabs).
          step();
        };

        const stop = () => {
          running = false;
          if (frameId) window.cancelAnimationFrame(frameId);
          frameId = null;
        };

        resize();
        start();

        on(window, "resize", resize);
        on(document, "visibilitychange", () => {
          if (document.hidden) stop();
          else start();
        });
        on(
          window,
          "pointermove",
          (event) => {
            const pointerEvent = event as PointerEvent;
            if (pointerEvent.pointerType && pointerEvent.pointerType !== "mouse") return;
            pointer.targetX = pointerEvent.clientX / width;
            pointer.targetY = pointerEvent.clientY / height;
          },
          { passive: true },
        );

        listeners.push(() => stop());
      }
    }

    /* ----------------------------------------------------------------- cursor */
    const dot = $<HTMLElement>("#cursorDot");
    const ring = $<HTMLElement>("#cursorRing");
    if (dot && ring && !reduceMotion && finePointer) {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;
      let shown = false;
      let frameId: number | null = null;

      on(
        window,
        "pointermove",
        (event) => {
          const pointerEvent = event as PointerEvent;
          if (pointerEvent.pointerType && pointerEvent.pointerType !== "mouse") return;
          mouseX = pointerEvent.clientX;
          mouseY = pointerEvent.clientY;
          dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
          if (!shown) {
            shown = true;
            root.classList.add("has-cursor");
            dot.style.opacity = "1";
            ring.style.opacity = "1";
          }
        },
        { passive: true },
      );

      on(document, "pointerover", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        ring.classList.toggle(
          "is-active",
          Boolean(target.closest("a, button, .module, .tag, input, textarea")),
        );
      });

      on(document, "mouseleave", () => {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
        shown = false;
      });

      const loop = () => {
        if (!cancelled) {
          ringX += (mouseX - ringX) * 0.16;
          ringY += (mouseY - ringY) * 0.16;
          ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
          frameId = window.requestAnimationFrame(loop);
        }
      };
      loop();

      listeners.push(() => {
        if (frameId) window.cancelAnimationFrame(frameId);
        root.classList.remove("has-cursor");
      });
    }

    /* --------------------------------------------------------------- magnetic */
    if (!reduceMotion && finePointer) {
      $$<HTMLElement>(".magnetic").forEach((element) => {
        let rect: DOMRect | null = null;
        const enter = () => {
          rect = element.getBoundingClientRect();
        };
        const move = (event: Event) => {
          const pointerEvent = event as PointerEvent;
          if (!rect) rect = element.getBoundingClientRect();
          const dx = (pointerEvent.clientX - (rect.left + rect.width / 2)) / rect.width;
          const dy = (pointerEvent.clientY - (rect.top + rect.height / 2)) / rect.height;
          element.style.setProperty("--mx", `${(dx * 8).toFixed(2)}px`);
          element.style.setProperty("--my", `${(dy * 8).toFixed(2)}px`);
        };
        const leave = () => {
          element.style.setProperty("--mx", "0px");
          element.style.setProperty("--my", "0px");
          rect = null;
        };
        on(element, "pointerenter", enter);
        on(element, "pointermove", move);
        on(element, "pointerleave", leave);
        listeners.push(() => {
          element.style.removeProperty("--mx");
          element.style.removeProperty("--my");
        });
      });
    }

    /* ------------------------------------------------------------------- tilt */
    if (!reduceMotion && finePointer) {
      $$<HTMLElement>(".module").forEach((card) => {
        const frame = $<HTMLElement>(".module-frame", card);
        const glare = $<HTMLElement>(".glare", card);
        if (!frame) return;
        let rect: DOMRect | null = null;
        const enter = () => {
          rect = card.getBoundingClientRect();
        };
        const move = (event: Event) => {
          const pointerEvent = event as PointerEvent;
          if (!rect) rect = card.getBoundingClientRect();
          const px = (pointerEvent.clientX - rect.left) / rect.width;
          const py = (pointerEvent.clientY - rect.top) / rect.height;
          frame.style.setProperty("--ry", `${((px - 0.5) * 7).toFixed(2)}deg`);
          frame.style.setProperty("--rx", `${((0.5 - py) * 7).toFixed(2)}deg`);
          if (glare) {
            glare.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
            glare.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
          }
        };
        const leave = () => {
          frame.style.setProperty("--rx", "0deg");
          frame.style.setProperty("--ry", "0deg");
          rect = null;
        };
        on(card, "pointerenter", enter);
        on(card, "pointermove", move);
        on(card, "pointerleave", leave);
        listeners.push(() => {
          frame.style.removeProperty("--rx");
          frame.style.removeProperty("--ry");
          glare?.style.removeProperty("--gx");
          glare?.style.removeProperty("--gy");
        });
      });
    }

    /* ---------------------------------------------------------------- dialogs */
    const dialogs = $$<HTMLDialogElement>("dialog.dossier");
    let activeTrigger: HTMLElement | null = null;

    $$<HTMLElement>("[data-case]").forEach((trigger) => {
      on(trigger, "click", () => {
        const dialog = $(`#case-${trigger.getAttribute("data-case")}`);
        if (!dialog || !(dialog instanceof HTMLDialogElement)) return;
        activeTrigger = trigger;
        if (!dialog.open) {
          if (typeof dialog.showModal === "function") dialog.showModal();
          else dialog.setAttribute("open", "");
        }
      });
    });

    dialogs.forEach((dialog) => {
      on(dialog, "click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      on(dialog, "close", () => {
        if (activeTrigger) {
          activeTrigger.focus();
          activeTrigger = null;
        }
      });
      $$<HTMLButtonElement>("[data-close]", dialog).forEach((button) => {
        on(button, "click", () => dialog.close());
      });
    });

    /* ------------------------------------------------------------------- copy */
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
      on(button, "click", () => {
        const value = button.getAttribute("data-copy") ?? "";
        void copyText(value).then((ok) => {
          if (ok) {
            button.classList.add("is-copied");
            announce(`Copied ${value} to your clipboard.`);
            later(() => button.classList.remove("is-copied"), 1800);
          } else {
            announce(`Couldn't copy automatically. The value is ${value}`);
          }
        });
      });
    });

    /* ----------------------------------------------------------------- resume */
    $$<HTMLAnchorElement>("[data-resume]").forEach((link) => {
      on(link, "click", (event) => {
        if (window.location.protocol === "file:") return;
        const href = link.getAttribute("href");
        if (!href) return;
        event.preventDefault();
        const missing = () => {
          announce(
            "The resume PDF isn't attached yet. Add assets/Babafemi-Adojutelegan-Resume.pdf to enable the download.",
          );
        };
        fetch(href, { method: "HEAD", cache: "no-store" })
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
      listeners.forEach((dispose) => dispose());
      observers.forEach((observer) => observer.disconnect());
      rafIds.forEach((id) => window.cancelAnimationFrame(id));
      timeoutIds.forEach((id) => window.clearTimeout(id));
      intervalIds.forEach((id) => window.clearInterval(id));
      if (drawerTimer) window.clearTimeout(drawerTimer);
      if (liveTimer) window.clearTimeout(liveTimer);

      if (splitRestore) splitRestore();
      scrambleFinals.forEach((text, element) => {
        element.textContent = text;
      });
      counterFinals.forEach((text, element) => {
        element.textContent = text;
      });
      reveals.forEach((element) => element.classList.remove("reveal-wait"));

      dialogs.forEach((dialog) => {
        if (dialog.open) dialog.close();
      });

      document.body.style.overflow = "";
      root.classList.remove("has-cursor");
      docEl.classList.remove("kinetic-html");
    };
  }, []);

  return (
    <div className="kinetic" ref={rootRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <canvas id="field" aria-hidden="true" />

      <Frame />
      <HudReadout />
      <HudScroll />

      <TopBar />
      <Drawer />

      <main id="main">
        <Hero />
        <Marquees />
        <Modules />
        <Stack />
        <Timeline />
        <Uplink />
      </main>

      <SiteFooter />

      <Dossiers />
      <LiveRegion />
      <Cursors />
    </div>
  );
}
