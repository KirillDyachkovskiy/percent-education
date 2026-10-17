const DL_TOTAL = 2400; // МБ
const DL_SPEEDS = { "3G": 15, "4G": 40, "Wi-Fi": 120 }; // МБ в секунду
const DL_TICK = 100; // мс
const dl = { got: 0, speed: "4G", timer: null };

function dlInit() {
  makeChips($("dl-speeds"), Object.keys(DL_SPEEDS), dl.speed, (s) => {
    dl.speed = s;
    dlInit();
  });
  dlUpdate();
}

function dlToggle() {
  if (dl.timer) {
    clearInterval(dl.timer);
    dl.timer = null;
  } else {
    if (dl.got >= DL_TOTAL) dl.got = 0;
    dl.timer = setInterval(dlTick, DL_TICK);
  }
  dlUpdate();
}

function dlTick() {
  dl.got = Math.min(DL_TOTAL, dl.got + (DL_SPEEDS[dl.speed] * DL_TICK) / 1000);
  if (dl.got >= DL_TOTAL) {
    clearInterval(dl.timer);
    dl.timer = null;
  }
  dlUpdate();
}

function dlReset() {
  clearInterval(dl.timer);
  dl.timer = null;
  dl.got = 0;
  dlUpdate();
}

function dlUpdate() {
  const got = Math.floor(dl.got);
  const left = DL_TOTAL - got;
  const p = (got / DL_TOTAL) * 100;
  const done = got >= DL_TOTAL;
  const speed = DL_SPEEDS[dl.speed];

  $("dl-percent").textContent = (done ? 100 : Math.floor(p)) + "%";
  $("dl-fill").style.width = p + "%";
  $("dl-fill").classList.toggle("running", !!dl.timer);
  $("dl-fill").classList.toggle("complete", done);
  $("dl-done").textContent = `${got} из ${DL_TOTAL} МБ`;
  $("dl-eta").textContent = done ? "✅ Готово!" : `⏱ осталось ~${Math.ceil(left / speed)} сек (${speed} МБ/с)`;
  $("dl-got").textContent = got + " МБ";
  $("dl-left").textContent = left + " МБ";
  $("dl-toggle").textContent = dl.timer ? "⏸ Пауза" : done ? "▶ Скачать ещё раз" : got ? "▶ Продолжить" : "▶ Скачать";

  let html = `
    Всё обновление — <b>${DL_TOTAL} МБ</b>, это <b>100%</b>.<br>
    1% = <span class="formula">${DL_TOTAL} ÷ 100 = ${DL_TOTAL / 100} МБ</span><br>`;
  if (got === 0) {
    html += `Нажми «Скачать» и поставь на паузу в любой момент, чтобы разобрать проценты.`;
  } else {
    html += `
      Скачано <b>${got} МБ</b>: <span class="formula">${got} ÷ ${DL_TOTAL} × 100 = ${fmt(p)}%</span><br>
      Осталось <b>${left} МБ</b>: <span class="formula">100% − ${fmt(p)}% = ${fmt(100 - p)}%</span>`;
    if (!done) html += `<br>💡 Загрузчики обычно показывают проценты без дробной части: ${fmt(p)}% → <b>${Math.floor(p)}%</b>.`;
  }
  if (done) html += `<br>✅ Скачано всё — <b>100%</b>. Можно играть!`;
  else if (p >= 50 && p < 51) html += `<br>🌓 Половина позади: 50% — это ровно <b>1200 МБ</b> из 2400.`;
  $("dl-explain").innerHTML = html;
}

$("dl-toggle").addEventListener("click", dlToggle);
$("dl-reset").addEventListener("click", dlReset);
dlInit();
