# BoneSaver: údržba webu

Statický web kapely BoneSaver pro `https://www.bonesaver.cz/`. Nasazuje se pushnutím do větve `main` (GitHub Pages, zdroj: kořen větve, Jekyll) — **push do `main` rovnou mění ostrý web**. Repozitář je veřejný, proto v něm nejsou interní podklady ani diagnostické soubory; viz oddíl „Interní podklady“ na konci.

Web nepotřebuje k běžnému sestavení žádné závislosti ani framework. Zdroj pravdy je `_dev/build.mjs` spolu s `_dev/content.mjs` a `_dev/data/*.json`; vygenerované HTML se commituje.

## Náhled

```powershell
node .\_dev\preview.mjs
```

Alternativně `.\_dev\start-preview.ps1`. Náhled běží na <http://127.0.0.1:4174/>, dokud běží jeho proces; ukončení je Ctrl+C. Změny HTML/CSS/JS se projeví po obnovení stránky.

Server naslouchá pouze na `127.0.0.1`, vrací `X-Robots-Tag: noindex, nofollow` a vlastní `/robots.txt` s `Disallow: /`. Tyto hodnoty se nikdy nezapisují do HTML ani do produkčního `robots.txt`. Složku `_dev`, `.git` a diagnostické logy server nevydává a `_config.yml` je navíc vylučuje z výstupu Jekyllu. Nepřidávat `.nojekyll` bez náhradního bezpečného publikovacího procesu.

## Úprava obsahu a sestavení

```powershell
node .\_dev\build.mjs
```

- `_dev/build.mjs`: společná hlavička, patička, formulář, SEO a šablony. Generuje kořenová HTML, `robots.txt` a `sitemap.xml`. Neupravovat současně vygenerované HTML — sestavení tyto změny přepíše.
- `_dev/content.mjs`: kontakty, členové, schválené reference, služby a FAQ.
- `_dev/data/repertoire.json`: všech 174 skladeb, z toho 16 vlastních. Sestavení hlídá počty; při skutečné změně repertoáru upravit i související popisy.
- `_dev/data/videos.json`: ověřené odkazy a popisy. `VideoObject` se vytváří jen tam, kde je doložené datum a délka.
- `_dev/web3forms-config.mjs`: veřejný klientský přístupový klíč Web3Forms. V HTML je záměrně, stejně jako na zdrojovém webu bsband.cz; při změně účtu znovu sestavit statické HTML.
- `style.css`, `script.js`: ručně udržované společné styly a chování (včetně validace poptávky a přístupnosti).
- `_dev/optimize-media.cjs`: volitelná regenerace obrázků pomocí `sharp` (WebP kvalita 76, JPEG 82); originály nemaže. Vyžaduje doinstalovaný `sharp`.
- `_dev/fetch-public-media.cjs`: volitelná obnova veřejných náhledů a fontů. Vyžaduje internet a `sharp`; přepisuje metadata videí, proto před opakováním zkontrolovat vlastní úpravy dat.
- `_dev/import-repertoire.mjs`: již provedená jednorázová migrace, nad novým HTML ji znovu nespouštět.

Datum `lastmod` v sitemapě se mění při sestavení; udržovat ho pravdivé.

## Dokumenty ke stažení

Pracovní vzor smlouvy v PDF a DOCX je v `assets/documents/` a odkazuje na něj `/kontakt.html#dokumenty`. Zdroj dokumentu je `_dev/build-contract.py`, textovou shodu DOCX a PDF ověřuje `_dev/verify-contract.py`.

Repertoárové PDF se generují z dat webu a **neupravují se ručně**:

- `assets/bonesaver-repertoar.pdf`: všech 174 skladeb podle interpreta, vlastní tvorba vyznačená. Generuje se z `_dev/data/repertoire.json`.
- `assets/documents/bonesaver-repertoar-pro-plesy-osa-2026.pdf`: 60 skladeb pro plesy v pořadí, které dodal majitel (28. 9. 2026 opravené překlepy zdroje).

Postup: vytvořit tiskové HTML (A4, tabulka nebo číslovaný seznam) a vyrenderovat ho do PDF headless Chromem:

```powershell
& "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer --print-to-pdf=cesta.pdf tisk.html
```

Stage plán dodal majitel a generátor nemá; jeho obsah se needituje (obsahuje například překlep „Katarista“ ve zdrojovém Visio souboru).

## Měření poptávek a návštěvnosti

Web **záměrně neobsahuje žádné měřicí skripty**, dokud je majitel nezapne. Staví na dvou vrstvách:

1. **Kontext poptávky v e-mailu** (funguje vždy, bez cookies a bez třetích stran): odeslaná zpráva obsahuje „Odesláno z:“ (stránka a parametry, např. `?akce=svatba`) a „Zdroj návštěvy:“ (utm parametry, jiná stránka webu, domény odkazujícího webu, nebo „přímý vstup“).
2. **Volitelné měření návštěvnosti** v `_dev/content.mjs`; po každé změně spustit `node _dev/build.mjs`:
   - `ga4Id: "G-XXXXXXXXXX"` — Google Analytics 4. Web vloží jen meta značku `ga4-id`; `script.js` pak zobrazí lištu se souhlasem a **skript Googlu načte až po kliknutí na „Přijmout“** (do té doby žádný požadavek na cizí server). Volba se ukládá do `localStorage` pod klíčem `bonesaver-consent`, odvolat ji lze tlačítkem „Nastavení měření“ v patičce. Souhlas je nutný, protože GA4 používá cookies.
   - `snippet: "..."` — alternativa bez cookies (GoatCounter, Plausible, Umami) se vloží do stránek doslova a bez lišty.
   Obě volby rozesílají události `poptavka_odeslana`, `klik_telefon`, `klik_email` a `prehrani_videa` (názvy s podtržítkem kvůli GA4) a na stránce Soukromí se automaticky objeví odpovídající oddíl o měření. Prázdné hodnoty = web neposílá data nikam a Soukromí o měření mlčí.

   Když je lišta otevřená, skrývá se spodní mobilní lišta s telefonem (`body.consent-open`), aby se nepřekrývaly.

Vyhodnocení: Google Search Console a Bing Webmaster Tools (ověření přes meta značku nebo soubor; nástroje vyžadují přihlášení majitele) + Seznam Webmaster (ověřovací soubor už v repu je).

## Ověření webu

`node _dev/verify.cjs` provede funkční kontroly a rozměrové kontroly 320–1440 px. Potřebuje běžící náhled, Chrome a balíček `playwright` (případně přes `NODE_PATH`); cestu k jinému Chrome lze nastavit proměnnou `CHROME_PATH`. Běžný provoz webu tyto testovací závislosti nepotřebuje.

Kontroly zahrnují mimo jiné oba formuláře se simulovanou odpovědí služby, validaci s chybovým souhrnem, stažení všech dokumentů a ověření, že server interní soubory (`/_dev/...`, `/gcm-diagnose.log`, `/.git/config`) opravdu nevydává. Testy poptávku neodesílají do skutečné schránky (požadavek se zachytí a nahradí simulovanou odpovědí) — doručení musí před publikací ověřit majitel jednou zkušební zprávou.

## Interní podklady

Plán úprav, audit, podklady ke smlouvě, dokumentace formuláře a souhrn kontrol **nejsou součástí veřejného repozitáře**. Leží ve složce `bonesaver-interni` vedle tohoto projektu (`..\bonesaver-interni`), aby je GitHub nezveřejňoval. Sem patří i výsledky kontrolních běhů a citlivější poznámky k obchodním podmínkám.

## Kontrola před prací a před nasazením

```powershell
git status --short --branch
git diff origin/main --stat
```

Před pushnutím do `main` ověřit, že výstup neobsahuje interní soubory, adresy `localhost` ani preview `noindex` a že `robots.txt` a `sitemap.xml` odpovídají produkci.
