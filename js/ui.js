/* Basic UI only (menu, lightbox, video play, sub-nav pill). No animation. Safe to delete if your main.js already does these. */
(function () {
    var $ = function (s, r) { return (r || document).querySelector(s) };
    var bg = $(".burger"), lk = $("#lk"); if (bg) { bg.onclick = function () { bg.setAttribute("aria-expanded", lk.classList.toggle("open")) }; lk.onclick = function (e) { if (e.target.tagName == "A") { lk.classList.remove("open"); bg.setAttribute("aria-expanded", "false") } } }
    var dl = $("#dl"), di = $("#di"); document.addEventListener("click", function (e) { var z = e.target.closest("[data-zoom]"); if (z) { di.src = z.dataset.zoom; dl.showModal() } else if (e.target === dl) dl.close() }); $("#dx").onclick = function () { dl.close() };
    var v = $("#vd"), p = $("#pl"); if (v && p) { v.removeAttribute("controls"); p.onclick = function () { v.setAttribute("controls", ""); v.preload = "auto"; v.play(); p.hidden = true } }
    var s = $("[data-subnav]"), h = $("#hero"); if (s && h && "IntersectionObserver" in window) new IntersectionObserver(function (x) { s.classList.toggle("on", !x[0].isIntersecting) }).observe(h);
    document.querySelectorAll(".d3 img,.photo img").forEach(function (i) { function m() { i.parentNode.classList.add("missing") } i.addEventListener("error", m); if (i.complete && !i.naturalWidth) m() });
})();