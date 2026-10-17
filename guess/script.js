const GS_ROUNDS = 10;
const GS_MODES = ["По порядку", "Вразброс"];
const gs = { mode: "По порядку", round: 1, score: 0, best: 0, answer: 0, cells: [], checked: false, last: null };

// Рекорд — удобство для одного зрителя, поэтому хранится в браузере
try { gs.best = +localStorage.getItem("percent-guess-best") || 0; } catch (e) {}

function gsNewGame() {
  gs.round = 1;
  gs.score = 0;
  gsNewRound();
}

function gsNewRound() {
  gs.answer = 5 + Math.floor(Math.random() * 91); // от 5% до 95%
  const order = [...Array(100).keys()];
  if (gs.mode === "Вразброс") {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  gs.cells = Array(100).fill(false);
  order.slice(0, gs.answer).forEach((i) => (gs.cells[i] = true));
  gs.checked = false;
  gs.last = null;
  $("gs-range").value = 50;
  gsRender();
}

// Очки за раунд: ровно — 10, каждый процент ошибки отнимает очко
function gsPoints(diff) {
  return Math.max(0, 10 - diff);
}

function gsCheck() {
  if (gs.checked) return;
  const guess = +$("gs-range").value;
  const diff = Math.abs(guess - gs.answer);
  const pts = gsPoints(diff);
  gs.score += pts;
  gs.checked = true;
  gs.last = { guess, diff, pts };
  if (gs.round === GS_ROUNDS && gs.score > gs.best) {
    gs.best = gs.score;
    try { localStorage.setItem("percent-guess-best", gs.best); } catch (e) {}
  }
  gsRender();
}

function gsNext() {
  if (gs.round === GS_ROUNDS) {
    gsNewGame();
  } else {
    gs.round++;
    gsNewRound();
  }
}

function gsRender() {
  makeChips($("gs-modes"), GS_MODES, gs.mode, (m) => {
    gs.mode = m;
    gsNewGame();
  });

  const grid = $("gs-grid");
  grid.innerHTML = gs.cells.map((on) => `<div class="gs-cell${on ? " on" : ""}"></div>`).join("");
  grid.classList.toggle("revealed", gs.checked);

  const guess = +$("gs-range").value;
  $("gs-value").textContent = guess + "%";
  $("gs-range").style.setProperty("--p", guess + "%");
  $("gs-range").disabled = gs.checked;
  $("gs-check").disabled = gs.checked;
  $("gs-next").disabled = !gs.checked;
  $("gs-next").textContent = gs.round === GS_ROUNDS ? "🔄 Новая игра" : "➡ Дальше";
  $("gs-round").textContent = `Раунд ${gs.round} из ${GS_ROUNDS}`;
  $("gs-score").textContent = gs.score;
  $("gs-best").textContent = gs.best;

  let result = "";
  if (gs.last) {
    const { diff, pts } = gs.last;
    const cls = diff === 0 ? "good" : diff <= 5 ? "mid" : "bad";
    const text = diff === 0 ? "🎯 В точку!" : diff <= 5 ? `👍 Почти! Ошибка ${diff}%` : `😅 Мимо на ${diff}%`;
    result = `<span class="${cls}">${text}</span> +${pts} ${plural(pts, "очко", "очка", "очков")}
      <div class="gs-answer">Правильный ответ: <b>${gs.answer}%</b>${diff ? ` <span class="gs-yours">(ты сказал ${gs.last.guess}%)</span>` : ""}</div>`;
    if (gs.round === GS_ROUNDS) result += `<br>Игра окончена: ${gs.score} из ${GS_ROUNDS * 10}`;
  }
  $("gs-result").innerHTML = result;

  let html = `
    В сетке <b>100</b> клеток — это <b>100%</b>. Значит каждая клетка = <b>1%</b>.<br>
    Подсказка: один ряд — это <b>10 клеток = 10%</b>, половина сетки — <b>50%</b>.`;
  if (gs.checked) {
    html += `<br>Закрашено <b>${gs.answer}</b> клеток из 100:
      <span class="formula">${gs.answer} ÷ 100 × 100 = ${gs.answer}%</span><br>
      Ты сказал <b>${gs.last.guess}%</b>, ошибка <span class="formula">|${gs.last.guess} − ${gs.answer}| = ${gs.last.diff}%</span>`;
  } else if (gs.mode === "Вразброс") {
    html += `<br>💡 Когда клетки вразброс, посчитай закрашенные в одном-двух рядах и прикинь на все 10.`;
  }
  $("gs-explain").innerHTML = html;
}

$("gs-range").addEventListener("input", gsRender);
$("gs-check").addEventListener("click", gsCheck);
$("gs-next").addEventListener("click", gsNext);
gsNewGame();
