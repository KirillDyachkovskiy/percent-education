// ---------- Утилиты ----------
const $ = (id) => document.getElementById(id);

// Красиво печатаем процент: 20 → "20", 33.333 → "33,3"
function fmt(n) {
  const r = Math.round(n * 10) / 10;
  return String(r).replace(".", ",");
}

function makeChips(container, values, current, onPick) {
  container.innerHTML = "";
  values.forEach((v) => {
    const b = document.createElement("button");
    b.className = "chip" + (v === current ? " active" : "");
    b.textContent = v;
    b.addEventListener("click", () => onPick(v));
    container.appendChild(b);
  });
}

// ---------- Навигация ----------
function go(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === screenId));
  window.scrollTo(0, 0);
}
document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => go(el.dataset.go));
});

// =====================================================
// СТЕНДОФФ
// =====================================================
const ENEMY_NAMES = ["Sn1per", "AWPer", "NoScope", "Rusher", "Camper", "Headshot", "Baiter", "Lurker", "Entry", "Clutch"];
const ENEMY_FACES = ["🥷", "😈", "🤠", "👺", "🤖", "👽", "🧟", "💂", "🦹", "👹"];
const so = { size: 5, alive: [] };

// Спрайты из игры: положи картинки в папку img/
//   img/player.png          — твой персонаж (CT)
//   img/enemy1.png … enemy10.png — враги (T)
//   img/weapon.png          — оружие в килфиде
// Если картинки нет — показывается эмодзи.
function sprite(src, fallback) {
  return `<img class="sprite" src="${src}" alt=""
    onerror="this.replaceWith(document.createTextNode('${fallback}'))">`;
}

function soStart(size) {
  so.size = size;
  so.alive = Array(size).fill(true);
  makeChips($("so-sizes"), [1, 2, 3, 4, 5, 8, 10], size, soStart);
  $("so-feed").innerHTML = '<div class="killfeed-title">Килфид</div>';
  document.querySelector(".win-banner")?.remove();
  soRenderEnemies();
  soUpdate(false);
}

function soRenderEnemies() {
  const box = $("so-enemies");
  box.innerHTML = "";
  const worth = 100 / so.size;
  so.alive.forEach((isAlive, i) => {
    const e = document.createElement("div");
    e.className = "enemy" + (isAlive ? "" : " dead");
    e.innerHTML = `
      <div class="avatar">${sprite(`img/enemy${i + 1}.png`, ENEMY_FACES[i])}${isAlive ? "" : '<span class="skull">💀</span>'}</div>
      <div class="enemy-name">${ENEMY_NAMES[i]}</div>
      <div class="enemy-worth">${fmt(worth)}% команды</div>`;
    e.addEventListener("click", () => soKill(i));
    box.appendChild(e);
  });
}

function soKill(i) {
  if (!so.alive[i]) return;
  so.alive[i] = false;
  soRenderEnemies();
  const el = $("so-enemies").children[i];
  el.classList.add("hit");

  const feed = document.createElement("div");
  feed.className = "feed-item";
  feed.innerHTML = `<span class="k">ТЫ</span>${sprite("img/weapon.png", " 🔫 ").replace('class="sprite"', 'class="feed-weapon"')}<span class="v">${ENEMY_NAMES[i]}</span>`;
  $("so-feed").appendChild(feed);

  soUpdate(true);
}

function soUpdate(animate) {
  const total = so.size;
  const killed = so.alive.filter((a) => !a).length;
  const alive = total - killed;
  const killedPct = (killed / total) * 100;
  const alivePct = 100 - killedPct;

  $("so-alive").textContent = fmt(alivePct) + "%";
  $("so-bar").style.width = alivePct + "%";

  const badge = $("so-killed");
  badge.textContent = `${fmt(killedPct)}% вражеской команды убито`;
  if (animate) {
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
  }

  const worth = 100 / total;
  let html = `
    Во вражеской команде <b>${total}</b> ${plural(total, "игрок", "игрока", "игроков")} — это <b>100%</b> команды.<br>
    Значит один враг = <span class="formula">100% ÷ ${total} = ${fmt(worth)}%</span><br>`;

  if (killed > 0) {
    html += `
      Ты убил <b>${killed}</b> из <b>${total}</b>:
      <span class="formula">${killed} ÷ ${total} × 100 = ${fmt(killedPct)}%</span> убито<br>
      Живых осталось <b>${alive}</b>:
      <span class="formula">100% − ${fmt(killedPct)}% = ${fmt(alivePct)}%</span>`;
  } else {
    html += `Пока никто не убит — живо <b>100%</b> врагов. Стреляй! 🎯`;
  }
  if (total === 3 && killed > 0 && killed < 3) {
    html += `<br><i>3 не делится на 100 ровно, поэтому получаются «некрасивые» проценты — это нормально 😉</i>`;
  }
  $("so-explain").innerHTML = html;

  if (alive === 0) {
    const win = document.createElement("div");
    win.className = "win-banner";
    win.textContent = "🏆 Победа CT! 100% врагов убито";
    document.querySelector(".so-arena").appendChild(win);
  }
}

$("so-reset").addEventListener("click", () => soStart(so.size));

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// =====================================================
// ЗАРЯД ТЕЛЕФОНА
// =====================================================
const BAT_ACTIONS = [
  { label: "🔫 Катка в Стендофф", delta: -15 },
  { label: "📺 Видео на YouTube", delta: -10 },
  { label: "💬 Переписка", delta: -5 },
  { label: "🔦 Фонарик", delta: -1 },
  { label: "🔌 Зарядить 10 мин", delta: +20 },
  { label: "⚡ Зарядить полностью", delta: "full" },
];
const bat = { level: 100, last: null };

function batInit() {
  const grid = $("bat-grid");
  grid.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div");
    c.className = "cell";
    grid.appendChild(c);
  }

  const box = $("bat-actions");
  box.innerHTML = "";
  BAT_ACTIONS.forEach((a) => {
    const b = document.createElement("button");
    b.className = "action";
    const d = a.delta === "full" ? '<span class="delta plus">до 100%</span>'
      : a.delta < 0 ? `<span class="delta minus">−${-a.delta}%</span>`
      : `<span class="delta plus">+${a.delta}%</span>`;
    b.innerHTML = a.label + d;
    b.addEventListener("click", () => batApply(a));
    box.appendChild(b);
  });
  batUpdate();
}

function batApply(a) {
  const before = bat.level;
  const target = a.delta === "full" ? 100 : before + a.delta;
  bat.level = Math.max(0, Math.min(100, target));
  bat.last = { label: a.label, before, after: bat.level };
  batUpdate();
}

function batUpdate() {
  const lvl = bat.level;
  const color = lvl > 50 ? "var(--green)" : lvl > 20 ? "var(--yellow)" : "var(--red)";
  const cls = lvl > 50 ? "" : lvl > 20 ? "mid" : "low";

  $("bat-fill").style.height = lvl + "%";
  $("bat-fill").style.background = color;
  $("bat-text").textContent = lvl + "%";
  $("bat-small").textContent = lvl + "%";

  [...$("bat-grid").children].forEach((c, i) => {
    c.className = "cell" + (i < lvl ? " on " + cls : "");
  });

  // Кнопки «тратить» блокируем, когда телефон сел
  [...$("bat-actions").children].forEach((b, i) => {
    const d = BAT_ACTIONS[i].delta;
    b.disabled = (d !== "full" && d < 0 && lvl === 0) || ((d === "full" || d > 0) && lvl === 100);
  });

  const hours = (lvl * 10) / 100;
  let html = `
    Заряд <b>${lvl}%</b> — это <b>${lvl}</b> закрашенных клеток из <b>100</b>.<br>
    Если полной батареи (100%) хватает на <b>10 часов</b>, то ${lvl}% хватит на
    <span class="formula">10 ч × ${lvl} ÷ 100 = ${fmt(hours)} ч</span>`;

  if (bat.last) {
    const { label, before, after } = bat.last;
    const diff = after - before;
    if (diff !== 0) {
      html += `<br>${label}: было <b>${before}%</b>, стало <b>${after}%</b>
        (<span class="formula">${before} ${diff < 0 ? "−" : "+"} ${Math.abs(diff)} = ${after}</span>)`;
    }
    if (diff < 0 && after === 0) html += `<br>📴 Телефон сел! 0% — это ничего не осталось.`;
  }
  if (lvl === 100) html += `<br>✅ 100% — батарея заряжена <b>целиком</b>.`;
  else if (lvl <= 20 && lvl > 0) html += `<br>⚠️ Меньше 20% — это меньше <b>пятой части</b> батареи. Пора заряжать!`;
  else if (lvl === 50) html += `<br>🌓 50% — ровно <b>половина</b> батареи.`;

  $("bat-explain").innerHTML = html;
}

// =====================================================
// ПИРОГ
// =====================================================
const pie = { size: 4, eaten: [] };
const SLICE_COLORS = ["#e8a54b", "#d9933a"];

function pieStart(size) {
  pie.size = size;
  pie.eaten = Array(size).fill(false);
  makeChips($("pie-sizes"), [2, 3, 4, 5, 6, 8, 10], size, pieStart);
  pieRender();
}

function slicePath(i, n, r) {
  if (n === 1) return `M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 Z`;
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
  const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

function pieRender() {
  const svg = $("pie-svg");
  const n = pie.size;
  const worth = 100 / n;
  let html = "";
  for (let i = 0; i < n; i++) {
    const mid = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
    const tx = 62 * Math.cos(mid), ty = 62 * Math.sin(mid);
    html += `<g data-i="${i}">
      <path class="slice${pie.eaten[i] ? " eaten" : ""}" d="${slicePath(i, n, 100)}" fill="${SLICE_COLORS[i % 2]}"></path>
      <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle"
        font-size="${n > 6 ? 9 : 12}" font-weight="800" fill="${pie.eaten[i] ? "#555" : "#3b2108"}"
        pointer-events="none">${pie.eaten[i] ? "😋" : fmt(worth) + "%"}</text>
    </g>`;
  }
  svg.innerHTML = html;
  svg.querySelectorAll("g").forEach((g) => {
    g.addEventListener("click", () => {
      const i = +g.dataset.i;
      pie.eaten[i] = !pie.eaten[i];
      pieRender();
    });
  });
  pieUpdate();
}

function pieUpdate() {
  const n = pie.size;
  const k = pie.eaten.filter(Boolean).length;
  const eatenPct = (k / n) * 100;
  const leftPct = 100 - eatenPct;

  $("pie-eaten").textContent = fmt(eatenPct) + "%";
  $("pie-left").textContent = fmt(leftPct) + "%";

  let html = `
    Целый пирог = <b>100%</b>. Мы разрезали его на <b>${n}</b> ${plural(n, "кусок", "куска", "кусков")}.<br>
    Один кусок = <span class="formula">100% ÷ ${n} = ${fmt(100 / n)}%</span><br>`;
  if (k === 0) {
    html += `Пока ничего не съели. Кликни по куску! 🍴`;
  } else {
    html += `Съедено <b>${k}</b> из <b>${n}</b>:
      <span class="formula">${k} ÷ ${n} × 100 = ${fmt(eatenPct)}%</span><br>
      Осталось: <span class="formula">100% − ${fmt(eatenPct)}% = ${fmt(leftPct)}%</span>`;
  }
  if (k === n) html += `<br>🎉 Съеден весь пирог — это <b>100%</b>!`;
  else if (eatenPct === 50) html += `<br>🌓 Ровно <b>половина</b> пирога — это 50%.`;
  else if (eatenPct === 25) html += `<br>Четверть пирога — это <b>25%</b>.`;
  else if (eatenPct === 75) html += `<br>Три четверти пирога — это <b>75%</b>.`;

  $("pie-explain").innerHTML = html;
}

$("pie-reset").addEventListener("click", () => pieStart(pie.size));

// =====================================================
// ЛЫЖИ
// =====================================================
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
    b.addEventListener("click", () => {
      $("ski-range").value = p;
      skiUpdate();
    });
    quick.appendChild(b);
  });

  $("ski-range").addEventListener("input", skiUpdate);
  skiUpdate();
}

function skiUpdate() {
  const p = +$("ski-range").value;
  const km = (SKI_TOTAL * p) / 100;
  const left = SKI_TOTAL - km;

  $("ski-done").style.width = p + "%";
  $("skier").style.left = p + "%";
  $("ski-passed").textContent = `${p}% = ${fmt(km)} км`;
  $("ski-left").textContent = `${100 - p}% = ${fmt(left)} км`;
  $("ski-range").style.setProperty("--p", p + "%");

  [...$("ski-quick").children].forEach((c) => c.classList.toggle("active", c.textContent === p + "%"));

  let html = `
    Весь путь — <b>1500 км</b>, это <b>100%</b>.<br>
    Значит 1% пути = <span class="formula">1500 ÷ 100 = 15 км</span><br>
    Никита прошёл <b>${p}%</b>:
    <span class="formula">1500 × ${p} ÷ 100 = ${fmt(km)} км</span><br>
    Осталось пройти <b>${100 - p}%</b>:
    <span class="formula">1500 − ${fmt(km)} = ${fmt(left)} км</span>`;

  if (p === 0) html += `<br>🏠 Никита ещё дома — прошёл 0%.`;
  else if (p === 25) html += `<br>25% — это <b>четверть</b> пути.`;
  else if (p === 50) html += `<br>🌓 50% — ровно <b>половина</b> пути!`;
  else if (p === 75) html += `<br>75% — <b>три четверти</b> пути, финиш близко!`;
  else if (p === 100) html += `<br>🏁 Никита дошёл! 100% — это <b>весь</b> путь.`;

  $("ski-explain").innerHTML = html;
}

// ---------- Старт ----------
skiInit();
$("so-player-avatar").innerHTML = sprite("img/player.png", "😎");
soStart(5);
batInit();
pieStart(4);
