/* Group equivalent names while retaining formats, campaign links and unnamed assets. */
(function (root) {
  function key(a) {
    const name = (a.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\bvideo\b/g, '').replace(/\s+/g, ' ').trim();
    if (!name || name === 'recurso visual') return a.kind + ':' + a.id;
    return a.kind + ':' + name;
  }
  function group(assets) {
    const groups = new Map();
    for (const asset of assets.filter(a => a.active && ['image','video'].includes(a.kind))) {
      const id = key(asset);
      if (!groups.has(id)) groups.set(id, {...asset, placements:[], memberIds:[]});
      const item = groups.get(id);
      item.memberIds.push(asset.id);
      for (const p of asset.placements) if (!item.placements.some(v => JSON.stringify(v) === JSON.stringify(p))) item.placements.push(p);
    }
    return [...groups.values()];
  }
  const api = {key,group};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GoogleGallery = api;
})(typeof window !== 'undefined' ? window : this);
