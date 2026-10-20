/* EOT lazy loading helpers: fade-in for lazy images + lazy video poster. */
(function () {
  var root = document.documentElement;

  /* images: hidden until loaded, then fade in (CSS in the page <head>) */
  root.classList.add("lz-on");
  Array.prototype.forEach.call(document.querySelectorAll("img"), function (im) {
    function show() { im.classList.add("is-in"); }
    if (im.complete && (im.naturalWidth || im.getAttribute("loading") !== "lazy")) return show();
    im.addEventListener("load", show, { once: true });
    im.addEventListener("error", show, { once: true });
  });

  /* video poster: only fetched when the video area is about to scroll into view */
  Array.prototype.forEach.call(document.querySelectorAll("video[data-poster]"), function (v) {
    function load() { v.setAttribute("poster", v.getAttribute("data-poster")); v.removeAttribute("data-poster"); }
    if (!("IntersectionObserver" in window)) return load();
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { load(); io.disconnect(); }
    }, { rootMargin: "600px 0px" });
    io.observe(v);
  });
})();
