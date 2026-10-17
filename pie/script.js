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

pieStart(4);
