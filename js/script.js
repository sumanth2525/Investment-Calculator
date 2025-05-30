/* -------------------------------------------------------------------
   Returns‑calculator logic + currency switching
------------------------------------------------------------------- */

// ---------- helpers ----------
const currencyInfo = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" }
};

const formatCurrency = (n, cur) =>
  n.toLocaleString(currencyInfo[cur].locale, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0
  });

const monthlyFutureValue = (p, years, annualRate) => {
  const r = annualRate / 100 / 12;  // monthly rate
  const n = years * 12;             // #months
  return p * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
};

// ---------- DOM refs ----------
const sidebarCards   = [...document.querySelectorAll(".card")];
const titleEl        = document.getElementById("calc-title");
const formEl         = document.getElementById("calc-form");
const amountEl       = document.getElementById("amount");
const yearsEl        = document.getElementById("years");
const roiEl          = document.getElementById("roi");
const resultBox      = document.getElementById("result");
const investedEl     = document.getElementById("invested");
const profitEl       = document.getElementById("profit");
const totalEl        = document.getElementById("total");
const currencySel    = document.getElementById("currency-select");
const currencySymEl  = document.getElementById("currency-symbol");
const curSpans       = [...document.querySelectorAll(".cur")];

// ---------- defaults ----------
const presets = { mutual:{roi:12}, etf:{roi:10}, gold:{roi:8} };
let activeType = "mutual";
let activeCur  = "INR";

/* ========= sidebar switching ========= */
sidebarCards.forEach(btn =>
  btn.addEventListener("click", () => switchCalc(btn.dataset.type)));

function switchCalc(type){
  if(type === activeType) return;
  activeType = type;

  sidebarCards.forEach(c =>
    c.classList.toggle("active", c.dataset.type === type));
  titleEl.textContent = `${capitalize(type)} Calculator`;
  roiEl.value = presets[type].roi;
  resultBox.classList.add("hidden");
  formEl.reset();
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ========= currency selector ========= */
currencySel.addEventListener("change", e => {
  activeCur = e.target.value;
  updateCurrencyUI();
  // re‑format any visible results
  if(!resultBox.classList.contains("hidden")) reformatResults();
});

function updateCurrencyUI(){
  const {symbol} = currencyInfo[activeCur];
  currencySymEl.textContent = symbol;
  curSpans.forEach(sp => sp.textContent = symbol);
}

/* ========= calculation ========= */
formEl.addEventListener("submit", e =>{
  e.preventDefault();

  const p      = +amountEl.value;
  const years  = +yearsEl.value;
  const roi    = +roiEl.value;
  if(!p || !years || roi < 0) return;

  const fv       = monthlyFutureValue(p, years, roi);
  const invested = p * years * 12;
  const profit   = fv - invested;

  investedEl.dataset.raw = invested; // store raw numbers for future re‑format
  profitEl.dataset.raw   = profit;
  totalEl.dataset.raw    = fv;
  reformatResults();

  resultBox.classList.remove("hidden");
});

function reformatResults(){
  investedEl.textContent = formatCurrency(+investedEl.dataset.raw, activeCur)
                              .replace(currencyInfo[activeCur].symbol, "")
                              .trim();
  profitEl.textContent   = formatCurrency(+profitEl.dataset.raw, activeCur)
                              .replace(currencyInfo[activeCur].symbol, "")
                              .trim();
  totalEl.textContent    = formatCurrency(+totalEl.dataset.raw, activeCur)
                              .replace(currencyInfo[activeCur].symbol, "")
                              .trim();
}

/* initial symbol load */
updateCurrencyUI();
