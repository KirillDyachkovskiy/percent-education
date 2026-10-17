const RG_SHOTS = 20;
const RG_LEVELS = {
  "Легко": { size: 84, every: 1400 },
  "Норм": { size: 64, every: 1000 },
  "Сложно": { size: 44, every: 700 },
};
const rg = { level: "Норм", shots: [], playing: false, timer: null };

function rgInit() {
  makeChips($("rg-levels"), Object.keys(RG_LEVELS), rg.level, (lvl) => {
    rg.level = lvl;
    rgInit();
  });
  rgStop();
  rg.shots = [];
  $("rg-target").style.setProperty("--size", RG_LEVELS[rg.level].size + "px");
  $("rg-overlay-text").textContent = `${RG_SHOTS} патронов. Стреляй по мишени!`;
  $("rg-start").textContent = "▶ Начать";
  $("rg-overlay").classList.remove("hidden");
  rgUpdate();
}

function rgStart() {
  rg.shots = [];
  rg.playing = true;
  $("rg-overlay").classList.add("hidden");
  rgMoveTarget();
  rg.timer = setInterval(rgMoveTarget, RG_LEVELS[rg.level].every);
  rgUpdate();
}

function rgStop() {
  rg.playing = false;
  clearInterval(rg.timer);
}

function rgMoveTarget() {
  const arena = $("rg-arena");
  const r = RG_LEVELS[rg.level].size / 2 + 6;
  const x = r + Math.random() * (arena.clientWidth - 2 * r);
  const y = r + Math.random() * (arena.clientHeight - 2 * r);
  $("rg-target").style.left = x + "px";
  $("rg-target").style.top = y + "px";
}

function rgShoot(e) {
  if (!rg.playing) return;
  const hit = e.target === $("rg-target");
  rg.shots.push(hit);

  const box = $("rg-arena").getBoundingClientRect();
  const mark = document.createElement("div");
  mark.className = "rg-mark " + (hit ? "hit" : "miss");
  mark.textContent = hit ? "+1" : "мимо";
  mark.style.left = e.clientX - box.left + "px";
  mark.style.top = e.clientY - box.top + "px";
  $("rg-arena").appendChild(mark);
  setTimeout(() => mark.remove(), 600);

  if (hit) {
    const t = $("rg-target");
    t.classList.remove("hit");
    void t.offsetWidth;
    t.classList.add("hit");
  }

  if (rg.shots.length === RG_SHOTS) rgFinish();
  rgUpdate();
}

function rgRank(acc) {
  if (acc === 100) return "🏆 Идеально! Ни одного промаха";
  if (acc >= 80) return "🎯 Снайпер!";
  if (acc >= 50) return "👍 Неплохо, больше половины в цель";
  return "💪 Тренируйся — меньше половины попаданий";
}

function rgFinish() {
  rgStop();
  const hits = rg.shots.filter(Boolean).length;
  const acc = (hits / RG_SHOTS) * 100;
  $("rg-overlay-text").innerHTML = `Точность ${fmt(acc)}%<br>${rgRank(acc)}`;
  $("rg-start").textContent = "🔄 Ещё раз";
  $("rg-overlay").classList.remove("hidden");
}

function rgUpdate() {
  const n = rg.shots.length;
  const hits = rg.shots.filter(Boolean).length;
  const miss = n - hits;
  const acc = n ? (hits / n) * 100 : 0;

  $("rg-hits").textContent = hits;
  $("rg-miss").textContent = miss;
  $("rg-acc").textContent = n ? fmt(acc) + "%" : "—";

  const ammo = $("rg-ammo");
  ammo.innerHTML = "";
  for (let i = 0; i < RG_SHOTS; i++) {
    const b = document.createElement("div");
    b.className = "rg-bullet" + (i < n ? " used " + (rg.shots[i] ? "hit" : "miss") : "");
    ammo.appendChild(b);
  }

  let html = `
    Точность — это какой процент выстрелов попал в цель.<br>
    <span class="formula">попадания ÷ выстрелы × 100</span><br>`;
  if (n === 0) {
    html += `Пока выстрелов нет. Нажми «Начать» и кликай по мишени!`;
  } else {
    html += `
      Выстрелов: <b>${n}</b>, попаданий: <b>${hits}</b> →
      <span class="formula">${hits} ÷ ${n} × 100 = ${fmt(acc)}%</span><br>
      Промахов: <b>${miss}</b> → <span class="formula">100% − ${fmt(acc)}% = ${fmt(100 - acc)}%</span> выстрелов мимо`;
    if (n === RG_SHOTS) {
      html += `<br>💡 Из ${RG_SHOTS} выстрелов каждый — это <b>${100 / RG_SHOTS}%</b>, поэтому точность шагает по 5%.`;
    }
  }
  $("rg-explain").innerHTML = html;
}

$("rg-start").addEventListener("click", (e) => {
  e.stopPropagation();
  rgStart();
});
$("rg-arena").addEventListener("pointerdown", rgShoot);
rgInit();
