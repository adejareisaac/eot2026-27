/* EOT scroll choreography. Needs js/gsap.min.js and js/ScrollTrigger.min.js loaded first. */
(function () {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var mm = gsap.matchMedia();
    var fine = matchMedia("(hover: hover) and (pointer: fine)");

    /* ---------- scroll progress ---------- */
    var bar = document.createElement("div");
    bar.className = "scrubbar";
    bar.style.cssText = "position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#1769FF,#48A0FF);z-index:70;pointer-events:none";
    document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.15 } });

    /* ---------- helpers ---------- */
    function splitMasked(el) {
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = "";
        var inners = [];
        words.forEach(function (w, n) {
            var o = document.createElement("span"), i = document.createElement("span");
            o.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em";
            i.style.display = "inline-block";
            i.textContent = w;
            o.appendChild(i);
            el.appendChild(o);
            if (n !== words.length - 1) el.appendChild(document.createTextNode(" "));
            inners.push(i);
        });
        return inners;
    }
    function splitChars(el) {
        var text = el.textContent, out = [];
        el.textContent = "";
        Array.from(text).forEach(function (ch) {
            var s = document.createElement("span");
            s.style.display = "inline-block";
            s.textContent = ch === " " ? "\u00a0" : ch;
            el.appendChild(s);
            out.push(s);
        });
        return out;
    }
    function addRule(el) {
        if (!el || el.closest(".fam") || (el.parentElement && el.parentElement.classList.contains("head"))) return;
        var rule = document.createElement("span");
        rule.className = "rule";
        rule.setAttribute("aria-hidden", "true");
        el.insertAdjacentElement("afterend", rule);
        gsap.from(rule, {
            scaleX: 0, duration: 0.9, ease: "power3.inOut",
            transformOrigin: el.closest(".c, .fin") ? "50% 50%" : "0% 50%",
            scrollTrigger: { trigger: el, start: "top 90%", once: true }
        });
    }
    function flagSlot(img) {
        var p = img.closest(".d3, .photo, button");
        if (!p) return;
        if (img.naturalWidth && img.naturalWidth > 12) p.classList.remove("missing");
        else p.classList.add("missing");
    }
    $$("img").forEach(function (img) {
        function go() { flagSlot(img); }
        img.addEventListener("error", go);
        if (img.complete) go(); else img.addEventListener("load", go, { once: true });
    });

    /* ---------- header state + section spy ---------- */
    var topbar = $(".top");
    var spies = [];
    $$(".links a[href^='#']").forEach(function (a) {
        if (a.classList.contains("btn")) return;
        var sec = $(a.getAttribute("href"));
        if (sec) spies.push({ a: a, sec: sec });
    });
    var spyId = "";
    ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: function (self) {
            if (topbar) topbar.classList.toggle("scrolled", self.scroll() > 10);
            var y = self.scroll() + window.innerHeight * 0.28, id = "";
            spies.forEach(function (s) {
                if (s.sec.getBoundingClientRect().top + window.scrollY <= y) id = s.a.getAttribute("href");
            });
            if (id === spyId) return;
            spyId = id;
            spies.forEach(function (s) { s.a.classList.toggle("is-on", s.a.getAttribute("href") === id); });
        }
    });

    /* ---------- hero ---------- */
    var hero = $("#hero"), stack = $(".stack", hero), floor = $(".floor", hero), giant = $(".giant", hero), scene = $(".d3", hero);
    var h1 = $("h1", hero), lead = $(".lead", hero), cta = $(".cta", hero);
    var h1w = h1 ? splitMasked(h1) : [];
    var tilt = null;
    if (scene) {
        tilt = document.createElement("div");
        tilt.className = "tilt";
        while (scene.firstChild) tilt.appendChild(scene.firstChild);
        scene.appendChild(tilt);
    }
    var cue = document.createElement("div");
    cue.className = "cue";
    cue.setAttribute("aria-hidden", "true");
    cue.innerHTML = "<span></span>";
    if (hero) hero.appendChild(cue);

    gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(floor, { scaleX: 0.3, autoAlpha: 0, duration: 1.3 }, 0)
        .from(giant, { yPercent: 45, scale: 0.55, autoAlpha: 0, duration: 1.5 }, 0.1)
        .from(scene, { y: 180, scale: 0.45, rotateX: 45, autoAlpha: 0, duration: 1.5, transformPerspective: 900 }, 0.35)
        .from(h1w, { yPercent: 120, autoAlpha: 0, stagger: 0.012, duration: 0.8 }, 0.42)
        .from(lead, { y: 40, autoAlpha: 0, duration: 0.85 }, 0.62)
        .from($$(".cta a", hero), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.78)
        .from(cue, { autoAlpha: 0, y: 12, duration: 0.6 }, 1.05);

    function heroScroll(pin) {
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: pin ? "top 60px" : "top top",
                end: pin ? "+=120%" : "bottom top",
                scrub: 0.65,
                pin: pin,
                anticipatePin: 1
            },
            defaults: { ease: "none" }
        });
        tl.to(stack, { scale: 1.22, yPercent: -4 }, 0)
            .to(scene, { y: -64, rotateY: 12, transformPerspective: 1000 }, 0)
            .to(floor, { scaleX: 1.16 }, 0)
            .to(cue, { autoAlpha: 0, y: -8 }, 0)
            .to([h1, lead, cta], { y: -80, autoAlpha: 0, stagger: 0.04 }, 0.4);
    }
    mm.add("(min-width:900px) and (min-height:820px)", function () { heroScroll(true); });
    mm.add("(max-width:899px), (max-height:819px)", function () { heroScroll(false); });

    if (hero && tilt && giant) {
        var tiltTo = function (px, py) {
            gsap.to(tilt, { rotateY: px * 12, rotateX: py * -8, x: px * 16, y: py * 10, transformPerspective: 900, duration: 0.7, ease: "power2.out", overwrite: "auto" });
            gsap.to(giant, { x: px * -18, y: py * -10, duration: 0.85, ease: "power2.out", overwrite: "auto" });
        };
        hero.addEventListener("pointermove", function (e) {
            var r = hero.getBoundingClientRect();
            hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
            hero.style.setProperty("--my", (e.clientY - r.top) + "px");
            if (!fine.matches || (e.pointerType && e.pointerType !== "mouse")) return;
            tiltTo((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
        });
        hero.addEventListener("pointerleave", function () { if (fine.matches) tiltTo(0, 0); });
    }

    /* ---------- reveals ---------- */
    $$("[data-reveal]").forEach(function (el) {
        if (el.closest("#hero") || el.classList.contains("pz") || el.classList.contains("photo") || el.classList.contains("time") || el.classList.contains("plan") || el.classList.contains("stat") || el.classList.contains("dates") || el.closest(".fg")) return;
        var st = { trigger: el, start: "top 88%", once: true };
        if (el.tagName === "H2" && !el.children.length) {
            var inners = splitMasked(el);
            gsap.from(inners, { yPercent: 115, rotate: 3, duration: 1.05, ease: "power4.out", stagger: 0.045, scrollTrigger: st });
            addRule(el);
        } else {
            gsap.from(el, { y: 64, autoAlpha: 0, duration: 1.05, ease: "power3.out", scrollTrigger: st });
            if (el.tagName === "H2") addRule(el);
        }
    });

    /* ---------- counters ---------- */
    $$("[data-counter]").forEach(function (el) {
        var to = +el.dataset.to, o = { v: 0 };
        el.textContent = "0";
        ScrollTrigger.create({
            trigger: el, start: "top 88%", once: true,
            onEnter: function () {
                gsap.to(o, {
                    v: to, duration: 1.35, ease: "power2.out",
                    onUpdate: function () { el.textContent = String(Math.round(o.v)); },
                    onComplete: function () {
                        el.textContent = String(to);
                        gsap.fromTo(el, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: "power2.out", transformOrigin: "50% 80%" });
                    }
                });
            }
        });
    });

    /* ---------- stat row ---------- */
    $$(".stat").forEach(function (el, i) {
        gsap.from(el, {
            y: 36, autoAlpha: 0, duration: 0.8, delay: i * 0.1, ease: "power3.out",
            scrollTrigger: { trigger: ".stats", start: "top 90%", once: true }
        });
    });

    /* ---------- horizontal galleries: pinned coverflow on desktop, swipe focus on mobile ---------- */
    function cover(buttons) {
        var mid = window.innerWidth / 2;
        buttons.forEach(function (b) {
            var r = b.getBoundingClientRect();
            var norm = gsap.utils.clamp(-1, 1, ((r.left + r.width / 2) - mid) / (window.innerWidth * 0.48));
            var ad = Math.abs(norm);
            gsap.set(b, {
                rotateY: -norm * 16,
                scale: 1 - ad * 0.07,
                zIndex: Math.round((1 - ad) * 8),
                transformPerspective: 900,
                transformOrigin: "50% 50%"
            });
        });
    }
    mm.add("(min-width:900px)", function () {
        var undo = [];
        $$(".hs").forEach(function (sec) {
            var track = $("[data-hscroll]", sec), inner = $("[data-track]", sec);
            if (!track || !inner) return;
            var buttons = $$("button", inner);
            track.style.overflow = "hidden";
            inner.style.display = "flex";
            inner.style.gap = "20px";
            inner.style.width = "max-content";
            var dist = function () {
                var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
                return Math.max(0, inner.offsetWidth - (track.clientWidth - pad * 2));
            };
            gsap.to(inner, {
                x: function () { return -dist(); }, ease: "none",
                scrollTrigger: {
                    trigger: sec, start: "top 60px", end: function () { return "+=" + Math.max(dist(), 1); },
                    pin: true, scrub: 0.85, anticipatePin: 1, invalidateOnRefresh: true,
                    onUpdate: function () { cover(buttons); }
                }
            });
            undo.push(function () {
                track.style.overflow = "";
                inner.style.cssText = "display:contents";
                gsap.set(buttons, { clearProps: "transform,zIndex" });
            });
        });
        return function () { undo.forEach(function (f) { f(); }); };
    });
    mm.add("(max-width:899px)", function () {
        var offs = [];
        $$(".track").forEach(function (track) {
            var buttons = $$("button", track);
            var focus = function () {
                var mid = window.innerWidth / 2;
                buttons.forEach(function (b) {
                    var r = b.getBoundingClientRect();
                    var ad = Math.min(1, Math.abs((r.left + r.width / 2) - mid) / (window.innerWidth * 0.75));
                    b.style.scale = String(1 - ad * 0.05);
                });
            };
            track.addEventListener("scroll", focus, { passive: true });
            focus();
            offs.push(function () {
                track.removeEventListener("scroll", focus);
                buttons.forEach(function (b) { b.style.scale = ""; });
            });
        });
        return function () { offs.forEach(function (f) { f(); }); };
    });

    /* ---------- founder story ---------- */
    function mark(steps, idx, dim) {
        steps.forEach(function (s, i) {
            s.classList.toggle("on", i === idx);
            if (dim) gsap.to(s, { opacity: i === idx ? 1 : i < idx ? 0.55 : 0.28, duration: 0.35, overwrite: "auto" });
        });
    }
    var story = $("#story"), beats = story ? $$("[data-step]", story) : [], num = story ? $(".num", story) : null;
    var beatsBox = story ? $(".beats", story) : null, bead = null, railFill = null, idxNow = 0;
    function layoutStory() {
        if (!beatsBox || !beats.length || !beatsBox.querySelector(".rail")) return;
        var rail = beatsBox.querySelector(".rail");
        var top = beats[0].offsetTop + 6;
        var last = beats[beats.length - 1];
        rail.style.top = top + "px";
        rail.style.height = Math.max(40, last.offsetTop + last.offsetHeight - 10 - top) + "px";
    }
    function moveBead(idx, instant) {
        if (!bead || !beats[idx]) return;
        var y = beats[idx].offsetTop + 18;
        if (instant) gsap.set(bead, { y: y });
        else gsap.to(bead, { y: y, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    }
    if (beatsBox && beats.length) {
        beatsBox.classList.add("has-rail");
        var rail = document.createElement("span");
        rail.className = "rail";
        rail.setAttribute("aria-hidden", "true");
        railFill = document.createElement("i");
        rail.appendChild(railFill);
        bead = document.createElement("span");
        bead.className = "bead";
        bead.setAttribute("aria-hidden", "true");
        beatsBox.appendChild(rail);
        beatsBox.appendChild(bead);
        layoutStory();
        moveBead(0, true);
        ScrollTrigger.addEventListener("refresh", function () { layoutStory(); moveBead(idxNow, true); });
    }
    mm.add("(min-width:900px) and (min-height:680px)", function () {
        if (!story || !beats.length) return;
        mark(beats, 0, true);
        idxNow = 0;
        var end = "+=" + beats.length * 75 + "%";
        ScrollTrigger.create({
            trigger: story, start: "top 60px", end: end, pin: true, anticipatePin: 1,
            onUpdate: function (s) {
                var idx = Math.min(beats.length - 1, Math.floor(s.progress * beats.length));
                if (idx !== idxNow) { idxNow = idx; mark(beats, idx, true); moveBead(idx, false); }
                if (railFill) gsap.set(railFill, { scaleY: Math.max(0.04, s.progress) });
            }
        });
        if (num) gsap.to(num, { scale: 1.28, rotateZ: -3, transformOrigin: "0% 50%", ease: "none", scrollTrigger: { trigger: story, start: "top 60px", end: end, scrub: 1 } });
        return function () { beats.forEach(function (b) { gsap.set(b, { clearProps: "opacity" }); }); };
    });
    mm.add("(max-width:899px), (max-height:679px)", function () {
        if (!beats.length) return;
        beats.forEach(function (b, i) {
            ScrollTrigger.create({
                trigger: b, start: "top 65%", end: "bottom 35%",
                onToggle: function (s) {
                    b.classList.toggle("on", s.isActive);
                    if (s.isActive) { idxNow = i; moveBead(i, false); }
                }
            });
        });
        if (num) gsap.from(num, { scale: 0.7, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: num, start: "top 85%", once: true } });
        if (railFill) gsap.fromTo(railFill, { scaleY: 0.04 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: beatsBox, start: "top 70%", end: "bottom 50%", scrub: true } });
    });

    /* ---------- family ---------- */
    gsap.from("#family .step", {
        y: 26, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: "#family .steps", start: "top 80%", once: true }
    });
    $$("#family [data-step]").forEach(function (s) {
        ScrollTrigger.create({ trigger: s, start: "top 62%", end: "bottom 38%", onToggle: function (t) { s.classList.toggle("on", t.isActive); } });
    });
    var clock = $("#family [data-step-visual] .d3");
    if (clock) {
        gsap.fromTo(clock, { y: 48, rotateY: -18, rotateZ: -3, transformPerspective: 900 }, {
            y: -28, rotateY: 16, rotateZ: 3, ease: "none",
            scrollTrigger: { trigger: "#family", start: "top bottom", end: "bottom top", scrub: 1 }
        });
    }

    /* ---------- 3D drift (hero, story, family clock and prizes have their own motion) ---------- */
    $$(".d3").forEach(function (d) {
        if (d.closest("#hero") || d.closest("#story") || d.closest("#family") || d.closest(".pz")) return;
        gsap.fromTo(d, { y: 70, rotateY: -16, rotateZ: -3, transformPerspective: 900 }, {
            y: -48, rotateY: 16, rotateZ: 3, ease: "none",
            scrollTrigger: { trigger: d, start: "top bottom", end: "bottom top", scrub: 1 }
        });
    });

    /* ---------- feature cards ---------- */
    $$(".fg .f").forEach(function (el) {
        gsap.from(el, {
            y: 54, autoAlpha: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
        ScrollTrigger.create({
            trigger: el, start: "top 58%", end: "bottom 42%",
            onToggle: function (s) { el.classList.toggle("hot", s.isActive); }
        });
    });

    /* ---------- class film ---------- */
    var stage = $("[data-expand]");
    if (stage) {
        gsap.fromTo(stage, { scale: 0.7, borderRadius: 84 }, {
            scale: 1, borderRadius: 32, ease: "none",
            scrollTrigger: {
                trigger: stage, start: "top 95%", end: "top 28%", scrub: true,
                onUpdate: function (s) {
                    var p = s.progress;
                    stage.style.boxShadow = "0 " + Math.round(24 + p * 40) + "px " + Math.round(48 + p * 36) + "px -36px rgba(16,71,184," + (0.32 + p * 0.4).toFixed(3) + ")";
                }
            }
        });
    }
    var vid = $("#vd");
    if (vid && "IntersectionObserver" in window) {
        new IntersectionObserver(function (ents) {
            if (!ents[0].isIntersecting && !vid.paused) vid.pause();
        }, { threshold: 0.15 }).observe(vid);
    }

    /* ---------- programme ---------- */
    var photo = $(".photo");
    if (photo) {
        gsap.from(photo, {
            y: 60, autoAlpha: 0, clipPath: "inset(12% 8% 12% 8% round 36px)", duration: 1.1, ease: "power3.out",
            scrollTrigger: { trigger: photo, start: "top 85%", once: true }
        });
        var pimg = $("img", photo);
        if (pimg) gsap.fromTo(pimg, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true } });
    }
    var time = $(".time");
    if (time) {
        gsap.from(splitChars(time), {
            yPercent: 110, autoAlpha: 0, stagger: 0.03, duration: 0.65, ease: "power3.out",
            scrollTrigger: { trigger: time, start: "top 90%", once: true }
        });
    }
    gsap.from(".subj span", {
        y: 12, autoAlpha: 0, stagger: 0.05, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: ".subj", start: "top 88%", once: true }
    });
    gsap.from(".ck li", {
        x: 22, autoAlpha: 0, stagger: 0.08, duration: 0.65, ease: "power3.out",
        scrollTrigger: { trigger: ".ck", start: "top 82%", once: true }
    });
    var datesEl = $(".dates");
    if (datesEl && datesEl.children.length >= 2) {
        var bridge = document.createElement("span");
        bridge.className = "bridge";
        bridge.setAttribute("aria-hidden", "true");
        var bfill = document.createElement("i");
        bridge.appendChild(bfill);
        datesEl.insertBefore(bridge, datesEl.children[1]);
        gsap.fromTo(bfill, { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "0% 50%", scrollTrigger: { trigger: datesEl, start: "top 90%", end: "top 48%", scrub: true } });
    }
    var dates = $$(".dates div");
    if (dates[0]) gsap.fromTo(dates[0], { x: -140, opacity: 0.2 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".dates", start: "top 92%", end: "top 48%", scrub: true } });
    if (dates[1]) gsap.fromTo(dates[1], { x: 140, opacity: 0.2 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".dates", start: "top 92%", end: "top 48%", scrub: true } });

    /* ---------- prizes, referral, price, faq, close ---------- */
    gsap.from(".pz", {
        y: 120, scale: 0.9, autoAlpha: 0, stagger: 0.14, duration: 1.05, ease: "power3.out",
        scrollTrigger: { trigger: ".rw", start: "top 82%", once: true }
    });
    ScrollTrigger.create({
        trigger: ".rw", start: "top 80%", once: true,
        onEnter: function () {
            gsap.to(".pz .d3", { y: -10, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.15, delay: 0.85 });
        }
    });
    gsap.from(".ref", { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".ref", start: "top 88%", once: true } });
    gsap.from(".ref img", { rotate: -6, y: 18, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".ref", start: "top 88%", once: true } });

    $$(".plan").forEach(function (el, i) {
        gsap.from(el, {
            y: 48, autoAlpha: 0, duration: 0.85, delay: i * 0.12, ease: "power3.out",
            scrollTrigger: { trigger: ".pr", start: "top 84%", once: true },
            onStart: function () { if (el.classList.contains("hi")) el.classList.add("sweep"); }
        });
    });
    gsap.from("#faq details", {
        y: 20, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: "#faq .faq", start: "top 86%", once: true }
    });
    gsap.from(".note", { y: 10, autoAlpha: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: ".note", start: "top 96%", once: true } });
    gsap.fromTo(".fin", { clipPath: "inset(8% 5% 0% 5% round 48px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: ".fin", start: "top 96%", end: "top 40%", scrub: true }
    });
    gsap.from(".fin .lead, .fin .btn", {
        y: 28, autoAlpha: 0, stagger: 0.1, duration: 0.75, ease: "power3.out",
        scrollTrigger: { trigger: ".fin", start: "top 75%", once: true }
    });
    gsap.from("footer .fw > *", {
        y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: "footer", start: "top 96%", once: true }
    });

    /* ---------- magnetic buttons ---------- */
    mm.add("(hover: hover) and (pointer: fine)", function () {
        var clean = $$(".btn").map(function (btn) {
            var move = function (e) {
                var r = btn.getBoundingClientRect();
                gsap.to(btn, {
                    x: (e.clientX - (r.left + r.width / 2)) * 0.22,
                    y: (e.clientY - (r.top + r.height / 2)) * 0.32,
                    duration: 0.35, ease: "power3.out", overwrite: "auto"
                });
            };
            var leave = function () { gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" }); };
            btn.addEventListener("pointermove", move);
            btn.addEventListener("pointerleave", leave);
            return function () {
                btn.removeEventListener("pointermove", move);
                btn.removeEventListener("pointerleave", leave);
                gsap.set(btn, { clearProps: "x,y" });
            };
        });
        return function () { clean.forEach(function (f) { f(); }); };
    });

    window.addEventListener("load", function () { layoutStory(); ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutStory(); ScrollTrigger.refresh(); });
})();
