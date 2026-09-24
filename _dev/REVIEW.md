# BoneSaver — první lokální verze k prohlídce

Datum: 24. 9. 2026. Stav: k odsouhlasení, nikoli zveřejněný web.

## Otevřít

- Nová verze: http://127.0.0.1:4174/
- Původní verze pro porovnání: http://127.0.0.1:4173/
- Kopie: `C:\Users\mbecicka\.codex\worktrees\bonesaver-redesign\bonesaver`
- Větev: `codex/bonesaver-redesign`
- Restart náhledu: `node _dev/preview.mjs` v této kopii. Server běží jen na tomto počítači, nikoli na telefonu nebo internetu.

## Co je připravené

Nový tmavý a světlý vzhled, elektrická modrá a autentické fotografie kapely. Homepage vede návštěvníka od zvuku a referencí přes typ akce k poptávce. Původní logo zůstává zachováno; v hlavičce je čitelný textový wordmark s bleskem.

Zachována stávající URL hlavních stránek, PDF i všech 174 položek repertoáru. Přidány stránky pro svatby, plesy, firemní/veřejné akce a vlastní tvorbu se 16 skladbami. Všechen důležitý obsah je přímo ve statickém HTML a dostupný i bez JavaScriptu. Vyhledávání funguje bez diakritiky a spolu s filtry.

Pět členů, dosavadní kontakty a informace o službě vycházejí z původního webu. Tři reference majitel výslovně schválil během implementace. Nejsou z nich vytvářeny hvězdičky ani vymyšlené souhrnné hodnocení.

SEO základ zahrnuje unikátní titulky/popisy, canonical, sdílecí metadata, provázaná strukturovaná data kapely a služeb, sitemapu s 10 kanonickými stránkami a produkční robots.txt. Lokální server vždy vrací noindex a vlastní zákaz procházení; tyto preview hodnoty nejsou ve veřejných HTML souborech. Zachován ověřovací soubor Seznam Webmaster, CNAME a původní doménové nastavení.

## Prosím zkontrolovat jako majitel

1. Vzhled a tón textů: homepage, svatby, plesy a firemní akce. Formulace jsou pracovní návrh k vašemu rozhodnutí.
2. Aktuálnost nabídky: pět členů, 100% živé hraní, vlastní zvuk/světla, dojezd po ČR, tři zpěvy, prostor orientačně 5 × 3 m, telefon a fakturační údaje. Vychází z minulého webu; potvrzení aktuálnosti zůstává otevřené.
3. Hlavní video a dalších pět ukázek: přehrát v běžném prohlížeči, zhodnotit zvuk a reprezentativnost. Automatizovaný Chrome se dostal k přehrávači, YouTube ale požadoval ověření proti robotům. Samotné video nelze na základě tohoto testu označit za úspěšně přehrané. Přímý odkaz na YouTube je vždy dostupný.
4. Vlastní tvorba: seznam je zachovaný, ale nebyly doplněny neexistující nahrávky, data vydání ani streamovací odkazy. Reálné podklady lze doplnit následně.
5. Poptávka: formulář je nyní napojený na existující klíč Web3Forms z bsband.cz. Automatický test ověřil požadavek i odpovědi při simulovaném úspěchu a chybě. Skutečné doručení do přiřazené schránky zatím nebylo ověřeno; před publikací pošlete z lokálního náhledu jednu vlastní testovací poptávku a potvrďte, kam přišla. Bez toho nelze tvrdit, že odesílání funguje end-to-end. Podrobnosti v [FORM.md](FORM.md).
6. Soukromí: text už popisuje předání údajů službě Web3Forms a je k obsahové/právní kontrole provozovatelem. Před publikací ověřit skutečná pravidla uchování a případné mezinárodní předávání v účtu poskytovatele.

## Ověření a limity

- 240 automatických kontrol bez chyby. Z toho 220 kombinací 11 stránek, 10 šířek (320–1440 px včetně 861 px) a 2 motivů, bez vodorovného přetékání.
- Kontrola všech interních odkazů a kotev, obrázků, jednoho H1, unikátních titulků, JSON-LD, canonical, sitemap a vyloučení preview údajů z veřejného HTML.
- Shoda všech 174 skladeb s migrovanými daty, 16 vlastních, hledání bez diakritiky, filtry a nulový výsledek.
- Oba formuláře: prázdný výchozí termín, odmítnutí minulosti, možnost neznámého data, předvyplnění typu akce, simulovaný POST do Web3Forms se jménem/e-mailem a podrobnostmi akce, zobrazení úspěchu až po potvrzení služby, zachování údajů při chybě. Test neodeslal skutečný e-mail.
- Mobilní menu, Escape, odkaz pro přeskočení navigace, přepnutí a zapamatování motivu, základní použití bez JavaScriptu.
- Videa načítají iframe až na kliknutí. Před kliknutím nebyly zachyceny žádné požadavky na externí domény. To nenahrazuje test přehrávání se skutečným YouTube.
- 28 auditů axe-core 4.10.3 (11 stránek × 2 motivy na desktopu + homepage/kontakt/repertoár × 2 motivy při 390 px) bez hlášených porušení po opravách. Nejde o úplnou certifikaci přístupnosti.
- Vizuálně prohlédnuta homepage, kontakt a sestava na desktopu/mobilu. Snímky a JSON reporty jsou v `_dev/output/`.
- Nebylo testováno na fyzickém iPhonu/Androidu ani potvrzeno reálné serverové doručení, terénní rychlost či zlepšení pozic ve vyhledávání. Izolovaný Chrome má verzi 154.0.8037.58.

## Bezpečné další kroky

Nejprve připomínky majitele, jedna skutečná testovací poptávka z localhostu a potvrzení doručení. Potom kontrola na reálném mobilu, ověření aktuálního Pages source a výstupu. Teprve po výslovném souhlasu push pracovní větve, kontrolovaný PR a samostatné schválení nasazení do main podle PLAN.md. Žádný krok na GitHub ani DNS zatím neproběhl.
