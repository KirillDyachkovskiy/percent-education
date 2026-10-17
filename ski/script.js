const SKI_TOTAL = 1500;

function skiInit() {
  const marks = $("ski-marks");
  [25, 50, 75].forEach((p) => {
    const m = document.createElement("div");
    m.className = "ski-mark";
    m.style.left = p + "%";
    m.innerHTML = `<span>${p}%<br>${(SKI_TOTAL * p) / 100} км</span>`;
    marks.appendChild(m);
  });

  const quick = $("ski-quick");
  [0, 1, 10, 25, 50, 75, 100].forEach((p) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = p + "%";
    b.dataset.km = (SKI_TOTAL * p) / 100;
    b.addEventListener("click", () => skiSet(+b.dataset.km));
    quick.appendChild(b);
  });

  // Стрелки: клик — один шаг, зажатие — шагает само, пока держишь
  document.querySelectorAll(".ski-arrow").forEach((btn) => {
    const step = +btn.dataset.step;
    let timer = null;
    const stop = () => { clearTimeout(timer); clearInterval(timer); timer = null; };
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      skiSet(+$("ski-range").value + step);
      timer = setTimeout(() => {
        timer = setInterval(() => skiSet(+$("ski-range").value + step), 60);
      }, 400);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stop));
  });

  $("ski-range").addEventListener("input", skiUpdate);
  skiUpdate();
}

function skiSet(km) {
  $("ski-range").value = Math.max(0, Math.min(SKI_TOTAL, km));
  skiUpdate();
}

// Проценты до сотых: 601 км → "40,07"
function fmt2(n) {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function skiUpdate() {
  const km = +$("ski-range").value;
  const left = SKI_TOTAL - km;
  const p = (km / SKI_TOTAL) * 100;
  const pLeft = 100 - p;

  $("ski-done").style.width = p + "%";
  $("skier").style.left = p + "%";
  $("skier-km").style.left = p + "%";
  $("skier-km").textContent = `${km} км`;
  $("ski-passed").textContent = `${fmt2(p)}% = ${km} км`;
  $("ski-left").textContent = `${fmt2(pLeft)}% = ${left} км`;
  $("ski-range").style.setProperty("--p", p + "%");

  [...$("ski-quick").children].forEach((c) => c.classList.toggle("active", +c.dataset.km === km));

  let html = `
    Весь путь — <b>1500 км</b>, это <b>100%</b>.<br>
    Значит 1% пути = <span class="formula">1500 ÷ 100 = 15 км</span><br>
    Никита прошёл <b>${km} км</b>:
    <span class="formula">${km} ÷ 1500 × 100 = ${fmt2(p)}%</span><br>
    Осталось пройти <b>${left} км</b>:
    <span class="formula">1500 − ${km} = ${left} км</span> → это
    <span class="formula">100% − ${fmt2(p)}% = ${fmt2(pLeft)}%</span>`;

  if (km % 15 !== 0) {
    html += `<br>💡 ${km} км не делится на 15 ровно, поэтому процент получился с запятой.`;
  }
  if (km === 0) html += `<br>🏠 Никита ещё дома — прошёл 0%.`;
  else if (p === 25) html += `<br>25% — это <b>четверть</b> пути.`;
  else if (p === 50) html += `<br>🌓 50% — ровно <b>половина</b> пути!`;
  else if (p === 75) html += `<br>75% — <b>три четверти</b> пути, финиш близко!`;
  else if (p === 100) html += `<br>🏁 Никита дошёл! 100% — это <b>весь</b> путь.`;

  $("ski-explain").innerHTML = html;
}

skiInit();
