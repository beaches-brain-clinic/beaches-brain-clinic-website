/* Beaches Brain Clinic — interactions */
(function () {
  "use strict";

  /* Sydney inquiry handler (Cloud Run, australia-southeast1). */
  var INQUIRY_ENDPOINT = "https://inquiry-handler-2kmdoytnva-ts.a.run.app/inquiry";

  /* ---- Sticky header background on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var mobileClose = document.querySelector(".mobile-nav-close");
  function setMenu(open) {
    if (!mobileNav) return;
    mobileNav.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(true); });
  if (mobileClose) mobileClose.addEventListener("click", function () { setMenu(false); });
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Active nav link by current path ---- */
  var here = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-links a, .mobile-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#") return;
    var path = href.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
    if (path === here) a.classList.add("active");
  });

  /* ---- Inquiry submit: POST JSON to the Sydney handler ---- */

  /* The referral form's fields don't map 1:1 onto the /inquiry payload, so
     compose one: referrer = the contact, client details fold into `reason`
     (sealed + de-identified server-side, never emailed). */
  function ageRangeFromDob(dob) {
    var d = new Date(dob);
    if (!dob || isNaN(d.getTime())) return "";
    var age = (Date.now() - d.getTime()) / 31557600000; /* ms per year */
    if (age <= 12) return "child_0_12";
    if (age <= 18) return "adolescent_13_18";
    return "adult_19_plus";
  }

  function referralPayload(data) {
    var reason = [
      "Referral from a health professional (" + (data.profession || "unspecified") + (data.organisation ? ", " + data.organisation : "") + ").",
      "Client: " + [data.client_first_name, data.client_last_name].join(" ").trim() +
        (data.client_dob ? ", DOB " + data.client_dob : "") +
        (data.client_sex ? ", " + data.client_sex : "") + ".",
      "Client contact: " + [data.client_phone, data.client_email].filter(Boolean).join(" / ") + ".",
      "Reason for referral: " + (data.reason_for_referral || ""),
      "Presenting issues: " + (data.presenting_issues || ""),
      data.diagnoses ? "Diagnoses: " + data.diagnoses : "",
      data.medications ? "Medications: " + data.medications : "",
      data.medical_history ? "Medical history: " + data.medical_history : ""
    ].filter(Boolean).join("\n");
    return {
      first_name: data.referrer_first_name || "",
      last_name: data.referrer_last_name || "",
      email: data.referrer_email,
      phone: data.referrer_phone || "",
      reason: reason,
      /* "how did you hear about us" approximated from the referrer's profession */
      referral_source: data.profession === "General Practitioner" ? "gp" : "other_health_professional",
      age_range: ageRangeFromDob(data.client_dob),
      referral_detail: [data.profession, data.organisation].filter(Boolean).join(", "),
      company: data.company || ""
    };
  }

  document.querySelectorAll("form.inquiry-form, form.referral-form").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var defaultLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!INQUIRY_ENDPOINT) {
        showStatus("err", "This form isn't connected yet. Please email us directly at contact@beachesbrainclinic.com.au.");
        return;
      }

      var data = Object.fromEntries(new FormData(form).entries());
      var payload = form.classList.contains("referral-form") ? referralPayload(data) : data;

      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Sending…"; }
      if (status) status.className = "form-status";

      fetch(INQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showStatus("ok", "Thank you — your enquiry has been received. We'll be in touch shortly.");
          } else if (res.body && res.body.error === "validation_failed") {
            showStatus("err", "Please check the highlighted fields and try again.");
          } else {
            showStatus("err", "Something went wrong. Please email us directly at contact@beachesbrainclinic.com.au.");
          }
        })
        .catch(function () {
          showStatus("err", "Network error. Please email us directly at contact@beachesbrainclinic.com.au.");
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = defaultLabel; }
        });
    });

    function showStatus(kind, msg) {
      if (!status) return;
      status.className = "form-status " + kind;
      status.textContent = msg;
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  /* ---- Footer year ---- */
  var y = document.querySelector(".js-year");
  if (y) y.textContent = new Date().getFullYear();

})();
