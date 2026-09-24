// Dependency-free static site build. Edit content.mjs/templates here, then run node _dev/build.mjs.
import { readFile, writeFile } from "node:fs/promises";
import {
  site,
  members,
  testimonials,
  showTestimonials,
  genres,
  services,
  faq,
} from "./content.mjs";
const root = new URL("../", import.meta.url);
const songs = JSON.parse(
  await readFile(new URL("data/repertoire.json", import.meta.url), "utf8"),
);
const videos = JSON.parse(
  await readFile(new URL("data/videos.json", import.meta.url), "utf8"),
);
if (
  songs.length !== 174 ||
  songs.filter((s) => s.genre === "bonesaver").length !== 16
)
  throw new Error("Repertoire integrity check failed.");
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const arrow =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const play =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>';
const bolt =
  '<svg viewBox="0 0 20 28" width="17" height="25" fill="currentColor" aria-hidden="true"><path d="M11 0 0 16h8l-2 12L20 10h-9z"/></svg>';
const link = (href, label, className = "text-link") =>
  `<a class="${className}" href="${esc(href)}">${label}${arrow}</a>`;
const photoSizes = {
  "hero-background3": [958, 640],
  "band-photo-1": [960, 640],
  "band-photo-2": [921, 614],
};
function photo(
  name,
  alt,
  {
    eager = false,
    className = "",
    sizes = "(max-width: 700px) 100vw, 50vw",
  } = {},
) {
  const [width, height] = photoSizes[name];
  return `<img class="${className}" src="/img/optimized/${name}-1200.webp" srcset="/img/optimized/${name}-640.webp 640w, /img/optimized/${name}-1200.webp ${width}w" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""} decoding="async">`;
}
function header(active) {
  const current = (name) => (active === name ? ' aria-current="page"' : "");
  return `<a class="skip-link" href="#main">Přejít k obsahu</a>
  <header class="site-header"><div class="container header-inner">
    <a href="/" class="brand" aria-label="BoneSaver — úvodní stránka">${bolt}<span>BONE<span class="brand-accent">SAVER</span></span></a>
    <nav class="site-nav" id="site-nav" aria-label="Hlavní navigace">
      <details class="nav-dropdown"><summary${services.some((s) => s.key === active) ? ' class="active"' : ""}>Pro vaši akci <span aria-hidden="true">⌄</span></summary><div class="dropdown-panel">${services.map((s) => `<a href="/${s.file}"${current(s.key)}>${s.label}</a>`).join("")}</div></details>
      <a href="/ukazky.html"${current("ukazky")}>Ukázky</a><a href="/repertoar.html"${current("repertoar")}>Repertoár</a><a href="/o-nas.html"${current("o-nas")}>O kapele</a>
      <a href="/kontakt.html#poptavka" class="button button-small"${current("kontakt")}>Ověřit termín ${arrow}</a>
    </nav>
    <div class="header-tools"><button class="theme-toggle" type="button" aria-label="Přepnout barevný motiv" title="Přepnout barevný motiv"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg></button><button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Otevřít menu"><span></span><span></span></button></div>
  </div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><div><a href="/" class="brand">${bolt}<span>BONESAVER</span></a><p>Živá muzika. Společné zážitky.<br>Pardubice a celá Česká republika.</p></div><div><h2>Domluvme si hraní</h2><a class="footer-phone" href="tel:${site.telephone}">${site.phone}</a><a class="footer-email" href="mailto:${site.email}">${site.email}</a></div><div><h2>Ještě trochu muziky</h2><a href="/vlastni-tvorba.html">Naše vlastní tvorba</a><a href="/assets/bonesaver-repertoar.pdf" target="_blank" rel="noopener">Repertoár v PDF ↗</a><div class="socials">${site.socials.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`).join("")}</div></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> BoneSaver</span><span>Ing. Miroslav Bečička · IČO 69126887</span><a href="/soukromi.html">Soukromí</a></div></div></footer>
  <div class="mobile-contact"><a href="tel:${site.telephone}">Zavolat kapele</a><a href="/kontakt.html#poptavka">Ověřit termín ${arrow}</a></div>`;
}
function schema(page) {
  const url = site.url + (page.file === "index.html" ? "/" : "/" + page.file);
  const nodes = [
    {
      "@type":
        page.key === "kontakt"
          ? "ContactPage"
          : page.key === "o-nas"
            ? "AboutPage"
            : "WebPage",
      "@id": url + "#page",
      url,
      name: page.title,
      description: page.description,
      inLanguage: "cs",
      isPartOf: { "@id": site.url + "/#website" },
      about: { "@id": site.url + "/#band" },
    },
  ];
  if (page.file === "index.html") {
    nodes.push({
      "@type": "WebSite",
      "@id": site.url + "/#website",
      url: site.url + "/",
      name: "BoneSaver",
      inLanguage: "cs",
      publisher: { "@id": site.url + "/#band" },
    });
    nodes.push({
      "@type": "MusicGroup",
      "@id": site.url + "/#band",
      name: site.name,
      url: site.url + "/",
      image: site.url + "/img/optimized/social.jpg",
      logo: site.url + "/img/optimized/logo.webp",
      description:
        "Pětičlenná živá kapela z Pardubic. Rock, pop, plesové tance a saxofon pro svatby, plesy, firemní a veřejné akce.",
      telephone: site.telephone,
      email: site.email,
      genre: ["Rock", "Pop", "Plesové tance"],
      areaServed: { "@type": "Country", name: "Česká republika" },
      location: {
        "@type": "Place",
        name: "Pardubice",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Pardubice",
          addressRegion: "Pardubický kraj",
          addressCountry: "CZ",
        },
      },
      sameAs: site.socials.map((s) => s[1]),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "booking",
        telephone: site.telephone,
        email: site.email,
        availableLanguage: "cs",
      },
      member: members.map((m) => ({
        "@type": "OrganizationRole",
        roleName: m.role,
        member: { "@type": "Person", name: m.name },
      })),
    });
  } else if (page.key !== "404") {
    nodes.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Domů",
          item: site.url + "/",
        },
        { "@type": "ListItem", position: 2, name: page.label, item: url },
      ],
    });
  }
  const service = services.find((s) => s.key === page.key);
  if (service)
    nodes.push({
      "@type": "Service",
      "@id": url + "#service",
      name: page.title.split(" | ")[0],
      serviceType: service.label,
      provider: { "@id": site.url + "/#band" },
      areaServed: { "@type": "Country", name: "Česká republika" },
      url,
    });
  if (page.key === "ukazky") {
    for (const video of videos.filter((v) => v.uploadDate && v.duration))
      nodes.push({
        "@type": "VideoObject",
        name: video.title,
        description: video.description,
        thumbnailUrl: [site.url + `/img/videos/video-${video.id}.webp`],
        uploadDate: video.uploadDate,
        duration: video.duration,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        publisher: { "@id": site.url + "/#band" },
      });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}
function shell(page) {
  const url = site.url + (page.file === "index.html" ? "/" : "/" + page.file);
  return `<!doctype html>
<html lang="cs" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}"><meta name="theme-color" content="#10141b">${page.key === "404" ? '<meta name="robots" content="noindex">' : ""}<link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="BoneSaver"><meta property="og:locale" content="cs_CZ"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:image" content="${site.url}/img/optimized/social.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Pětičlenná kapela BoneSaver z Pardubic"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title)}"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${site.url}/img/optimized/social.jpg"><link rel="icon" type="image/png" sizes="48x48" href="/img/optimized/favicon-48.png"><link rel="apple-touch-icon" href="/img/optimized/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');try{const t=localStorage.getItem('bonesaver-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}</script><link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/style.css"><script type="application/ld+json">${schema(page)}</script><script src="/script.js" defer></script></head><body data-page="${page.key}">${header(page.key)}<main id="main" tabindex="-1">${page.body}</main>${footer()}</body></html>\n`;
}
function sectionTitle(kicker, title, intro = "") {
  return `<div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2>${intro ? `<p>${intro}</p>` : ""}</div>`;
}
function pageHero(kicker, heading, intro, trailing = "") {
  return `<section class="page-hero"><div class="container"><p class="eyebrow"><a href="/">BoneSaver</a><span>/</span>${kicker}</p><h1>${heading}</h1><p class="lead">${intro}</p>${trailing}</div></section>`;
}
function videoCard(video, featured = false, headingLevel = 3) {
  return `<article class="video-card ${featured ? "video-featured" : ""}"><div class="video-frame" data-video="${video.id}" data-title="${esc(video.title)}"><img src="/img/videos/video-${video.id}.webp" width="480" height="270" alt="Náhled videa: ${esc(video.title)}" loading="lazy" decoding="async"><button class="video-play" type="button" aria-label="Přehrát video: ${esc(video.title)}">${play}<span>Pustit živou ukázku</span></button></div><div class="video-caption"><div><p class="eyebrow">Živý záznam</p><h${headingLevel}>${esc(video.title)}</h${headingLevel}></div><a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer" aria-label="${esc(video.title)} — otevřít na YouTube">YouTube ↗</a></div><p class="video-note">Přehráním načtete video ze služby YouTube.</p></article>`;
}
function faqs(items = faq) {
  return `<div class="faq-list">${items.map(([q, a]) => `<details><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("")}</div>`;
}
function serviceCards() {
  return `<div class="service-grid">${services.map((s) => `<a class="service-card" href="/${s.file}"><span class="service-number">${s.number}</span><h3>${s.label}</h3><p>${s.short}</p><span class="service-link">Jak to může vypadat ${arrow}</span></a>`).join("")}</div>`;
}
function inquiryForm() {
  return `<form id="inquiryForm" class="inquiry-form" data-inquiry method="post" action="/kontakt.html#poptavka">
    <div class="form-row"><div class="field"><label for="eventType">Co plánujete?</label><select id="eventType" name="eventType"><option value="svatba">Svatbu</option><option value="ples">Ples / maturitní ples</option><option value="firemni">Firemní akci</option><option value="verejna">Veřejnou akci / slavnost</option><option value="oslava">Oslavu / jinou akci</option></select></div><div class="field"><label for="eventDate">Datum akce</label><input type="date" id="eventDate" name="eventDate" required><label class="check-label" for="dateUnknown"><input type="checkbox" id="dateUnknown" name="dateUnknown">Termín ještě neznám</label></div></div>
    <div class="field"><label for="eventLocation">Kde se bude hrát?</label><input id="eventLocation" name="eventLocation" autocomplete="address-level2" placeholder="Město, obec nebo místo konání" maxlength="160" required></div>
    <div class="form-row"><div class="field"><label for="contactName">Vaše jméno</label><input id="contactName" name="contactName" autocomplete="name" maxlength="100" required></div><div class="field"><label for="contactEmail">Váš e-mail</label><input id="contactEmail" name="contactEmail" type="email" autocomplete="email" maxlength="180" required></div></div>
    <div class="field"><label for="contactPhone">Telefon <span>(nepovinné)</span></label><input type="tel" id="contactPhone" name="contactPhone" autocomplete="tel" maxlength="40"></div>
    <div class="field"><label for="eventNotes">Ještě něco důležitého? <span>(nepovinné)</span></label><textarea id="eventNotes" name="eventNotes" rows="3" maxlength="1200" placeholder="Čas hraní, přibližný počet hostů nebo píseň na přání…"></textarea></div>
    <p class="form-info">Připravíme vám text poptávky. Odeslání potvrdíte až ve svém e-mailu.</p><button type="submit" class="button" disabled>Připravit e-mail s poptávkou ${arrow}</button><p class="form-privacy">Údaje slouží k domluvě vystoupení. <a href="/soukromi.html">Jak nakládáme s údaji</a></p><noscript><p>Pro přípravu textu zapněte JavaScript, nebo napište přímo na <a href="mailto:${site.email}">${site.email}</a>.</p></noscript>
    <section id="inquiryResult" class="inquiry-result" hidden aria-labelledby="resultHeading"><h3 id="resultHeading" tabindex="-1">E-mail je připravený. Ještě není odeslaný.</h3><p>Otevřete ho ve své poště a odešlete. Pokud poštu v tomto zařízení nemáte nastavenou, zkopírujte text a pošlete jej na ${site.email}.</p><div class="button-row"><a id="emailDraft" class="button" href="mailto:${site.email}">Otevřít e-mail ${arrow}</a><button id="copyInquiry" type="button" class="button button-outline">Zkopírovat text</button></div><label for="inquiryText" class="sr-only">Text připravené poptávky</label><textarea id="inquiryText" rows="8" readonly></textarea><p id="copyStatus" role="status" aria-live="polite"></p></section>
  </form>`;
}
function booking() {
  return `<section class="section booking-section" id="poptavka"><div class="container booking-grid"><div>${sectionTitle("Domluvme si hraní", "Kdy to spolu<br>rozjedeme?", "Napište nám, co chystáte. Ověříme termín a společně probereme hudbu, techniku i cenu.")}<a class="big-phone" href="tel:${site.telephone}">${site.phone}</a><p><a href="mailto:${site.email}">${site.email}</a></p><p class="small muted">Nezávazná poptávka. Domluva přímo s kapelou.</p></div><div class="form-panel">${inquiryForm()}</div></div></section>`;
}
function cta(title = "Vaše akce může znít takhle.") {
  return `<section class="section cta-section"><div class="container cta-inner"><div><p class="eyebrow">BoneSaver na vaší akci</p><h2>${title}</h2></div>${link("/kontakt.html#poptavka", "Ověřit volný termín", "button")}</div></section>`;
}
function home() {
  const preview = [
    ["Pohoda", "Kabát", "Rock"],
    ["Highway to Hell", "AC/DC", "Rock"],
    ["Máma - táta", "Hudba Praha", "Saxofon & rock"],
    ["What's Up", "4 Non Blondes", "Pop / rock"],
    ["Voda živá", "Aneta Langerová", "Ploužák"],
    ["Malá dáma", "Kabát", "Rock"],
  ];
  return `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow"><span class="live-dot"></span> Živá kapela z Pardubic</p><h1>BoneSaver.<br><span>Naživo pro vás.</span></h1><p class="lead">Pět muzikantů, saxofon a písničky, které znáte.<br class="desktop-break"> Pro svatby, plesy a večery, na které se vzpomíná.</p><div class="button-row">${link("#poptavka", "Ověřit termín", "button")}<a class="button button-quiet" href="#ukazky">${play} Poslechnout kapelu</a></div><p class="hero-region">Pardubice · východní Čechy · celá ČR</p></div><div class="hero-media"><div class="photo-corner"></div>${photo("hero-background3", "Pět členů kapely BoneSaver s nástroji při společném focení", { eager: true })}<span class="photo-stamp">Pět lidí.<br>Jeden zvuk.</span><div class="hero-caption"><span>ROCK / POP / SAXOFON</span><span>100% NAŽIVO ${bolt}</span></div></div></div><div class="container"><div class="hero-proof"><p><strong>174</strong> skladeb v repertoáru</p><p><strong>5</strong> muzikantů v sestavě</p><p><strong>Vlastní</strong> ozvučení a světla</p></div></div></section>
    <section class="section live-section" id="ukazky"><div class="container live-grid"><div>${sectionTitle("Nejdřív si nás pusťte", "Takhle zní<br>BoneSaver naživo.", "Živý záznam vám řekne víc než dlouhé představování. Poslechněte si zpěv, kytary, rytmiku i náš saxofon.")}<p class="live-side-note">Známé hity.<br>Naše vlastní energie.</p>${link("/ukazky.html", "Všech 6 živých ukázek")}</div>${videoCard(videos[0], true)}</div></section>
    ${showTestimonials ? `<section class="section testimonials-section"><div class="container">${sectionTitle("Po dohrání", "Jak na nás vzpomínají pořadatelé")}<div class="testimonials-grid">${testimonials.map((t) => `<figure class="testimonial"><blockquote>„${esc(t.quote)}“</blockquote><figcaption><strong>${esc(t.author)}</strong><span>${esc(t.event)}</span></figcaption></figure>`).join("")}</div></div></section>` : ""}
    <section class="section section-tint" id="akce"><div class="container">${sectionTitle("Každý večer má svůj rytmus", "Co společně chystáme?", "Vyberte si svou akci. Projdeme s vámi program i praktické detaily.")} ${serviceCards()}</div></section>
    <section class="section"><div class="container split-content"><div>${sectionTitle("Hudba a všechno kolem", "Dobrá domluva.<br>Pak už jen muzika.")}<p>Před akcí spolu projdeme časový plán, místo i vaše oblíbené písničky. Máme vlastní zvuk a světla; technické řešení přizpůsobíme konkrétním podmínkám.</p>${link("/kontakt.html#otazky", "Praktické otázky a odpovědi")}</div><ol class="steps"><li><span>01</span><div><h3>Napište nám svou představu</h3><p>Termín, místo a typ akce. To stačí pro první domluvu.</p></div></li><li><span>02</span><div><h3>Doladíme program a nabídku</h3><p>Hudbu, délku hraní, techniku i cenu pro vaši akci.</p></div></li><li><span>03</span><div><h3>Potkáme se před pódiem</h3><p>S domluveným plánem a nástroji připravenými na váš večer.</p></div></li></ol></div></section>
    <section class="section section-tint"><div class="container"><div class="section-heading-row">${sectionTitle("Od Kabátu po AC/DC", "Písničky, které spojují.")} ${link("/repertoar.html", "Celý repertoár — 174 skladeb")}</div><div class="song-preview">${preview.map(([title, artist, genre]) => `<div><span class="song-preview-genre">${genre}</span><h3>${esc(title)}</h3><p>${esc(artist)}</p></div>`).join("")}</div><p class="small muted">Rock, pop, ploužáky, plesové tance, folk a také <a href="/vlastni-tvorba.html">naše vlastní tvorba</a>.</p></div></section>
    <section class="section"><div class="container about-teaser">${photo("band-photo-1", "Členové kapely BoneSaver při neformálním společném focení")}<div>${sectionTitle("Těší nás, BoneSaver", "Parta, kterou<br>spojuje muzika.")}<p>Jsme pětičlenná kapela z Pardubic. Hrajeme na kytary, basu, klávesy, bicí a saxofon. K tomu tři hlasy a chuť strávit večer s vámi.</p>${link("/o-nas.html", "Poznejte naši sestavu")}</div></div></section>
    <section class="section section-tint"><div class="container faq-grid">${sectionTitle("Ať víte, do čeho jdete", "Ještě vás zajímá…")}${faqs(faq.slice(0, 4))}</div></section>${booking()}`;
}
function repertoire() {
  return `${pageHero("Repertoár", "Najděte svůj<br><span>oblíbený refrén.</span>", "174 skladeb, české i zahraniční hity a 16 vlastních písní. Prohlédněte si, co hrajeme, a napište nám, co by na vaší akci nemělo chybět.", link("/assets/bonesaver-repertoar.pdf", "Stáhnout repertoár v PDF", "button button-outline"))}<section class="section repertoire-section"><div class="container"><div class="repertoire-controls"><div class="field search-field"><label for="repertoireSearch">Najít skladbu nebo interpreta</label><input type="search" id="repertoireSearch" placeholder="Třeba Kabát, valčík nebo vaše oblíbená píseň…" autocomplete="off" aria-controls="songTable"></div><p id="repertoireCount" class="result-count" role="status" aria-live="polite">174 / 174 skladeb</p></div><div class="filter-list" aria-label="Filtrovat repertoár podle žánru"><button type="button" data-filter="all" aria-pressed="true">Všechno <span>174</span></button>${Object.entries(
    genres,
  )
    .map(
      ([key, label]) =>
        `<button type="button" data-filter="${key}" aria-pressed="false">${label} <span>${songs.filter((s) => s.genre === key).length}</span></button>`,
    )
    .join(
      "",
    )}</div><table class="song-table" id="songTable"><caption class="sr-only">Kompletní repertoár kapely BoneSaver</caption><thead><tr><th scope="col">Skladba</th><th scope="col">Interpret</th><th scope="col">Žánr</th></tr></thead><tbody>${songs.map((s) => `<tr data-genre="${s.genre}"><th scope="row">${esc(s.title)}</th><td>${esc(s.artist)}</td><td><span class="genre-label">${genres[s.genre]}</span></td></tr>`).join("")}</tbody></table><div id="repertoireEmpty" class="empty-state" hidden><h2>Tuhle skladbu jsme nenašli.</h2><p>Zkuste jiný výraz nebo zrušte filtr. Píseň na přání s vámi rádi probereme.</p><button type="button" id="resetRepertoire" class="button button-outline">Zobrazit celý repertoár</button></div><noscript><p>Bez JavaScriptu je níže dostupný kompletní seznam. Pro hledání použijte vyhledávání v prohlížeči.</p></noscript><div class="repertoire-note"><h2>Nenašli jste svou písničku?</h2><p>Napište nám ji do poptávky. Společně probereme možnosti. Novou skladbu je potřeba domluvit předem.</p>${link("/kontakt.html#poptavka", "Domluvit píseň na přání")}</div></div></section>`;
}
function about() {
  return `${pageHero("O kapele", "Pět muzikantů.<br><span>Společná radost z hraní.</span>", "Jsme BoneSaver, kapela z Pardubic. Potkáváme se u známých písniček i vlastní tvorby a nejraději je hrajeme lidem naživo.")}<section class="section"><div class="container about-teaser">${photo("band-photo-1", "Společná fotografie kapely BoneSaver s nástroji")}<div><p class="eyebrow">Kytary, klávesy a něco navíc</p><h2>Náš zvuk má<br>i saxofon.</h2><p>Základ tvoří kytary, basová kytara a bicí. Klávesy, saxofon a tři zpěvy nám umožňují přecházet mezi rockem, popem a tanečními skladbami.</p><p>Hrajeme na svatbách, plesech, firemních večírcích i veřejných akcích. Program domlouváme s pořadateli podle toho, kdo přijde a jaký večer si představují.</p>${link("/ukazky.html", "Poslechněte si nás")}</div></div></section><section class="section section-tint"><div class="container">${sectionTitle("Lidé za nástroji", "Kdo pro vás hraje")}<div class="members-grid">${members.map((m) => `<article class="member"><img src="/img/optimized/${m.image}-480.webp" srcset="/img/optimized/${m.image}-240.webp 240w, /img/optimized/${m.image}-480.webp 480w" sizes="(max-width: 600px) 45vw, 20vw" width="480" height="480" alt="${esc(m.name)} — ${esc(m.role)}" loading="lazy" decoding="async"><h3>${esc(m.name)}</h3><p class="member-role">${esc(m.role)}</p><p>${esc(m.note)}</p></article>`).join("")}</div></div></section><section class="section"><div class="container split-content"><div><p class="eyebrow">Z vlastní dílny</p><h2>Máme i svoje<br>písničky.</h2></div><div><p>Vedle známých hitů patří do repertoáru také 16 našich vlastních skladeb. Prohlédněte si je v samostatné sekci.</p>${link("/vlastni-tvorba.html", "Vlastní tvorba BoneSaver")}</div></div></section>${cta()}`;
}
function servicePage(service) {
  const inquiry = `/kontakt.html?akce=${service.key}#poptavka`;
  return `${pageHero(
    service.label,
    service.heading
      .split("\n")
      .map((part, i) => (i ? `<span>${part}</span>` : part))
      .join("<br>"),
    service.intro,
    `<div class="button-row">${link(inquiry, "Ověřit termín", "button")}${link("/ukazky.html", "Poslechnout kapelu", "button button-outline")}</div>`,
  )}<section class="section"><div class="container"><div class="service-detail-grid">${service.points.map(([title, text], i) => `<article><span class="service-number">0${i + 1}</span><h2>${esc(title)}</h2><p>${esc(text)}</p></article>`).join("")}</div></div></section><section class="section section-tint"><div class="container live-grid"><div>${sectionTitle("Rozhodujte se podle zvuku", "Poslechněte si<br>živý BoneSaver.", "Vyberte si kapelu podle toho, jak opravdu hraje. Na stránce ukázek najdete sestřih i jednotlivé skladby.")}${link("/ukazky.html", "Všechny ukázky")}</div>${videoCard(videos[service.key === "firemni" ? 1 : 0], true)}</div></section><section class="section"><div class="container faq-grid"><div>${sectionTitle("Před první domluvou", "Co nám napsat?")}<p>${esc(service.practical)}</p>${link(inquiry, "Připravit poptávku")}</div>${faqs(service.questions)}</div></section><section class="section section-tint"><div class="container split-content"><div><p class="eyebrow">Hudba podle vaší akce</p><h2>174 skladeb.<br>Spousta možností.</h2></div><div><p>Projděte si kompletní repertoár s vyhledáváním podle interpreta, názvu a žánru. Konkrétní skladby i délku hraní spolu domluvíme.</p>${link("/repertoar.html" + (service.key === "ples" ? "?zanr=ballroom" : ""), "Prohlédnout repertoár")}</div></div></section>${cta("Začněme vaším termínem.")}`;
}
function contact() {
  return `${pageHero("Kontakt", "Domluvme si<br><span>váš večer.</span>", "Máte termín, nápad nebo jen první otázku? Ozvěte se přímo kapele. Dostupnost i nabídku probereme společně.")}<section class="section contact-section" id="poptavka"><div class="container booking-grid"><div class="contact-details"><p class="eyebrow">Přímo na kapelníka</p><h2>Miroslav Bečička</h2><a class="big-phone" href="tel:${site.telephone}">${site.phone}</a><a class="contact-email" href="mailto:${site.email}">${site.email}</a><p>Pardubice · východní Čechy · celá ČR</p><div class="contact-card"><h3>Co domluvíme</h3><ul class="check-list"><li>Dostupnost vašeho termínu</li><li>Program a délku hraní</li><li>Ozvučení, světla a prostor</li><li>Konkrétní cenovou nabídku</li></ul></div><details class="billing"><summary>Fakturační údaje</summary><p>Ing. Miroslav Bečička<br>Do Polí 1054, 530 06 Pardubice<br>IČO: 69126887<br>DIČ: CZ7512233322<br>Plátce DPH</p></details><p class="small">${site.socials.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`).join(" · ")}</p></div><div class="form-panel"><h2>Nezávazná poptávka</h2><p>Pár základních údajů a můžeme začít domlouvat.</p>${inquiryForm()}</div></div></section><section class="section section-tint" id="otazky"><div class="container faq-grid">${sectionTitle("Prakticky a na rovinu", "Co vás často<br>zajímá")}${faqs()}</div></section>`;
}
function originalMusic() {
  const originals = songs.filter((s) => s.genre === "bonesaver");
  return `${pageHero("Vlastní tvorba", "Taky něco<br><span>z naší dílny.</span>", "BoneSaver nejsou jen převzaté hity. Do našeho repertoáru patří také 16 vlastních skladeb. Tady jsou pohromadě.")}<section class="section"><div class="container originals-layout"><div class="originals-intro"><img src="/img/optimized/logo.webp" width="800" height="450" alt="Původní logo BoneSaver s elektrickými modrými blesky" loading="lazy"><h2>Pod jménem BoneSaver</h2><p>Naše vlastní písničky mají v repertoáru své místo vedle skladeb oblíbených českých i zahraničních interpretů.</p><p>Zajímá vás vlastní tvorba na vaší akci? Napište nám a probereme podobu programu.</p>${link("/kontakt.html#poptavka", "Domluvit program s kapelou")}</div><ol class="original-songs">${originals.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><h2>${esc(s.title)}</h2><span>BoneSaver</span></li>`).join("")}</ol></div></section>${cta("Potkáme se naživo.")}`;
}
function privacy() {
  return `${pageHero("Soukromí", "Vaše údaje<br><span>při domluvě hraní.</span>", "Co se děje při přípravě poptávky, přepnutí vzhledu a přehrávání videí.")}<section class="section"><div class="container prose"><h2>Kdo vyřizuje poptávku</h2><p>Ing. Miroslav Bečička, IČO 69126887, Do Polí 1054, 530 06 Pardubice. Pro dotazy k osobním údajům použijte <a href="mailto:${site.email}">${site.email}</a>.</p><h2>Formulář připravuje e-mail</h2><p>Zadané údaje zpracuje tento prohlížeč pro sestavení textu poptávky. Samotné stisknutí „Připravit e-mail s poptávkou“ údaje kapele neodesílá. K odeslání dojde až vaším potvrzením ve vašem e-mailovém programu či službě. Údaje formuláře neukládáme do úložiště prohlížeče.</p><h2>Domluva vystoupení</h2><p>Pokud nám zprávu odešlete, použijeme její obsah a kontaktní údaje pro vyřízení vašeho dotazu, přípravu nabídky a případnou dohodu o vystoupení. Tyto kroky před uzavřením smlouvy provádíme na vaši žádost. Zprávy uchováváme po dobu potřebnou k vyřízení domluvy; při objednávce se na související doklady vztahují zákonné povinnosti. Samotná poptávka vás nepřihlašuje k marketingovým zprávám.</p><h2>Videa a externí služby</h2><p>Náhledy videí i písma se načítají přímo z tohoto webu. Teprve po kliknutí na přehrání se připojí přehrávač YouTube v režimu rozšířené ochrany soukromí. YouTube přitom může zpracovat například vaši IP adresu a informace o zařízení. <a href="https://policies.google.com/privacy?hl=cs" target="_blank" rel="noopener noreferrer">Zásady ochrany soukromí společnosti Google ↗</a></p><h2>Uložený vzhled</h2><p>Po přepnutí světlého nebo tmavého motivu si web může uložit pouze vaši volbu vzhledu do localStorage. Nepoužívá ji ke sledování. Tato verze neobsahuje analytické ani reklamní měřicí skripty.</p><h2>Vaše práva</h2><p>Můžete se na nás obrátit se žádostí o přístup k údajům, jejich opravu, výmaz nebo omezení zpracování. Podle konkrétní situace můžete mít také právo na přenositelnost nebo vznést námitku. Pokud máte za to, že s údaji není nakládáno správně, můžete kontaktovat Úřad pro ochranu osobních údajů.</p><p class="small muted">Informace odpovídají verzi formuláře s přípravou e-mailu. Aktualizováno 24. 9. 2026.</p></div></section>`;
}
const pages = [
  {
    file: "index.html",
    key: "home",
    label: "Domů",
    title: "BoneSaver | Živá kapela z Pardubic na svatby a plesy",
    description:
      "Pět muzikantů, saxofon a 174 skladeb. BoneSaver z Pardubic hraje na svatbách, plesech i firemních akcích po celé ČR. Poslechněte si nás a ověřte termín.",
    body: home(),
  },
  {
    file: "repertoar.html",
    key: "repertoar",
    label: "Repertoár",
    title: "Repertoár BoneSaver | 174 skladeb, rock, pop i plesové tance",
    description:
      "Kompletní repertoár kapely BoneSaver: 174 skladeb včetně 16 vlastních. Hledání podle názvu, interpreta a žánru, také ke stažení v PDF.",
    body: repertoire(),
  },
  {
    file: "ukazky.html",
    key: "ukazky",
    label: "Ukázky",
    title: "BoneSaver naživo | Video ukázky kapely z Pardubic",
    description:
      "Poslechněte si BoneSaver naživo. Šest video ukázek z firemních a veřejných akcí: rock, pop, české hity a saxofon.",
    body: `${pageHero("Živé ukázky", "Dejte nám<br><span>chvíli poslechu.</span>", "Sestřihy i celé skladby ze živých vystoupení. Poslechněte si kapelu tak, jak hraje před lidmi.")}<section class="section"><div class="container">${videoCard(videos[0], true, 2)}<div class="video-grid">${videos
      .slice(1)
      .map((v) => videoCard(v, false, 2))
      .join(
        "",
      )}</div><p class="center">Další nahrávky najdete na <a href="${site.socials[2][1]}" target="_blank" rel="noopener noreferrer">našem YouTube kanálu ↗</a>.</p></div></section>${cta("Sedí vám náš zvuk?")}`,
  },
  {
    file: "o-nas.html",
    key: "o-nas",
    label: "O kapele",
    title: "O kapele BoneSaver | Pět muzikantů z Pardubic",
    description:
      "Poznejte pětičlennou kapelu BoneSaver z Pardubic. Kytary, saxofon, klávesy, basa, bicí a tři zpěvy. Známé hity i vlastní tvorba.",
    body: about(),
  },
  {
    file: "kontakt.html",
    key: "kontakt",
    label: "Kontakt",
    title: "Kontakt a poptávka kapely | BoneSaver Pardubice",
    description:
      "Ověřte termín kapely BoneSaver pro svatbu, ples nebo firemní akci. Telefon +420 734 393 711, e-mail bonesavermusic@gmail.com. Domluva přímo s kapelou.",
    body: contact(),
  },
  ...services.map((s) => ({
    file: s.file,
    key: s.key,
    label: s.label,
    title: s.title,
    description: s.intro,
    body: servicePage(s),
  })),
  {
    file: "vlastni-tvorba.html",
    key: "tvorba",
    label: "Vlastní tvorba",
    title: "Vlastní tvorba BoneSaver | 16 autorských skladeb",
    description:
      "Vlastní písně kapely BoneSaver z Pardubic. Prohlédněte si 16 skladeb z našeho repertoáru a domluvte si program na vaši akci.",
    body: originalMusic(),
  },
  {
    file: "soukromi.html",
    key: "soukromi",
    label: "Soukromí",
    title: "Soukromí a kontaktní údaje | BoneSaver",
    description:
      "Informace o přípravě e-mailové poptávky, ochraně osobních údajů, uloženém vzhledu a přehrávání videí na webu BoneSaver.",
    body: privacy(),
  },
  {
    file: "404.html",
    key: "404",
    label: "Stránka nenalezena",
    title: "Tady už dohráno | BoneSaver",
    description:
      "Tuto stránku jsme nenašli. Vraťte se na web kapely BoneSaver, poslechněte si ukázky nebo nám napište.",
    body: `${pageHero("404 · Stránka nenalezena", "Tady už<br><span>dohráno.</span>", "Tenhle odkaz nikam nevede. Hudba ale pokračuje — vraťte se na úvod, pusťte si ukázku nebo nám napište.", `<div class="button-row">${link("/", "Zpátky na úvod", "button")}${link("/kontakt.html", "Kontakt na kapelu", "button button-outline")}</div>`)}`,
  },
];
for (const page of pages)
  await writeFile(
    new URL(page.file, root),
    shell(page).replace(/^[\t ]+$/gm, ""),
  );
await writeFile(
  new URL("sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => p.key !== "404")
    .map(
      (p) =>
        `  <url><loc>${site.url}${p.file === "index.html" ? "/" : "/" + p.file}</loc><lastmod>2026-09-24</lastmod></url>`,
    )
    .join("\n")}\n</urlset>\n`,
);
await writeFile(
  new URL("robots.txt", root),
  `User-agent: *\nAllow: /\nDisallow: /_dev/\n\nSitemap: ${site.url}/sitemap.xml\n`,
);
console.log(
  `Built ${pages.length} static pages; ${songs.length} repertoire entries preserved. No deployment performed.`,
);
