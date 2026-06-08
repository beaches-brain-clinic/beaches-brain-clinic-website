/* Beaches Brain Clinic — interactions */
(function () {
  "use strict";

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

  /* ---- Web3Forms AJAX submit (forms with class .ajax-form) ---- */
  document.querySelectorAll("form.ajax-form").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var defaultLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var key = form.querySelector('input[name="access_key"]');
      if (key && /YOUR_WEB3FORMS/.test(key.value)) {
        showStatus("err", "Form not connected yet — add your free Web3Forms access key (see README) to start receiving submissions.");
        return;
      }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Sending…"; }
      if (status) status.className = "form-status";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            form.reset();
            showStatus("ok", "Thank you — your message has been sent. We'll be in touch shortly.");
          } else {
            showStatus("err", (data && data.message) || "Something went wrong. Please email us directly at contact@beachesbrainclinic.com.au.");
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

  /* ---- Design-variant switcher: shows on the preview ports 8137/8138/8139 whether
     reached via localhost OR a LAN IP (e.g. 192.168.x.x); hidden on the live site ---- */
  var host = location.hostname;
  if (["8137", "8138", "8139"].indexOf(location.port) !== -1) {
    var variants = [
      { port: "8137", label: "A", name: "Aurora" },
      { port: "8138", label: "B", name: "Column" },
      { port: "8139", label: "C", name: "Supahub" }
    ];
    var bar = document.createElement("div");
    bar.setAttribute("aria-label", "Design variant switcher");
    bar.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:9999;display:flex;gap:4px;align-items:center;padding:6px 6px 6px 0;border-radius:999px;background:rgba(15,23,42,0.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 14px 34px -8px rgba(0,0,0,0.5);font-family:ui-sans-serif,system-ui,-apple-system,'Inter',sans-serif;";
    var tag = document.createElement("span");
    tag.textContent = "DESIGN";
    tag.style.cssText = "color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;letter-spacing:0.14em;padding:0 10px;";
    bar.appendChild(tag);
    variants.forEach(function (v) {
      var active = v.port === location.port;
      var a = document.createElement("a");
      a.href = location.protocol + "//" + host + ":" + v.port + location.pathname;
      a.textContent = v.label;
      a.title = v.name + " — port " + v.port;
      a.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 6px;border-radius:999px;font-size:13px;font-weight:700;line-height:1;text-decoration:none;transition:background .2s,color .2s;" +
        (active ? "background:#fff;color:#0f172a;" : "background:transparent;color:rgba(255,255,255,0.72);");
      a.addEventListener("mouseenter", function () { if (!active) a.style.background = "rgba(255,255,255,0.14)"; });
      a.addEventListener("mouseleave", function () { if (!active) a.style.background = "transparent"; });
      bar.appendChild(a);
    });
    document.body.appendChild(bar);
  }
})();
