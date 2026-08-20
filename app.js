const categories = [
  { id: "todos", label: "Todos os criativos", short: "Todos" },
  { id: "engajamento", label: "Engajamento", short: "Engajamento" },
  { id: "venda", label: "Venda", short: "Venda" },
  { id: "aluguel", label: "Aluguel", short: "Aluguel" },
];

let data = { total: 0, creatives: [] };
let active = "todos";
let query = "";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const category = (id) => categories.find((item) => item.id === id);
const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

function renderMetrics() {
  const metrics = data.strategyMetrics || [];
  const leadMetrics = metrics.filter((item) => item.category === "venda" || item.category === "aluguel");
  const totalSpend = metrics.reduce((sum, item) => sum + item.spend, 0);
  const leadSpend = leadMetrics.reduce((sum, item) => sum + item.spend, 0);
  const totalLeads = leadMetrics.reduce((sum, item) => sum + item.leads, 0);
  const averageCpl = totalLeads ? leadSpend / totalLeads : null;
  const cards = [{ category: "total", label: "Total geral", spend: totalSpend, leads: totalLeads, cpl: averageCpl }, ...metrics];
  document.getElementById("metric-grid").innerHTML = cards.map((item) => {
    const total = item.category === "total";
    const showLeads = total || item.category !== "engajamento";
    const label = total ? item.label : category(item.category).label;
    const count = total ? "3 estratégias" : `${item.campaigns} ${item.campaigns === 1 ? "campanha" : "campanhas"}`;
    return `<article class="metric-card ${item.category}"><div class="metric-title"><span>${label}</span><small>${count}</small></div><strong>${money(item.spend)}</strong><p>${total ? "investimento total no mês" : "investidos no mês"}</p>${showLeads ? `<div class="metric-details"><div><b>${item.leads}</b><span>${total ? "Total de leads" : "Leads"}</span></div><div><b>${item.cpl == null ? "—" : money(item.cpl)}</b><span>${total ? "CPL médio" : "CPL"}</span></div></div>` : ""}</article>`;
  }).join("");
}

function renderFilters() {
  document.querySelector(".filters").innerHTML = categories.map((item) => {
    const count = item.id === "todos" ? data.creatives.length : data.creatives.filter((creative) => creative.category === item.id).length;
    return `<button class="${active === item.id ? "active" : ""}" data-category="${item.id}"><span>${item.label}</span><b>${count}</b></button>`;
  }).join("");
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => { active = button.dataset.category; render(); }));
}

function renderGrid() {
  const term = query.toLocaleLowerCase("pt-BR").trim();
  const filtered = data.creatives.filter((item) => (active === "todos" || item.category === active) && (!term || `${item.name} ${item.campaign} ${item.adset}`.toLocaleLowerCase("pt-BR").includes(term)));
  document.getElementById("section-title").textContent = category(active).label;
  const grid = document.getElementById("grid");
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty"><span>○</span><h3>Nenhum criativo ativo aqui</h3><p>${query ? "Tente buscar por outro nome." : "Esta estratégia não possui anúncios ativos no momento."}</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map((creative, index) => `<button class="card" data-id="${escapeHtml(creative.id)}" style="--delay:${Math.min(index, 12) * 40}ms">
    <div class="media">${creative.image ? `<img src="${escapeHtml(creative.image)}" alt="${escapeHtml(creative.name)}" loading="lazy">` : "<span>Prévia indisponível</span>"}${creative.mediaType === "video" ? '<span class="play" aria-hidden="true">▶</span>' : ""}<span class="tag ${creative.category}">${category(creative.category).short}</span><span class="expand">↗</span></div>
    <div class="card-copy"><h3>${escapeHtml(creative.name)}</h3><p>${escapeHtml(creative.campaign)}</p></div>
  </button>`).join("");
  document.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => openModal(data.creatives.find((item) => item.id === button.dataset.id))));
}

function render() { renderMetrics(); renderFilters(); renderGrid(); document.getElementById("total").textContent = `${data.total} criativos ativos`; }

function openModal(creative) {
  const modal = document.getElementById("modal");
  const media = creative.video ? `<video controls autoplay playsinline preload="metadata" poster="${escapeHtml(creative.image || "")}"><source src="${escapeHtml(creative.video)}" type="video/mp4">Seu navegador não suporta este vídeo.</video>` : creative.image ? `<img src="${escapeHtml(creative.image)}" alt="${escapeHtml(creative.name)}">` : "<span>Prévia indisponível</span>";
  modal.innerHTML = `<div class="modal-card"><button class="close" aria-label="Fechar">×</button><div class="modal-media">${media}</div><div class="modal-copy"><span class="tag ${creative.category}">${category(creative.category).label}</span><h2>${escapeHtml(creative.name)}</h2><dl><div><dt>Campanha</dt><dd>${escapeHtml(creative.campaign)}</dd></div><div><dt>Conjunto</dt><dd>${escapeHtml(creative.adset)}</dd></div></dl></div></div>`;
  modal.hidden = false;
  modal.querySelector(".close").focus();
}

document.getElementById("search").addEventListener("input", (event) => { query = event.target.value; renderGrid(); });
document.getElementById("modal").addEventListener("click", (event) => { if (event.target.id === "modal" || event.target.closest(".close")) event.currentTarget.hidden = true; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") document.getElementById("modal").hidden = true; });
fetch("data.json").then((response) => response.json()).then((payload) => { data = payload; render(); }).catch(() => { document.getElementById("grid").innerHTML = '<div class="empty"><h3>Não foi possível carregar os criativos.</h3></div>'; });
