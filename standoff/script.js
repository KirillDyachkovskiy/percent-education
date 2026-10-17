const ENEMY_NAMES = ["Sn1per", "AWPer", "NoScope", "Rusher", "Camper", "Headshot", "Baiter", "Lurker", "Entry", "Clutch"];
const ENEMY_FACES = ["🥷", "😈", "🤠", "👺", "🤖", "👽", "🧟", "💂", "🦹", "👹"];
const so = { size: 5, alive: [] };

// Спрайты из игры лежат в общей папке img/ в корне сайта
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
      <div class="avatar">${sprite(`../img/enemy${i + 1}.png`, ENEMY_FACES[i])}${isAlive ? "" : '<span class="skull">💀</span>'}</div>
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
  feed.innerHTML = `<span class="k">ТЫ</span>${sprite("../img/weapon.png", " 🔫 ").replace('class="sprite"', 'class="feed-weapon"')}<span class="v">${ENEMY_NAMES[i]}</span>`;
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

$("so-player-avatar").innerHTML = sprite("../img/player.png", "😎");
soStart(5);
