// Шансы в сумме дают 100%
const CS_RARITIES = [
  { name: "Обычный", chance: 70, color: "#9aa4b2", icon: "🔫" },
  { name: "Редкий", chance: 20, color: "#4aa3ff", icon: "💎" },
  { name: "Эпический", chance: 8, color: "#b06cff", icon: "🔮" },
  { name: "Легендарный", chance: 2, color: "#ffd23f", icon: "🗡️" },
];
const CS_SHOW = 30; // сколько последних выпадений показывать
const cs = { counts: [0, 0, 0, 0], last: [] };

function csRoll() {
  let r = Math.random() * 100;
  for (let i = 0; i < CS_RARITIES.length; i++) {
    if (r < CS_RARITIES[i].chance) return i;
    r -= CS_RARITIES[i].chance;
  }
  return 0;
}

function csOpen(n) {
  const got = [];
  for (let i = 0; i < n; i++) {
    const k = csRoll();
    cs.counts[k]++;
    got.push(k);
  }
  cs.last = got;
  csUpdate();
}

function csReset() {
  cs.counts = [0, 0, 0, 0];
  cs.last = [];
  csUpdate();
}

function csUpdate() {
  const total = cs.counts.reduce((a, b) => a + b, 0);

  const drops = $("cs-drops");
  if (cs.last.length === 0) {
    drops.innerHTML = '<div class="cs-empty">Открой кейс — здесь появится, что выпало</div>';
  } else {
    // Сначала самые редкие, чтобы легендарка не потерялась среди 100 обычных
    const shown = [...cs.last].sort((a, b) => b - a).slice(0, CS_SHOW);
    drops.innerHTML = shown.map((k) => {
      const r = CS_RARITIES[k];
      return `<div class="cs-item" style="border-color:${r.color}" title="${r.name}">${r.icon}</div>`;
    }).join("") + (cs.last.length > CS_SHOW ? `<span class="cs-more">и ещё ${cs.last.length - CS_SHOW}…</span>` : "");
  }

  $("cs-rows").innerHTML = CS_RARITIES.map((r, i) => {
    const pct = total ? (cs.counts[i] / total) * 100 : 0;
    return `<tr>
      <td class="cs-name" style="color:${r.color}">${r.icon} ${r.name}</td>
      <td class="cs-pct">${r.chance}%</td>
      <td>${cs.counts[i]}</td>
      <td class="cs-bars">
        <span class="cs-pct" style="color:${r.color}">${total ? fmt(pct) + "%" : "—"}</span>
        <div class="cs-bar"><div class="cs-bar-fill" style="width:${pct}%;background:${r.color}"></div></div>
        <div class="cs-bar"><div class="cs-bar-fill expected" style="width:${r.chance}%;background:${r.color}"></div></div>
      </td>
    </tr>`;
  }).join("");
  $("cs-total").textContent = total
    ? `Всего открыто: ${total} ${plural(total, "кейс", "кейса", "кейсов")}. Яркая полоска — что выпало у тебя, бледная — шанс.`
    : "Яркая полоска — что выпало у тебя, бледная — шанс.";

  const leg = CS_RARITIES[3];
  const legN = cs.counts[3];
  let html = `
    Шанс <b>${leg.chance}%</b> у легендарки значит: примерно <b>${leg.chance} из 100</b> кейсов.<br>
    Все шансы вместе: <span class="formula">70% + 20% + 8% + 2% = 100%</span> — что-то выпадет точно.<br>`;
  if (total === 0) {
    html += `Открой 100 кейсов и посмотри, сколько выпадет легендарок!`;
  } else {
    const expect = (total * leg.chance) / 100;
    html += `
      Ты открыл <b>${total}</b>. По шансам легендарок должно быть около
      <span class="formula">${total} × ${leg.chance} ÷ 100 = ${fmt(expect)}</span><br>
      А выпало <b>${legN}</b>: <span class="formula">${legN} ÷ ${total} × 100 = ${fmt((legN / total) * 100)}%</span>`;
    html += total < 100
      ? `<br>🎲 Кейсов мало — доля может сильно отличаться от шанса. Открой побольше!`
      : `<br>🎲 Чем больше кейсов откроешь, тем ближе «доля у тебя» к шансу. Попробуй открыть ещё сотню!`;
  }
  $("cs-explain").innerHTML = html;
}

document.querySelectorAll("[data-open]").forEach((b) => {
  b.addEventListener("click", () => csOpen(+b.dataset.open));
});
$("cs-reset").addEventListener("click", csReset);
csUpdate();
