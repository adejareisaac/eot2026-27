/* EOT dramatic scroll layer. Loads after main.js and before lazy.js. Needs GSAP + ScrollTrigger. */
(function () {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var mm = gsap.matchMedia();

    /* ---------- 1. Mosaic zoom reveal (the effect from the sample video) ----------
       One screenshot fills the screen, then shrinks into its slot while the rest of the grid blooms in around it. */
    var firstHs = document.querySelector(".hs");
    var srcs = $$(".hs [data-track] img").map(function (i) { return i.getAttribute("src"); }).slice(0, 9);
    if (firstHs && srcs.length >= 5) {
        var sec = document.createElement("section");
        sec.className = "mz";
        sec.setAttribute("aria-hidden", "true");
        sec.innerHTML = '<div class="mz-pin"><div class="mz-grid">' + srcs.map(function (s, i) {
            return '<div' + (i === 0 ? ' class="mz-star"' : '') + '><img src="' + s + '" alt="" loading="lazy" decoding="async"></div>';
        }).join("") + '</div></div>';
        firstHs.parentNode.insertBefore(sec, firstHs);

        var grid = sec.querySelector(".mz-grid"), star = sec.querySelector(".mz-star");
        var others = $$(".mz-grid > div:not(.mz-star)", sec);

        mm.add("(min-width:700px)", function () {
            var need = function () {
                var W = grid.offsetWidth, H = grid.offsetHeight, c = H / 2, st = star.offsetTop, sh = star.offsetHeight;
                return Math.max(W / star.offsetWidth, c / Math.max(c - st, 1), (H - c) / Math.max(st + sh - c, 1)) + 0.03;
            };
            var tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: sec, start: "top top", end: "+=170%", pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true }
            });
            tl.fromTo(star,
                { scale: need, borderRadius: 0, transformOrigin: function () { return "50% " + (grid.offsetHeight / 2 - star.offsetTop) + "px"; } },
                { scale: 1, borderRadius: 22, duration: 1, ease: "power2.inOut" }, 0)
              .fromTo(others, { autoAlpha: 0, scale: 0.4, y: 80 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" }, 0.45)
              .to({}, { duration: 0.35 });
        });
        mm.add("(max-width:699px)", function () {
            gsap.fromTo(star, { scale: 0.82, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, ease: "none",
                scrollTrigger: { trigger: star, start: "top 95%", end: "top 45%", scrub: true } });
            others.forEach(function (o) {
                gsap.from(o, { y: 70, scale: 0.88, autoAlpha: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: o, start: "top 92%", once: true } });
            });
        });
    }

    /* ---------- 2. Vertical testimonial stack: each card tilts up out of the page, scrubbed to scroll ---------- */
    mm.add("(min-width:700px)", function () {
        $$(".hs [data-track] button").forEach(function (b) {
            gsap.fromTo(b,
                { y: 140, rotateX: -22, scale: 0.84, autoAlpha: 0, transformPerspective: 1100, transformOrigin: "50% 100%" },
                { y: 0, rotateX: 0, scale: 1, autoAlpha: 1, ease: "none",
                  scrollTrigger: { trigger: b, start: "top 104%", end: "top 58%", scrub: 0.6 } });
        });
    });
    mm.add("(max-width:699px)", function () {
        $$(".hs [data-track] button").forEach(function (b) {
            gsap.from(b, { y: 60, scale: 0.92, autoAlpha: 0, duration: 0.8, ease: "power3.out",
                scrollTrigger: { trigger: b, start: "top 92%", once: true } });
        });
    });

    /* ---------- 3. Scroll-lit paragraphs: words light up as you read down ---------- */
    $$("#results .lead, #classes .lead, #family .lead, #programme .lead").forEach(function (el) {
        if (el.children.length) return;
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = "";
        var sp = words.map(function (w, i) {
            var s = document.createElement("span");
            s.textContent = w;
            s.style.opacity = "0.16";
            el.appendChild(s);
            if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
            return s;
        });
        gsap.to(sp, { opacity: 1, ease: "none", stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 86%", end: "bottom 52%", scrub: true } });
    });

    ScrollTrigger.refresh();
})();
