/* forms.js - JavaScript validation for the contact, booking and sign-up forms,
   booking cost calculator, localStorage (username + saved bookings). */
"use strict";
(function () {
  /* ---------- validation rules ---------- */
  const rules = {
    name: v => v.length < 2 ? "Please enter your full name (at least 2 letters)."
              : !/^[A-Za-z\u00C0-\u024F' .-]+$/.test(v) ? "Names can only contain letters, spaces, apostrophes and hyphens." : "",
    username: v => !/^[A-Za-z0-9_]{3,16}$/.test(v) ? "Use 3 to 16 letters, numbers or underscores." : "",
    email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Enter a valid email address, for example name@example.com." : "",
    phone: v => !/^(\+266|00266)?[2568]\d{7}$/.test(v.replace(/[\s-]/g, "")) ? "Enter a Lesotho number such as +266 5812 3456 or 62345678." : "",
    subject: v => v.length < 3 ? "Please add a short subject." : "",
    message: v => v.length < 10 ? "Please write at least 10 characters so we can help you properly." : "",
    password: v => v.length < 8 ? "Use at least 8 characters."
                 : !/[A-Z]/.test(v) ? "Add at least one capital letter."
                 : !/[a-z]/.test(v) ? "Add at least one small letter."
                 : !/\d/.test(v) ? "Add at least one number." : "",
    date: v => { if (!v) return "Choose your arrival date.";
                 const t = new Date(); t.setHours(0, 0, 0, 0);
                 return new Date(v) < t ? "Your arrival date cannot be in the past." : ""; },
    number: (v, el) => { const n = +v; const min = +el.min || 1, max = +el.max || 99;
                 return !v || isNaN(n) || n < min || n > max ? `Enter a number from ${min} to ${max}.` : ""; },
    select: v => !v ? "Please choose an option." : ""
  };

  function check(el, form) {
    const value = el.type === "checkbox" || el.type === "radio" ? "" : el.value.trim();
    let msg = "";
    if (el.type === "radio") {
      msg = form.querySelector(`input[name="${el.name}"]:checked`) ? "" : "Please choose one.";
    } else if (el.type === "checkbox") {
      msg = el.required && !el.checked ? "You need to tick this box to continue." : "";
    } else if (el.required && !value) {
      msg = "This field is required.";
    } else if (value && el.dataset.rule && rules[el.dataset.rule]) {
      msg = rules[el.dataset.rule](value, el);
    }
    if (!msg && el.dataset.match) {
      const other = form.querySelector(el.dataset.match);
      if (other && other.value !== el.value) msg = "The passwords do not match.";
    }
    if (!msg && value && el.checkValidity && !el.checkValidity() && !el.dataset.rule) msg = el.validationMessage;   // HTML5 validation as a backup
    setState(el, msg);
    return !msg;
  }

  function setState(el, msg) {
    const group = el.closest(".mb-3, .col-md-6, .col-12, .form-check") || el.parentElement;
    let fb = group.querySelector(".invalid-feedback");
    if (!fb) { fb = document.createElement("div"); fb.className = "invalid-feedback"; group.appendChild(fb); }
    el.classList.toggle("is-invalid", !!msg);
    el.classList.toggle("is-valid", !msg && el.type !== "radio" && el.type !== "checkbox");
    el.setAttribute("aria-invalid", !!msg);
    fb.textContent = msg;
    if (el.type === "radio") fb.style.display = msg ? "block" : "none";
  }

  function wire(form, onSuccess) {
    if (!form) return;
    const fields = () => [...form.querySelectorAll("input:not([type=hidden]), select, textarea")];
    fields().forEach(el => {
      el.addEventListener("blur", () => { if (el.type !== "radio") check(el, form); });
      el.addEventListener("input", () => { if (el.classList.contains("is-invalid") || el.classList.contains("is-valid")) check(el, form); });
      el.addEventListener("change", () => check(el, form));
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const seen = new Set(); let firstBad = null;
      fields().forEach(el => {
        if (el.type === "radio") { if (seen.has(el.name)) return; seen.add(el.name); }
        if (!check(el, form) && !firstBad) firstBad = el;
      });
      const status = form.querySelector(".form-status");
      if (firstBad) {
        firstBad.focus();
        status.innerHTML = '<div class="alert alert-danger" role="alert"><strong>Please fix the highlighted fields</strong> and send the form again.</div>';
        return;
      }
      status.innerHTML = "";
      onSuccess(form, status);
    });
  }

  const success = (status, title, text) => {
    status.innerHTML = `<div class="alert alert-success" role="status"><strong>${LT.esc(title)}</strong> ${LT.esc(text)}</div>`;
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const reset = form => { form.reset(); form.querySelectorAll(".is-valid,.is-invalid").forEach(el => el.classList.remove("is-valid", "is-invalid")); };

  document.addEventListener("DOMContentLoaded", async () => {
    const dateInput = document.getElementById("bkDate");
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    /* ---------- Contact form ---------- */
    wire(document.getElementById("contactForm"), (form, status) => {
      const first = form.querySelector("[name=name]").value.trim().split(" ")[0];
      success(status, `Thank you, ${first}.`, "Your message has been received. We usually reply within two working days.");
      reset(form);
    });

    /* ---------- Sign-up (saves username with localStorage) ---------- */
    wire(document.getElementById("signupForm"), (form, status) => {
      const username = form.querySelector("[name=username]").value.trim();
      localStorage.setItem("lt_username", JSON.stringify(username));       // save
      LT.showWelcome();
      success(status, `Welcome, ${username}!`, "Your traveller profile is saved on this device. Your saved places and bookings will be here when you return.");
      reset(form);
      const bar = document.querySelector("#pwBar span"); if (bar) bar.style.width = "0";
    });
    const savedName = LT.get("lt_username", null);
    const hello = document.getElementById("savedUser");
    if (hello && savedName) {
      hello.innerHTML = `<div class="alert alert-lt-info d-flex justify-content-between align-items-center flex-wrap gap-2" role="status">
        <span>Welcome back, <strong>${LT.esc(savedName)}</strong>. Your name was retrieved from this device.</span>
        <button class="btn btn-ghost btn-sm" id="forgetUser" type="button">Sign out</button></div>`;
      document.getElementById("forgetUser").addEventListener("click", () => { localStorage.removeItem("lt_username"); hello.innerHTML = ""; LT.showWelcome(); });
    }

    /* password strength meter */
    const pw = document.getElementById("suPassword"), bar = document.querySelector("#pwBar span");
    if (pw && bar) pw.addEventListener("input", () => {
      const v = pw.value; let s = 0;
      if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      bar.style.width = (s * 20) + "%";
      bar.style.background = s <= 2 ? "#d6293e" : s <= 3 ? "#e0a526" : "#009543";
    });

    /* ---------- Booking form + cost calculator ---------- */
    const booking = document.getElementById("bookingForm");
    if (booking) {
      const dests = await LT.loadDestinations().catch(() => window.DESTINATIONS_FALLBACK || []);
      const sel = document.getElementById("bkDestination");
      sel.innerHTML = '<option value="">Choose a destination</option>' + dests.map(d => `<option value="${d.id}">${LT.esc(d.name)}</option>`).join("");
      const pre = new URLSearchParams(location.search).get("destination");
      if (pre && dests.some(d => d.id === pre)) sel.value = pre;

      const fmt = n => "M" + n.toLocaleString("en-ZA");
      function calc() {
        const rate = +booking.querySelector("[name=package]:checked")?.dataset.rate || 0;
        const guests = Math.max(1, +booking.querySelector("[name=guests]").value || 1);
        const nights = Math.max(1, +booking.querySelector("[name=nights]").value || 1);
        const lines = [];
        const base = rate * guests * nights;
        lines.push([`Stay: ${guests} guest${guests > 1 ? "s" : ""} x ${nights} night${nights > 1 ? "s" : ""}`, base]);
        let extras = 0;
        booking.querySelectorAll("[name=extras]:checked").forEach(x => {
          const amt = x.dataset.per === "person" ? +x.dataset.price * guests : x.dataset.per === "day" ? +x.dataset.price * nights : +x.dataset.price;
          lines.push([x.dataset.label, amt]); extras += amt;
        });
        const total = base + extras;
        document.getElementById("calcLines").innerHTML = lines.map(l => `<li><span>${LT.esc(l[0])}</span><span>${fmt(l[1])}</span></li>`).join("");
        document.getElementById("calcTotal").textContent = fmt(total);
        document.getElementById("calcPer").textContent = fmt(Math.round(total / guests)) + " per person";
        return total;
      }
      booking.addEventListener("input", calc); booking.addEventListener("change", calc); calc();

      const renderSaved = () => {
        const list = LT.get("lt_bookings", []);
        const box = document.getElementById("savedBookings");
        box.innerHTML = list.length ? list.map((b, i) => `
          <li class="d-flex justify-content-between gap-2 border-bottom py-2">
            <span><strong>${LT.esc(b.destination)}</strong><br><small class="text-muted-lt">${LT.esc(b.date)} - ${b.guests} guest(s) - ${LT.esc(b.total)}</small></span>
            <button class="btn btn-ghost btn-sm align-self-center" data-del="${i}" aria-label="Cancel booking for ${LT.esc(b.destination)}">Cancel</button></li>`).join("")
          : '<li class="text-muted-lt">No booking requests yet.</li>';
      };
      renderSaved();
      document.getElementById("savedBookings").addEventListener("click", e => {
        const b = e.target.closest("[data-del]"); if (!b) return;
        const list = LT.get("lt_bookings", []); list.splice(+b.dataset.del, 1); LT.set("lt_bookings", list); renderSaved();
      });

      wire(booking, (form, status) => {
        const d = dests.find(x => x.id === sel.value);
        const entry = { destination: d ? d.name : "Lesotho", date: form.querySelector("[name=date]").value,
          guests: +form.querySelector("[name=guests]").value, total: document.getElementById("calcTotal").textContent };
        LT.set("lt_bookings", [...LT.get("lt_bookings", []), entry]);
        success(status, "Booking request sent.", `${entry.destination} for ${entry.guests} guest(s) from ${entry.date}. Estimated total ${entry.total}. We will confirm availability by email.`);
        renderSaved(); reset(form); sel.value = ""; calc();
      });
    }
  });
})();
