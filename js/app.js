(function () {
  "use strict";

  const STORE_KEY = "roteiro2027.data";
  const SETTINGS_KEY = "roteiro2027.settings";
  const RATES_KEY = "roteiro2027.rates";
  const CHECK_KEY = "roteiro2027.checks";
  const CURRENCIES = ["EUR", "BRL", "PLN", "CZK", "HUF"];
  const CUR_SYMBOL = { EUR: "€", BRL: "R$", PLN: "zł", CZK: "Kč", HUF: "Ft" };
  const CUR_NAME = { EUR: "Euro", BRL: "Real", PLN: "Złoty polonês", CZK: "Coroa tcheca", HUF: "Forint húngaro" };
  const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  // ---------- Estado ----------
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const load = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } };

  let data = load(STORE_KEY, null);
  if (!data || !data.cities || (data.version || 0) < window.DEFAULT_DATA.version) data = clone(window.DEFAULT_DATA);
  let settings = load(SETTINGS_KEY, { googleKey: "" });
  let rates = load(RATES_KEY, { base: "EUR", date: null, fetched: 0, rates: { EUR: 1, BRL: 5.65, PLN: 4.39, CZK: 24.3, HUF: 367 }, fallback: true });
  let checks = load(CHECK_KEY, {});
  let editing = false;

  function persist() { save(STORE_KEY, data); renderAll(); fetchWikiImages(); }

  // ---------- Utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => "p" + Math.random().toString(36).slice(2, 9);
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const isoDate = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = parseDate(s); d.setUTCDate(d.getUTCDate() + n); return isoDate(d); };
  const fmtDM = (s) => s ? s.slice(8, 10) + "/" + s.slice(5, 7) : "";
  const fmtDMY = (s) => s ? fmtDM(s) + "/" + s.slice(0, 4) : "";
  const weekday = (s) => WEEKDAYS[parseDate(s).getUTCDay()];
  const nightsBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
  const safeUrl = (u) => /^https?:\/\//i.test(u || "") ? u : (u ? "https://" + u : "");
  const host = (u) => { try { return new URL(safeUrl(u)).hostname.replace(/^www\./, ""); } catch (e) { return u; } };
  const cityById = (id) => data.cities.find((c) => c.id === id);
  const allPlaces = () => data.cities.flatMap((c) => c.blocks.flatMap((b) => b.places.map((p) => ({ p, b, c }))));

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function nightCityFor(date) {
    return data.cities.find((c) => c.checkin <= date && date < c.checkout);
  }
  function tripRange() {
    const ins = data.cities.map((c) => c.checkin).filter(Boolean).sort();
    const outs = data.cities.map((c) => c.checkout).filter(Boolean).sort();
    return { start: ins[0] || data.trip.start, end: outs[outs.length - 1] || data.trip.end };
  }
  function tripDates() {
    const { start, end } = tripRange();
    const out = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
    return out;
  }

  // ---------- Moedas ----------
  function convert(amount, from, to) {
    const r = rates.rates;
    if (!r[from] || !r[to]) return null;
    return amount / r[from] * r[to];
  }
  function fmtMoney(v, cur) {
    if (v == null || isNaN(v)) return "—";
    const digits = cur === "HUF" ? 0 : (Math.abs(v) >= 100 ? 0 : 2);
    const n = v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return cur === "BRL" ? "R$ " + n : cur === "EUR" ? "€ " + n : n + " " + cur;
  }
  function convChip(price) {
    if (!price || price.amount == null || price.amount === "") return "";
    const amt = Number(price.amount);
    if (amt === 0) return '<span class="conv">grátis</span>';
    const parts = [];
    if (price.currency !== "EUR") parts.push(fmtMoney(convert(amt, price.currency, "EUR"), "EUR"));
    if (price.currency !== "BRL") parts.push(fmtMoney(convert(amt, price.currency, "BRL"), "BRL"));
    return `<span class="conv" title="${esc(fmtMoney(amt, price.currency))} convertido pela cotação atual">≈ ${parts.join(" · ")}</span>`;
  }

  async function fetchRates(force) {
    const stale = Date.now() - (rates.fetched || 0) > 30 * 60 * 1000;
    if (!force && !stale && !rates.fallback) { renderRates(); return; }
    $("#ratesStamp").textContent = "atualizando…";
    const sym = CURRENCIES.filter((c) => c !== "EUR").join(",");
    const tries = [
      async () => {
        const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${sym}`);
        if (!r.ok) throw new Error(r.status);
        const j = await r.json();
        return { date: j.date, rates: Object.assign({ EUR: 1 }, j.rates), source: "BCE (Frankfurter)" };
      },
      async () => {
        const r = await fetch("https://open.er-api.com/v6/latest/EUR");
        if (!r.ok) throw new Error(r.status);
        const j = await r.json();
        const out = { EUR: 1 };
        CURRENCIES.forEach((c) => { if (j.rates[c]) out[c] = j.rates[c]; });
        return { date: (j.time_last_update_utc || "").slice(5, 16), rates: out, source: "ExchangeRate-API" };
      }
    ];
    for (const t of tries) {
      try {
        const res = await t();
        rates = { base: "EUR", date: res.date, rates: res.rates, fetched: Date.now(), source: res.source, fallback: false };
        save(RATES_KEY, rates);
        renderRates(); renderCities(); renderTrains();
        return;
      } catch (e) { /* tenta a próxima fonte */ }
    }
    renderRates();
    $("#ratesStamp").textContent = "offline — usando última cotação salva";
  }

  function renderRates() {
    const r = rates.rates;
    const items = ["BRL", "PLN", "CZK", "HUF"].map((c) => {
      const perEur = r[c];
      const brl = c === "BRL" ? null : convert(1, c, "BRL");
      return `<div class="rate"><div class="muted small">${esc(CUR_NAME[c])}</div>
        <b>€ 1 = ${esc(fmtMoney(perEur, c))}</b>
        ${brl != null ? `<div class="muted small">1 ${c} = ${esc(fmtMoney(brl, "BRL"))}</div>` : `<div class="muted small">R$ 1 = € ${(1 / perEur).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</div>`}</div>`;
    });
    $("#rates").innerHTML = items.join("");
    const when = rates.fetched ? new Date(rates.fetched).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    $("#ratesStamp").textContent = rates.fallback ? "valores de referência" : `${rates.source || ""} · ${rates.date || ""} · ${when}`;
    renderConverter();
  }

  function renderConverter() {
    const amt = parseFloat($("#convAmount").value) || 0;
    const from = $("#convFrom").value || "EUR";
    $("#convOut").innerHTML = CURRENCIES.filter((c) => c !== from).map((c) =>
      `<div class="${c === "EUR" || c === "BRL" ? "big" : ""}">${esc(fmtMoney(convert(amt, from, c), c))}</div>`).join("");
  }

  // ---------- Relógios ----------
  function tzOffsetMinutes(tz, date) {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(date);
    const g = (t) => Number(p.find((x) => x.type === t).value);
    const asUTC = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
    return Math.round((asUTC - Math.floor(date.getTime() / 60000) * 60000) / 60000);
  }
  function clockGroups() {
    const groups = [];
    data.cities.forEach((c) => {
      let g = groups.find((x) => x.cc === c.cc);
      if (!g) { g = { cc: c.cc, country: c.country, tz: c.tz, names: [] }; groups.push(g); }
      g.names.push(c.name);
    });
    return groups;
  }
  function renderClocks() {
    const now = new Date();
    const homeTz = data.trip.homeTz || "America/Sao_Paulo";
    const homeOff = tzOffsetMinutes(homeTz, now);
    const timeFmt = (tz) => now.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateFmt = (tz) => now.toLocaleDateString("pt-BR", { timeZone: tz, weekday: "short", day: "2-digit", month: "2-digit" });
    const cards = [`<div class="clock home"><div class="place">🇧🇷 ${esc(data.trip.homeLabel || "Brasília")}</div>
      <div class="time">${timeFmt(homeTz)}</div><div class="date">${dateFmt(homeTz)}</div><div class="diff">horário de referência</div></div>`];
    clockGroups().forEach((g) => {
      const diff = (tzOffsetMinutes(g.tz, now) - homeOff) / 60;
      const flag = flagEmoji(g.cc);
      cards.push(`<div class="clock"><div class="place">${flag} ${esc(g.names.join(" · "))}</div>
        <div class="time">${timeFmt(g.tz)}</div><div class="date">${dateFmt(g.tz)} · ${esc(g.country)}</div>
        <div class="diff">${diff >= 0 ? "+" : ""}${diff.toLocaleString("pt-BR")}h em relação a Brasília</div></div>`);
    });
    $("#clocks").innerHTML = cards.join("");
    const tripOff = (tzOffsetMinutes(data.cities[0] ? data.cities[0].tz : "Europe/Vienna", new Date(tripRange().start + "T12:00:00Z")) - tzOffsetMinutes(homeTz, new Date(tripRange().start + "T12:00:00Z"))) / 60;
    $("#tzNote").textContent = `na viagem: +${tripOff}h`;
  }
  function flagEmoji(cc) {
    if (!cc || cc.length !== 2) return "🏳️";
    return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
  }

  // ---------- Notas do Google ----------
  function ratingHtml(p) {
    const q = encodeURIComponent([p.name, p.address].filter(Boolean).join(", "));
    const url = p.googleUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;
    if (p.rating == null || p.rating === "") return `<a class="rating" href="${esc(url)}" target="_blank" rel="noopener">Ver no Google</a>`;
    const pct = Math.max(0, Math.min(100, p.rating / 5 * 100));
    const count = p.ratingCount ? ` (${Number(p.ratingCount).toLocaleString("pt-BR")})` : "";
    const src = p.ratingLive ? `Google · ${p.ratingDate || ""}` : "Google ≈";
    return `<a class="rating" href="${esc(url)}" target="_blank" rel="noopener" title="Nota no Google${p.ratingLive ? " (ao vivo)" : " (aproximada)"}">
      ${Number(p.rating).toLocaleString("pt-BR", { minimumFractionDigits: 1 })} <span class="stars"><i style="width:${pct}%"></i></span><small>${count} ${esc(src)}</small></a>`;
  }

  function loadGoogleMaps(key) {
    if (window.google && google.maps && google.maps.importLibrary) return Promise.resolve();
    return new Promise((resolve, reject) => {
      window.__gmReady = resolve;
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&language=pt-BR&callback=__gmReady`;
      s.async = true; s.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
      document.head.appendChild(s);
    });
  }

  async function refreshGoogleRatings() {
    if (!settings.googleKey) { toast("Informe a chave da Google Maps API primeiro."); return; }
    try {
      await loadGoogleMaps(settings.googleKey);
      const { Place } = await google.maps.importLibrary("places");
      const list = allPlaces().filter(({ p }) => p.name && p.address).concat(data.auschwitz.places.map((p) => ({ p })));
      let ok = 0;
      const today = new Date().toLocaleDateString("pt-BR");
      for (const { p } of list) {
        try {
          const req = { textQuery: `${p.name}, ${p.address}`, fields: ["displayName", "rating", "userRatingCount", "googleMapsURI"], maxResultCount: 1, language: "pt-BR" };
          if (p.lat != null) req.locationBias = { lat: p.lat, lng: p.lng };
          const { places } = await Place.searchByText(req);
          const f = places && places[0];
          if (f && f.rating != null) {
            p.rating = f.rating; p.ratingCount = f.userRatingCount; p.googleUrl = f.googleMapsURI; p.ratingLive = true; p.ratingDate = today;
            ok++;
          }
        } catch (e) { /* lugar sem resultado */ }
      }
      persist();
      toast(`Notas atualizadas: ${ok} de ${list.length} lugares.`);
    } catch (e) {
      toast("Não foi possível consultar o Google: " + e.message);
    }
  }

  // ---------- Fotos (Wikipédia / Wikimedia Commons) ----------
  const IMG_KEY = "roteiro2027.imgs";
  let imgCache = load(IMG_KEY, {});
  function imgFor(o) { return o.img || (o.wiki && imgCache[o.wiki]) || ""; }
  function wikiUrl(o) { return o.wiki ? "https://en.wikipedia.org/wiki/" + encodeURIComponent(o.wiki.replace(/ /g, "_")) : ""; }

  async function fetchWikiImages() {
    const titles = new Set();
    data.cities.forEach((c) => { if (c.wiki) titles.add(c.wiki); c.blocks.forEach((b) => b.places.forEach((p) => { if (p.wiki && !p.img) titles.add(p.wiki); })); });
    data.auschwitz.places.forEach((p) => { if (p.wiki) titles.add(p.wiki); });
    const missing = [...titles].filter((t) => !(t in imgCache));
    if (!missing.length) return;
    for (let i = 0; i < missing.length; i += 40) {
      const chunk = missing.slice(i, i + 40);
      try {
        const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&pithumbsize=640&titles=" + encodeURIComponent(chunk.join("|"));
        const j = await (await fetch(url)).json();
        const map = {};
        (j.query.normalized || []).forEach((n) => { map[n.to] = map[n.to] || []; map[n.to].push(n.from); });
        (j.query.redirects || []).forEach((n) => { map[n.to] = (map[n.to] || []).concat(map[n.from] || [n.from]); });
        Object.values(j.query.pages).forEach((pg) => {
          const src = pg.thumbnail ? pg.thumbnail.source : "";
          [pg.title].concat(map[pg.title] || []).forEach((t) => { if (chunk.includes(t)) imgCache[t] = src; });
        });
        chunk.forEach((t) => { if (!(t in imgCache)) imgCache[t] = ""; });
      } catch (e) { return; }
    }
    save(IMG_KEY, imgCache);
    renderCities(); renderMisc(); drawMap(false);
  }

  const ALERT_ICON = { "atenção": "⚠️", "economia": "💰", "reservar antes": "🎟️", "otimização": "💡" };
  const alertIcon = (l) => ALERT_ICON[(l || "").toLowerCase()] || "📌";

  // ---------- Cabeçalho ----------
  function renderHeader() {
    const t = data.trip;
    const { start, end } = tripRange();
    const nights = data.cities.reduce((s, c) => s + nightsBetween(c.checkin, c.checkout), 0);
    const countries = new Set(data.cities.map((c) => c.cc)).size;
    document.title = t.title + " — Roteiro";
    $("#tripTitle").textContent = t.title;
    $("#tripSubtitle").textContent = `Roteiro de viagem · ${tripDates().length} dias · ${data.cities.length} cidades · ${countries} países`;
    $("#tripRoute").innerHTML = data.cities.map((c) => `<a href="#city-${esc(c.id)}" style="color:inherit;text-decoration:none">${esc(c.name)}</a>`).join(' <span class="arrow">→</span> ');
    $("#tripMeta").innerHTML = `<span><b>${fmtDMY(start)} a ${fmtDMY(end)}</b> · ${nights} noites</span>
      <span>Chegada: <b>${esc(t.arrival)}</b></span><span>Retorno: <b>${esc(t.departure)}</b></span>`;
    const days = Math.ceil((parseDate(start) - Date.now()) / 86400000);
    const today = new Date().toISOString().slice(0, 10);
    let cd;
    if (days > 0) cd = `Faltam <b>${days}</b> dias para a viagem`;
    else if (today <= end) { const c = nightCityFor(today); cd = `<b>Em viagem!</b> Hoje: ${esc(c ? c.name : "")}`; }
    else cd = "Viagem concluída";
    $("#countdown").innerHTML = cd;
    $("#footLeft").textContent = `${t.title} · ${data.cities[0] ? data.cities[0].name : ""} → ${data.cities.length ? data.cities[data.cities.length - 1].name : ""}`;
    $("#footRight").textContent = `${nights} noites · ${fmtDM(start)} a ${fmtDMY(end)}`;
  }

  // ---------- Hoje (cartão principal no celular) ----------
  let todayView = null;
  function defaultTodayDate() {
    const dates = tripDates(); const now = new Date().toISOString().slice(0, 10);
    if (now < dates[0]) return dates[0];
    if (now > dates[dates.length - 1]) return dates[dates.length - 1];
    return now;
  }
  function renderToday() {
    const dates = tripDates();
    if (!todayView || !dates.includes(todayView)) todayView = defaultTodayDate();
    const d = todayView;
    const now = new Date().toISOString().slice(0, 10);
    const day = data.days[d] || {};
    const night = nightCityFor(d);
    const here = night || nightCityFor(addDays(d, -1));
    const blocks = [];
    data.cities.forEach((c) => c.blocks.forEach((b) => { if (b.date === d) blocks.push({ c, b }); }));
    const isAu = d === data.auschwitz.date;
    const emg = here && (data.emergency || []).find((e) => e.cc === here.cc);
    const trains = data.trains.filter((t) => t.date === d);
    const idx = dates.indexOf(d);
    const label = "Dia";
    const placeLi = (p, c) => `<li><span>${esc(p.icon || "•")}</span><div><b>${esc(p.name)}</b>${p.priceText && p.priceText !== "—" ? ` <span class="muted small">· ${esc(p.priceText.split(" · ")[0])}</span>` : ""}
      <div class="links">${p.lat != null ? `<a href="#mapa" data-act="fly" data-lat="${p.lat}" data-lng="${p.lng}" data-place="${p.id}">📍 mapa</a> <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking" target="_blank" rel="noopener">🚶 ir a pé</a>` : ""}</div></div></li>`;
    $("#todayCard").innerHTML = `
      <div class="today-head">
        <button class="icon-btn big" data-act="today-nav" data-dir="-1" ${idx <= 0 ? "disabled" : ""} aria-label="Dia anterior">‹</button>
        <div class="today-title"><div class="eyebrow">${label} ${idx + 1} de ${dates.length}${d === now ? " · hoje" : ""}</div>
          <h2>${fmtDM(d)} <span class="muted" style="font-size:.7em">${weekday(d)}</span> · ${esc(day.route || (here ? here.name : ""))}</h2></div>
        <button class="icon-btn big" data-act="today-nav" data-dir="1" ${idx >= dates.length - 1 ? "disabled" : ""} aria-label="Próximo dia">›</button>
      </div>
      <p class="today-prog">${esc(day.program || "")}</p>
      ${trains.map((t) => `<div class="today-pill">🚆 <b>${esc(t.from)} → ${esc(t.to)}</b> · ${esc(t.duration)} <span class="muted small">${esc(t.info.split(" · ")[0])}</span></div>`).join("")}
      ${isAu ? `<div class="today-pill">🕯️ <b>Auschwitz-Birkenau</b> · passe nominal com horário · <a href="#auschwitz">detalhes</a></div>` : ""}
      ${blocks.map(({ c, b }) => `<div class="today-block"><div class="tlabel">${esc(b.label)}${b.sub ? ` <span class="sub" style="display:inline">· ${esc(b.sub)}</span>` : ""}</div>
        ${b.note ? `<div class="muted small">${esc(b.note)}</div>` : ""}<ul class="today-list">${b.places.map((p) => placeLi(p, c)).join("")}</ul></div>`).join("")}
      ${isAu ? `<ul class="today-list">${data.auschwitz.places.map((p) => placeLi(p)).join("")}</ul>` : ""}
      <div class="today-foot">
        ${night ? `<span>🛏️ Dorme em <b>${esc(night.name)}</b></span>` : `<span>✈️ Voo de volta</span>`}
        ${blocks.length || isAu ? `<a href="#mapa" data-act="map-day" data-date="${d}">🗺️ Roteiro do dia no mapa</a>` : ""}
        ${emg ? `<a href="tel:112" class="sos-link">🆘 112</a><a href="tel:${esc((emg.embassy.duty || "").replace(/[^\d+]/g, ""))}">🇧🇷 Plantão</a>` : ""}
      </div>`;
  }

  // ---------- Cidades ----------
  function placeHtml(p, idx, c, bi) {
    const tools = `<span class="edit-tools">
      <button class="icon-btn" data-act="edit-place" data-city="${c.id}" data-block="${bi}" data-place="${p.id}" title="Editar">✏️</button>
      <button class="icon-btn" data-act="move-place" data-dir="-1" data-city="${c.id}" data-block="${bi}" data-place="${p.id}" title="Subir">↑</button>
      <button class="icon-btn" data-act="move-place" data-dir="1" data-city="${c.id}" data-block="${bi}" data-place="${p.id}" title="Descer">↓</button>
      <button class="icon-btn" data-act="del-place" data-city="${c.id}" data-block="${bi}" data-place="${p.id}" title="Remover">🗑️</button></span>`;
    const hasGeo = p.lat != null && p.lng != null;
    const q = encodeURIComponent([p.name, p.address].filter(Boolean).join(", "));
    const dir = hasGeo ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=transit` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    const img = imgFor(p);
    return `<li class="place"><span class="n">${idx + 1}</span><div>
      ${img ? `<a href="${esc(wikiUrl(p) || img)}" target="_blank" rel="noopener" class="thumb"><img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy"></a>` : ""}
      ${p.icon ? `<span class="picon" aria-hidden="true">${esc(p.icon)}</span>` : ""}<span class="title">${esc(p.name)}</span>${p.desc ? ` <span class="desc">— ${esc(p.desc)}</span>` : ""}${tools}
      <div class="prow">${p.address ? `<span class="addr">${esc(p.address)}</span>` : ""}${p.address ? ratingHtml(p) : ""}</div>
      ${p.priceText && p.priceText !== "—" ? `<div class="prow"><span class="price">${esc(p.priceText)}</span>${convChip(p.price)}</div>` : ""}
      <div class="links" style="margin-top:3px">
        ${hasGeo ? `<a href="#mapa" data-act="fly" data-lat="${p.lat}" data-lng="${p.lng}" data-place="${p.id}">📍 Ver no mapa</a>` : ""}
        ${p.address ? `<a href="${esc(dir)}" target="_blank" rel="noopener">🧭 Como chegar</a>` : ""}
        ${p.site ? `<a href="${esc(safeUrl(p.site))}" target="_blank" rel="noopener">🔗 ${esc(host(p.site))}</a>` : ""}
      </div></div></li>`;
  }

  function cityHtml(c, ci) {
    const nights = nightsBetween(c.checkin, c.checkout);
    const blocks = c.blocks.map((b, bi) => `
      <div class="tblock">
        <div class="tlabel">${fmtDM(b.date)} · ${esc(b.label)}<span class="sub">${esc(weekday(b.date))}${b.sub ? " · " + esc(b.sub) : ""}</span>
          <span class="edit-tools"><button class="icon-btn" data-act="edit-block" data-city="${c.id}" data-block="${bi}" title="Editar bloco">✏️</button>
          <button class="icon-btn" data-act="del-block" data-city="${c.id}" data-block="${bi}" title="Remover bloco">🗑️</button></span></div>
        <div>${b.note ? `<p class="desc" style="font-family:var(--serif);margin:0 0 8px">${esc(b.note)}</p>` : ""}
          <ol class="places">${b.places.map((p, i) => placeHtml(p, i, c, bi)).join("")}</ol>
          <div class="add-row edit-only"><button class="btn sm" data-act="add-place" data-city="${c.id}" data-block="${bi}">＋ Lugar</button></div>
        </div>
      </div>`).join("");
    const banner = imgFor(c);
    return `<article class="city" id="city-${esc(c.id)}" style="--city:${esc(c.color)}">
      ${banner ? `<div class="city-banner" style="background-image:url('${esc(banner)}')"><span>${flagEmoji(c.cc)} ${esc(c.country)}</span></div>` : ""}
      <div class="city-head">
        <h3><span class="cc">${esc(c.cc)}</span>${esc(c.name)}
          <span class="edit-tools">
            <button class="icon-btn" data-act="edit-city" data-city="${c.id}" title="Editar cidade e datas">✏️</button>
            <button class="icon-btn" data-act="move-city" data-dir="-1" data-city="${c.id}" title="Mover antes">↑</button>
            <button class="icon-btn" data-act="move-city" data-dir="1" data-city="${c.id}" title="Mover depois">↓</button>
            <button class="icon-btn" data-act="del-city" data-city="${c.id}" title="Remover cidade">🗑️</button></span></h3>
        <div class="city-dates">${fmtDM(c.checkin)} → ${fmtDM(c.checkout)} · ${nights} ${nights === 1 ? "noite" : "noites"} · ${esc(c.currency)}
          · <a href="#mapa" data-act="fly-city" data-city="${c.id}">mapa</a></div>
      </div>
      ${c.window ? `<div class="window">Janela real: ${esc(c.window)}</div>` : ""}
      ${c.alert && c.alert.text ? `<div class="callout"><div class="lbl">${alertIcon(c.alert.label)} ${esc(c.alert.label || "Atenção")}</div><div>${esc(c.alert.text)}</div></div>` : ""}
      ${blocks}
      <div class="add-row edit-only"><button class="btn sm" data-act="add-block" data-city="${c.id}">＋ Bloco de horário</button></div>
      ${c.tip ? `<div class="callout tip"><div class="lbl">💡 Otimização</div><div>${esc(c.tip)}</div></div>` : ""}
    </article>`;
  }

  function renderCities() {
    $("#cityList").innerHTML = data.cities.map(cityHtml).join("");
  }

  // ---------- Calendário ----------
  function renderCalendar() {
    const today = new Date().toISOString().slice(0, 10);
    $("#calBody").innerHTML = tripDates().map((d) => {
      const day = data.days[d] || {};
      const night = nightCityFor(d);
      const wake = nightCityFor(addDays(d, -1)) || night;
      const ico = d === data.auschwitz.date ? "🕯️" : !night ? "✈️" : day.travel ? "🚆" : "📍";
      return `<tr class="${day.travel ? "travel" : ""} ${d === today ? "today" : ""}">
        <td class="date">${fmtDM(d)} – ${weekday(d)}</td>
        <td class="route" data-label="Destino">${ico} <span class="cc">${esc(wake ? wake.cc : "")}</span> ${esc(day.route || (night ? night.name : ""))}</td>
        <td class="prog">${esc(day.program || "")}</td>
        <td class="night" data-label="Noite">${night ? "🛏️ " + esc(night.name) : "—"}</td>
        <td class="edit-only"><button class="icon-btn" data-act="edit-day" data-date="${d}">✏️</button></td></tr>`;
    }).join("");
  }

  // ---------- Hospedagens ----------
  function renderStays() {
    let total = 0;
    const rows = data.cities.map((c) => {
      const n = nightsBetween(c.checkin, c.checkout); total += n;
      return `<tr><td class="date"><span class="cc">${esc(c.cc)}</span> ${esc(c.name)}</td><td data-label="Check-in">${fmtDMY(c.checkin)}</td><td data-label="Check-out">${fmtDMY(c.checkout)}</td><td data-label="Noites">${n}</td></tr>`;
    });
    const { start, end } = tripRange();
    rows.push(`<tr><td class="date"><b>Total</b></td><td data-label="De">${fmtDMY(start)}</td><td data-label="Até">${fmtDMY(end)}</td><td data-label="Noites"><b>${total}</b></td></tr>`);
    const sorted = data.cities.slice().sort((x, y) => x.checkin.localeCompare(y.checkin));
    const clash = sorted.find((c, i) => i && c.checkin !== sorted[i - 1].checkout);
    if (clash) rows.push(`<tr><td colspan="4" style="color:#b91c1c">⚠️ Atenção: o check-in de ${esc(clash.name)} não coincide com o check-out anterior — confira as datas.</td></tr>`);
    $("#stayBody").innerHTML = rows.join("");
    $("#stayCards").innerHTML = data.cities.map((c) => {
      const n = nightsBetween(c.checkin, c.checkout);
      const b = c.stay.booking || {};
      const air = `https://www.airbnb.com.br/s/${encodeURIComponent(c.name)}/homes?checkin=${c.checkin}&checkout=${c.checkout}&adults=2`;
      return `<div class="card stay-card" style="border-top:4px solid ${esc(c.color)}">
        <h4><span class="cc">${esc(c.cc)}</span>${esc(c.name)}<span class="edit-tools"><button class="icon-btn" data-act="edit-stay" data-city="${c.id}">✏️</button></span></h4>
        <div class="nights">Check-in ${fmtDM(c.checkin)} · Check-out ${fmtDM(c.checkout)} · ${n} ${n === 1 ? "noite" : "noites"}</div>
        <p style="margin:8px 0 4px"><b>Onde pesquisar:</b> ${esc(c.stay.hoods)}</p>
        <p class="muted" style="margin:0">${esc(c.stay.tip)}</p>
        <div class="booking">${b.name ? `🏠 <b>${esc(b.name)}</b><br>${esc(b.address || "")}${b.notes ? `<br><span class="muted">${esc(b.notes)}</span>` : ""}${b.link ? `<br><a href="${esc(safeUrl(b.link))}" target="_blank" rel="noopener">Abrir reserva</a>` : ""}`
          : `<span class="muted">Nenhuma hospedagem reservada ainda.</span> <a href="${esc(air)}" target="_blank" rel="noopener">Buscar no Airbnb com as datas →</a>`}</div>
      </div>`;
    }).join("");
    $("#checklist").innerHTML = data.checklist.map((item, i) =>
      `<li><label><input type="checkbox" data-check="${i}" ${checks[item] ? "checked" : ""}><span>${esc(item)}</span></label></li>`).join("");
  }

  // ---------- Trens ----------
  function renderTrains() {
    $("#trainBody").innerHTML = data.trains.map((t, i) => `<tr>
      <td class="date">${fmtDM(t.date)} – ${t.date ? weekday(t.date) : ""}</td>
      <td><b>${esc(t.from)} → ${esc(t.to)}</b></td>
      <td style="white-space:nowrap;color:var(--accent);font-weight:600" data-label="Duração">${esc(t.duration)}</td>
      <td>${esc(t.info)} ${t.link ? `· <a href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener">${esc(host(t.link))}</a>` : ""}</td>
      <td data-label="Referência">${t.price && t.price.amount ? `${esc(fmtMoney(Number(t.price.amount), t.price.currency))} ${convChip(t.price)}` : ""}</td>
      <td class="edit-only"><button class="icon-btn" data-act="edit-train" data-i="${i}">✏️</button><button class="icon-btn" data-act="del-train" data-i="${i}">🗑️</button></td></tr>`).join("");
    $("#stationBody").innerHTML = data.cities.map((c) => `<tr>
      <td class="date"><b>🚉 ${esc(c.name)}</b></td>
      <td>${esc(c.station.name)} — ${esc(c.station.address)}<br><span class="muted small">${esc(c.station.note || "")}</span></td>
      <td class="small">${esc(c.transit || "")}</td></tr>`).join("");
    $("#notesBox").innerHTML = data.notes.map((n) => `<div class="callout side" style="margin-top:16px"><div class="lbl">${esc(n.title)}</div>
      <ul class="bullets" style="font-size:15px">${n.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");
  }

  // ---------- Auschwitz, saída, revisão, fontes ----------
  function renderMisc() {
    const a = data.auschwitz;
    const d = parseDate(a.date);
    $("#auTitle").textContent = `${d.getUTCDate()} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][d.getUTCMonth()]}`;
    const fake = { id: "auschwitz" };
    $("#auBox").innerHTML = `<p class="lead">${esc(a.intro)}</p>
      <div class="card"><ol class="places">${a.places.map((p, i) => placeHtml(p, i, fake, 0)).join("")}</ol>
      <p style="margin:14px 0 0"><b>Ida e volta:</b> ${esc(a.transport)}</p></div>
      <div class="callout side" style="margin-top:16px"><div class="lbl">Como isso se organiza no dia</div><div>${esc(a.howto)}</div></div>`;
    $("#auBox").querySelectorAll(".edit-tools").forEach((e) => e.remove());
    const dep = data.departure;
    $("#depBox").innerHTML = `<div class="callout side"><div class="lbl">${esc(dep.title)}</div><div>${esc(dep.text)}</div></div>`;
    $("#reviewList").innerHTML = (window.REVIEW || []).map((r) => {
      const lbl = { ok: "Conferido", fix: "Corrigido", upd: "Atualizado", add: "Acrescentado" }[r.t];
      return `<li><span class="tag ${r.t}">${lbl}</span>${esc(r.text)}</li>`;
    }).join("");
    $("#sourceList").innerHTML = data.sources.map((s) => `<li><b>${esc(s.title)}.</b> ${esc(s.text)} ${s.links.map((l) => `<a href="${esc(safeUrl(l))}" target="_blank" rel="noopener">${esc(host(l))}</a>`).join(" · ")}</li>`).join("");
  }

  // ---------- Emergência ----------
  const tel = (n) => n ? `<a class="tel" href="tel:${esc(n.replace(/[^\d+]/g, ""))}">${esc(n)}</a>` : "—";
  function renderEmergency() {
    $("#emgCards").innerHTML = (data.emergency || []).map((e, i) => {
      const cities = data.cities.filter((c) => c.cc === e.cc).map((c) => c.name).join(", ");
      const em = e.embassy || {};
      return `<div class="card emg">
        <h4>${flagEmoji(e.cc)} ${esc(e.country)} <span class="muted small" style="font-weight:400">${esc(cities)}</span>
          <span class="edit-tools"><button class="icon-btn" data-act="edit-emergency" data-i="${i}">✏️</button></span></h4>
        <div class="emg-nums">
          <div class="big112">🆘 Geral ${tel(e.general)}</div>
          <div>👮 Polícia ${tel(e.police)}</div><div>🚑 Ambulância ${tel(e.ambulance)}</div><div>🚒 Bombeiros ${tel(e.fire)}</div>
          ${e.extra ? `<div class="muted small" style="grid-column:1/-1">${esc(e.extra)}</div>` : ""}
        </div>
        <div class="embassy">
          <div><b>🇧🇷 ${esc(em.name)}</b></div>
          <div>📍 ${esc(em.address)} ${em.lat != null ? `· <a href="https://www.google.com/maps/dir/?api=1&destination=${em.lat},${em.lng}" target="_blank" rel="noopener">rota</a> · <a href="#mapa" data-act="fly" data-lat="${em.lat}" data-lng="${em.lng}" data-place="emb-${esc(e.cc)}">mapa</a>` : ""}</div>
          <div>☎️ Telefone: ${tel(em.phone)}</div>
          <div class="duty">🚨 Plantão consular (emergências): ${tel(em.duty)}</div>
          ${em.email ? `<div>✉️ <a href="mailto:${esc(em.email)}">${esc(em.email)}</a></div>` : ""}
          ${em.hours ? `<div class="muted small">🕘 ${esc(em.hours)}</div>` : ""}
          ${em.site ? `<div class="small"><a href="${esc(safeUrl(em.site))}" target="_blank" rel="noopener">Página oficial (Itamaraty)</a></div>` : ""}
        </div></div>`;
    }).join("");
    const br = data.emergencyBrazil || "";
    $("#emgBrazil").innerHTML = esc(br).replace(/(\+55[\d\s]+)/, (m) => tel(m.trim()));
  }

  // ---------- Lavanderias (OpenStreetMap / Overpass) ----------
  const LAUNDRY_KEY = "roteiro2027.laundry";
  let laundryCache = load(LAUNDRY_KEY, {});
  const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
  function stayCenter(c) {
    const b = c.stay.booking || {};
    if (b.lat != null && b.lat !== "") return { lat: +b.lat, lng: +b.lng, label: b.name || "sua hospedagem", exact: true };
    const a = (c.stay.areas || [])[0];
    if (a) return { lat: a.lat, lng: a.lng, label: a.name, exact: false };
    return { lat: c.lat, lng: c.lng, label: "centro", exact: false };
  }
  function distM(a, b, c, d) {
    const R = 6371000, r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  async function overpass(q) {
    for (const ep of OVERPASS) {
      try {
        const r = await fetch(ep, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        if (r.ok) return await r.json();
      } catch (e) { /* tenta o próximo servidor */ }
    }
    throw new Error("servidores do OpenStreetMap indisponíveis");
  }
  async function loadLaundries(c, force) {
    const ctr = stayCenter(c);
    const key = ctr.lat.toFixed(4) + "," + ctr.lng.toFixed(4);
    const hit = laundryCache[key];
    if (!force && hit && Date.now() - hit.t < 7 * 86400000) return hit.list;
    let list = [];
    for (const R of [1500, 3500]) {
      const q = `[out:json][timeout:25];(nwr(around:${R},${ctr.lat},${ctr.lng})["shop"~"^(laundry|dry_cleaning)$"];nwr(around:${R},${ctr.lat},${ctr.lng})["amenity"="washing_machine"];);out center tags 60;`;
      const j = await overpass(q);
      list = j.elements.map((e) => {
        const lat = e.lat != null ? e.lat : e.center && e.center.lat, lng = e.lon != null ? e.lon : e.center && e.center.lon;
        const t = e.tags || {};
        const addr = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
        return { name: t.name || (t.shop === "dry_cleaning" ? "Lavanderia / tinturaria" : "Lavanderia"), lat, lng, addr, hours: t.opening_hours || "", phone: t.phone || t["contact:phone"] || "", web: t.website || t["contact:website"] || "",
          self: t.self_service === "yes" || /self|samoobs|önkiszolg|waschsalon|wash ?& ?go|pralnia samoobsługowa/i.test(t.name || ""), dry: t.shop === "dry_cleaning", d: distM(ctr.lat, ctr.lng, lat, lng) };
      }).filter((x) => x.lat != null).sort((a, b) => a.d - b.d);
      if (list.length >= 3) break;
    }
    list = list.slice(0, 8);
    laundryCache[key] = { t: Date.now(), list };
    save(LAUNDRY_KEY, laundryCache);
    return list;
  }
  function laundryCardBody(c, list, err) {
    const ctr = stayCenter(c);
    const g = `https://www.google.com/maps/search/${encodeURIComponent("lavanderia self service")}/@${ctr.lat},${ctr.lng},16z`;
    let body;
    if (err) body = `<p class="muted">Não foi possível buscar agora (${esc(err)}).</p>`;
    else if (!list) body = `<p class="muted">Buscando lavanderias…</p>`;
    else if (!list.length) body = `<p class="muted">Nenhuma lavanderia cadastrada no OpenStreetMap por perto.</p>`;
    else body = `<ol class="laundry">${list.map((l) => {
      const walk = Math.max(1, Math.round(l.d / 80));
      return `<li><div><b>${l.self ? "🧺" : l.dry ? "👔" : "🫧"} ${esc(l.name)}</b> <span class="muted small">${l.d < 1000 ? Math.round(l.d) + " m" : (l.d / 1000).toFixed(1).replace(".", ",") + " km"} · ${walk} min a pé${l.self ? " · self-service" : l.dry ? " · tinturaria" : ""}</span></div>
        ${l.addr ? `<div class="small">${esc(l.addr)}</div>` : ""}${l.hours ? `<div class="small muted">🕘 ${esc(l.hours)}</div>` : ""}
        <div class="links"><a href="https://www.google.com/maps/dir/?api=1&origin=${ctr.lat},${ctr.lng}&destination=${l.lat},${l.lng}&travelmode=walking" target="_blank" rel="noopener">🧭 Rota a pé</a>
        <a href="#mapa" data-act="fly" data-lat="${l.lat}" data-lng="${l.lng}" data-place="">📍 Mapa</a>${l.phone ? ` ${tel(l.phone)}` : ""}${l.web ? ` <a href="${esc(safeUrl(l.web))}" target="_blank" rel="noopener">site</a>` : ""}</div></li>`;
    }).join("")}</ol>`;
    return `<h4>${flagEmoji(c.cc)} ${esc(c.name)} <button class="icon-btn" data-act="laundry-reload" data-city="${c.id}" title="Buscar de novo">↻</button></h4>
      <div class="muted small">Perto de: ${ctr.exact ? "🏠 " : "◌ "}${esc(ctr.label)}${ctr.exact ? "" : " (bairro sugerido)"} · ${fmtDM(c.checkin)} → ${fmtDM(c.checkout)}</div>
      ${body}<div class="small" style="margin-top:8px"><a href="${esc(g)}" target="_blank" rel="noopener">Ver mais no Google Maps →</a></div>`;
  }
  function renderLaundry() {
    $("#laundryCards").innerHTML = data.cities.map((c) => `<div class="card laundry-card" id="laundry-${esc(c.id)}" style="border-top:4px solid ${esc(c.color)}">${laundryCardBody(c, null)}</div>`).join("");
    laundryQueued = false;
    if (laundryVisible) runLaundryQueue(false);
  }
  let laundryVisible = false, laundryQueued = false;
  async function runLaundryQueue(force) {
    if (laundryQueued && !force) return;
    laundryQueued = true;
    for (const c of data.cities) await refreshLaundryCard(c, force);
    drawLaundryLayer();
  }
  async function refreshLaundryCard(c, force) {
    const el = document.getElementById("laundry-" + c.id);
    if (!el) return;
    if (force) el.innerHTML = laundryCardBody(c, null);
    try { el.innerHTML = laundryCardBody(c, await loadLaundries(c, force)); }
    catch (e) { el.innerHTML = laundryCardBody(c, null, e.message); }
  }
  function drawLaundryLayer() {
    if (!map || !layers.laundry) return;
    layers.laundry.clearLayers();
    data.cities.forEach((c) => {
      const ctr = stayCenter(c);
      const hit = laundryCache[ctr.lat.toFixed(4) + "," + ctr.lng.toFixed(4)];
      if (!hit) return;
      hit.list.forEach((l) => L.marker([l.lat, l.lng], { icon: emojiIcon("🧺") })
        .bindPopup(`<h4>🧺 ${esc(l.name)}</h4>${l.addr ? `<div>${esc(l.addr)}</div>` : ""}${l.hours ? `<div class="muted small">${esc(l.hours)}</div>` : ""}<div class="small">${Math.round(l.d)} m de ${esc(ctr.label)}</div>`)
        .addTo(layers.laundry));
    });
  }

  // ---------- Mapa ----------
  let map, layers = {}, markerIndex = {}, mapFilter = { city: "all", date: "all" };

  function pinIcon(color, label) {
    return L.divIcon({ className: "", html: `<div class="pin" style="background:${color}"><span>${esc(label)}</span></div>`, iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] });
  }
  function emojiIcon(e) {
    return L.divIcon({ className: "", html: `<div class="emoji-pin">${e}</div>`, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -10] });
  }
  function popupHtml(p, c, b) {
    const q = encodeURIComponent([p.name, p.address].filter(Boolean).join(", "));
    const img = imgFor(p);
    return `${img ? `<img class="pop-img" src="${esc(img)}" alt="" loading="lazy">` : ""}<h4>${p.icon ? esc(p.icon) + " " : ""}${esc(p.name)}</h4>
      ${c ? `<div class="muted small">${esc(c.name)}${b ? ` · ${fmtDM(b.date)} (${weekday(b.date)}) · ${esc(b.label)}` : ""}</div>` : ""}
      ${p.desc ? `<div style="margin-top:4px">${esc(p.desc)}</div>` : ""}
      ${p.address ? `<div class="muted small" style="margin-top:4px">${esc(p.address)}</div>` : ""}
      ${p.address ? `<div style="margin-top:4px">${ratingHtml(p)}</div>` : ""}
      ${p.priceText ? `<div class="price" style="margin-top:4px">${esc(p.priceText)}</div>${convChip(p.price)}` : ""}
      <div class="pop-links">
        <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google Maps</a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking" target="_blank" rel="noopener">A pé</a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=transit" target="_blank" rel="noopener">Transporte</a>
        ${p.site ? `<a href="${esc(safeUrl(p.site))}" target="_blank" rel="noopener">Site</a>` : ""}
      </div>`;
  }

  function initMap() {
    if (!window.L) { $("#map").innerHTML = '<p style="padding:20px">Não foi possível carregar o mapa (sem internet?).</p>'; return; }
    map = L.map("map", { zoomControl: !L.Browser.mobile, scrollWheelZoom: true, tap: true });
    const base = {
      "Ruas (OpenStreetMap)": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }),
      "Ruas detalhado (Esri)": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "© Esri, HERE, OpenStreetMap" }),
      "Satélite (Esri)": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "© Esri" }),
      "Transporte público": L.tileLayer("https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© ÖPNVKarte · OpenStreetMap" }),
      "Relevo (OpenTopoMap)": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17, subdomains: "abc", attribution: "© OpenTopoMap · OpenStreetMap" })
    };
    base["Ruas (OpenStreetMap)"].addTo(map);
    layers = {
      route: L.layerGroup().addTo(map),
      places: L.layerGroup().addTo(map),
      stays: L.layerGroup().addTo(map),
      stations: L.layerGroup().addTo(map),
      labels: L.layerGroup().addTo(map),
      walk: L.layerGroup().addTo(map),
      embassy: L.layerGroup().addTo(map),
      laundry: L.layerGroup()
    };
    L.control.layers(base, {
      "Rota de trem": layers.route, "Pontos turísticos": layers.places, "Hospedagem (bairros)": layers.stays,
      "Estações e aeroporto": layers.stations, "Nomes das cidades": layers.labels, "Caminho do dia": layers.walk,
      "Embaixadas do Brasil": layers.embassy, "Lavanderias": layers.laundry
    }, { collapsed: true }).addTo(map);
    map.on("overlayadd", (e) => { if (e.layer === layers.laundry) runLaundryQueue(false); });
    // detalhes que só fazem sentido de perto
    const zoomDetail = () => {
      const z = map.getZoom();
      document.getElementById("map").classList.toggle("far", z < 8);
      document.getElementById("map").classList.toggle("very-far", z < 6);
    };
    map.on("zoomend", zoomDetail); setTimeout(zoomDetail, 0);
    L.control.scale({ imperial: false }).addTo(map);

    const Ctl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create("div", "leaflet-bar");
        div.innerHTML = '<a href="#" title="Tela cheia" data-mc="full">⛶</a><a href="#" title="Minha localização" data-mc="loc">◎</a><a href="#" title="Ver viagem inteira" data-mc="all">⌂</a>';
        L.DomEvent.disableClickPropagation(div);
        div.addEventListener("click", (e) => {
          const a = e.target.closest("a"); if (!a) return; e.preventDefault();
          if (a.dataset.mc === "full") { $("#mapShell").classList.toggle("full"); setTimeout(() => map.invalidateSize(), 50); }
          if (a.dataset.mc === "loc") map.locate({ setView: true, maxZoom: 16 });
          if (a.dataset.mc === "all") { mapFilter = { city: "all", date: "all" }; renderMapFilters(); drawMap(true); }
        });
        return div;
      }
    });
    new Ctl({ position: "topleft" }).addTo(map);
    let locMarker;
    map.on("locationfound", (e) => { if (locMarker) locMarker.remove(); locMarker = L.circleMarker(e.latlng, { radius: 8, color: "#fff", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }).addTo(map).bindPopup("Você está aqui").openPopup(); });
    map.on("locationerror", () => toast("Não foi possível obter sua localização."));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#mapShell").classList.contains("full")) { $("#mapShell").classList.remove("full"); map.invalidateSize(); } });
    drawMap(true);
  }

  function renderMapFilters() {
    const chips = [`<button class="chip ${mapFilter.city === "all" ? "on" : ""}" data-mf-city="all">Todas</button>`]
      .concat(data.cities.map((c) => `<button class="chip ${mapFilter.city === c.id ? "on" : ""}" data-mf-city="${c.id}"><span class="dot" style="background:${esc(c.color)}"></span>${esc(c.name)}</button>`));
    chips.push(`<button class="chip ${mapFilter.city === "auschwitz" ? "on" : ""}" data-mf-city="auschwitz"><span class="dot" style="background:#475569"></span>Auschwitz</button>`);
    const opts = ['<option value="all">Todos os dias</option>'].concat(tripDates().map((d) => {
      const n = nightCityFor(d) || nightCityFor(addDays(d, -1));
      return `<option value="${d}" ${mapFilter.date === d ? "selected" : ""}>${fmtDM(d)} ${weekday(d)} — ${esc((data.days[d] && data.days[d].route) || (n ? n.name : ""))}</option>`;
    }));
    $("#mapFilters").innerHTML = chips.join("") + `<select id="mfDate" aria-label="Filtrar por dia">${opts.join("")}</select>`;
  }

  function drawMap(fit) {
    if (!map) return;
    Object.values(layers).forEach((l) => l.clearLayers());
    markerIndex = {};
    const bounds = [];
    const showCity = (id) => mapFilter.city === "all" || mapFilter.city === id;

    // Rota de trem entre estações
    const stationPts = data.cities.map((c) => [c.station.lat, c.station.lng]).filter((p) => p[0] != null);
    if (stationPts.length > 1) {
      L.polyline(stationPts, { color: "#8a4b08", weight: 4, opacity: .85 }).addTo(layers.route);
      data.trains.forEach((t) => {
        const a = data.cities.find((c) => c.name === t.from), b = data.cities.find((c) => c.name === t.to);
        if (!a || !b) return;
        const mid = [(a.station.lat + b.station.lat) / 2, (a.station.lng + b.station.lng) / 2];
        L.marker(mid, { icon: L.divIcon({ className: "", html: `<div class="city-label train-lbl" style="font-size:11px;font-weight:600;white-space:nowrap;transform:translate(-50%,-50%);display:inline-block">🚆 ${fmtDM(t.date)} · ${esc(t.duration)}</div>`, iconSize: [0, 0] }) })
          .bindPopup(`<h4>${esc(t.from)} → ${esc(t.to)}</h4><div>${fmtDM(t.date)} (${weekday(t.date)}) · ${esc(t.duration)}</div><div class="muted small">${esc(t.info)}</div>`)
          .addTo(layers.route);
      });
    }
    // Auschwitz bate-volta
    const kr = data.cities[0];
    const au = data.auschwitz.places.filter((p) => p.lat != null);
    if (kr && au.length) L.polyline([[kr.station.lat, kr.station.lng], [au[0].lat, au[0].lng]], { color: "#475569", weight: 3, dashArray: "8 8" }).addTo(layers.route);

    data.cities.forEach((c, ci) => {
      L.tooltip({ permanent: true, direction: "right", className: "city-label", offset: [8, 0] }).setLatLng([c.lat, c.lng]).setContent(`${ci + 1}. ${c.name}`).addTo(layers.labels);
      if (c.station.lat != null) {
        L.marker([c.station.lat, c.station.lng], { icon: emojiIcon("🚆") }).bindPopup(`<h4>${esc(c.station.name)}</h4><div class="muted small">${esc(c.station.address)}</div><div>${esc(c.station.note || "")}</div><div class="small" style="margin-top:4px">${esc(c.transit || "")}</div>`).addTo(layers.stations);
      }
      if (!showCity(c.id)) return;
      (c.stay.areas || []).forEach((a) => {
        L.circle([a.lat, a.lng], { radius: a.radius || 500, color: c.color, weight: 2, dashArray: "4 6", fillOpacity: .08 })
          .bindPopup(`<h4>🛏️ ${esc(a.name)}</h4><div>Bairro sugerido para Airbnb em ${esc(c.name)}</div><div class="muted small">${fmtDM(c.checkin)} → ${fmtDM(c.checkout)}</div>`).addTo(layers.stays);
      });
      const bk = c.stay.booking;
      if (bk && bk.lat != null && bk.lat !== "") {
        L.marker([bk.lat, bk.lng], { icon: emojiIcon("🏠"), zIndexOffset: 500 }).bindPopup(`<h4>🏠 ${esc(bk.name || "Hospedagem")}</h4><div>${esc(bk.address || "")}</div>`).addTo(layers.stays);
        bounds.push([bk.lat, bk.lng]);
      }
      if (mapFilter.city !== "all") bounds.push([c.station.lat, c.station.lng]);
      c.blocks.forEach((b) => {
        if (mapFilter.date !== "all" && b.date !== mapFilter.date) return;
        const pts = [];
        b.places.forEach((p, i) => {
          if (p.lat == null || p.lng == null) return;
          const m = L.marker([p.lat, p.lng], { icon: pinIcon(c.color, i + 1), title: p.name }).bindPopup(popupHtml(p, c, b), { maxWidth: 300 });
          m.addTo(layers.places);
          markerIndex[p.id] = m;
          pts.push([p.lat, p.lng]); bounds.push([p.lat, p.lng]);
        });
        if (mapFilter.date !== "all" && pts.length > 1) L.polyline(pts, { color: c.color, weight: 3, dashArray: "2 8", lineCap: "round" }).addTo(layers.walk);
      });
    });
    if (showCity("auschwitz") && (mapFilter.date === "all" || mapFilter.date === data.auschwitz.date)) {
      data.auschwitz.places.forEach((p, i) => {
        if (p.lat == null) return;
        const m = L.marker([p.lat, p.lng], { icon: pinIcon("#475569", i + 1) }).bindPopup(popupHtml(p, { name: "Auschwitz-Birkenau" }, { date: data.auschwitz.date, label: "Dia" }), { maxWidth: 300 });
        m.addTo(layers.places); markerIndex[p.id] = m; bounds.push([p.lat, p.lng]);
      });
    }
    (data.emergency || []).forEach((e) => {
      const em = e.embassy;
      if (!em || em.lat == null) return;
      const m = L.marker([em.lat, em.lng], { icon: L.divIcon({ className: "near-only", html: '<div class="emoji-pin">🇧🇷</div>', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -10] }) }).bindPopup(`<h4>🇧🇷 ${esc(em.name)}</h4><div>${esc(em.address)}</div>
        <div style="margin-top:4px">☎️ ${tel(em.phone)}<br>🚨 Plantão: ${tel(em.duty)}</div><div class="small muted">Emergência local: 112 · Polícia ${esc(e.police)} · Ambulância ${esc(e.ambulance)}</div>`);
      m.addTo(layers.embassy); markerIndex["emb-" + e.cc] = m;
    });
    drawLaundryLayer();
    const ap = data.departure.airport;
    if (ap && ap.lat != null) {
      L.marker([ap.lat, ap.lng], { icon: emojiIcon("✈️") }).bindPopup(`<h4>${esc(ap.name)}</h4><div>${esc(data.departure.title)}</div>`).addTo(layers.stations);
      if (mapFilter.city === "vienna") bounds.push([ap.lat, ap.lng]);
    }
    if (fit) {
      if (mapFilter.city === "all" && mapFilter.date === "all") map.fitBounds(L.latLngBounds(stationPts.concat(au.map((p) => [p.lat, p.lng]))).pad(0.12));
      else if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.15), { maxZoom: 16 });
    }
  }

  function flyToPlace(id, lat, lng) {
    if (!map) return;
    const owner = data.cities.find((c) => c.blocks.some((b) => b.places.some((p) => p.id === id)));
    if (!markerIndex[id] && owner) { mapFilter = { city: owner.id, date: "all" }; renderMapFilters(); drawMap(false); }
    map.flyTo([lat, lng], 17, { duration: .8 });
    setTimeout(() => markerIndex[id] && markerIndex[id].openPopup(), 850);
  }

  // ---------- Modal e formulários ----------
  function openForm(title, fields, values, onSave, extra = {}) {
    const root = $("#modalRoot");
    const fieldHtml = (f) => {
      const v = values[f.key] == null ? "" : values[f.key];
      let input;
      if (f.type === "textarea") input = `<textarea name="${f.key}">${esc(v)}</textarea>`;
      else if (f.type === "select") input = `<select name="${f.key}">${f.options.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(v) ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select>`;
      else if (f.type === "checkbox") input = `<label style="display:flex;gap:8px;text-transform:none;font-weight:400"><input type="checkbox" name="${f.key}" style="width:auto" ${v ? "checked" : ""}> ${esc(f.text || "")}</label>`;
      else input = `<input type="${f.type || "text"}" name="${f.key}" value="${esc(v)}" ${f.step ? `step="${f.step}"` : ""}>`;
      return `<div class="field"><label>${esc(f.label)}</label>${input}${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ""}</div>`;
    };
    const rows = fields.map((f) => Array.isArray(f) ? `<div class="frow">${f.map(fieldHtml).join("")}</div>` : fieldHtml(f)).join("");
    root.innerHTML = `<div class="modal-bg"><form class="modal"><h3>${esc(title)}</h3>${rows}
      <div class="modal-actions">${extra.geocode ? '<button type="button" class="btn" data-geo>📍 Buscar coordenadas pelo endereço</button>' : ""}
      <div class="right"><button type="button" class="btn" data-cancel>Cancelar</button><button type="submit" class="btn primary">Salvar</button></div></div></form></div>`;
    const form = $("form", root);
    const close = () => { root.innerHTML = ""; };
    $("[data-cancel]", root).onclick = close;
    $(".modal-bg", root).addEventListener("mousedown", (e) => { if (e.target.classList.contains("modal-bg")) close(); });
    if (extra.geocode) $("[data-geo]", root).onclick = async () => {
      const q = [form.elements[extra.geocode.query[0]].value, form.elements[extra.geocode.query[1]] ? form.elements[extra.geocode.query[1]].value : ""].filter(Boolean).join(", ");
      if (!q) { toast("Preencha o endereço primeiro."); return; }
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { "Accept-Language": "pt-BR" } });
        const j = await r.json();
        if (!j.length) { toast("Endereço não encontrado — tente simplificar."); return; }
        form.elements[extra.geocode.lat].value = (+j[0].lat).toFixed(5);
        form.elements[extra.geocode.lng].value = (+j[0].lon).toFixed(5);
        toast("Coordenadas encontradas: " + j[0].display_name.slice(0, 60) + "…");
      } catch (e) { toast("Falha na busca de endereço."); }
    };
    form.onsubmit = (e) => {
      e.preventDefault();
      const out = {};
      fields.flat().forEach((f) => {
        const el = form.elements[f.key];
        if (f.type === "checkbox") out[f.key] = el.checked;
        else if (f.type === "number") out[f.key] = el.value === "" ? null : Number(el.value);
        else out[f.key] = el.value.trim();
      });
      if (onSave(out) !== false) { close(); persist(); }
    };
    const first = form.querySelector("input,textarea,select"); if (first) first.focus();
  }

  const curOptions = CURRENCIES.map((c) => ({ value: c, label: `${c} — ${CUR_NAME[c]}` }));

  function placeForm(c, bi, p) {
    const isNew = !p;
    const target = p || { id: uid(), name: "", desc: "", address: "", priceText: "", price: null, site: "", lat: null, lng: null, rating: null };
    const dateOpts = c.blocks.map((b, i) => ({ value: i, label: `${fmtDM(b.date)} · ${b.label}${b.sub ? " · " + b.sub : ""}` }));
    openForm(isNew ? `Novo lugar em ${c.name}` : `Editar: ${target.name}`, [
      { key: "name", label: "Nome" },
      { key: "desc", label: "Descrição / dica", type: "textarea" },
      { key: "address", label: "Endereço" },
      [{ key: "lat", label: "Latitude", type: "number", step: "any" }, { key: "lng", label: "Longitude", type: "number", step: "any" }],
      { key: "priceText", label: "Preço (texto)", hint: "Ex.: “Grátis · torre ≈ PLN 25”" },
      [{ key: "amount", label: "Valor principal (número)", type: "number", step: "any", hint: "Usado na conversão para € e R$" }, { key: "currency", label: "Moeda", type: "select", options: curOptions }],
      [{ key: "rating", label: "Nota Google (0–5)", type: "number", step: "0.1" }, { key: "site", label: "Site oficial" }],
      { key: "block", label: "Dia / bloco", type: "select", options: dateOpts },
      [{ key: "icon", label: "Ícone (emoji)", hint: "Ex.: 🏰 ⛪ 🏛️ 🍽️" }, { key: "wiki", label: "Artigo da Wikipédia (inglês)", hint: "Usado para a foto automática" }],
      { key: "img", label: "Foto (URL de imagem, opcional)", hint: "Substitui a foto automática" }
    ], Object.assign({}, target, { amount: target.price ? target.price.amount : null, currency: target.price ? target.price.currency : c.currency, block: bi }), (v) => {
      if (!v.name) { toast("O nome é obrigatório."); return false; }
      Object.assign(target, { name: v.name, desc: v.desc, address: v.address, lat: v.lat, lng: v.lng, priceText: v.priceText, site: v.site, icon: v.icon, wiki: v.wiki, img: v.img });
      if (v.rating !== target.rating) { target.rating = v.rating; target.ratingLive = false; target.ratingCount = null; }
      target.price = v.amount != null ? { amount: v.amount, currency: v.currency } : null;
      const nb = Number(v.block);
      if (!isNew && nb !== bi) { c.blocks[bi].places = c.blocks[bi].places.filter((x) => x !== target); }
      if (isNew || nb !== bi) c.blocks[nb].places.push(target);
    }, { geocode: { query: ["address", "name"], lat: "lat", lng: "lng" } });
  }

  function cityForm(c) {
    const isNew = !c;
    const target = c || { id: uid(), name: "", country: "", cc: "", currency: "EUR", tz: "Europe/Vienna", color: "#0f766e", lat: null, lng: null, checkin: tripRange().end, checkout: addDays(tripRange().end, 1), window: "", alert: { label: "Atenção", text: "" }, tip: "", stay: { hoods: "", tip: "", areas: [], booking: {} }, station: { name: "", address: "", note: "", lat: null, lng: null }, transit: "", blocks: [] };
    openForm(isNew ? "Nova cidade" : `Editar cidade: ${target.name}`, [
      [{ key: "name", label: "Cidade" }, { key: "country", label: "País" }],
      [{ key: "cc", label: "Sigla do país (2 letras)" }, { key: "currency", label: "Moeda local", type: "select", options: curOptions }],
      [{ key: "checkin", label: "Check-in", type: "date" }, { key: "checkout", label: "Check-out", type: "date" }],
      [{ key: "lat", label: "Latitude do centro", type: "number", step: "any" }, { key: "lng", label: "Longitude do centro", type: "number", step: "any" }],
      [{ key: "tz", label: "Fuso horário (IANA)", hint: "Ex.: Europe/Vienna" }, { key: "color", label: "Cor no mapa", type: "color" }],
      { key: "window", label: "Janela real (resumo do tempo disponível)", type: "textarea" },
      [{ key: "alertLabel", label: "Título do aviso" }, { key: "alertText", label: "Texto do aviso", type: "textarea" }],
      { key: "tip", label: "Otimização", type: "textarea" },
      [{ key: "stName", label: "Estação de trem" }, { key: "stAddress", label: "Endereço da estação" }],
      [{ key: "stLat", label: "Lat. estação", type: "number", step: "any" }, { key: "stLng", label: "Lng. estação", type: "number", step: "any" }],
      { key: "stNote", label: "Nota da estação" },
      { key: "transit", label: "Transporte urbano (preços)" }
    ], Object.assign({}, target, { alertLabel: target.alert ? target.alert.label : "", alertText: target.alert ? target.alert.text : "", stName: target.station.name, stAddress: target.station.address, stLat: target.station.lat, stLng: target.station.lng, stNote: target.station.note }), (v) => {
      if (!v.name || !v.checkin || !v.checkout || v.checkout <= v.checkin) { toast("Preencha nome e datas (check-out depois do check-in)."); return false; }
      try { Intl.DateTimeFormat("pt-BR", { timeZone: v.tz }); } catch (e) { toast("Fuso horário inválido."); return false; }
      const oldIn = target.checkin;
      Object.assign(target, { name: v.name, country: v.country, cc: v.cc.toUpperCase().slice(0, 2), currency: v.currency, checkin: v.checkin, checkout: v.checkout, lat: v.lat, lng: v.lng, tz: v.tz, color: v.color, window: v.window, tip: v.tip, transit: v.transit });
      target.alert = v.alertText ? { label: v.alertLabel || "Atenção", text: v.alertText } : null;
      Object.assign(target.station, { name: v.stName, address: v.stAddress, lat: v.stLat != null ? v.stLat : v.lat, lng: v.stLng != null ? v.stLng : v.lng, note: v.stNote });
      if (target.lat == null) { target.lat = target.station.lat; target.lng = target.station.lng; }
      if (target.lat == null) { toast("Informe as coordenadas da cidade ou da estação."); return false; }
      // desloca os blocos junto com a mudança de datas
      if (!isNew && oldIn && oldIn !== v.checkin) {
        const shift = nightsBetween(oldIn, v.checkin);
        target.blocks.forEach((b) => { b.date = addDays(b.date, shift); });
      }
      if (isNew) { data.cities.push(target); data.cities.sort((a, b) => a.checkin.localeCompare(b.checkin)); }
      tripDates().forEach((d) => { if (!data.days[d]) data.days[d] = { route: "", program: "" }; });
    }, { geocode: { query: ["name", "country"], lat: "lat", lng: "lng" } });
  }

  function blockForm(c, bi) {
    const isNew = bi == null;
    const b = isNew ? { date: c.checkin, label: "Dia", sub: "", note: "", places: [] } : c.blocks[bi];
    openForm(isNew ? `Novo bloco em ${c.name}` : "Editar bloco de horário", [
      [{ key: "date", label: "Data", type: "date" }, { key: "label", label: "Período", hint: "Ex.: Manhã, Tarde, Noite" }],
      { key: "sub", label: "Subtítulo", hint: "Ex.: Cidade Velha" },
      { key: "note", label: "Observação (opcional)", type: "textarea" }
    ], b, (v) => {
      Object.assign(b, v);
      if (isNew) c.blocks.push(b);
      c.blocks.sort((x, y) => x.date.localeCompare(y.date));
    });
  }

  function dayForm(d) {
    const day = data.days[d] || (data.days[d] = { route: "", program: "" });
    openForm(`Dia ${fmtDM(d)} (${weekday(d)})`, [
      { key: "route", label: "Destino / deslocamento" },
      { key: "program", label: "Programa", type: "textarea" },
      { key: "travel", label: "Dia de deslocamento", type: "checkbox", text: "destacar como dia de viagem" }
    ], day, (v) => { Object.assign(day, v); });
  }

  function trainForm(i) {
    const isNew = i == null;
    const t = isNew ? { date: data.trip.start, from: "", to: "", duration: "", info: "", link: "", price: null } : data.trains[i];
    const cityOpts = data.cities.map((c) => ({ value: c.name, label: c.name }));
    openForm(isNew ? "Novo trecho" : `Trecho ${t.from} → ${t.to}`, [
      [{ key: "date", label: "Data", type: "date" }, { key: "duration", label: "Duração" }],
      [{ key: "from", label: "De", type: "select", options: cityOpts }, { key: "to", label: "Para", type: "select", options: cityOpts }],
      { key: "info", label: "Informações", type: "textarea" },
      { key: "link", label: "Site para compra" },
      [{ key: "amount", label: "Preço de referência", type: "number", step: "any" }, { key: "currency", label: "Moeda", type: "select", options: curOptions }]
    ], Object.assign({}, t, { amount: t.price ? t.price.amount : null, currency: t.price ? t.price.currency : "EUR" }), (v) => {
      Object.assign(t, { date: v.date, duration: v.duration, from: v.from, to: v.to, info: v.info, link: v.link, price: v.amount != null ? { amount: v.amount, currency: v.currency } : null });
      if (isNew) data.trains.push(t);
      data.trains.sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  function stayForm(c) {
    const bk = c.stay.booking || (c.stay.booking = {});
    openForm(`Hospedagem em ${c.name}`, [
      { key: "hoods", label: "Onde pesquisar (bairros)", type: "textarea" },
      { key: "tip", label: "Dica", type: "textarea" },
      { key: "bName", label: "Hospedagem reservada — nome" },
      { key: "bAddress", label: "Endereço" },
      [{ key: "bLat", label: "Latitude", type: "number", step: "any" }, { key: "bLng", label: "Longitude", type: "number", step: "any" }],
      { key: "bLink", label: "Link da reserva" },
      { key: "bNotes", label: "Notas (código, horário de check-in, anfitrião…)", type: "textarea" }
    ], { hoods: c.stay.hoods, tip: c.stay.tip, bName: bk.name, bAddress: bk.address, bLat: bk.lat, bLng: bk.lng, bLink: bk.link, bNotes: bk.notes }, (v) => {
      c.stay.hoods = v.hoods; c.stay.tip = v.tip;
      Object.assign(bk, { name: v.bName, address: v.bAddress, lat: v.bLat, lng: v.bLng, link: v.bLink, notes: v.bNotes });
    }, { geocode: { query: ["bAddress", "bName"], lat: "bLat", lng: "bLng" } });
  }

  function settingsForm() {
    const root = $("#modalRoot");
    root.innerHTML = `<div class="modal-bg"><div class="modal"><h3>⚙️ Configurações e dados</h3>
      <div class="field"><label>Chave da Google Maps API (opcional)</label><input id="gk" value="${esc(settings.googleKey)}" placeholder="AIza…">
      <div class="hint">Com uma chave com a “Places API (New)” e a “Maps JavaScript API” ativadas, o site busca as notas e o número de avaliações reais do Google. A chave fica salva só neste navegador.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><button class="btn" id="gkSave">Salvar chave</button><button class="btn primary" id="gkRun">⭐ Atualizar notas pelo Google</button></div>
      <div class="field"><label>Tema</label><select id="themeSel" style="width:auto"><option value="">Automático</option><option value="light">Claro</option><option value="dark">Escuro</option></select></div>
      <div class="field"><label>Seus dados</label><div class="hint" style="margin-bottom:8px">As edições ficam salvas neste navegador. Exporte um arquivo para guardar uma cópia ou abrir em outro aparelho.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="exp">⬇️ Exportar JSON</button><label class="btn" style="cursor:pointer">⬆️ Importar JSON<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn" id="prt">🖨️ Imprimir / PDF</button><button class="btn danger" id="rst">↺ Restaurar roteiro original</button></div></div>
      <div class="modal-actions"><div class="right"><button class="btn" data-cancel>Fechar</button></div></div></div></div>`;
    const close = () => { root.innerHTML = ""; };
    $("[data-cancel]", root).onclick = close;
    $(".modal-bg", root).addEventListener("mousedown", (e) => { if (e.target.classList.contains("modal-bg")) close(); });
    $("#themeSel").value = settings.theme || "";
    $("#themeSel").onchange = (e) => { settings.theme = e.target.value; save(SETTINGS_KEY, settings); applyTheme(); };
    $("#gkSave").onclick = () => { settings.googleKey = $("#gk").value.trim(); save(SETTINGS_KEY, settings); toast("Chave salva."); };
    $("#gkRun").onclick = () => { settings.googleKey = $("#gk").value.trim(); save(SETTINGS_KEY, settings); close(); toast("Consultando o Google…"); refreshGoogleRatings(); };
    $("#exp").onclick = () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "roteiro-europa-2027.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $("#imp").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        if (!j.cities || !Array.isArray(j.cities)) throw new Error("formato inválido");
        data = j; data.version = window.DEFAULT_DATA.version; close(); persist(); drawMap(true); toast("Roteiro importado.");
      } catch (err) { toast("Arquivo inválido: " + err.message); }
    };
    $("#prt").onclick = () => { close(); window.print(); };
    $("#rst").onclick = () => {
      if (!confirm("Descartar todas as edições e voltar ao roteiro original?")) return;
      data = clone(window.DEFAULT_DATA); close(); persist(); drawMap(true); toast("Roteiro original restaurado.");
    };
  }

  function applyTheme() {
    if (settings.theme) document.documentElement.setAttribute("data-theme", settings.theme);
    else document.documentElement.removeAttribute("data-theme");
  }

  // ---------- Ações ----------
  function findPlace(cityId, bi, pid) {
    const c = cityById(cityId); const b = c.blocks[bi];
    return { c, b, p: b.places.find((x) => x.id === pid) };
  }

  document.addEventListener("click", (e) => {
    const mf = e.target.closest("[data-mf-city]");
    if (mf) { mapFilter.city = mf.dataset.mfCity; if (mapFilter.city === "auschwitz") mapFilter.date = "all"; renderMapFilters(); drawMap(true); return; }
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act, ds = el.dataset;
    switch (act) {
      case "fly": e.preventDefault(); document.getElementById("mapa").scrollIntoView(); flyToPlace(ds.place, +ds.lat, +ds.lng); break;
      case "fly-city": e.preventDefault(); document.getElementById("mapa").scrollIntoView(); mapFilter = { city: ds.city, date: "all" }; renderMapFilters(); drawMap(true); break;
      case "edit-place": { const r = findPlace(ds.city, +ds.block, ds.place); placeForm(r.c, +ds.block, r.p); break; }
      case "add-place": placeForm(cityById(ds.city), +ds.block, null); break;
      case "del-place": { const r = findPlace(ds.city, +ds.block, ds.place); if (confirm(`Remover “${r.p.name}”?`)) { r.b.places = r.b.places.filter((x) => x !== r.p); persist(); } break; }
      case "move-place": {
        const r = findPlace(ds.city, +ds.block, ds.place); const i = r.b.places.indexOf(r.p); const j = i + Number(ds.dir);
        if (j >= 0 && j < r.b.places.length) { [r.b.places[i], r.b.places[j]] = [r.b.places[j], r.b.places[i]]; persist(); }
        break;
      }
      case "edit-city": cityForm(cityById(ds.city)); break;
      case "add-city": cityForm(null); break;
      case "del-city": { const c = cityById(ds.city); if (confirm(`Remover ${c.name} e todos os seus lugares?`)) { data.cities = data.cities.filter((x) => x !== c); persist(); } break; }
      case "move-city": {
        const i = data.cities.findIndex((c) => c.id === ds.city); const j = i + Number(ds.dir);
        if (j >= 0 && j < data.cities.length) { [data.cities[i], data.cities[j]] = [data.cities[j], data.cities[i]]; persist(); toast("Ordem alterada — ajuste as datas se necessário."); }
        break;
      }
      case "edit-block": blockForm(cityById(ds.city), +ds.block); break;
      case "add-block": blockForm(cityById(ds.city), null); break;
      case "del-block": { const c = cityById(ds.city); if (confirm("Remover este bloco e seus lugares?")) { c.blocks.splice(+ds.block, 1); persist(); } break; }
      case "edit-day": dayForm(ds.date); break;
      case "edit-train": trainForm(+ds.i); break;
      case "add-train": trainForm(null); break;
      case "del-train": if (confirm("Remover este trecho?")) { data.trains.splice(+ds.i, 1); persist(); } break;
      case "edit-stay": stayForm(cityById(ds.city)); break;
      case "edit-trip": openForm("Dados da viagem", [
        { key: "title", label: "Título" },
        [{ key: "arrival", label: "Chegada" }, { key: "departure", label: "Retorno" }],
        [{ key: "homeLabel", label: "Relógio de casa" }, { key: "homeTz", label: "Fuso de casa (IANA)" }]
      ], data.trip, (v) => { Object.assign(data.trip, v); }); break;
      case "edit-checklist": openForm("Checklist", [{ key: "items", label: "Um item por linha", type: "textarea" }], { items: data.checklist.join("\n") },
        (v) => { data.checklist = v.items.split("\n").map((s) => s.trim()).filter(Boolean); }); break;
      case "edit-auschwitz": openForm("Auschwitz-Birkenau", [
        { key: "date", label: "Data", type: "date" }, { key: "intro", label: "Introdução", type: "textarea" },
        { key: "transport", label: "Ida e volta", type: "textarea" }, { key: "howto", label: "Como se organiza", type: "textarea" }
      ], data.auschwitz, (v) => { Object.assign(data.auschwitz, v); }); break;
      case "today-nav": { const ds2 = tripDates(); const i = ds2.indexOf(todayView) + Number(ds.dir); if (ds2[i]) { todayView = ds2[i]; renderToday(); } break; }
      case "map-day": e.preventDefault(); document.getElementById("mapa").scrollIntoView(); mapFilter = { city: "all", date: ds.date }; renderMapFilters(); drawMap(true); break;
      case "laundry-reload": { const c = cityById(ds.city); refreshLaundryCard(c, true).then(drawLaundryLayer); break; }
      case "edit-emergency": {
        const em = data.emergency[+ds.i]; const b = em.embassy;
        openForm(`Emergência — ${em.country}`, [
          [{ key: "general", label: "Geral" }, { key: "police", label: "Polícia" }],
          [{ key: "ambulance", label: "Ambulância" }, { key: "fire", label: "Bombeiros" }],
          { key: "extra", label: "Outros números" },
          { key: "eName", label: "Embaixada" }, { key: "eAddress", label: "Endereço" },
          [{ key: "eLat", label: "Latitude", type: "number", step: "any" }, { key: "eLng", label: "Longitude", type: "number", step: "any" }],
          [{ key: "ePhone", label: "Telefone" }, { key: "eDuty", label: "Plantão consular" }],
          { key: "eEmail", label: "E-mail" }, { key: "eHours", label: "Horário / observações", type: "textarea" }, { key: "eSite", label: "Página oficial" }
        ], Object.assign({}, em, { eName: b.name, eAddress: b.address, eLat: b.lat, eLng: b.lng, ePhone: b.phone, eDuty: b.duty, eEmail: b.email, eHours: b.hours, eSite: b.site }), (v) => {
          Object.assign(em, { general: v.general, police: v.police, ambulance: v.ambulance, fire: v.fire, extra: v.extra });
          Object.assign(b, { name: v.eName, address: v.eAddress, lat: v.eLat, lng: v.eLng, phone: v.ePhone, duty: v.eDuty, email: v.eEmail, hours: v.eHours, site: v.eSite });
        }, { geocode: { query: ["eAddress", "eName"], lat: "eLat", lng: "eLng" } });
        break;
      }
      case "edit-departure": openForm("Saída", [{ key: "title", label: "Título" }, { key: "text", label: "Texto", type: "textarea" }],
        data.departure, (v) => { Object.assign(data.departure, v); }); break;
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "mfDate") { mapFilter.date = e.target.value; if (mapFilter.city === "auschwitz" && mapFilter.date !== data.auschwitz.date) mapFilter.city = "all"; drawMap(true); }
    if (e.target.dataset.check != null) { checks[data.checklist[+e.target.dataset.check]] = e.target.checked; save(CHECK_KEY, checks); }
    if (e.target.id === "convFrom") renderConverter();
  });
  $("#convAmount").addEventListener("input", renderConverter);
  $("#ratesRefresh").onclick = () => fetchRates(true);
  $("#settingsBtn").onclick = settingsForm;
  $("#moreBtn").onclick = () => $("#moreSheet").classList.toggle("hidden");
  $("#moreSheet").addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (e.target.id === "moreSheet" || a) $("#moreSheet").classList.add("hidden");
    if (a && a.dataset.sheet === "convert") { e.preventDefault(); $("#widgets").scrollIntoView(); }
  });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  $("#editToggle").onclick = () => {
    editing = !editing;
    document.body.classList.toggle("editing", editing);
    $("#editToggle").classList.toggle("on", editing);
    $("#editBanner").classList.toggle("hidden", !editing);
  };

  // ---------- Inicialização ----------
  function renderAll() {
    renderHeader(); renderToday(); renderCities(); renderCalendar(); renderStays(); renderTrains(); renderMisc(); renderClocks();
    renderEmergency(); renderLaundry(); renderMapFilters(); drawMap(false);
  }

  applyTheme();
  $("#convFrom").innerHTML = CURRENCIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  $("#convFrom").value = "EUR";
  renderHeader(); renderToday(); renderCities(); renderCalendar(); renderStays(); renderTrains(); renderMisc(); renderClocks(); renderRates();
  renderEmergency(); renderLaundry(); renderMapFilters();
  initMap();
  fetchRates(false);
  fetchWikiImages();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((ents, obs) => {
      if (ents.some((e) => e.isIntersecting)) { laundryVisible = true; runLaundryQueue(false); obs.disconnect(); }
    }, { rootMargin: "300px" }).observe(document.getElementById("lavanderias"));
  } else { laundryVisible = true; runLaundryQueue(false); }
  setInterval(renderClocks, 1000);
  setInterval(() => fetchRates(false), 10 * 60 * 1000);
})();
