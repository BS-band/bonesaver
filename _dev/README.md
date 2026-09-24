# BoneSaver: lokální vývoj

Redesign vznikl 24. 9. 2026 na základě produkčního commitu `0ec64811b8256ee6b29799fb4b9cbe7da8ed4c35`. Obsahuje 11 statických stránek včetně 404. První lokální kontrolu a její omezení shrnuje [REVIEW.md](REVIEW.md).

- Pracovní větev: `codex/bonesaver-redesign`.
- Pracovní adresář: samostatný worktree `bonesaver-redesign/bonesaver` mimo původní checkout; přesnou cestu vypíše `git worktree list`.
- Hlavní adresář: checkout větve `main`, také uvedený v `git worktree list`.
- Pracovní náhled: <http://127.0.0.1:4174/>.
- Srovnávací náhled původních souborů: <http://127.0.0.1:4173/>.
- Podrobný audit, návrh a postup nasazení: [PLAN.md](PLAN.md).

## Spuštění

V terminálu v pracovním adresáři stačí Node.js 20 nebo novější, bez instalace balíčků:

```powershell
node .\_dev\preview.mjs
```

Alternativně:

```powershell
.\_dev\start-preview.ps1
```

Pro srovnání původních souborů ve druhém terminálu:

```powershell
$puvodniProjekt = Split-Path -Parent (git rev-parse --path-format=absolute --git-common-dir)
node .\_dev\preview.mjs --port 4173 --root $puvodniProjekt
```

Náhled běží, dokud běží jeho proces. Ukončení: Ctrl+C. Po restartu počítače se spouští znovu. Změny HTML/CSS/JS se projeví po obnovení stránky.

## Oddělení od produkce

Git worktree má vlastní soubory, pracovní větev a index, ale sdílí historii a vzdálený repozitář s původním projektem. Není to samostatný vzdálený repozitář ani omezení oprávnění k pushnutí. Příkazy je potřeba spouštět v pracovním adresáři a před commitem ověřit `git status --short --branch`.

Server naslouchá pouze na `127.0.0.1`, nepublikuje se do internetu ani do domácí sítě. Vrací `X-Robots-Tag: noindex, nofollow` a vlastní lokální `/robots.txt` s `Disallow: /`. Tyto ochrany jsou pouze odpovědí vývojového serveru: nezapisují se do HTML, CNAME ani produkčního robots.txt. Interní soubory `_dev`, `.git` a diagnostické logy nejsou přes server dostupné. Audio podporuje HTTP Range pro posouvání v nahrávce.

Písma a video náhledy jsou nyní lokální; YouTube se připojí až po kliknutí na přehrání. Oba poptávkové formuláře po odeslání předávají údaje službě Web3Forms přes existující účet použitý na bsband.cz. Podrobnosti integrace a omezení testu jsou v [FORM.md](FORM.md). Pro lokální kontrolu bez skutečného e-mailu používejte `_dev/verify.cjs`, který odpověď služby simuluje. Ruční odeslání z náhledu odešle skutečnou poptávku.

Snímky a strojové reporty jsou v ignorovaném `_dev/output/`. `_config.yml` výslovně vylučuje `_dev` i starý diagnostický log z výstupu Jekyll. Nepřidávat `.nojekyll` bez náhradního bezpečného publish procesu. Náhledy videí mají prefix `video-`, takže ani ID začínající podtržítkem nezpůsobí vynechání souboru v Pages. Změna publikovacího procesu vyžaduje novou kontrolu výstupu.

## Úprava obsahu a sestavení

Web zůstává statický, bez klientského frameworku a bez potřeby instalovat závislosti pro běžné sestavení:

```powershell
node .\_dev\build.mjs
```

- `_dev/build.mjs`: společná hlavička, patička, formulář, SEO a šablony. Generuje kořenová HTML, robots.txt a sitemap.xml. Neupravovat současně vygenerované HTML — sestavení tyto změny přepíše.
- `_dev/web3forms-config.mjs`: veřejný klientský přístupový klíč převzatý z nasazeného webu bsband.cz. Při změně účtu je nutné znovu sestavit statické HTML. Klíč se v HTML záměrně zveřejňuje stejně jako u zdrojového webu.
- `_dev/content.mjs`: kontakty, členové, schválené reference, služby a FAQ.
- `_dev/data/repertoire.json`: všech 174 skladeb z původního webu; 16 vlastních. Počty jsou zatím záměrně hlídané. Při skutečné změně repertoáru aktualizovat i související popisy a kontrolu počtů.
- `_dev/data/videos.json`: ověřené odkazy a popisy; datum/délku přidat až po doložení. `VideoObject` se nevyrábí s vymyšlenými údaji.
- `style.css`, `script.js`: ručně udržované společné styly a chování.
- `_dev/import-repertoire.mjs`: již provedená jednorázová migrace, nad novým HTML ji znovu nespouštět.
- `_dev/optimize-media.cjs`: volitelná regenerace obrázků pomocí `sharp`, originály nemaže.
- `_dev/fetch-public-media.cjs`: volitelná obnova veřejných náhledů a fontů. Vyžaduje internet a `sharp`; přepisuje video metadata, proto před opakováním zkontrolovat vlastní úpravy dat.

Výsledné HTML a média se později ukládají do Gitu; na GitHub Pages není nutné spouštět Node build. Datum `lastmod` se mění pouze při skutečné obsahové aktualizaci, ne automaticky při každém sestavení.

## Dokumenty ke stažení

Pracovní vzor v PDF a DOCX je v `assets/documents/`, dostupný na `/kontakt.html#dokumenty`. Údržba, potvrzené platební podmínky a body k právní kontrole jsou v [CONTRACT.md](CONTRACT.md). Zdroj dokumentu je `_dev/build-contract.py`, PDF se exportuje ze stejného DOCX a textová shoda se kontroluje pomocí `_dev/verify-contract.py`.

Ve stejné sekci jsou také majitelem dodané PDF `bonesaver-stage-plan.pdf` a `bonesaver-repertoar-pro-plesy-osa-2026.pdf`. Jejich obsah již uváděl BONESAVER, proto se změnily pouze názvy souborů pro web, nikoli skladby nebo technické údaje. Podrobnosti a omezení podkladu pro OSA jsou v [EVENT-DOCUMENTS.md](EVENT-DOCUMENTS.md).

## Ověření webu

`node _dev/verify.cjs` provede funkční kontroly a 220 kontrol rozměrů, potřebuje běžící náhled, Chrome a dostupný balíček `playwright` (případně přes `NODE_PATH`). Cestu k jinému Chrome lze nastavit proměnnou `CHROME_PATH`. Běžné spuštění webu tyto testovací závislosti nepotřebuje.

Poslední výsledek: 240 kontrol prošlo, 0 chyb, včetně simulovaného úspěchu a odmítnutí obou formulářů, stažení všech čtyř dokumentů a 220 kontrol rozměrů. Při předchozím auditu bylo dále provedeno 28 automatických kontrol přístupnosti pomocí axe-core 4.10.3, po opravách bez hlášených porušení. Nejde o certifikaci WCAG, test fyzického telefonu nebo důkaz skutečného doručení e-mailu. Výsledky a omezení uvádí [REVIEW.md](REVIEW.md).

## Kontrola před další prací

```powershell
git status --short --branch
git diff main -- '*.html' '*.css' '*.js' CNAME sitemap.xml
```

Pracovní větev a `main` sdílejí historii. Před další změnou zkontrolovat aktuální větev, stav a rozdíl proti produkčnímu commitu; DNS se v rámci redesignu nemění.
