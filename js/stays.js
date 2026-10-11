/* stays.js - accommodation cost calculator (JavaScript calculator feature) */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stayCalc");
  if (!form) return;
  const fmt = n => "M" + n.toLocaleString("en-ZA");
  const get = n => form.querySelector(`[name=${n}]`);
  function run() {
    const opt = get("stay").selectedOptions[0];
    const rate = +opt.dataset.rate;
    const nights = Math.min(30, Math.max(1, +get("nights").value || 1));
    const rooms = Math.min(10, Math.max(1, +get("rooms").value || 1));
    const breakfast = get("breakfast").checked ? 120 * nights * rooms * 2 : 0;
    const sub = rate * nights * rooms;
    const discount = nights >= 5 ? Math.round(sub * 0.1) : 0;       // 10% for 5+ nights
    const total = sub + breakfast - discount;
    document.getElementById("scLines").innerHTML =
      `<li><span>${opt.textContent.split(" - ")[0]}: ${rooms} room(s) x ${nights} night(s)</span><span>${fmt(sub)}</span></li>` +
      (breakfast ? `<li><span>Breakfast for two, daily</span><span>${fmt(breakfast)}</span></li>` : "") +
      (discount ? `<li><span>Long-stay discount (5+ nights, 10%)</span><span>-${fmt(discount)}</span></li>` : "");
    document.getElementById("scTotal").textContent = fmt(total);
  }
  form.addEventListener("input", run); form.addEventListener("change", run);
  form.addEventListener("submit", e => e.preventDefault());
  run();
});
