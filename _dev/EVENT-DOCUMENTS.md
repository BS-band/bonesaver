# Stage plán a plesový repertoár ke stažení

Přidáno 24. 9. 2026 výhradně do lokálního redesignu. Původní PDF majitele, smlouva, produkční checkout, GitHub a doména zůstávají beze změny.

## Podklady a pojmenování

- `Stage plan Bonesaver.pdf` -> `assets/documents/bonesaver-stage-plan.pdf`: 1 strana A4 na šířku, rozmístění pěti muzikantů a technické zapojení.
- `Repertoár pro plesy – BS BAND 2026.pdf` -> `assets/documents/bonesaver-repertoar-pro-plesy-osa-2026.pdf`: 3 strany, 60 číslovaných položek v původním pořadí.

Oba dokumenty dodal majitel. Kontrola všech stran, textu a metadat potvrdila, že název BS BAND byl jen ve jménu zdrojového souboru repertoáru. Uvnitř je nadpis „Repertoár pro plesy – BONESAVER 2026“, patička „BONESAVER Band | Repertoár 2026“ a stage plán má nadpis „BONESAVER – stage plan“. Webové kopie jsou obsahově i binárně shodné s dodanými PDF. Nedošlo k přepisu, doplňování autorů, změně skladeb ani k nevyžádané úpravě techniky; zachována je i původní sazba a případné překlepy zdrojů.

## Umístění na webu

Kontakt, sekce `/kontakt.html#dokumenty`, pod formulářem a před FAQ: smlouva PDF, smlouva DOCX, stage plán PDF, repertoár pro plesy / OSA PDF. Odkazy mají atribut `download`, PDF se servírují jako `application/pdf`. Doprovodné odkazy z obsahových stránek nově zmiňují všechny tři typy podkladů.

## Rozsah podkladu pro OSA

Dokument je seznam repertoáru, nikoli vyplněné hlášení pro konkrétní akci nebo ověřený seznam autorů hudby a textu. Web jej proto označuje jako podklad pro pořadatele a připomíná použití skutečně odehraných skladeb. Názvy a interpreti zůstaly podle podkladu majitele; jejich věcná a autorská kontrola je případný samostatný úkol.

Původní obecný repertoár v `assets/bonesaver-repertoar.pdf` a 174 položek webového repertoáru se nemění. Nový soubor je oddělený plesový výběr, nikoli náhrada celého repertoáru.

## Kontroly

Všechny čtyři strany dodaných PDF byly vykresleny Popplerem a vizuálně zkontrolovány. Při integraci se kontroluje binární shoda zdrojů a kopií, počet 60 skladeb, nepřítomnost označení BS BAND v textu/metadatech, odkazy a MIME typy přes localhost, skutečné stažení v prohlížeči a rozložení sekce na mobilu i desktopu. Ověření nových odkazů je součástí `_dev/verify.cjs`.

Výsledek 24. 9. 2026: 240 kontrol webu prošlo bez chyby (220 rozměrových kontrol, stažení všech čtyř dokumentů včetně porovnání bytů a názvů). Vizuálně ověřena výsledná PDF i sekce při šířce 1440 a 390 px. SHA-256 webových kopií odpovídá dodaným originálům:

- Repertoár: `dbe56687399a30643c1878225c58a875316e29bf608014b787a77a78f64ee0cf` (220 853 bajtů).
- Stage plán: `396a9e3819e78457d8abd119d198f9f84a4bd1d2415238a93427b648a5b197b5` (149 301 bajtů).
