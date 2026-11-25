// Al HTML til sitet. Tekster rettes her; tal, heste og resultater kommer fra data/travinfo.json.
import { existsSync } from 'node:fs';

export const SITE = {
  // ← Domænet er ikke valgt endnu; indtil da GitHub Pages (kan også sættes med miljøvariablen SITE_URL). På Vercel bruges projektets adresse.
  url: (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL) || 'https://mikkelgamer1.github.io/stald-mathias-jensen').replace(/\/$/, ''),
  navn: 'Mathias Jensen', // ← staldnavn, hvis Mathias bruger et
  fornavn: 'Mathias',
  licens: 505281,
  // Telefon og adresse fra Dansk Hestevæddeløbs licensregister (tjekket 25.11.2026); Mathias har sagt ok til, at de står på siden.
  telefon: '+45 24 21 11 18',
  email: '',  // ← mangler
  firma: '',  // ← mangler: navn og CVR skal stå på siden efter e-handelsloven § 7, hvis han driver virksomhed
  cvr: '',    // ← mangler
  gade: 'Rold Bavnehøjvej 2',
  postnr: '9510',
  by: 'Arden',
  travinfo: 'https://travinfo.dk/licenseholder-tabs/505281',
  kort: 'https://www.google.com/maps/search/?api=1&query=Rold+Bavneh%C3%B8jvej+2%2C+9510+Arden',
};
// Felter, der mangler, før siden kan gå live – build.mjs skriver dem ud ved hver bygning.
export const MANGLER = [!SITE.email && 'e-mail', !SITE.cvr && 'CVR og firmanavn', 'fotos', 'domæne'].filter(Boolean);

// Billeder af enkelte heste (hest-id fra Travinfo → [filnavn i assets/img, evt. fokuspunkt]).
// Forlader hesten træningslisten, forsvinder kortet af sig selv.
const HESTEFOTO = {};

// Heste, der stadig står på den officielle træningsliste, men ikke skal vises.
const UDELAD = new Set([
  643041, // Fit For Fight er død (Mathias til travservice.dk 24.11.2026)
]);

// Kun rigtige, uredigerede fotos – ingen AI. Mathias' Facebook bruges ikke; fotos skal komme fra Mathias selv.
// Originalerne lægges i originaler/ (kun lokalt). Den største bredde er originalfilen uændret;
// de mindre er kun skaleret ned. Udsnittet på siden vælges med CSS (object-position), ikke i filen.
// navn: [forhold bredde/højde, ...bredder]
const BILLEDER = {};
// Fotos, siden mangler: navn → [forhold, hvad fotoet skal vise]. Indtil fotoet er lagt ind i BILLEDER,
// vises en pladsholder med teksten – listen kan sendes direkte til Mathias.
const OENSKER = {
  'hero': [1.5, 'Mathias i sulkyen i grøn/sort dragt, gerne i fart (liggende)'],
  'mathias': [0.8, 'Portræt af Mathias – i dragten eller ved en hest'],
  'portraet': [0.8, 'Nærbillede af Mathias'],
  'resultater': [1.5, 'Fra et løb (liggende)'],
  'loeb': [1.5, 'Fra et løb, fx Aalborg (liggende)'],
  'stald': [0.75, 'Stalden i Arden eller en af hestene'],
  'heste': [0.75, 'Kasino eller en anden hest fra stalden'],
  'kontakt': [0.75, 'Stemningsbillede fra stalden eller banen'],
  'baand': [1.5, 'En hest i træning eller på folden (liggende)'],
};
// Udkast: fotos af Mathias fundet via Google på banernes og travmediernes egne sider – hentet uredigeret, som de ligger der.
// Ophavsretten ligger hos fotograferne. Mappen assets/udkast/ står i .gitignore og .vercelignore, så filerne kommer
// aldrig på nettet (der vises pladsholdere i stedet), før fotografen har givet lov og fotoet er lagt ind i BILLEDER.
const UDKAST_FOTOS = {
  karlo: ['karlo-ole-hindby.jpg', 'Ole Hindby', 3309, 2311, 'Karlo, Jydsk Væddeløbsbane 24/7-2026 (jvb-aarhus.dk)'],
  lulu: ['lulu-ole-hindby.jpg', 'Ole Hindby', 3829, 2538, 'Lulu, Jydsk Væddeløbsbane 12/7-2025 (jvb-aarhus.dk)'],
  pokaler: ['pokaler-burt-seeger.jpg', 'Burt Seeger', 800, 528, 'Amatør Grand Prix, Charlottenlund 2022 (travet.dk)'],
  kasino: ['kasino-travet.jpg', 'Ole Hindby eller KM Foto', 800, 532, 'Kasino, Odense 4/7-2025 (travet.dk) – kusk er Frederik Kragh Olsen, så den bruges ikke'],
  smil: ['smil-2021-hesselborg.jpg', 'Hesselborg Foto', 800, 533, 'Mathias med vinderbuket, Aalborg 2021 (travet.dk)'],
  buket: ['buket-2021-hesselborg.jpg', 'Hesselborg Foto', 800, 533, 'Mathias med vinderbuket, Aalborg 2021 (travet.dk)'],
  nr9: ['nr9-2023-hesselborg.jpg', 'Hesselborg Foto', 800, 533, 'Mathias i løb, Aalborg december 2023 (travet.dk)'],
  liga: ['liga-2026-hesselborg.jpg', 'Hesselborg Foto', 800, 533, 'Liga, Aalborg 9/10-2026 (travet.dk)'],
  fitforfight: ['fitforfight-2024-hesselborg.jpg', 'Hesselborg Foto', 800, 533, 'Fit For Fight, Aalborg 2/7-2024 (travet.dk) – bruges ikke, hesten er død'],
  kasinoSigter: ['kasino-sigter-ole-hindby.jpg', 'Ole Hindby', 800, 532, 'Kasino efter sejren i Sigter mod stjernerne, Aarhus 28/6-2025 (travet.dk) – kusk er Frederik Kragh Olsen, så den bruges ikke'],
};
// Hvilket foto der vises hvor (felt → foto)
const UDKAST_FELT = { hero: 'karlo', mathias: 'pokaler', portraet: 'smil', loeb: 'liga', resultater: 'lulu', heste: 'karlo', baand: 'lulu', kontakt: 'buket', stald: 'nr9' };
const UDKAST = Object.fromEntries(Object.entries(UDKAST_FELT).map(([felt, foto]) => [felt, UDKAST_FOTOS[foto]]).filter(([, u]) => existsSync(new URL(`./assets/udkast/${u[0]}`, import.meta.url))));
// Fokuspunkt for fotos, hvor motivet ikke står i midten (bruges, når feltet har en anden form end fotoet).
const FOKUS = {};

const BANER = { Sk: 'Skive', 'Ål': 'Aalborg', 'År': 'Aarhus', Od: 'Odense', Ch: 'Charlottenlund', Bi: 'Billund', Bh: 'Bornholm', Ny: 'Nykøbing F.', Bs: 'Skovbo', Kl: 'Klampenborg' };
// Banernes omtrentlige placering [længdegrad, breddegrad] til det skematiske Danmarkskort (Bornholm ligger uden for kortet).
const BANE_POS = { Sk: [9.06, 56.56], 'Ål': [9.87, 57.05], 'År': [10.2, 56.14], Od: [10.36, 55.4], Ch: [12.58, 55.75], Bi: [9.12, 55.73], Ny: [11.87, 54.77], Bs: [12.03, 55.46], Kl: [12.59, 55.77], stald: [9.86, 56.77] };
const HJEMME = 'Ål'; // hjemmebanen: Spar Nord Arena Aalborg
const NAV = [['om-mathias/', 'Om Mathias'], ['heste/', 'Heste'], ['resultater/', 'Resultater']];

// ---------- små hjælpere ----------

let R = ''; // sti tilbage til roden fra den side, der bygges
let V = ''; // versionsmærke til css/js
let KORT;   // Danmarks omrids og projektionstal fra data/danmark.json

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nf = (n) => Number(n).toLocaleString('da-DK');
const kr = (n) => `${nf(n)}&nbsp;kr.`;
const d = (iso) => new Date(`${String(iso).slice(0, 10)}T12:00:00Z`);
const langDato = (iso) => new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d(iso));
const kortDato = (iso) => new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d(iso));
const ugedag = (iso) => new Intl.DateTimeFormat('da-DK', { weekday: 'long', timeZone: 'UTC' }).format(d(iso));
const dkListe = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} og ${a.at(-1)}`);
const bane = (kode) => BANER[kode] ?? kode;
const tlfLink = SITE.telefon.replace(/\s/g, '');

/** "16,0a" → "1.16,0a". Tomt, hvis der ikke er en tid (fx galop uden tid). */
export const tid = (t) => (/^\d\d,\d/.test(t ?? '') ? `1.${t}` : '');

/** Hurtigste tid i en rekordstreng som "18,7k 14,3m *12,2am" → "1.12,2am". */
export const bedsteRekord = (mark) => {
  const tider = String(mark ?? '').replace(/\*/g, '').split(/\s+/).filter((x) => /^\d\d,\d/.test(x));
  tider.sort((a, b) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.')));
  return tider.length ? `1.${tider[0]}` : '';
};

/** Placering som den vises: 1, 2, 3 … "–" for uplaceret, "disk." for diskvalificeret. */
export const plac = (p) => (/^[1-9]\d*$/.test(p) ? p : p === 'd' ? 'disk.' : '–');

const pil = '<svg class="pil" viewBox="0 0 22 10" width="22" height="10" aria-hidden="true"><path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const ud = '<svg class="ud" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1 9 9 1M3 1h6v6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const nyFane = '<span class="sr"> (åbner i ny fane)</span>';
const ekstern = (href, tekst, cls = 'laes') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${tekst} ${ud}${nyFane}</a>`;
const knap = (href, tekst, cls = '') => `<a class="knap ${cls}" href="${R}${href}">${tekst} ${pil}</a>`;
const laes = (href, tekst) => `<a class="laes" href="${R}${href}">${tekst} ${pil}</a>`;

const forhold = (navn) => BILLEDER[navn]?.[0] ?? (UDKAST[navn] ? UDKAST[navn][2] / UDKAST[navn][3] : OENSKER[navn]?.[0] ?? 1.5);
const billedsti = (navn, w) => `${R}assets/img/${navn}-${w}.jpg`;
const srcset = (navn) => (BILLEDER[navn] ?? [1]).slice(1).map((w) => `${billedsti(navn, w)} ${w}w`).join(', ');
const img = (navn, alt, { sizes = '100vw', lazy = true, pos = FOKUS[navn] } = {}) => {
  if (!BILLEDER[navn] && UDKAST[navn]) { // lokalt udkast-foto (kun på egen maskine)
    return `<img src="${R}assets/udkast/${UDKAST[navn][0]}" width="${UDKAST[navn][2]}" height="${UDKAST[navn][3]}" alt="${esc(alt)}"${pos ? ` style="object-position:${pos}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
  }
  if (!BILLEDER[navn]) { // fotoet er ikke kommet endnu: pladsholder med en beskrivelse af det ønskede foto
    const [forhold, oenske] = OENSKER[navn] ?? [1, alt];
    return `<span class="mangler" style="--r:${forhold}" role="img" aria-label="Pladsholder: ${esc(oenske)}"><span class="mangler__tekst" aria-hidden="true"><b>Foto følger</b>${esc(oenske)}</span></span>`;
  }
  const [forhold, ...bredder] = BILLEDER[navn];
  const max = bredder.at(-1);
  return `<img src="${billedsti(navn, bredder[Math.min(1, bredder.length - 1)])}" srcset="${srcset(navn)}" sizes="${sizes}" width="${max}" height="${Math.round(max / forhold)}" alt="${esc(alt)}"${pos ? ` style="object-position:${pos}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
};
const figur = (navn, alt, tekst, opt) => `<figure class="figur"><div class="billede" data-vis="billede">${img(navn, alt, opt)}</div>${tekst ? `<figcaption>${tekst}</figcaption>` : ''}</figure>`;

// ---------- afledte tal ----------

function afled(data, idag) {
  const heste = data.heste.filter((h) => !UDELAD.has(h.id)).sort((a, b) => b.praemier - a.praemier || a.navn.localeCompare(b.navn, 'da'));
  const navne = new Map(heste.map((h) => [h.id, h.navn]));
  const medNavn = (r) => ({ ...r, hest: navne.get(r.hestId) ?? r.hest });
  const saeson = data.traenerStatistik.find((s) => s.sejre > 0) ?? data.traenerStatistik.find((s) => s.starter > 0) ?? data.traenerStatistik[0];
  const kusk = data.kuskStatistik.find((s) => s.aar === saeson.aar) ?? data.kuskStatistik[0];
  // Som kusk: den seneste sæson med starter (Mathias kører mest for andre trænere).
  const kuskSaeson = data.kuskStatistik.find((s) => s.starter > 0) ?? data.kuskStatistik[0];
  const kuskIAar = (data.kuskResultater ?? []).filter((r) => r.dato.startsWith(String(kuskSaeson.aar)));
  const antalPrBane = {};
  for (const r of kuskIAar) antalPrBane[r.bane] = (antalPrBane[r.bane] ?? 0) + 1;
  const banetal = Object.entries(antalPrBane).sort((a, b) => b[1] - a[1]).map(([kode, antal]) => ({ kode, navn: bane(kode), antal }));
  const sum = (liste, felt) => liste.reduce((t, s) => t + s[felt], 0);
  const kuskAar = data.kuskStatistik.filter((s) => s.starter > 0);
  const traenerAar = data.traenerStatistik.filter((s) => s.starter > 0);
  return {
    heste,
    saeson,
    kusk,
    kuskSaeson,
    opdateret: langDato(data.opdateret),
    seneste: data.resultater.slice(0, 10).map(medNavn),
    kommende: data.kommende.filter((k) => k.dato >= idag).map(medNavn),
    kuskSeneste: (data.kuskResultater ?? []).slice(0, 10),
    kuskKommende: (data.kuskKommende ?? []).filter((k) => k.dato >= idag),
    banerIAar: banetal.map((b) => b.navn),
    banetal,
    hjemmestarter: antalPrBane[HJEMME] ?? 0,
    kuskIalt: { aar: kuskAar.length, starter: sum(kuskAar, 'starter'), sejre: sum(kuskAar, 'sejre') },
    traenerAar: traenerAar.length,
    bedsteTraenerAar: [...traenerAar].sort((a, b) => b.sejre - a.sejre || b.praemier - a.praemier)[0],
    ungheste: heste.filter((h) => h.alder <= 2),
    aldre: [Math.min(...heste.map((h) => h.alder)), Math.max(...heste.map((h) => h.alder))],
    fotoheste: heste.filter((h) => HESTEFOTO[h.id]),
  };
}

// ---------- fælles dele ----------

// Intet logo endnu: navnet sat med skrift som ordmærke. ← Skift til et logo, hvis Mathias har et.
const logo = (cls = '') => `<span class="ordmaerke ${cls}">Mathias <em>Jensen</em></span>`;

const top = (sti) => `
<header class="top">
  <div class="top__inner wrap">
    <nav class="top__nav" aria-label="Primær navigation">
      ${NAV.map(([href, navn]) => `<a href="${R}${href}"${sti.startsWith(href) ? ' aria-current="page"' : ''}>${navn}</a>`).join('\n      ')}
    </nav>
    <a class="top__logo" href="${R || './'}" aria-label="${SITE.navn} – til forsiden">${logo()}</a>
    <div class="top__cta">
      <a class="top__tlf" href="tel:${tlfLink}">${SITE.telefon}</a>
      <a class="knap knap--lys knap--lille" href="${R}kontakt/"${sti.startsWith('kontakt/') ? ' aria-current="page"' : ''}>Kontakt Mathias</a>
    </div>
    <button class="burger" type="button" aria-haspopup="dialog" aria-controls="menu" commandfor="menu" command="show-modal"><span>Menu</span><i aria-hidden="true"></i></button>
  </div>
</header>
<dialog class="menu" id="menu" aria-label="Menu">
  <div class="menu__top wrap">
    <a class="top__logo" href="${R || './'}" aria-label="${SITE.navn} – til forsiden">${logo()}</a>
    <button class="burger burger--luk" type="button" data-luk commandfor="menu" command="close"><span>Luk</span><i aria-hidden="true"></i></button>
  </div>
  <nav class="menu__nav wrap" aria-label="Menu">
    <ul>
      ${[['', 'Forside'], ...NAV, ['kontakt/', 'Kontakt']].map(([href, navn], i) => `<li style="--i:${i}"><a href="${R}${href || (R ? '' : './')}"${(href ? sti.startsWith(href) : sti === '') ? ' aria-current="page"' : ''}><small>0${i + 1}</small>${navn}</a></li>`).join('\n      ')}
    </ul>
  </nav>
  <div class="menu__bund wrap">
    <a href="tel:${tlfLink}">${SITE.telefon}</a>${SITE.email ? `
    <a href="mailto:${SITE.email}">${SITE.email}</a>` : ''}
    <p><a href="${SITE.travinfo}" target="_blank" rel="noopener">Travinfo</a></p>
  </div>
</dialog>`;

const kontaktbaand = () => `
<section class="slut">
  <div class="wrap slut__inner">
    <p class="oje" data-vis>Kontakt</p>
    <h2 data-vis style="--i:1">Skal din hest <em>til start?</em></h2>
    <p class="slut__tekst" data-vis style="--i:2">Ring eller skriv til Mathias – om en kusk til næste løb eller om træning.</p>
    <div class="slut__valg" data-vis style="--i:3">
      ${knap('kontakt/', 'Kontakt Mathias', 'knap--lys')}
      <a class="slut__tlf" href="tel:${tlfLink}">${SITE.telefon}</a>
    </div>
  </div>
</section>`;

const bund = (o) => `
<footer class="bund">
  <div class="wrap bund__gitter">
    <div class="bund__brand">
      ${logo('bund__logo')}
      <p>Professionel travkusk og træner med A1-licens. Hjemmebane: Spar Nord Arena Aalborg.</p>
    </div>
    <nav aria-label="Sider">
      <h2>Sider</h2>
      <ul>
        ${[...NAV, ['kontakt/', 'Kontakt']].map(([href, navn]) => `<li><a href="${R}${href}">${navn}</a></li>`).join('')}
      </ul>
    </nav>
    <div>
      <h2>Kontakt</h2>
      <ul>
        <li><a href="tel:${tlfLink}">${SITE.telefon}</a></li>${SITE.email ? `
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>` : ''}
        <li><address>${SITE.gade}<br>${SITE.postnr} ${SITE.by}</address></li>
      </ul>
    </div>
    <div>
      <h2>Følg Mathias</h2>
      <ul>
        <li>${ekstern(SITE.travinfo, 'Travinfo', '')}</li>
      </ul>
    </div>
  </div>
  <div class="wrap bund__linje">
    <p>Hjemmebane: Spar Nord Arena Aalborg</p>
    <p>Resultater og statistik: Dansk Hestevæddeløb · opdateret ${o.opdateret}</p>
    <p>© ${new Date().getFullYear()} ${SITE.navn}${SITE.firma ? ` · ${SITE.firma}` : ''}${SITE.cvr ? ` · CVR ${SITE.cvr}` : ''}</p>
    <p class="bund__niveo"><a href="https://niveo.dk" target="_blank" rel="noopener">Hjemmeside af <img src="${R}assets/img/niveo-logo.webp" width="1400" height="299" alt="Niveo" loading="lazy" decoding="async">${nyFane}</a></p>
  </div>
</footer>`;

const OG = BILLEDER.hero ? 'assets/img/og.jpg' : ''; // ← og.jpg laves af hero-fotoet, når det er kommet
const organisation = () => ({
  '@type': ['LocalBusiness', 'SportsOrganization'],
  '@id': `${SITE.url}/#stald`,
  name: SITE.navn,
  description: 'Professionel travkusk og træner med A1-licens og Spar Nord Arena Aalborg som hjemmebane.',
  url: `${SITE.url}/`,
  telephone: tlfLink,
  ...(SITE.email ? { email: SITE.email } : {}),
  ...(OG ? { image: `${SITE.url}/${OG}` } : {}),
  sport: 'Travsport',
  address: { '@type': 'PostalAddress', streetAddress: SITE.gade, postalCode: SITE.postnr, addressLocality: SITE.by, addressCountry: 'DK' },
  founder: { '@id': `${SITE.url}/#mathias` },
  sameAs: [SITE.travinfo],
});
const person = () => ({
  '@type': 'Person',
  '@id': `${SITE.url}/#mathias`,
  name: 'Mathias Jensen',
  jobTitle: 'Professionel travkusk og træner',
  url: `${SITE.url}/om-mathias/`,
  worksFor: { '@id': `${SITE.url}/#stald` },
  sameAs: [SITE.travinfo],
});

function layout({ sti, titel, beskrivelse, indhold, o, klasse = '', noindex = false, ekstraLd = [] }) {
  const kanonisk = `${SITE.url}/${sti}`;
  const sideNavn = [...NAV, ['kontakt/', 'Kontakt']].find(([href]) => href === sti)?.[1];
  const graf = [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.navn, inLanguage: 'da-DK' },
    organisation(),
    person(),
    ...(sideNavn ? [{ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Forside', item: `${SITE.url}/` }, { '@type': 'ListItem', position: 2, name: sideNavn, item: kanonisk }] }] : []),
    ...ekstraLd,
  ];
  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beskrivelse)}">
${noindex ? '<meta name="robots" content="noindex">' : '<link rel="canonical" href="' + kanonisk + '">'}
<meta name="theme-color" content="#0b1410">
<meta property="og:type" content="website">
<meta property="og:locale" content="da_DK">
<meta property="og:site_name" content="${SITE.navn}">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beskrivelse)}">
<meta property="og:url" content="${kanonisk}">
${OG ? `<meta property="og:image" content="${SITE.url}/${OG}">
<meta property="og:image:alt" content="Mathias Jensen i sulkyen">
<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<link rel="icon" type="image/svg+xml" href="${R}assets/img/ikon.svg">
<link rel="preload" href="${R}assets/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${R}assets/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${R}assets/css/site.css?v=${V}">
<script>document.documentElement.classList.add('js');setTimeout(function(){window.__klar||document.documentElement.classList.remove('js')},2500)</script>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graf }).replace(/</g, '\\u003c')}</script>
</head>
<body class="${klasse}">
<a class="skip" href="#indhold">Spring til indhold</a>
${top(sti)}
<main id="indhold">
${indhold}
</main>
${bund(o)}
<script src="${R}assets/js/site.js?v=${V}" defer></script>
</body>
</html>
`;
}

// Sidehoved. Normalt vises hele det høje billede (`billede`) til højre uden noget ovenpå, med teksten ved siden af.
// Har siden også et bredt billede (`bred`), fylder det hele feltet på liggende skærme med teksten ovenpå.
// På smalle og stående skærme ligger det høje billede altid bag teksten.
// `helt`: på liggende skærme får sidehovedet samme format som det brede billede, så fotoet ses i fuld størrelse.
// Et tal under 1 (fx .9) er den del af fotoets højde, der vises – resten skæres af i bunden med posBred '50% 0%'.
const sidehoved = ({ oje, h1, tekst, billede, bred, alt, pos = '50% 30%', posBred = '50% 30%', kredit = '', helt = false }) => `
<section class="sidehoved${bred ? ' sidehoved--fuld' : ''}${bred && helt ? ' sidehoved--helt' : ''}"${bred && helt ? ` style="--ratio:${(forhold(bred) / (helt === true ? 1 : helt)).toFixed(3)}"` : ''}>
  <picture class="sidehoved__billede" style="--pos:${pos};--pos-bred:${posBred}">${bred ? `
    <source media="(max-aspect-ratio: 1/1)" srcset="${srcset(billede)}" sizes="100vw">` : ''}
    ${img(bred ?? billede, alt, { sizes: bred ? '100vw' : '(min-width: 961px) 50vw, 100vw', lazy: false, pos: null })}
  </picture>
  <div class="wrap">
    <div class="sidehoved__tekst">
      <nav class="sti" aria-label="Brødkrumme"><a href="${R}">Forside</a><span aria-hidden="true">/</span><span aria-current="page">${oje}</span></nav>
      <h1>${h1}</h1>
      <p class="indled">${tekst}</p>
    </div>
  </div>${kredit ? `
  <p class="sidehoved__kredit">${esc(kredit)}</p>` : ''}
</section>`;

/**
 * Skematisk Danmarkskort. `punkter` er [{ kode, navn, antal? }]: med antal tegnes en boble med tallet i,
 * uden antal en lille prik. Hjemmebanen (Aalborg) får en ring, og der tegnes linjer derfra til de andre baner.
 */
function danmarkskort(punkter, beskrivelse) {
  const { bredde, hoejde, lon0, lat1, kx, ky, sti } = KORT;
  const max = Math.max(1, ...punkter.map((p) => p.antal ?? 0));
  const vist = punkter.filter((p) => BANE_POS[p.kode]).map((p) => {
    const [lon, lat] = BANE_POS[p.kode];
    const r = p.antal ? +(8 + 6 * Math.sqrt(p.antal / max)).toFixed(1) : 7;
    return { ...p, x: +((lon - lon0) * kx).toFixed(1), y: +((lat1 - lat) * ky).toFixed(1), r, ydre: p.kode === HJEMME ? r + (p.antal ? 4 : 6) : r };
  });
  const hjem = vist.find((p) => p.kode === HJEMME);
  const ruter = hjem ? vist.filter((p) => p !== hjem) : [];

  // Navnet sættes dér, hvor det bedst holder sig inden for kortet og fri af ruter og andre baner.
  const navn = (p) => {
    const w = p.navn.length * 6.4, m = p.ydre + 6;
    const steder = [['start', p.x + m, p.y + 3.7], ['middle', p.x, p.y + m + 9], ['end', p.x - m, p.y + 3.7], ['end', Math.min(p.x + p.ydre, bredde - 4), p.y + m + 9], ['middle', p.x, p.y - m - 2]];
    const straf = ([anker, x, y]) => { // 100 for at stikke ud over kortet, 10 for at ramme en rute eller en anden bane
      const x0 = (anker === 'start' ? x : anker === 'end' ? x - w : x - w / 2) - 3, x1 = x0 + w + 6, y0 = y - 12, y1 = y + 4;
      const inde = (px, py, luft = 0) => px > x0 - luft && px < x1 + luft && py > y0 - luft && py < y1 + luft;
      const udenfor = x0 < 0 || x1 > bredde || y0 < 0 || y1 > hoejde;
      const rammer = vist.some((q) => q !== p && inde(q.x, q.y, q.ydre))
        || ruter.some((q) => { for (let t = 0; t <= 1; t += 0.02) if (inde(hjem.x + (q.x - hjem.x) * t, hjem.y + (q.y - hjem.y) * t)) return true; return false; });
      return (udenfor ? 100 : 0) + (rammer ? 10 : 0);
    };
    // Hjemmebanen helst til venstre, uden for viften af ruter. Ved lige straf vinder det første sted på listen.
    const [anker, x, y] = (p === hjem ? [steder[2], ...steder] : steder).map((sted, i) => [straf(sted) + i / 100, sted]).sort((a, b) => a[0] - b[0])[0][1];
    return `<text class="kort__navn" x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" text-anchor="${anker}">${esc(p.navn)}</text>`;
  };

  return `<svg class="kort__svg" viewBox="0 0 ${bredde} ${hoejde}" role="img" aria-label="${esc(beskrivelse)}">
        <path class="kort__land" d="${sti}"/>${ruter.map((p, i) => `
        <path class="kort__rute" pathLength="1" d="M${hjem.x},${hjem.y}L${p.x},${p.y}" style="--n:${i}"/>`).join('')}${vist.map((p, i) => `
        <g class="kort__bane" style="--n:${i}">${p === hjem ? `<circle class="kort__ring" cx="${p.x}" cy="${p.y}" r="${p.ydre}"/>` : ''}<circle class="kort__prik" cx="${p.x}" cy="${p.y}" r="${p.r}"/>${p.antal ? `<text class="kort__tal" x="${p.x}" y="${+(p.y + 3.3).toFixed(1)}" text-anchor="middle">${p.antal}</text>` : ''}${navn(p)}</g>`).join('')}
      </svg>`;
}

const placMaerke = (r) => `<li class="res__pl${r.placering === '1' ? ' res__pl--1' : /^[23]$/.test(r.placering) ? ' res__pl--23' : r.placering === 'd' ? ' res__pl--tekst' : ''}"><span class="sr">${esc(r.hest)}: </span>${plac(r.placering)}</li>`;

// ---------- genbrugte blokke ----------

const resultatRaekke = (r) => `
      <li class="res__r">
        <time datetime="${r.dato}">${kortDato(r.dato)}</time>
        <span class="res__pl${r.placering === '1' ? ' res__pl--1' : /^[23]$/.test(r.placering) ? ' res__pl--23' : r.placering === 'd' ? ' res__pl--tekst' : ''}"><span class="sr">Placering: </span>${plac(r.placering)}</span>
        <span class="res__hest">${esc(r.hest)}</span>
        <span class="res__bane">${esc(bane(r.bane))} · ${nf(r.distance)}&nbsp;m</span>
        <span class="res__tid">${tid(r.tid) || '<span aria-hidden="true">–</span><span class="sr">ingen tid</span>'}</span>
        <span class="res__kr">${r.praemie ? kr(r.praemie) : '<span aria-hidden="true">–</span><span class="sr">ingen præmie</span>'}</span>
      </li>`;
const resultatliste = (liste) => `<ol class="res">${liste.map(resultatRaekke).join('')}
    </ol>`;

const kommendeListe = (liste) => `<ul class="kom">${liste.map((k) => `
      <li>
        <time datetime="${k.dato}"><b>${kortDato(k.dato)}</b> ${ugedag(k.dato)}</time>
        <span class="kom__hest">${esc(k.hest)}</span>
        <span class="kom__bane">${esc(bane(k.bane))} · ${k.loeb}. løb${k.kusk ? ` · ${esc(k.kusk)}` : ''}${k.traener ? ` · tr. ${esc(k.traener)}` : ''}</span>
      </li>`).join('')}
    </ul>`;

const omHest = (h) => `${h.alder}-årig ${esc(h.koen.toLowerCase())}`;
const afstamning = (h) => (h.far ? `e. ${esc(h.far)} – ${esc(h.mor)}` : '');
const sejre = (h) => Number(h.placeringer.split('-')[0]) || 0;

const hestekort = (h, href, eksternt) => `
      <a class="kort" href="${href}"${eksternt ? ' target="_blank" rel="noopener"' : ''}>
        <div class="billede" data-vis="billede">${img(HESTEFOTO[h.id][0], `Travhesten ${h.navn}`, { sizes: '(min-width: 1000px) 22vw, (min-width: 640px) 45vw, 72vw', pos: HESTEFOTO[h.id][1] })}</div>
        <h3>${esc(h.navn)}</h3>
        <p>${omHest(h)} · ${afstamning(h)}</p>
        <p class="kort__tal">${!h.starter ? 'Ustartet' : `${kr(h.praemier)} · ${sejre(h) ? `${sejre(h)} ${sejre(h) === 1 ? 'sejr' : 'sejre'}` : `${h.starter} ${h.starter === 1 ? 'start' : 'starter'}`}`}${eksternt ? nyFane : ''}</p>
      </a>`;

const flertal = (n, en, flere) => `${n} ${n === 1 ? en : flere}`;

const ydelser = (o) => `
    <ol class="ydelser ydelser--to">
      <li data-vis>
        <span class="ydelser__nr">01</span>
        <h3>Kusk til din hest</h3>
        <p>Mathias kører løb for trænere rundt i landet. I ${o.kuskSaeson.aar} er det blevet til ${o.kuskSaeson.starter} starter${o.banerIAar.length ? ` i ${dkListe(o.banerIAar)}` : ''}.</p>
      </li>
      <li data-vis style="--i:1">
        <span class="ydelser__nr">02</span>
        <h3>Træning af løbsheste</h3>
        <p>En lille stald i ${SITE.by} med ${flertal(o.heste.length, 'hest', 'heste')} i træning lige nu og Spar Nord Arena Aalborg som hjemmebane.</p>
      </li>
    </ol>`;

const ejerbaand = () => `
<section class="baand">
  <picture class="baand__billede">
    ${img('baand', 'Mathias Jensen bag Lulu på Jydsk Væddeløbsbane')}
  </picture>
  <div class="wrap baand__tekst">
    <p class="oje" data-vis>For trænere og hesteejere</p>
    <h2 data-vis style="--i:1">Mangler din hest <em>en kusk?</em></h2>
    <p data-vis style="--i:2">Skal din hest have en kusk til næste start, eller har du en hest, der skal i træning? Ring eller skriv – så tager Mathias gerne en snak om mulighederne.</p>
    <p data-vis style="--i:3">${knap('kontakt/', 'Kontakt Mathias', 'knap--lys')}</p>
  </div>
</section>`;

const statTabel = (titel, raekker) => `
      <div class="tabelboks" role="region" aria-label="${titel}" tabindex="0">
        <table class="tabel">
          <caption>${titel}</caption>
          <thead><tr><th scope="col">År</th><th scope="col">Starter</th><th scope="col">1.–2.–3.</th><th scope="col">Sejrs&shy;procent</th><th scope="col">Præmiesum</th></tr></thead>
          <tbody>${raekker.filter((s) => s.starter > 0).map((s) => `
            <tr><th scope="row">${s.aar}</th><td>${s.starter}</td><td>${s.sejre}–${s.toer}–${s.treer}</td><td>${s.procent}&nbsp;%</td><td>${kr(s.praemier)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;

// ---------- sider ----------

const forside = (o, data) => `
<section class="hero">
  <picture class="hero__billede">
    ${img('hero', 'Mathias Jensen i grøn dragt bag Karlo på Jydsk Væddeløbsbane', { lazy: false })}
  </picture>
  <div class="wrap hero__tekst">
    <p class="oje" style="--i:0">Travkusk og træner · Aalborg</p>
    <h1><span class="hero__navn" style="--i:1">Mathias <em>Jensen</em></span> <span class="hero__titel" style="--i:2">Professionel travkusk og træner</span></h1>
    <p class="hero__indled" style="--i:3">A1-licens som både kusk og træner. I ${o.kuskSaeson.aar} har Mathias kørt ${o.kuskSaeson.starter} løb og vundet ${o.kuskSaeson.sejre} – med Spar Nord Arena Aalborg som hjemmebane.</p>
    <p class="hero__valg" style="--i:4">${knap('kontakt/', 'Kontakt Mathias', 'knap--lys')} ${laes('resultater/', 'Se resultater')}</p>
  </div>
  <div class="hero__tal">
    <dl class="wrap">
      <div><dt>Starter som kusk i ${o.kuskSaeson.aar}</dt><dd>${o.kuskSaeson.starter}</dd></div>
      <div><dt>Sejre som kusk i ${o.kuskSaeson.aar}</dt><dd>${o.kuskSaeson.sejre}</dd></div>
      <div><dt>Indkørt som kusk i ${o.kuskSaeson.aar}</dt><dd>${nf(o.kuskSaeson.praemier)}<small>&nbsp;kr.</small></dd></div>
      <div><dt>Heste i træning</dt><dd>${o.heste.length}</dd></div>
    </dl>
    <p class="wrap hero__kilde">Tal fra Dansk Hestevæddeløb · opdateret ${o.opdateret}</p>
  </div>
</section>

<section class="sek sek--taet-bund">
  <div class="wrap duo">
    <div class="duo__billede">
      ${figur('mathias', 'Mathias Jensen', '', { sizes: '(min-width: 900px) 38vw, 92vw' })}
    </div>
    <div class="duo__tekst">
      <p class="oje" data-vis>Om Mathias</p>
      <h2 data-vis style="--i:1">Kusk for mange – <em>træner for de få.</em></h2>
      <p class="indled" data-vis style="--i:2">Mathias Jensen er født i ${data.traener.foedt} – tidligere dansk mester for amatørkuske og Årets Komet 2021.</p>
      <p data-vis style="--i:3">I 2026 fik han A-licens og egen stald i ${SITE.by}. De fleste løb kører han for andre trænere: over de seneste ${o.kuskIalt.aar} sæsoner er det blevet til ${nf(o.kuskIalt.starter)} starter og ${o.kuskIalt.sejre} sejre som kusk.</p>
      <p class="valg" data-vis style="--i:4">${laes('om-mathias/', 'Læs mere om Mathias')}</p>
    </div>
  </div>
</section>

<section class="sek sek--tone">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>Det tilbyder Mathias</p>
        <h2 data-vis style="--i:1">I sulkyen <em>og i stalden.</em></h2>
      </div>
      <p data-vis style="--i:2">Kontakt Mathias for pris og ledige datoer.</p>
    </div>
    ${ydelser(o)}
  </div>
</section>

<section class="sek">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>Heste i træning</p>
        <h2 data-vis style="--i:1">Stalden <em>i ${SITE.by}.</em></h2>
      </div>
      <p data-vis style="--i:2">${flertal(o.heste.length, 'hest', 'heste')} på træningslisten lige nu. Listen følger Dansk Hestevæddeløb og opdateres af sig selv.</p>
    </div>
    <ul class="hesteliste">${o.heste.map(hesteraekke).join('')}
    </ul>
    <p class="midt" data-vis>${knap('heste/', 'Se hestene', 'knap--kant')}</p>
  </div>
</section>

<section class="sek--mork resbane">
  <div class="resbane__billede">${img('loeb', 'Mathias Jensen bag Liga på Spar Nord Arena Aalborg', { pos: '50% 55%' })}</div>
  <div class="wrap duo duo--top">
    <div class="duo__tekst">
      <p class="oje" data-vis>Resultater</p>
      <h2 data-vis style="--i:1">Seneste <em>fra banen.</em></h2>
      <p class="indled" data-vis style="--i:2">Mathias' seneste løb som kusk og hans næste kørsler – hentet fra Dansk Hestevæddeløb og opdateret ${o.opdateret}.</p>
      <p class="valg" data-vis style="--i:3">${knap('resultater/', 'Alle resultater', 'knap--lys')} ${ekstern(SITE.travinfo, 'Se Travinfo')}</p>
    </div>
    <div class="duo__lister" data-vis style="--i:2">
      <h3 class="mini">Seneste løb som kusk</h3>
      ${resultatliste(o.kuskSeneste.slice(0, 5))}
      ${o.kuskKommende.length ? `<h3 class="mini">Næste kørsler</h3>
      ${kommendeListe(o.kuskKommende.slice(0, 4))}` : ''}
    </div>
  </div>
</section>

${ejerbaand()}
${kontaktbaand()}`;

// Historien bygger på travservice.dk (2017–2026) og Mikkel (A-licens i 2026); tallene kommer fra Dansk Hestevæddeløb.
const MILEPAELE = [
  ['2016', 'Amatørchampion i Aalborg', 'Vinder amatørchampionatet på hjemmebanen.'],
  ['2017', 'EM for amatørkuske', 'Repræsenterer Danmark ved EM i Schweiz og Frankrig.'],
  ['2021', 'Årets Komet', 'Kåres som Årets Komet ved Hestesportens Galla.'],
  ['2023', 'Dansk mester', 'Vinder DM for amatørkuske på Fyens Væddeløbsbane.'],
  ['2024', 'Jockey hos Kaj Jensen', 'Bedste dansker ved NM for amatørkuske i Finland – og bliver jockey hos Kaj Jensen.'],
  ['2026', 'A-licens og egen stald', 'Får A-licens som træner og kusk og starter egen stald i Arden.'],
];
const omMathias = (o, data) => {
  const topHest = o.heste.find((h) => h.starter);
  return `
${sidehoved({
  oje: 'Om Mathias',
  h1: 'Om <em>Mathias</em>',
  tekst: `Professionel travkusk og træner med A1-licens. Født i ${data.traener.foedt} – og med ${esc(data.traener.hjemmebane)} som hjemmebane.`,
  billede: 'portraet',
  bred: 'portraet', // hele fotoet i fuld bredde på liggende skærme
  helt: true,
  alt: 'Mathias Jensen med vinderbuket i Aalborg',
  pos: '68% 35%',
  posBred: '50% 50%',
})}

<section class="sek">
  <div class="wrap artikel">
    <aside class="fakta">
      <div class="fakta__foto billede" data-vis="billede">${img('stald', 'Mathias Jensen i løb i Aalborg', { sizes: '(min-width: 961px) 30vw, 92vw' })}</div>
      <h2 class="oje">Kort fortalt</h2>
      <dl>
        <div><dt>Født</dt><dd>${data.traener.foedt}</dd></div>
        <div><dt>Licens</dt><dd>${esc(data.traener.licens)} – professionel træner og kusk (fra 2026)</dd></div>
        <div><dt>Titler</dt><dd>DM for amatørkuske 2023, Årets Komet 2021</dd></div>
        <div><dt>Hjemmebane</dt><dd>${esc(data.traener.hjemmebane)}</dd></div>
        <div><dt>Farver</dt><dd>Grøn og sort</dd></div>
        <div><dt>Stald</dt><dd>${SITE.by}</dd></div>
        <div><dt>Heste i træning</dt><dd>${o.heste.length}</dd></div>
      </dl>
    </aside>
    <div class="prosa">
      <h2 data-vis>Kusken</h2>
      <p class="indled" data-vis>Mathias Jensen begyndte som amatørkusk på hjemmebanen i Aalborg – og blev hurtigt en af de bedste.</p>
      <p data-vis>I 2016 vandt han amatørchampionatet i Aalborg, og året efter repræsenterede han Danmark ved EM for amatørkuske i Schweiz og Frankrig. I 2021 blev han kåret som Årets Komet ved Hestesportens Galla.</p>
      <p data-vis>I 2023 vandt han DM for amatørkuske på Fyens Væddeløbsbane efter en tæt kamp, og ved NM for amatørkuske i Finland i 2024 blev han bedste dansker – kun ét point fra bronze. Samme år blev han jockey hos træner Kaj Jensen.</p>
      <p data-vis>I ${o.kuskSaeson.aar} har han kørt ${o.kuskSaeson.starter} løb, vundet ${o.kuskSaeson.sejre} og været blandt de tre første ${o.kuskSaeson.sejre + o.kuskSaeson.toer + o.kuskSaeson.treer} gange.${o.banerIAar.length > 1 ? ` Løbene er kørt i ${dkListe(o.banerIAar)}.` : ''}</p>
      <p data-vis>Over de seneste ${o.kuskIalt.aar} sæsoner er det blevet til ${nf(o.kuskIalt.starter)} starter og ${o.kuskIalt.sejre} sejre som kusk.</p>

      <h2 data-vis>Træneren</h2>
      <p class="indled" data-vis>I 2026 fik Mathias A-licens og tog springet til egen stald i ${SITE.by}.</p>
      <p data-vis>Lige nu står ${dkListe(o.heste.map((h) => esc(h.navn)))} på træningslisten, og han skal også i gang med nogle af sin fars heste. Han håber, at flere hesteejere vil bruge ham – både som træner og som kusk.</p>${o.bedsteTraenerAar ? `
      <p data-vis>Han har også trænet heste før A-licensen – bedste sæson var ${o.bedsteTraenerAar.aar} med ${o.bedsteTraenerAar.sejre} sejre på ${o.bedsteTraenerAar.starter} starter og ${kr(o.bedsteTraenerAar.praemier)} indkørt.</p>` : ''}${topHest ? `
      <p data-vis>${o.heste.length > 1 ? `Den hest på holdet, der har tjent mest, er ${esc(topHest.navn)} – en` : `${esc(topHest.navn)} er en`} ${omHest(topHest)} ${afstamning(topHest)} med ${flertal(sejre(topHest), 'sejr', 'sejre')} og ${kr(topHest.praemier)} i karrieren.</p>` : ''}
    </div>
  </div>
</section>

<section class="sek sek--mork">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>Milepæle</p>
        <h2 data-vis style="--i:1">Karrieren <em>kort.</em></h2>
      </div>
    </div>
    <ol class="tidslinje tidslinje--seks">${MILEPAELE.map(([aar, titel, tekst], i) => `
      <li data-vis style="--i:${i % 3}"><span class="tidslinje__aar">${aar}</span><h3>${titel}</h3><p>${tekst}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sek sek--tone">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>Statistik</p>
        <h2 data-vis style="--i:1">Sæson <em>for sæson.</em></h2>
      </div>
      <p data-vis style="--i:2">Officielle tal fra Dansk Hestevæddeløb, opdateret ${o.opdateret}.<br>${ekstern(SITE.travinfo, 'Se alle tal på Travinfo')}</p>
    </div>
    <div class="tabeller" data-vis>
      ${statTabel('Som kusk', data.kuskStatistik)}
      ${statTabel('Som træner', data.traenerStatistik)}
    </div>
  </div>
</section>
${ejerbaand()}
${kontaktbaand()}`;
};

const hesteraekke = (h, i) => `
      <li class="hest" id="hest-${h.id}" data-vis style="--i:${i % 6}">
        <div class="hest__navn">
          <h3>${esc(h.navn)}</h3>
          <p>${afstamning(h)}</p>
        </div>
        <p class="hest__om">${omHest(h)}</p>
        ${h.starter ? `<dl class="hest__tal">
          <div><dt>Starter</dt><dd>${h.starter} <span>${esc(h.placeringer)}</span></dd></div>
          <div><dt>Indkørt</dt><dd>${kr(h.praemier)}</dd></div>
          <div><dt>Rekord</dt><dd>${bedsteRekord(h.rekord) || '–'}</dd></div>
        </dl>` : '<p class="hest__tal hest__tal--tom">Ustartet</p>'}
        <a class="hest__link" href="https://travinfo.dk/horse_tabs/${h.id}" target="_blank" rel="noopener" aria-label="${esc(h.navn)} på Travinfo (åbner i ny fane)">${ud}</a>
      </li>`;
const hestegruppe = (titel, heste) => (heste.length ? `
    <div class="gruppe">
      <h2 class="gruppe__titel" data-vis>${titel} <span>${heste.length}</span></h2>
      <ul class="hesteliste">${heste.map(hesteraekke).join('')}
      </ul>
    </div>` : '');

const heste = (o) => `
${sidehoved({
  oje: 'Heste',
  h1: 'Heste <em>i<br>træning</em>',
  tekst: `${flertal(o.heste.length, 'hest', 'heste')} står lige nu på træningslisten hos Mathias Jensen. Listen kommer direkte fra Dansk Hestevæddeløb og følger automatisk med, når heste kommer til eller rejser videre.`,
  billede: 'heste',
  bred: 'heste', // hele fotoet i fuld bredde på liggende skærme
  helt: true,
  alt: 'Mathias Jensen bag Karlo på Jydsk Væddeløbsbane',
  pos: '16% 45%', // mobil: Mathias til venstre i fotoet
  posBred: '50% 50%',
})}
${o.fotoheste.length ? `
<section class="sek sek--tone">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>I fokus</p>
        <h2 data-vis style="--i:1">Ansigter <em>fra stalden.</em></h2>
      </div>
    </div>
    <div class="kortraekke kortraekke--tre">${o.fotoheste.map((h) => hestekort(h, `https://travinfo.dk/horse_tabs/${h.id}`, true)).join('')}
    </div>
  </div>
</section>` : ''}

<section class="sek">
  <div class="wrap">
    ${hestegruppe('Løbsheste', o.heste.filter((h) => h.alder >= 3))}
    ${hestegruppe('2-årige', o.heste.filter((h) => h.alder === 2))}
    ${hestegruppe('Åringer', o.heste.filter((h) => h.alder <= 1))}
    <p class="note" data-vis>Starter, placeringer (1.–2.–3.), præmiesum og rekord er livstal. Rekorden er hestens hurtigste kilometertid; a = autostart, k/m/l = kort, mellem og lang distance. Kilde: Dansk Hestevæddeløb, opdateret ${o.opdateret}.</p>
  </div>
</section>
${ejerbaand()}
${kontaktbaand()}`;

const resultater = (o, data) => `
${sidehoved({
  oje: 'Resultater',
  h1: 'Mathias’ <em>resultater</em>',
  tekst: `Seneste løb som kusk og træner, næste kørsler og sæsonens tal. Data kommer fra Dansk Hestevæddeløb og er senest opdateret ${o.opdateret}.`,
  billede: 'resultater',
  bred: 'resultater', // hele fotoet i fuld bredde på liggende skærme
  helt: true,
  alt: 'Mathias Jensen bag Lulu på Jydsk Væddeløbsbane',
  pos: '30% 45%', // mobil: Mathias til venstre i fotoet
  posBred: '50% 50%',
})}

<section class="sek sek--tone sek--smal sek--taet-bund">
  <div class="wrap">
    <h2 class="oje" data-vis>Som kusk i ${o.kuskSaeson.aar}</h2>
    <dl class="noegletal" data-vis style="--i:1">
      <div><dt>Starter</dt><dd>${o.kuskSaeson.starter}</dd></div>
      <div><dt>Sejre</dt><dd>${o.kuskSaeson.sejre}</dd></div>
      <div><dt>2.-pladser</dt><dd>${o.kuskSaeson.toer}</dd></div>
      <div><dt>3.-pladser</dt><dd>${o.kuskSaeson.treer}</dd></div>
      <div><dt>Sejrsprocent</dt><dd>${o.kuskSaeson.procent}<small>&nbsp;%</small></dd></div>
      <div><dt>Indkørt</dt><dd>${nf(o.kuskSaeson.praemier)}<small>&nbsp;kr.</small></dd></div>
    </dl>
    <div class="form" data-vis style="--i:2">
      <h3 class="mini">Formkurve – de seneste ${o.kuskSeneste.length} løb som kusk</h3>
      <ol>${o.kuskSeneste.map(placMaerke).join('')}</ol>
    </div>
  </div>
</section>

<section class="sek sek--taet-top sek--taet-bund">
  <div class="wrap resgitter">
    <div>
      <div class="sekhoved sekhoved--lille">
        <div>
          <p class="oje" data-vis>Som kusk</p>
          <h2 data-vis style="--i:1">De seneste <em>${o.kuskSeneste.length} løb.</em></h2>
        </div>
      </div>
      <div data-vis>${resultatliste(o.kuskSeneste)}</div>
      <p class="note" data-vis>Tider er kilometertider. a = autostart, g = galop undervejs. – = uplaceret, disk. = diskvalificeret.</p>
    </div>
    <aside>
      <h2 class="oje" data-vis>Næste kørsler</h2>
      ${o.kuskKommende.length ? `<div data-vis style="--i:1">${kommendeListe(o.kuskKommende)}</div>` : `<p data-vis style="--i:1">Mathias er ikke startmeldt som kusk lige nu.</p>`}
      <p class="valg" data-vis style="--i:2">${ekstern(SITE.travinfo, 'Startlister på Travinfo')}</p>
    </aside>
  </div>
</section>

<section class="sek sek--taet-top">
  <div class="wrap resgitter">
    <div>
      <div class="sekhoved sekhoved--lille">
        <div>
          <p class="oje" data-vis>Som træner</p>
          <h2 data-vis style="--i:1">Staldens <em>seneste starter.</em></h2>
        </div>
      </div>
      <div data-vis>${resultatliste(o.seneste)}</div>
    </div>
    <aside>
      <h2 class="oje" data-vis>Kommende starter</h2>
      ${o.kommende.length ? `<div data-vis style="--i:1">${kommendeListe(o.kommende)}</div>` : `<p data-vis style="--i:1">Ingen af staldens heste er startmeldt lige nu.</p>`}
    </aside>
  </div>
</section>
${o.banetal.length ? `
<section class="sek sek--tone">
  <div class="wrap duo">
    <div class="duo__tekst">
      <p class="oje" data-vis>Banerne</p>
      <h2 data-vis style="--i:1">Kørsler <em>pr. bane.</em></h2>
      <p class="indled" data-vis style="--i:2">I ${o.kuskSaeson.aar} har Mathias kørt løb på ${flertal(o.banetal.length, 'bane', 'baner')} – flest i ${o.banetal[0].navn}${o.hjemmestarter && o.banetal[0].kode !== HJEMME ? ` og ${o.hjemmestarter} på hjemmebanen i Aalborg` : ''}.</p>
    </div>
    <figure class="kort" data-vis style="--i:2">
      ${danmarkskort(o.banetal.some((b) => b.kode === HJEMME) ? o.banetal : [{ kode: HJEMME, navn: 'Aalborg' }, ...o.banetal], `Danmarkskort med Mathias' starter som kusk pr. bane i ${o.kuskSaeson.aar}: ${o.banetal.map((b) => `${b.navn} ${b.antal}`).join(', ')}.`)}
      <figcaption>Starter som kusk pr. bane i ${o.kuskSaeson.aar}. Ringen markerer hjemmebanen.</figcaption>
    </figure>
  </div>
</section>` : ''}

<section class="sek sek--mork">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        <p class="oje" data-vis>Statistik</p>
        <h2 data-vis style="--i:1">Sæson <em>for sæson.</em></h2>
      </div>
      <p data-vis style="--i:2">Alle resultater, startlister og detaljer findes hos Dansk Hestevæddeløb.<br>${ekstern(SITE.travinfo, 'Åbn Travinfo', 'knap knap--lys')}</p>
    </div>
    <div class="tabeller" data-vis>
      ${statTabel('Som kusk', data.kuskStatistik)}
      ${statTabel('Som træner', data.traenerStatistik)}
    </div>
  </div>
</section>
${kontaktbaand()}`;

const kontakt = () => `
${sidehoved({
  oje: 'Kontakt',
  h1: 'Kontakt <em>Mathias</em>',
  tekst: `Skal din hest have en kusk, eller har du en hest, der skal i træning? Ring eller send en sms${SITE.email ? ' eller en mail' : ''}.`,
  billede: 'kontakt',
  bred: 'kontakt', // hele fotoet i fuld bredde på liggende skærme
  helt: true,
  alt: 'Mathias Jensen med vinderbuket i Aalborg',
  pos: '68% 35%',
  posBred: '50% 50%',
})}

<section class="sek">
  <div class="wrap kontakt">
    <div class="kontakt__felt" data-vis>
      <h2 class="oje">Telefon</h2>
      <p class="kontakt__stor"><a href="tel:${tlfLink}">${SITE.telefon}</a></p>
      <p class="valg"><a class="knap" href="tel:${tlfLink}">Ring op ${pil}</a> <a class="laes" href="sms:${tlfLink}">Send en sms ${pil}</a></p>
    </div>${SITE.email ? `
    <div class="kontakt__felt" data-vis style="--i:1">
      <h2 class="oje">E-mail</h2>
      <p class="kontakt__stor kontakt__stor--mail"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p class="valg"><a class="knap knap--kant" href="mailto:${SITE.email}?subject=${encodeURIComponent('Henvendelse fra hjemmesiden')}">Skriv en mail ${pil}</a></p>
    </div>` : ''}
    <div class="kontakt__felt kontakt__felt--kort" data-vis style="--i:2">
      <div>
        <h2 class="oje">Stalden</h2>
        <address>${SITE.navn}<br>${SITE.gade}<br>${SITE.postnr} ${SITE.by}</address>
        <p class="valg">${ekstern(SITE.kort, 'Find vej')}</p>
      </div>
      <div class="kort kort--mini">${danmarkskort([{ kode: HJEMME, navn: 'Aalborg' }, { kode: 'stald', navn: SITE.by }], `Danmarkskort, hvor stalden i ${SITE.by} og hjemmebanen i Aalborg er markeret`)}</div>
    </div>
    <div class="kontakt__felt" data-vis style="--i:3">
      <h2 class="oje">Følg Mathias</h2>
      <ul class="folg">
        ${[
          [SITE.travinfo, 'Travinfo', 'Resultater og statistik', '<circle cx="12" cy="13.5" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 13.5V9.5M10 3h4M18.5 6.5l1.3-1.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'],
        ].map(([href, kanal, navn, ikon]) => `
        <li><a href="${href}" target="_blank" rel="noopener"><span class="folg__ikon"><svg viewBox="0 0 24 24" aria-hidden="true">${ikon}</svg></span><span class="folg__tekst"><span>${kanal}</span><b>${esc(navn)}</b></span><span class="folg__pil">${ud}</span>${nyFane}</a></li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;

const ikkeFundet = () => `
<section class="sidehoved sidehoved--enkel">
  <div class="wrap">
    <div class="sidehoved__tekst">
      <p class="oje">Fejl 404</p>
      <h1>Siden <em>findes ikke</em></h1>
      <p class="indled">Adressen er forkert, eller siden er flyttet.</p>
      <p>${knap('', 'Til forsiden', 'knap--lys')}</p>
    </div>
  </div>
</section>`;

/** Alle sider som [{ sti, html }]. `idag` er YYYY-MM-DD, `v` et versionsmærke til css/js. */
export function sider(data, { v, idag, kort }) {
  V = v;
  KORT = kort;
  const o = afled(data, idag);
  const side = (sti, def) => {
    R = sti === '404.html' ? new URL(SITE.url + '/').pathname : sti ? '../' : '';
    return { sti: sti.endsWith('.html') ? sti : `${sti}index.html`, url: sti, html: layout({ sti, o, ...def() }) };
  };
  return [
    side('', () => ({
      titel: `${SITE.navn} – travkusk og træner i Aalborg`,
      beskrivelse: `Mathias Jensen er professionel travkusk og træner med A1-licens og Spar Nord Arena Aalborg som hjemmebane. ${o.kuskSaeson.starter} starter og ${o.kuskSaeson.sejre} sejre som kusk i ${o.kuskSaeson.aar}.`,
      klasse: 'forside',
      indhold: forside(o, data),
    })),
    side('om-mathias/', () => ({
      titel: `Om Mathias Jensen – travkusk og træner | ${SITE.navn}`,
      beskrivelse: `Mød Mathias Jensen: dansk mester for amatørkuske 2023, Årets Komet 2021 – og fra 2026 professionel kusk og træner med A-licens og egen stald i ${SITE.by}.`,
      indhold: omMathias(o, data),
    })),
    side('heste/', () => ({
      titel: `Heste i træning | ${SITE.navn}`,
      beskrivelse: `Se de travheste, der lige nu er i træning hos Mathias Jensen i ${SITE.by} – med afstamning, starter, præmiesum og rekord.`,
      indhold: heste(o),
    })),
    side('resultater/', () => ({
      titel: `Resultater og statistik | ${SITE.navn}`,
      beskrivelse: `Seneste løb, næste kørsler og sæsonstatistik for travkusk og træner Mathias Jensen: ${o.kuskSaeson.sejre} sejre på ${o.kuskSaeson.starter} starter som kusk i ${o.kuskSaeson.aar}.`,
      indhold: resultater(o, data),
    })),
    side('kontakt/', () => ({
      titel: `Kontakt Mathias Jensen – travkusk og træner`,
      beskrivelse: `Kontakt Mathias Jensen: telefon ${SITE.telefon}${SITE.email ? `, ${SITE.email}` : ''}. Stalden ligger på ${SITE.gade}, ${SITE.postnr} ${SITE.by}.`,
      indhold: kontakt(),
    })),
    side('404.html', () => ({
      titel: `Siden findes ikke | ${SITE.navn}`,
      beskrivelse: 'Siden findes ikke.',
      noindex: true,
      indhold: ikkeFundet(),
    })),
  ];
}
