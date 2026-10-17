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

// Склонение: 1 игрок, 2 игрока, 5 игроков
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
