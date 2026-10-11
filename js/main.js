/* EOT scroll choreography. Needs js/gsap.min.js and js/ScrollTrigger.min.js loaded first (index.html does this). */
(function () {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; /* page stays fully readable, no motion */
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var mm = gsap.matchMedia();

    /* ---------- scroll progress bar ---------- */
    var bar = document.createElement("div");
    bar.style.cssText = "position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#1769FF,#48A0FF);z-index:70;pointer-events:none";
    document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    /* ---------- hero: dramatic entrance, then the scene rushes at you as you scroll ---------- */
    var hero = $("#hero"), stack = $(".stack", hero), floor = $(".floor", hero), giant = $(".giant", hero), scene = $(".d3", hero), copy = $$("h1,.lead,.cta", hero);
    gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(floor, { scaleX: 0.3, autoAlpha: 0, duration: 1.3 })
        .from(giant, { yPercent: 45, scale: 0.55, autoAlpha: 0, duration: 1.5 }, 0.1)
        .from(scene, { y: 180, scale: 0.45, rotateX: 45, autoAlpha: 0, duration: 1.5, transformPerspective: 900 }, "-=1.1")
        .from(copy, { y: 50, autoAlpha: 0, stagger: 0.12, duration: 0.9 }, "-=0.8");

    function heroScroll(pin) {
        var tl = gsap.timeline({
            scrollTrigger: { trigger: hero, start: pin ? "top 60px" : "top top", end: pin ? "+=110%" : "bottom top", scrub: 0.8, pin: pin, anticipatePin: 1 },
            defaults: { ease: "none" }
        });
        /* one group: the whole stage (300+, scene, floor) pushes toward you together, scene lifts slightly off the floor */
        tl.to(stack, { scale: 1.2, yPercent: -3 }, 0)
            .to(scene, { y: -50, rotateY: 10, transformPerspective: 900 }, 0)
            .to(floor, { scaleX: 1.12 }, 0)
            .to(copy, { y: -70, autoAlpha: 0, stagger: 0.05 }, 0.45);
    }
    mm.add("(min-width:900px) and (min-height:820px)", function () { heroScroll(true); });
    mm.add("(max-width:899px), (max-height:819px)", function () { heroScroll(false); });

    /* ---------- reveals: headlines slice up word by word, everything else rises ---------- */
    $$("[data-reveal]").forEach(function (el) {
        if (el.closest("#hero") || el.classList.contains("pz")) return;
        var st = { trigger: el, start: "top 88%", once: true };
        if (el.tagName === "H2" && !el.children.length) {
            var words = el.textContent.trim().split(/\s+/), inners = [];
            el.textContent = "";
            words.forEach(function (w) {
                var o = document.createElement("span"), i = document.createElement("span");
                o.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em";
                i.style.display = "inline-block"; i.textContent = w; o.appendChild(i);
                el.appendChild(o); el.appendChild(document.createTextNode(" ")); inners.push(i);
            });
            gsap.from(inners, { yPercent: 115, rotate: 4, duration: 1.1, ease: "power4.out", stagger: 0.07, scrollTrigger: st });
        } else {
            gsap.from(el, { y: 80, autoAlpha: 0, duration: 1.1, ease: "power3.out", scrollTrigger: st });
        }
    });

    /* ---------- counters ---------- */
    $$("[data-counter]").forEach(function (el) {
        var to = +el.dataset.to, o = { v: 0 }; el.textContent = "0";
        ScrollTrigger.create({
            trigger: el, start: "top 88%", once: true, onEnter: function () {
                gsap.to(o, { v: to, duration: 2.4, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
            }
        });
    });

    /* ---------- horizontal pinned galleries (desktop). On mobile they stay as native swipe scrollers ---------- */
    mm.add("(min-width:900px)", function () {
        var undo = [];
        $$(".hs").forEach(function (sec) {
            var track = $("[data-hscroll]", sec), inner = $("[data-track]", sec); if (!track || !inner) return;
            track.style.overflow = "hidden"; inner.style.display = "flex"; inner.style.gap = "20px"; inner.style.width = "max-content";
            var dist = function () { var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0; return Math.max(0, inner.offsetWidth - (track.clientWidth - pad * 2)); };
            gsap.to(inner, {
                x: function () { return -dist(); }, ease: "none",
                scrollTrigger: { trigger: sec, start: "top 60px", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true }
            });
            gsap.from($$("button", inner), {
                rotateY: -28, scale: 0.9, transformPerspective: 900, stagger: 0.08, ease: "none",
                scrollTrigger: { trigger: sec, start: "top 80%", end: "top 20%", scrub: 1 }
            });
            undo.push(function () { track.style.overflow = ""; inner.style.cssText = "display:contents"; });
        });
        return function () { undo.forEach(function (f) { f(); }); };
    });

    /* ---------- founder story: pinned, beats light up one at a time while 316 swells ---------- */
    function mark(steps, idx, dim) {
        steps.forEach(function (s, i) {
            s.classList.toggle("on", i === idx);
            if (dim) gsap.to(s, { opacity: i === idx ? 1 : i < idx ? 0.5 : 0.22, duration: 0.4, overwrite: true });
        });
    }
    var story = $("#story"), beats = $$("[data-step]", story), num = $(".num", story);
    mm.add("(min-width:900px) and (min-height:680px)", function () {
        mark(beats, 0, true);
        var end = "+=" + beats.length * 75 + "%";
        ScrollTrigger.create({
            trigger: story, start: "top 60px", end: end, pin: true, anticipatePin: 1,
            onUpdate: function (s) { mark(beats, Math.min(beats.length - 1, Math.floor(s.progress * beats.length)), true); }
        });
        gsap.to(num, { scale: 1.3, rotateZ: -4, transformOrigin: "0 50%", ease: "none", scrollTrigger: { trigger: story, start: "top 60px", end: end, scrub: 1 } });
        return function () { beats.forEach(function (b) { gsap.set(b, { clearProps: "opacity" }); }); };
    });
    mm.add("(max-width:899px), (max-height:679px)", function () {
        beats.forEach(function (b, i) { ScrollTrigger.create({ trigger: b, start: "top 65%", end: "bottom 35%", onToggle: function (s) { b.classList.toggle("on", s.isActive); } }); });
        gsap.from(num, { scale: 0.6, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: num, start: "top 85%", once: true } });
    });

    /* ---------- family system: steps light up in sequence ---------- */
    $$("#family [data-step]").forEach(function (s) {
        ScrollTrigger.create({ trigger: s, start: "top 62%", end: "bottom 38%", onToggle: function (t) { s.classList.toggle("on", t.isActive); } });
    });

    /* ---------- 3D objects drift, tilt and settle as they pass through the viewport ---------- */
    $$(".d3").forEach(function (d) {
        if (d.closest("#hero") || d.closest("#story")) return;
        gsap.fromTo(d, { y: 90, rotateY: -20, rotateZ: -4, transformPerspective: 900 },
            { y: -60, rotateY: 20, rotateZ: 4, ease: "none", scrollTrigger: { trigger: d, start: "top bottom", end: "bottom top", scrub: 1 } });
    });

    /* ---------- class video swells to full size ---------- */
    var stage = $("[data-expand]");
    if (stage) gsap.fromTo(stage, { scale: 0.68, borderRadius: 90 }, { scale: 1, borderRadius: 32, ease: "none", scrollTrigger: { trigger: stage, start: "top 95%", end: "top 30%", scrub: true } });

    /* ---------- programme dates slide in from both sides ---------- */
    var dates = $$(".dates div");
    if (dates[0]) gsap.fromTo(dates[0], { x: -180, opacity: 0.15 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".dates", start: "top 92%", end: "top 45%", scrub: true } });
    if (dates[1]) gsap.fromTo(dates[1], { x: 180, opacity: 0.15 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".dates", start: "top 92%", end: "top 45%", scrub: true } });

    /* ---------- prizes rise one after another ---------- */
    gsap.from(".pz", { y: 140, scale: 0.85, autoAlpha: 0, stagger: 0.18, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".rw", start: "top 82%", once: true } });

    /* ---------- final CTA opens up from a rounded panel ---------- */
    gsap.fromTo(".fin", { clipPath: "inset(10% 6% 0% 6% round 56px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".fin", start: "top 98%", end: "top 35%", scrub: true } });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();