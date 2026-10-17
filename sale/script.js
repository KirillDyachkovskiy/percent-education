// Цены в золоте (G), как в игре. Цены круглые, чтобы проценты считались ровно.
const SALE_ITEMS = [
  { name: "M4 «Lizard»", icon: "🔫", price: 800 },
  { name: "AKR «Dragon»", icon: "🐉", price: 1200 },
  { name: "AWM «Sport»", icon: "🎯", price: 2500 },
  { name: "Нож «Gold»", icon: "🗡️", price: 5000 },
];
const WALLET = 1000;
const sale = { item: 0 };

function saleInit() {
  const items = $("sale-items");
  SALE_ITEMS.forEach((it, i) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = it.icon + " " + it.name;
    b.addEventListener("click", () => {
      sale.item = i;
      saleUpdate();
    });
    items.appendChild(b);
  });

  const quick = $("sale-quick");
  [0, 10, 20, 25, 50, 75, 90].forEach((p) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = p + "%";
    b.dataset.p = p;
    b.addEventListener("click", () => {
      $("sale-range").value = p;
      saleUpdate();
    });
    quick.appendChild(b);
  });

  $("sale-range").addEventListener("input", saleUpdate);
  saleUpdate();
}

function saleUpdate() {
  const it = SALE_ITEMS[sale.item];
  const p = +$("sale-range").value;
  const onePct = it.price / 100;
  const save = (it.price * p) / 100;
  const pay = it.price - save;

  [...$("sale-items").children].forEach((c, i) => c.classList.toggle("active", i === sale.item));
  [...$("sale-quick").children].forEach((c) => c.classList.toggle("active", +c.dataset.p === p));
  $("sale-range").style.setProperty("--p", (p / 90) * 100 + "%");

  $("sale-pct").textContent = p + "%";
  $("sale-icon").textContent = it.icon;
  $("sale-name").textContent = it.name;
  $("sale-badge").textContent = "−" + p + "%";
  $("sale-badge").classList.toggle("hidden", p === 0);
  $("sale-old").textContent = p === 0 ? "" : it.price + " G";
  $("sale-new").textContent = fmt(pay) + " G";
  $("sale-save").textContent = fmt(save) + " G";
  $("sale-pay").textContent = fmt(pay) + " G";

  $("sale-wallet").innerHTML = pay <= WALLET
    ? `💰 У тебя <b>${WALLET} G</b> — <span class="ok">хватает! Останется ${fmt(WALLET - pay)} G</span>`
    : `💰 У тебя <b>${WALLET} G</b> — <span class="no">не хватает ещё ${fmt(pay - WALLET)} G</span>`;

  let html = `
    Цена скина <b>${it.price} G</b> — это <b>100%</b>.<br>
    1% цены = <span class="formula">${it.price} ÷ 100 = ${fmt(onePct)} G</span><br>`;
  if (p === 0) {
    html += `Скидки нет — платишь все <b>100%</b>. Подвинь ползунок!`;
  } else {
    html += `
      Скидка ${p}% = <span class="formula">${fmt(onePct)} × ${p} = ${fmt(save)} G</span> — столько сэкономишь<br>
      Заплатишь: <span class="formula">${it.price} − ${fmt(save)} = ${fmt(pay)} G</span><br>
      Или сразу: платишь <b>${100 - p}%</b> цены →
      <span class="formula">${it.price} × ${100 - p} ÷ 100 = ${fmt(pay)} G</span>`;
    if (p === 50) html += `<br>🌓 Скидка 50% — платишь ровно <b>половину</b>.`;
    if (p === 25) html += `<br>Скидка 25% — это <b>четверть</b> цены.`;
  }
  $("sale-explain").innerHTML = html;
}

saleInit();
