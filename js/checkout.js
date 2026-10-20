/* EOT checkout: validates the form and opens Paystack Inline. */
(function () {
  var cfg = window.EOT_CONFIG || {};
  var form = document.getElementById("enrolForm");
  if (!form) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "\u20A6" + Number(n).toLocaleString("en-NG"); };

  var btn = $("#payBtn"), banner = $("#coError"), total = $("#coTotal"), planName = $("#coPlan");
  var plans = $$(".plan[data-plan]");

  /* ---------- plan selection ---------- */
  function selected() {
    var r = $("input[name=plan]:checked", form);
    return r ? r.value : "phase1";
  }
  function syncPlan() {
    var key = selected(), p = cfg.PLANS[key];
    plans.forEach(function (el) { el.classList.toggle("is-sel", el.dataset.plan === key); });
    total.textContent = money(p.amount);
    planName.textContent = p.label;
    if (!btn.classList.contains("busy")) btn.querySelector(".lbl").textContent = "Pay " + money(p.amount) + " securely";
  }
  form.addEventListener("change", function (e) { if (e.target.name === "plan") syncPlan(); });
  syncPlan();

  /* ---------- validation ---------- */
  function setErr(input, msg) {
    var f = input.closest(".fld");
    f.classList.toggle("bad", !!msg);
    var m = $(".msg", f); if (m) m.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function normPhone(v) {
    var d = String(v).replace(/[^\d+]/g, "");
    if (/^\+234\d{10}$/.test(d)) return d;
    if (/^234\d{10}$/.test(d)) return "+" + d;
    if (/^0\d{10}$/.test(d)) return "+234" + d.slice(1);
    return null;
  }
  var rules = {
    name: function (v) { return v.trim().split(/\s+/).length >= 2 && v.trim().length >= 5 ? "" : "Enter your first and last name."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address."; },
    phone: function (v) { return normPhone(v) ? "" : "Enter a valid Nigerian number, e.g. 0803 123 4567."; },
    state: function (v) { return v.trim() ? "" : "Tell us your state of residence."; }
  };
  ["name", "email", "phone", "state"].forEach(function (k) {
    var i = form.elements[k];
    i.addEventListener("blur", function () { setErr(i, rules[k](i.value)); });
    i.addEventListener("input", function () { if (i.closest(".fld").classList.contains("bad")) setErr(i, rules[k](i.value)); });
  });
  function validate() {
    var first = null;
    Object.keys(rules).forEach(function (k) {
      var i = form.elements[k], m = rules[k](i.value);
      setErr(i, m);
      if (m && !first) first = i;
    });
    var c = form.elements.agree, cf = c.closest(".fld");
    cf.classList.toggle("bad", !c.checked);
    if (!c.checked && !first) first = c;
    if (first) first.focus();
    return !first;
  }

  /* ---------- UI helpers ---------- */
  function showError(msg) { banner.textContent = msg; banner.hidden = false; banner.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  function clearError() { banner.hidden = true; banner.textContent = ""; }
  function busy(on, text) {
    btn.classList.toggle("busy", on);
    btn.disabled = on;
    btn.setAttribute("aria-busy", on ? "true" : "false");
    if (text) btn.querySelector(".lbl").textContent = text;
    if (!on) syncPlan();
  }
  function ref() {
    var r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return "EOT-" + Date.now().toString(36).toUpperCase() + "-" + r;
  }

  /* ---------- pay ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    if (!window.PaystackPop) { showError("Payment could not load. Check your internet connection and try again."); return; }
    if (!cfg.PAYSTACK_PUBLIC_KEY || /REPLACE/.test(cfg.PAYSTACK_PUBLIC_KEY)) { showError("Payments are not switched on yet. Please contact EOT on WhatsApp to enrol."); return; }

    var key = selected(), plan = cfg.PLANS[key];
    var name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
    var phone = normPhone(form.elements.phone.value), state = form.elements.state.value.trim();
    var referral = form.elements.referral.value.trim();
    var reference = ref();

    busy(true, "Opening secure checkout\u2026");
    try {
      new window.PaystackPop().newTransaction({
        key: cfg.PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: plan.amount * 100,
        currency: "NGN",
        reference: reference,
        firstname: name.split(/\s+/)[0],
        lastname: name.split(/\s+/).slice(1).join(" "),
        phone: phone,
        metadata: {
          custom_fields: [
            { display_name: "Student name", variable_name: "student_name", value: name },
            { display_name: "WhatsApp number", variable_name: "whatsapp", value: phone },
            { display_name: "State", variable_name: "state", value: state },
            { display_name: "Plan", variable_name: "plan", value: key },
            { display_name: "Referred by", variable_name: "referral", value: referral || "none" },
            { display_name: "Class", variable_name: "class", value: "2027 UTME Phase 1" }
          ]
        },
        onSuccess: function (tx) {
          busy(true, "Payment received. Confirming\u2026");
          try { sessionStorage.setItem("eot_last", JSON.stringify({ name: name, email: email, plan: key, ref: tx.reference })); } catch (x) { }
          window.location.href = cfg.SUCCESS_PAGE + "?reference=" + encodeURIComponent(tx.reference);
        },
        onCancel: function () {
          busy(false);
          showError("Checkout was closed before payment finished. Your slot is not secured yet. Tap pay to try again.");
        },
        onError: function (err) {
          busy(false);
          showError((err && err.message) ? err.message : "Something went wrong opening checkout. Please try again.");
        }
      });
    } catch (err) {
      busy(false);
      showError("Something went wrong opening checkout. Please try again.");
    }
  });

  /* Bring the student to the form and focus the first field when any Join button is used */
  $$("[data-join]").forEach(function (a) {
    a.addEventListener("click", function () {
      setTimeout(function () { var n = form.elements.name; if (n && location.hash === "#enrol") n.focus({ preventScroll: true }); }, 700);
    });
  });
})();
