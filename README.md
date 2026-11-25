# Mathias Jensen – hjemmeside

Hjemmeside for travkusk og træner Mathias Jensen (A1-licens, hjemmebane Spar Nord Arena Aalborg, stald i Arden).

Statisk site (HTML, CSS, lidt JavaScript). Ingen afhængigheder, ingen database og ingen cookies. Kræver kun Node 20+ for at bygge.

```bash
node build.mjs --serve --port=4174
```

Åbn derefter http://localhost:4174. Det færdige site ligger i `dist/`.

| Kommando | Gør |
| --- | --- |
| `node build.mjs` | Bygger `dist/` med de gemte data |
| `node build.mjs --hent` | Henter friske data fra Dansk Hestevæddeløb og bygger |
| `node build.mjs --serve` | Bygger og viser sitet lokalt |
| `node build.mjs --test` | Selvtjek af formatering og datalogik |

Ved hver bygning skriver `build.mjs`, hvad der mangler før lancering (fx e-mail, CVR og fotos).

## Sådan holder sitet sig selv opdateret

Heste, resultater, kommende starter og statistik kommer fra Dansk Hestevæddeløbs sportsdata – de samme data, som travinfo.dk viser. `--hent` gemmer dem i `data/travinfo.json`, og siderne bygges ud fra den fil. Både løb som træner og som kusk hentes, fordi Mathias kører langt flest løb for andre trænere.

`.github/workflows/opdater.yml` kører `--hent` hver morgen og ved hvert push til `main` og udgiver på GitHub Pages: https://mikkelgamer1.github.io/stald-mathias-jensen/. Her holder `robots.txt` sitet ude af søgemaskinerne. Når domænet er på plads, sættes repo-variablen `SITE_URL` til den rigtige adresse – så åbnes der for søgemaskinerne af sig selv.

## Ret indhold

| Hvad | Hvor |
| --- | --- |
| Telefon, mail, adresse, CVR, domæne | `SITE` øverst i `templates.mjs` |
| Tekster og milepæle | `templates.mjs` (én funktion pr. side, `MILEPAELE`) |
| Heste, der stadig står på træningslisten, men ikke skal vises | `UDELAD` i `templates.mjs` |
| Farver, typografi, layout | `assets/css/site.css` (grøn og sort som løbsdragten) |

## Billeder

Kun rigtige, uredigerede fotos – ingen AI. Mathias' Facebook bruges ikke.

- **Endelige fotos** lægges i `originaler/` (kun lokalt) og skaleres ned til `assets/img/` (`navn-bredde.jpg`, den største er originalfilen uændret). De skrives ind i `BILLEDER` i `templates.mjs`.
- **Udkast:** `assets/udkast/` indeholder fotos fra banernes og travmediernes sider (Ole Hindby, Burt Seeger, Hesselborg Foto). De bruges kun lokalt til at se layoutet. Mappen står i `.gitignore` og `.vercelignore`, så online vises pladsholdere, indtil fotograferne har givet lov, og originalerne er lagt ind. Fotografens navn skal stå ved billedet.

## Kilder til fakta

| Oplysning | Kilde |
| --- | --- |
| Fødselsår, licens (A1), hjemmebane, farver, statistik, træningsliste, resultater | Dansk Hestevæddeløb / travinfo.dk, licens 505281 |
| Telefon og adresse | Dansk Hestevæddeløbs licensregister (tjekket 25.11.2026), godkendt af Mathias |
| A-licens og egen stald i 2026 | Mathias (via Mikkel) |
| Amatørchampion 2016, EM 2017, Årets Komet 2021, DM for amatørkuske 2023, jockey hos Kaj Jensen, Fit For Fight død | travservice.dk (2017–2026) |
| NM for amatørkuske 2024 (bedste dansker) | travservice.dk og danskhv.dk april 2024 |
| Danmarks omrids på kortet (`data/danmark.json`) | Natural Earth 1:50m, public domain. Bornholm er udeladt, og banernes placering er omtrentlig |
