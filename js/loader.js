/* EOT page loader. Keeps the site closed until fonts, key images and the full page have loaded,
   then dissolves and tells main.js to play the hero zoom-in. Safe: always opens within MAX ms. */
(function () {
  var root = document.documentElement, loader = document.getElementById("loader");
  root.classList.add("js");
  if (!loader) { root.classList.remove("is-loading"); return; }

  var MAX = 6000; /* no artificial minimum: opens the moment everything is ready */
  var bar = loader.querySelector(".ld-bar"), pct = loader.querySelector(".ld-pct"), msg = loader.querySelector(".ld-msg");
  var st = { dom: false, fonts: false, imgs: false, win: false };
  var shown = 0, done = false, lastMsg = -1;
  var lines = ["Warming up the classroom", "Loading lessons and materials", "Almost ready", "Welcome"];

  /* ---- real loading signals ---- */
  function onDom() {
    st.dom = true;
    var list = Array.prototype.slice.call(document.querySelectorAll("img[data-critical]")), left = list.length;
    if (!left) { st.imgs = true; return; }
    function one() { if (--left <= 0) st.imgs = true; }
    list.forEach(function (im) {
      if (im.complete) return one();
      im.addEventListener("load", one, { once: true });
      im.addEventListener("error", one, { once: true });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onDom); else onDom();

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { st.fonts = true; }, function () { st.fonts = true; });
  else st.fonts = true;
  setTimeout(function () { st.fonts = true; }, 2500); /* never wait long on web fonts */

  if (document.readyState === "complete") st.win = true; else window.addEventListener("load", function () { st.win = true; });

  /* ---- progress ---- */
  function real() { return (st.dom ? 20 : 0) + (st.fonts ? 25 : 0) + (st.imgs ? 25 : 0) + (st.win ? 30 : 0); }
  function paint() {
    var r = real(), target = r >= 100 ? 100 : Math.min(r + 14, 94);
    shown = r >= 100 ? 100 : Math.min(target, shown + (target - shown) * 0.22 + 0.15);
    var p = Math.round(shown);
    bar.style.transform = "scaleX(" + (shown / 100) + ")";
    pct.textContent = p + "%";
    var m = p >= 100 ? 3 : p >= 70 ? 2 : p >= 35 ? 1 : 0;
    if (m !== lastMsg) { lastMsg = m; msg.textContent = lines[m]; }
    if (!done && r >= 100) { done = true; finish(); return; }
    if (!done) requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);

  /* ---- open the site ---- */
  var opened = false;
  function finish() {
    if (opened) return; opened = true; done = true;
    bar.style.transform = "scaleX(1)"; pct.textContent = "100%";
    loader.classList.add("is-done");
    root.classList.remove("is-loading");
    root.classList.add("is-ready");
    if (window.ScrollTrigger) { try { ScrollTrigger.refresh(); } catch (e) { } }
    var h = location.hash;
    if (h.length > 1) { var t = null; try { t = document.querySelector(h); } catch (e) { } if (t) t.scrollIntoView(); }
    setTimeout(function () { if (window.EOT_playIntro) window.EOT_playIntro(); }, 90);
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 750);
  }
  setTimeout(finish, MAX); /* never trap the visitor */
})();
