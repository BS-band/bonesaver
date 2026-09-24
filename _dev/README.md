# BoneSaver: lokální vývoj

Připraveno 24. 9. 2026. Webové HTML, CSS, JavaScript, média, CNAME a sitemap jsou při založení této kopie shodné s produkčním commitem `0ec64811b8256ee6b29799fb4b9cbe7da8ed4c35`. Redesign zatím není provedený; tato větev obsahuje přípravu lokálního prostředí a druhý audit s plánem realizace.

- Pracovní větev: `codex/bonesaver-redesign`.
- Pracovní adresář: samostatný worktree `bonesaver-redesign/bonesaver` mimo původní checkout; přesnou cestu vypíše `git worktree list`.
- Původní adresář: dosavadní checkout větve `main`, také uvedený v `git worktree list`.
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

Web nadále používá své současné externí zdroje Google Fonts a YouTube. Formulář má stále původní chování `mailto:`; skutečné odesílání na server ještě neexistuje. Pro vizuální kontrolu není potřeba formulář odesílat.

Snímky z kontroly se ukládají do `_dev/output/`, které je v `.gitignore`. Při budoucím publikování je třeba ponechat vývojové podklady mimo veřejný výstup; při standardním Jekyll zpracování se adresáře začínající `_` standardně nepublikují, při změně build procesu se musí vyloučení zachovat.

## Kontrola před další prací

```powershell
git status --short --branch
git diff main -- '*.html' '*.css' '*.js' CNAME sitemap.xml
```

V okamžiku přípravy je tento rozdíl webových souborů prázdný. Jediná doplnění jsou vývojový server, spouštěč, dokumentace a `.gitignore`. Na GitHub zatím nebylo nic pushnuto.
