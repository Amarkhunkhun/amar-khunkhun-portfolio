/* ==========================================================================
   Amar Khunkhun — Cinematic Portfolio
   Lenis + GSAP/ScrollTrigger/Flip. Vanilla JS, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ------------------------------------------------------------------ *
   * 1. MEDIA MANIFEST
   * ------------------------------------------------------------------ */
  var MEDIA = [
    { type: "photo", src: "assets/photos/photo-01.jpg", alt: "Street scene, placeholder photograph 01" },
    { type: "photo", src: "assets/photos/photo-02.jpg", alt: "Portrait study, placeholder photograph 02" },
    { type: "video", src: "assets/videos/video-01.mp4", poster: "assets/posters/video-01-poster.jpg", alt: "Placeholder motion clip 01" },
    { type: "photo", src: "assets/photos/photo-03.jpg", alt: "Landscape, placeholder photograph 03" },
    { type: "photo", src: "assets/photos/photo-04.jpg", alt: "Architecture detail, placeholder photograph 04" },
    { type: "photo", src: "assets/photos/photo-05.jpg", alt: "Candid moment, placeholder photograph 05" },
    { type: "photo", src: "assets/photos/photo-06.jpg", alt: "Portrait, placeholder photograph 06" },
    { type: "photo", src: "assets/photos/photo-07.jpg", alt: "Wide shot, placeholder photograph 07" },
    { type: "video", src: "assets/videos/video-02.mp4", poster: "assets/posters/video-02-poster.jpg", alt: "Placeholder motion clip 02" },
    { type: "photo", src: "assets/photos/photo-08.jpg", alt: "Still life, placeholder photograph 08" },
    { type: "photo", src: "assets/photos/photo-09.jpg", alt: "Street scene, placeholder photograph 09" },
    { type: "photo", src: "assets/photos/photo-10.jpg", alt: "Portrait, placeholder photograph 10" },
    { type: "photo", src: "assets/photos/photo-11.jpg", alt: "Detail shot, placeholder photograph 11" },
    { type: "photo", src: "assets/photos/photo-12.jpg", alt: "Landscape, placeholder photograph 12" },
    { type: "video", src: "assets/videos/video-03.mp4", poster: "assets/posters/video-03-poster.jpg", alt: "Placeholder motion clip 03" },
    { type: "photo", src: "assets/photos/photo-13.jpg", alt: "Wide shot, placeholder photograph 13" },
    { type: "photo", src: "assets/photos/photo-14.jpg", alt: "Candid moment, placeholder photograph 14" },
    { type: "photo", src: "assets/photos/photo-15.jpg", alt: "Portrait, placeholder photograph 15" }
  ];

  var ROWS = [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17]
  ];

  /* ------------------------------------------------------------------ *
   * 2. BUILD A STRIP ITEM
   * ------------------------------------------------------------------ */
  function buildItem(index, inert) {
    var data = MEDIA[index];
    var el = document.createElement("div");
    el.className = "strip-item";
    el.setAttribute("data-media-index", index);
    if (inert) {
      el.setAttribute("tabindex", "-1");
      el.setAttribute("aria-hidden", "true");
    } else {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Open " + data.alt);
    }

    var media;
    if (data.type === "video") {
      media = document.createElement("video");
      media.src = data.src;
      media.poster = data.poster;
      media.muted = true;
      media.loop = true;
      media.autoplay = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.setAttribute("aria-label", data.alt);
    } else {
      media = document.createElement("img");
      media.src = data.src;
      media.alt = data.alt;
      media.loading = "lazy";
      media.decoding = "async";
    }
    el.appendChild(media);

    if (!inert) {
      el.addEventListener("click", function () { openLightbox(index, el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index, el);
        }
      });
    }
    return el;
  }

  /* ------------------------------------------------------------------ *
   * 3. BUILD STRIP ROWS (desktop) + MOBILE GRID (always)
   * ------------------------------------------------------------------ */
  var tracks = []; // { el, dir, offset, speed, baseSpeed }

  function buildStrips() {
    if (reduceMotion) return;
    var rowEls = document.querySelectorAll(".strip-row");
    rowEls.forEach(function (rowEl, i) {
      var track = rowEl.querySelector("[data-track]");
      var indices = ROWS[i];
      // duplicate the set so the loop has no visible seam
      [0, 1].forEach(function (setIdx) {
        indices.forEach(function (mediaIndex) {
          track.appendChild(buildItem(mediaIndex, setIdx === 1));
        });
      });
      var dir = parseFloat(rowEl.getAttribute("data-dir")) || 1;
      tracks.push({
        el: track,
        dir: dir,
        offset: 0,
        speed: 0,
        baseSpeed: 14 * dir // px/sec idle drift
      });
    });
  }

  function buildMobileGrid() {
    var grid = document.getElementById("mobile-grid");
    MEDIA.forEach(function (_, i) {
      grid.appendChild(buildItem(i, false));
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. DRIFT / SCROLL-VELOCITY TICKER
   * ------------------------------------------------------------------ */
  var scrollVelocity = 0; // px/frame-ish, signed, positive = scrolling down

  function tickStrips(deltaSec) {
    if (reduceMotion || lightboxOpen) return;
    tracks.forEach(function (t) {
      var target = t.baseSpeed + scrollVelocity * 1.6 * t.dir;
      t.speed += (target - t.speed) * Math.min(1, deltaSec * 3.2);
      t.offset += t.speed * deltaSec;

      var setWidth = t.el.scrollWidth / 2;
      if (setWidth > 0) {
        if (t.offset > setWidth) t.offset -= setWidth;
        if (t.offset < -setWidth) t.offset += setWidth;
      }
      t.el.style.transform = "translate3d(" + (-t.offset) + "px,0,0)";
    });
    // velocity decays toward 0 each frame so it reflects "recent" scroll speed
    scrollVelocity *= 0.9;
  }

  /* ------------------------------------------------------------------ *
   * 5. HOVER DIM
   * ------------------------------------------------------------------ */
  function initHoverDim() {
    if (isTouch) return;
    var viewport = document.getElementById("strip-viewport");
    viewport.addEventListener("pointerover", function (e) {
      var item = e.target.closest(".strip-item");
      if (!item) return;
      viewport.classList.add("is-dimming");
      viewport.querySelectorAll(".strip-item.is-active").forEach(function (n) {
        n.classList.remove("is-active");
      });
      var idx = item.getAttribute("data-media-index");
      viewport.querySelectorAll('.strip-item[data-media-index="' + idx + '"]').forEach(function (n) {
        n.classList.add("is-active");
      });
    });
    viewport.addEventListener("pointerleave", function () {
      viewport.classList.remove("is-dimming");
      viewport.querySelectorAll(".strip-item.is-active").forEach(function (n) {
        n.classList.remove("is-active");
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. LIGHTBOX (FLIP open/close, fade nav, keyboard + swipe)
   * ------------------------------------------------------------------ */
  var lightboxOpen = false;
  var openedIndex = null;
  var activeIndex = null;
  var currentEl = null; // the physical strip-item element moved into the stage
  var originalParent = null;
  var originalNext = null;

  var lightbox = document.getElementById("lightbox");
  var stage = document.getElementById("lb-stage");
  var counter = document.getElementById("lb-counter");
  var soundBtn = document.querySelector(".lb-sound");
  var prevBtn = document.querySelector(".lb-prev");
  var nextBtn = document.querySelector(".lb-next");

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateCounter() {
    counter.textContent = pad(activeIndex + 1) + " / " + MEDIA.length;
  }

  function setMediaContent(el, index) {
    var data = MEDIA[index];
    var media = el.querySelector("img,video");
    if (data.type === "video") {
      media.muted = true;
      if (soundBtn) {
        soundBtn.hidden = false;
        soundBtn.setAttribute("aria-pressed", "false");
      }
      if (media.src.indexOf(data.src) === -1) {
        media.src = data.src;
        media.poster = data.poster;
        media.load();
        media.play().catch(function () {});
      }
    } else {
      if (soundBtn) soundBtn.hidden = true;
      if (media.tagName === "IMG" && media.src.indexOf(data.src) === -1) {
        media.src = data.src;
        media.alt = data.alt;
      }
    }
  }

  function openLightbox(index, el) {
    if (lightboxOpen) return;
    lightboxOpen = true;
    openedIndex = index;
    activeIndex = index;
    currentEl = el;
    originalParent = el.parentNode;
    originalNext = el.nextSibling;

    var state = (window.Flip && !reduceMotion) ? Flip.getState(el) : null;

    document.documentElement.classList.add("lightbox-active");
    lightbox.hidden = false;
    stage.appendChild(el);
    updateCounter();

    if (state) {
      Flip.from(state, {
        duration: 0.65,
        ease: "power3.out",
        absolute: true,
        scale: true
      });
    } else {
      gsap.fromTo(el, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: reduceMotion ? 0.01 : 0.35 });
    }

    document.addEventListener("keydown", onKeydown);
    if (window.__lenis) window.__lenis.stop();
  }

  function closeLightbox() {
    if (!lightboxOpen || !currentEl) return;

    // restore the original opened item's media content before animating home
    if (activeIndex !== openedIndex) {
      setMediaContent(currentEl, openedIndex);
    }
    var media = currentEl.querySelector("video");
    if (media) media.muted = true;

    var el = currentEl;
    var state = (window.Flip && !reduceMotion) ? Flip.getState(el) : null;

    if (originalNext) {
      originalParent.insertBefore(el, originalNext);
    } else {
      originalParent.appendChild(el);
    }

    function finish() {
      lightbox.hidden = true;
      document.documentElement.classList.remove("lightbox-active");
      lightboxOpen = false;
      currentEl = null;
      if (window.__lenis) window.__lenis.start();
    }

    if (state) {
      Flip.from(state, {
        duration: 0.55,
        ease: "power3.inOut",
        absolute: true,
        scale: true,
        onComplete: finish
      });
    } else {
      finish();
    }
    document.removeEventListener("keydown", onKeydown);
  }

  function step(dir) {
    if (!lightboxOpen) return;
    var next = (activeIndex + dir + MEDIA.length) % MEDIA.length;
    var el = currentEl;
    var tl = gsap.timeline();
    tl.to(el, {
      opacity: 0,
      duration: reduceMotion ? 0.01 : 0.18,
      ease: "power1.out",
      onComplete: function () {
        activeIndex = next;
        setMediaContent(el, activeIndex);
        updateCounter();
      }
    }).to(el, { opacity: 1, duration: reduceMotion ? 0.01 : 0.22, ease: "power1.out" });
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  }

  document.querySelectorAll("[data-lb-close]").forEach(function (b) {
    b.addEventListener("click", closeLightbox);
  });
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });
  soundBtn.addEventListener("click", function () {
    var media = currentEl && currentEl.querySelector("video");
    if (!media) return;
    media.muted = !media.muted;
    soundBtn.setAttribute("aria-pressed", String(!media.muted));
    soundBtn.setAttribute("aria-label", media.muted ? "Unmute video" : "Mute video");
  });

  // touch swipe
  (function () {
    var startX = null;
    stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });
  })();

  /* ------------------------------------------------------------------ *
   * 7. SIDE NAV + MOBILE MENU
   * ------------------------------------------------------------------ */
  function initNav() {
    var links = document.querySelectorAll(".side-nav-link");
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var target = document.getElementById(link.getAttribute("data-target"));
        if (!target) return;
        if (window.__lenis) {
          window.__lenis.scrollTo(target, { duration: reduceMotion ? 0 : 1.1 });
        } else {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }
        closeMobileMenu();
      });
    });

    var sections = ["intro", "work", "about"].map(function (id) { return document.getElementById(id); });
    function syncActive() {
      var mid = window.innerHeight * 0.5;
      var current = sections[0];
      sections.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= 0) current = s;
      });
      var id = current.id;
      document.querySelectorAll(".side-nav-link").forEach(function (l) {
        var isCurrent = l.getAttribute("data-target") === id;
        l.setAttribute("aria-current", isCurrent ? "true" : "false");
      });
      var onDark = id === "intro";
      var monogramEl = document.querySelector(".monogram");
      var sideNavEl = document.querySelector(".side-nav");
      if (monogramEl) monogramEl.classList.toggle("on-dark", onDark);
      if (sideNavEl) sideNavEl.classList.toggle("on-dark", onDark);
    }
    window.addEventListener("scroll", debounce(syncActive, 50), { passive: true });
    syncActive();
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  var mobileToggle = document.querySelector(".mobile-menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.hidden = true;
    mobileToggle.setAttribute("aria-expanded", "false");
  }
  mobileToggle.addEventListener("click", function () {
    var open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    mobileMenu.classList.toggle("is-open", open);
    mobileToggle.setAttribute("aria-expanded", String(open));
  });

  /* ------------------------------------------------------------------ *
   * 8. TIMECODE — mapped to scroll progress
   * ------------------------------------------------------------------ */
  var timecodeEl = document.getElementById("timecode");
  var FPS = 24, TOTAL_SECONDS = 180; // stylistic viewfinder duration
  function updateTimecode() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var totalFrames = Math.floor(progress * TOTAL_SECONDS * FPS);
    var ss = Math.floor(totalFrames / FPS);
    var ff = totalFrames % FPS;
    var hh = Math.floor(ss / 3600);
    var mm = Math.floor((ss % 3600) / 60);
    var s = ss % 60;
    timecodeEl.textContent = pad(hh) + ":" + pad(mm) + ":" + pad(s) + ":" + pad(ff);
    return progress;
  }

  /* ------------------------------------------------------------------ *
   * 9. PRELOADER
   * ------------------------------------------------------------------ */
  function runPreloader(done) {
    var preloader = document.getElementById("preloader");
    var path = document.getElementById("preloader-path");
    if (reduceMotion || !window.gsap) {
      preloader.style.display = "none";
      done();
      return;
    }
    gsap.timeline({ onComplete: function () {
      preloader.classList.add("is-done");
      gsap.to(preloader, { opacity: 0, duration: 0.5, onComplete: function () {
        preloader.style.display = "none";
        done();
      }});
    }})
    .to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" });
  }

  /* ------------------------------------------------------------------ *
   * 10. INTRO: pinned zoom-through-the-letter
   * ------------------------------------------------------------------ */
  function initIntro() {
    var nameEl = document.querySelector(".intro-name");
    var copyEl = document.querySelector(".intro-copy");
    var windowEl = document.querySelector(".intro-window");
    var letterA = document.querySelector('[data-letter="A1"]');
    var section = document.getElementById("intro");

    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      gsap && gsap.fromTo(copyEl, { opacity: 0 }, { opacity: 1, duration: 0.8 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    function setOrigin() {
      var rect = letterA.getBoundingClientRect();
      // approximate the counter (the triangular gap) of a bold geometric "A":
      // horizontally centered, roughly 60% down the glyph's height.
      var ox = rect.left + rect.width * 0.5;
      var oy = rect.top + rect.height * 0.6;
      var oxPct = (ox / window.innerWidth) * 100;
      var oyPct = (oy / window.innerHeight) * 100;
      nameEl.style.transformOrigin = oxPct + "% " + oyPct + "%";
      windowEl.style.clipPath = "circle(0% at " + oxPct + "% " + oyPct + "%)";
      return { oxPct: oxPct, oyPct: oyPct };
    }

    var origin = setOrigin();
    window.addEventListener("resize", debounce(function () { origin = setOrigin(); }, 200));

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=140%",
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    tl.to(copyEl.querySelector(".intro-tagline"), { opacity: 0, duration: 0.12 }, 0)
      .to(copyEl.querySelector(".intro-scroll-cue"), { opacity: 0, duration: 0.08 }, 0)
      .to(nameEl, { scale: 7, opacity: 0, duration: 0.7, ease: "power2.in" }, 0.08)
      .to(windowEl, {
        clipPath: "circle(150% at " + origin.oxPct + "% " + origin.oyPct + "%)",
        duration: 0.75,
        ease: "power2.inOut"
      }, 0.18);
  }

  /* ------------------------------------------------------------------ *
   * 11. LENIS SMOOTH SCROLL
   * ------------------------------------------------------------------ */
  function initLenis() {
    if (reduceMotion || !window.Lenis) return null;
    var lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    lenis.on("scroll", function (e) {
      scrollVelocity = (e.velocity || 0) * 1.2;
      if (window.ScrollTrigger) ScrollTrigger.update();
      updateTimecode();
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
    return lenis;
  }

  /* ------------------------------------------------------------------ *
   * BOOT
   * ------------------------------------------------------------------ */
  function boot() {
    buildStrips();
    buildMobileGrid();
    initHoverDim();
    initNav();
    initIntro();
    initLenis();
    updateTimecode();

    if (!reduceMotion) {
      window.addEventListener("scroll", updateTimecode, { passive: true });
      var lastTime = performance.now();
      gsap.ticker.add(function () {
        var now = performance.now();
        var dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        tickStrips(dt);
      });
    } else {
      window.addEventListener("scroll", updateTimecode, { passive: true });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    runPreloader(boot);
  });
})();
