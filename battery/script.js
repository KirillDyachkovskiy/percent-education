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

batInit();
