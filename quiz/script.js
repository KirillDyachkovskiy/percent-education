// Для каждого уровня — какие проценты спрашивать и от каких чисел.
// Числа подобраны так, чтобы ответ всегда получался целым.
const QZ_LEVELS = {
  "Лёгкий": { pcts: [10, 50, 100], nums: [20, 40, 60, 80, 100, 200, 300, 500] },
  "Средний": { pcts: [20, 25, 50, 75], nums: [20, 40, 80, 100, 120, 200, 400, 1000] },
  "Сложный": { pcts: [1, 5, 15, 30, 40, 60, 90], nums: [100, 200, 300, 500, 600, 1000, 1500, 2000] },
};
const qz = { level: "Лёгкий", q: null, answered: false, right: 0, total: 0, streak: 0 };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function qzNew() {
  const { pcts, nums } = QZ_LEVELS[qz.level];
  const p = pick(pcts);
  const n = pick(nums);
  const ans = (n * p) / 100;

  // Неправильные варианты похожи на типичные ошибки
  const wrong = new Set([ans * 10, ans / 10, n - ans, ans * 2, ans + p, Math.abs(ans - 10), n / p]
    .filter((v) => Number.isInteger(v) && v > 0 && v !== ans));
  const options = [ans, ...[...wrong].sort(() => Math.random() - 0.5).slice(0, 3)];
  // Если похожих ошибок не хватило — добавляем соседние числа
  for (let d = 1; options.length < 4; d++) if (!options.includes(ans + d * 5)) options.push(ans + d * 5);

  qz.q = { p, n, ans, options: options.sort(() => Math.random() - 0.5) };
  qz.answered = false;
  qzRender();
}

function qzAnswer(v) {
  if (qz.answered) return;
  qz.answered = true;
  qz.total++;
  if (v === qz.q.ans) {
    qz.right++;
    qz.streak++;
  } else {
    qz.streak = 0;
  }
  qz.q.chosen = v;
  qzRender();
}

// Короткий путь для «красивых» процентов
function qzShortcut(p, n) {
  const map = { 10: [10, "десятая часть"], 20: [5, "пятая часть"], 25: [4, "четверть"], 50: [2, "половина"] };
  if (p === 100) return `100% — это <b>всё число</b>: ${n}.`;
  if (p === 75) return `75% — это <b>три четверти</b>: ${n} ÷ 4 × 3 = ${(n / 4) * 3}.`;
  if (map[p]) return `${p}% — это <b>${map[p][1]}</b>: ${n} ÷ ${map[p][0]} = ${n / map[p][0]}.`;
  return "";
}

function qzRender() {
  makeChips($("qz-levels"), Object.keys(QZ_LEVELS), qz.level, (lvl) => {
    qz.level = lvl;
    qzNew();
  });

  const { p, n, ans, options, chosen } = qz.q;
  $("qz-question").innerHTML = `<b>${p}%</b> от ${n} = ?`;
  $("qz-options").innerHTML = "";
  options.forEach((v) => {
    const b = document.createElement("button");
    b.className = "qz-option";
    if (qz.answered && v === ans) b.classList.add("right");
    if (qz.answered && v === chosen && v !== ans) b.classList.add("wrong");
    b.textContent = v;
    b.disabled = qz.answered;
    b.addEventListener("click", () => qzAnswer(v));
    $("qz-options").appendChild(b);
  });

  $("qz-feedback").innerHTML = !qz.answered ? ""
    : chosen === ans ? `<span class="good">✅ Правильно!</span>`
    : `<span class="bad">❌ Не то. Правильный ответ: ${ans}</span>`;
  $("qz-next").hidden = !qz.answered;

  $("qz-right").textContent = `${qz.right} из ${qz.total}`;
  $("qz-streak").textContent = `${qz.streak} 🔥`;
  $("qz-pct").textContent = qz.total ? fmt((qz.right / qz.total) * 100) + "%" : "—";

  const one = n / 100;
  let html = qz.answered
    ? `Как решать: сначала найди <b>1%</b>, потом умножь.<br>
       1% от ${n} = <span class="formula">${n} ÷ 100 = ${fmt(one)}</span><br>
       ${p}% = <span class="formula">${fmt(one)} × ${p} = ${ans}</span>`
    : `Как решать: сначала найди <b>1%</b> (раздели на 100), потом умножь на нужный процент.`;
  if (qz.answered) {
    const sc = qzShortcut(p, n);
    if (sc) html += `<br>⚡ Быстрее: ${sc}`;
  }
  if (qz.total) {
    html += `<br><br>📊 А твой результат — тоже процент: <span class="formula">${qz.right} ÷ ${qz.total} × 100 = ${fmt((qz.right / qz.total) * 100)}%</span> правильных ответов.`;
  }
  $("qz-explain").innerHTML = html;
}

$("qz-next").addEventListener("click", qzNew);
qzNew();
