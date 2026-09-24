(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = v => v == null ? '—' : new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
  const money = v => v == null ? '—' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const channels = {SEARCH:'Pesquisa',PERFORMANCE_MAX:'Performance Max'};
  const roleName = role => ({HEADLINE:'Título',LONG_HEADLINE:'Título longo',DESCRIPTION:'Descrição',BUSINESS_NAME:'Nome da empresa',LOGO:'Logo',LANDSCAPE_LOGO:'Logo horizontal',MARKETING_IMAGE:'Imagem',SQUARE_MARKETING_IMAGE:'Imagem quadrada',PORTRAIT_MARKETING_IMAGE:'Imagem vertical',YOUTUBE_VIDEO:'Vídeo',SITELINK:'Sitelink',CALLOUT:'Destaque',IMAGE:'Imagem'}[role] || (/^HEADLINE_\d$/.test(role) ? `Título ${role.slice(-1)}` : /^DESCRIPTION_\d$/.test(role) ? `Descrição ${role.slice(-1)}` : role.startsWith('HEADLINE') ? 'Título complementar' : role.startsWith('DESCRIPTION') ? 'Descrição complementar' : 'Recurso complementar'));
  const filters = [{id:'all',label:'Imagens e vídeos'},{id:'image',label:'Imagens'},{id:'video',label:'Vídeos'},{id:'combination',label:'Combinações'}];
  let google, assets = new Map(), kind = 'all', campaign = 'all', search = '', opener;
  const youtube = id => typeof id === 'string' && /^[\w-]{11}$/.test(id);
  const localImage = path => typeof path === 'string' && /^media\/[\w.-]+$/.test(path);

  function closeModal(restore = true) {
    $('google-modal').hidden = true; $('google-modal').innerHTML = '';
    document.body.style.overflow = '';
    if (restore) opener?.focus();
  }
  function platform(name,focus = false) {
    for (const key of ['meta','google']) {
      $(`tab-${key}`).setAttribute('aria-selected',String(name === key));
      $(`tab-${key}`).tabIndex = name === key ? 0 : -1;
      $(`panel-${key}`).hidden = name !== key;
    }
    $('platform-label').textContent = name === 'google' ? 'Google Ads' : 'Meta Ads';
    $('platform-title').innerHTML = name === 'google' ? 'Recursos <strong>ativos.</strong>' : 'Criativos <strong>ativos.</strong>';
    $('total').hidden = name === 'google'; $('google-total').hidden = name !== 'google';
    $('modal').hidden = true; $('modal').querySelectorAll('video').forEach(v => v.pause()); closeModal(false);
    history.replaceState(null,'',`#${name}`);
    if (focus) $(`tab-${name}`).focus();
  }
  for (const key of ['meta','google']) {
    $(`tab-${key}`).addEventListener('click',() => platform(key));
    $(`tab-${key}`).addEventListener('keydown',e => {
      if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
        e.preventDefault(); platform(e.key === 'Home' ? 'meta' : e.key === 'End' ? 'google' : key === 'meta' ? 'google' : 'meta',true);
      }
    });
  }
  if (location.hash === '#google') platform('google');

  function metrics() {
    const m = google.metrics;
    $('google-metrics').innerHTML = [
      ['Investimento',money(m.spend),'Todas as campanhas no período','total'],
      ['Leads',number(m.leads),'Formulários + LeadCompleto',''],
      ['CPL',money(m.cpl),'Investimento ÷ total de leads',''],
      ['MQLs',number(m.mql),'LeadCompleto · incluídos nos leads','']
    ].map(([label,value,caption,cls]) => `<article class="metric-card ${cls}"><div class="metric-title"><span>${label}</span></div><strong>${value}</strong><p>${caption}</p></article>`).join('');
    $('google-traffic').innerHTML = [['Impressões',number(m.impressions)],['Cliques',number(m.clicks)],['CTR',m.ctr == null ? '—' : `${number(m.ctr)}%`],['CPC',money(m.cpc)]].map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    const date = s => s.split('-').reverse().join('/');
    $('google-period').textContent = `${date(google.metricsPeriod.dateStart)} a ${date(google.metricsPeriod.dateStop)} · todas as campanhas`;
    const timestamp = new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(google.updatedAt));
    $('google-updated').textContent = `Atualizado em ${timestamp} · horário de Brasília · dia atual parcial. ${number(m.siteForm)} Lead_Site_Form + ${number(m.mql)} LeadCompleto.`;
    $('google-status').textContent = google.warnings?.length ? 'Algumas imagens não estão disponíveis nesta atualização.' : '';
    $('google-status').hidden = !google.warnings?.length;
    $('google-total').textContent = `${google.campaigns.filter(c => c.status === 'ENABLED').length} campanhas ativas · ${activeAssets().length} recursos vinculados`;
  }
  const galleryAssets = () => GoogleGallery.group(google.assets);
  const activeAssets = () => galleryAssets().filter(a => campaign === 'all' || a.placements.some(p => p.campaignId === campaign));
  const originTag = a => a.source === 'AUTOMATICALLY_CREATED' && a.kind === 'image' ? '<span class="origin-tag">Extraído automaticamente do site</span>' : '';
  const visibleName = a => a.showName ? a.name : a.kind === 'video' ? 'Vídeo da campanha' : 'Imagem da campanha';
  const combinations = () => google.combinations.filter(c => c.impressions > 0 && (campaign === 'all' || c.campaignId === campaign)).sort((a,b) => b.impressions - a.impressions);
  const parts = combo => combo.components.map(c => ({...c,asset:assets.get(c.assetId)})).filter(c => c.asset);
  const comboText = (combo,head) => parts(combo).filter(c => head ? /^(HEADLINE(_\d)?|LONG_HEADLINE)$/.test(c.role) : /^DESCRIPTION(_\d)?$/.test(c.role)).map(c => c.asset.text).filter(Boolean).join(head ? ' | ' : ' ');

  function visual(asset,large = false) {
    if (asset.kind === 'image' && localImage(asset.image)) return `<img src="${esc(asset.image)}" alt="${esc(visibleName(asset))}" loading="lazy">`;
    if (asset.kind === 'video' && youtube(asset.youtubeId)) return `<img src="https://i.ytimg.com/vi/${asset.youtubeId}/hqdefault.jpg" alt="${esc(visibleName(asset))}" loading="lazy"><span class="play" aria-hidden="true">▶</span>`;
    if (asset.kind === 'text') return `<div class="text-preview"><span>Aa</span><p>${esc(asset.text)}</p><small>${large ? 'Texto cadastrado no Google Ads' : 'Recurso de texto'}</small></div>`;
    return '<span class="unavailable">Prévia indisponível</span>';
  }
  function preview(combo) {
    const image = parts(combo).find(c => ['image','video'].includes(c.asset.kind));
    return `<div class="combination-preview">${image ? `<div class="combination-visual">${visual(image.asset)}</div>` : '<small>Patrocinado · Cosentino</small>'}<h3>${esc(comboText(combo,true) || image?.asset.name || 'Combinação de recursos')}</h3><p>${esc(comboText(combo,false))}</p><small>Representação da combinação</small></div>`;
  }
  function fallbacks(root) {
    root.querySelectorAll('img').forEach(img => img.addEventListener('error',() => {
      img.hidden = true; const note = document.createElement('span'); note.className = 'unavailable'; note.textContent = 'Prévia indisponível'; img.after(note);
    },{once:true}));
  }
  function formatGroup(a) {
    if (a.kind === 'video') return {order:3,label:'Vídeos'};
    const ratio = Number(a.width) / Number(a.height);
    if (!Number.isFinite(ratio)) return {order:4,label:'Outras imagens'};
    return ratio > 1.05 ? {order:0,label:'Imagens horizontais'} : ratio < 0.95 ? {order:2,label:'Imagens verticais'} : {order:1,label:'Imagens quadradas'};
  }
  function render() {
    if (!google) return;
    const base = activeAssets();
    $('google-filters').innerHTML = filters.map(f => `<button class="${kind === f.id ? 'active' : ''}" data-google-filter="${f.id}" aria-pressed="${kind === f.id}"><span>${f.label}</span><b>${f.id === 'combination' ? combinations().length : base.filter(a => f.id === 'all' || a.kind === f.id).length}</b></button>`).join('');
    $('google-filters').querySelectorAll('button').forEach(b => b.addEventListener('click',() => { kind = b.dataset.googleFilter; render(); }));
    $('google-section-title').textContent = filters.find(f => f.id === kind).label;
    $('google-note').textContent = kind === 'combination' ? 'Pesquisa: combinações ordenadas por impressões no período, até 5 por anúncio. Cliques por combinação não são disponibilizados pelo Google. Performance Max não entra neste ranking por não informar essas métricas. Logos omitidas; prévias ilustrativas.' : 'Recursos vinculados a campanhas ativas, agrupados por nome equivalente. Formatos diferentes são preservados. O vínculo não garante veiculação no período.';
    const term = search.toLocaleLowerCase('pt-BR').trim();
    let rows = kind === 'combination' ? combinations() : base.filter(a => kind === 'all' || kind === a.kind);
    rows = rows.filter(r => JSON.stringify(kind === 'combination' ? [r.campaign,r.group,parts(r).map(c => c.asset.text)] : [r.name,r.text,r.placements]).toLocaleLowerCase('pt-BR').includes(term));
    if (kind !== 'combination') rows.sort((a,b) => formatGroup(a).order - formatGroup(b).order || (Number(b.width)/Number(b.height) || 0) - (Number(a.width)/Number(a.height) || 0) || a.name.localeCompare(b.name,'pt-BR'));
    $('google-count').textContent = `${rows.length} ${kind === 'combination' ? 'combinações' : 'recursos'}`;
    $('google-grid').classList.toggle('combination-grid',kind === 'combination');
    $('google-grid').innerHTML = rows.length ? rows.map((r,i) => {
      if (kind === 'combination') return `<button class="card combo-card" data-google-combo="${esc(r.id)}" style="--delay:${Math.min(i,8)*30}ms">${preview(r)}<div class="card-copy"><span class="tag">${channels[r.channel] || 'Google Ads'}</span><h3>${r.impressions == null ? 'Seleção do Google' : `${number(r.impressions)} impressões`}</h3><p>${esc(r.group)}</p><small>${esc(r.campaign)}</small></div></button>`;
      const p = r.placements.find(p => campaign === 'all' || p.campaignId === campaign);
      const label = r.kind === 'video' ? 'Vídeo' : r.kind === 'image' ? 'Imagem' : roleName(p?.role || '');
      const section = i === 0 || formatGroup(rows[i-1]).order !== formatGroup(r).order ? `<h3 class="format-heading">${formatGroup(r).label}</h3>` : '';
      return `${section}<button class="card" data-google-asset="${esc(r.id)}" style="--delay:${Math.min(i,8)*30}ms"><div class="media google-media">${visual(r)}<span class="tag">${esc(label)}</span><span class="expand" aria-hidden="true">↗</span></div><div class="card-copy">${originTag(r)}${r.showName ? `<h3>${esc(r.name)}</h3>` : ''}<p>${esc(p?.campaign || '')}</p><small>${esc(p?.group || '')}</small></div></button>`;
    }).join('') : '<div class="empty"><h3>Nenhum resultado</h3><p>Não há recursos disponíveis para estes filtros.</p></div>';
    $('google-grid').querySelectorAll('[data-google-asset]').forEach(b => b.addEventListener('click',() => openAsset(galleryAssets().find(a => a.id === b.dataset.googleAsset),b)));
    $('google-grid').querySelectorAll('[data-google-combo]').forEach(b => b.addEventListener('click',() => openCombination(google.combinations.find(c => c.id === b.dataset.googleCombo),b)));
    fallbacks($('google-grid'));
  }
  function showModal(content,button) {
    opener = button; const modal = $('google-modal');
    modal.innerHTML = `<div class="modal-card google-modal-card"><button class="close" aria-label="Fechar detalhes">×</button>${content}</div>`;
    modal.hidden = false; document.body.style.overflow = 'hidden'; modal.querySelector('.close').addEventListener('click',() => closeModal()); modal.querySelector('.close').focus(); fallbacks(modal);
  }
  function openAsset(a,button) {
    const video = a.kind === 'video' && youtube(a.youtubeId);
    const media = video ? `<iframe src="https://www.youtube-nocookie.com/embed/${a.youtubeId}" title="${esc(visibleName(a))}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>` : visual(a,true);
    showModal(`<div class="modal-media google-modal-media">${media}</div><div class="modal-copy"><span class="tag">${a.kind === 'image' ? 'Imagem' : a.kind === 'video' ? 'Vídeo' : 'Texto'}</span>${originTag(a)}${a.showName ? `<h2>${esc(a.name)}</h2>` : ''}${video ? `<a class="external-link" href="https://www.youtube.com/watch?v=${a.youtubeId}" target="_blank" rel="noopener noreferrer">Assistir no YouTube ↗</a><p class="section-note">Se a reprodução incorporada estiver indisponível, abra o vídeo no YouTube.</p>` : ''}<dl>${a.placements.map(p => `<div><dt>${esc(roleName(p.role))} · ${esc(channels[p.channel] || p.channel)}</dt><dd>${esc(p.campaign)}<br>${esc(p.group)}</dd></div>`).join('')}</dl></div>`,button);
  }
  function openCombination(c,button) {
    const content = parts(c).map(p => `<div class="combination-part"><dt>${esc(roleName(p.role))}</dt><dd>${p.asset.kind === 'text' ? esc(p.asset.text) : p.asset.kind === 'image' && localImage(p.asset.image) ? `<img src="${esc(p.asset.image)}" alt="${esc(p.asset.name)}" loading="lazy">` : youtube(p.asset.youtubeId) ? `<a class="external-link" href="https://www.youtube.com/watch?v=${p.asset.youtubeId}" target="_blank" rel="noopener noreferrer">${esc(p.asset.name)} · YouTube ↗</a>` : esc(p.asset.name)}</dd></div>`).join('');
    showModal(`<div class="combo-modal-preview">${preview(c)}<p class="section-note">Representação com os recursos retornados pelo Google. O layout exibido ao público pode variar.</p></div><div class="modal-copy"><span class="tag">${channels[c.channel] || 'Google Ads'}</span><h2>${c.impressions == null ? 'Seleção do Google' : `${number(c.impressions)} impressões`}</h2><p>${esc(c.campaign)}<br>${esc(c.group)}</p><p class="section-note">${esc(c.channel === 'SEARCH' ? google.combinationNotes.search : google.combinationNotes.pmax)}</p><dl>${content}</dl></div>`,button);
  }
  $('google-search').addEventListener('input',e => { search = e.target.value; render(); });
  $('google-campaign').addEventListener('change',e => { campaign = e.target.value; render(); });
  $('google-modal').addEventListener('click',e => { if (e.target === $('google-modal')) closeModal(); });
  document.addEventListener('keydown',e => {
    const modal = $('google-modal'); if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button,a,iframe')], first = controls[0], last = controls[controls.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  fetch('data.json').then(r => { if (!r.ok) throw new Error('Dados indisponíveis'); return r.json(); }).then(data => {
    if (!data.google || data.google.status !== 'ok') throw new Error('Google indisponível');
    google = data.google; assets = new Map(google.assets.map(a => [a.id,a]));
    $('google-campaign').innerHTML += google.campaigns.filter(c => c.status === 'ENABLED').map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    metrics(); render();
  }).catch(() => {
    $('google-status').hidden = false; $('google-status').textContent = 'Não foi possível carregar os dados do Google Ads. Atualize a página para tentar novamente.';
    $('google-period').textContent = 'Dados indisponíveis';
    $('google-grid').innerHTML = '<div class="empty"><h3>Google Ads indisponível</h3><p>As métricas não foram substituídas por zero.</p></div>';
  });
})();
