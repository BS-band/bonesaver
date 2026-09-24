# BoneSaver: druhý audit a plán realizace

Datum: 24. 9. 2026. Výchozí commit: `0ec64811b8256ee6b29799fb4b9cbe7da8ed4c35`.

Potvrzený cíl majitele: hlavně získávat poptávky na hraní; vlastní tvorbu představit v samostatné sekci. Tento dokument je návrh. Stávající veřejné stránky dosud nebyly přepsány.

## 1. Co bylo ověřeno a co zatím ne

Prošel jsem všech pět obsahových HTML stránek, CSS, JavaScript, média, sitemapu a veřejné HTTP odpovědi. V izolovaném Chromium prohlížeči jsem změřil každou stránku při šířkách 320, 360, 390, 768, 860, 861, 900, 1024, 1280 a 1440 CSS pixelů. Prověřil jsem také světlou variantu homepage, hledání v repertoáru, metadata audia a validitu datumu v obou formulářích. Šlo o 50 kontrol rozměrů, nikoliv o úplný test všech kombinací ovládání, prohlížečů a zařízení.

Produkční repozitář je `BS-band/bonesaver`, výchozí větev `main`. Poslední tři veřejně dostupné úspěšné běhy Pages se vážou k větvi `main`. Poslední zveřejněný commit odpovídá pracovnímu základu. Konkrétní chráněné nastavení Pages přes anonymní `/pages` API dostupné nebylo; před prvním vzdáleným publikováním je vhodné zkontrolovat také nastavení zdroje a složky v Settings → Pages.

Ověřená přesměrování: `http://bonesaver.cz/`, `https://bonesaver.cz/` i `http://www.bonesaver.cz/` vracejí 301 na `https://www.bonesaver.cz/`. CNAME je `www.bonesaver.cz`. Toto nastavení funguje a doporučuji je zachovat.

Nebyla k dispozici data Search Console, Bing Webmaster Tools ani Seznam Webmaster, měření skutečných poptávek či terénní Core Web Vitals. Není proto možné tvrdit, jaké má web pozice, indexaci nebo kolik poptávek ztrácí. Designový směr níže je odborné doporučení pro tuto kapelu, nikoli tvrzení o změřené popularitě konkrétního vizuálního trendu.

## 2. Zpřesnění prvního auditu

- Homepage při skutečném viewportu 390 px nepřetéká: `innerWidth = clientWidth = scrollWidth = 390`, bez prvků přesahujících obrazovku. Původní screenshot při použití samotného CLI rozměru okna byl zavádějící a neopravňuje k závěru, že je celý mobilní web rozbitý.
- Konkrétní přetékání existuje: kontakt při 320 px dosahuje šířky dokumentu 362 px; při 360 px také mírně přesahuje. Při šířce 861 px přesahuje společná navigace na 880 px. Oprava má cílit na minimální šířky obsahu a breakpoint navigace.
- FAQ už je na kontaktu a obsahuje příjezd kapely, technické požadavky a hudbu o přestávkách. Má se rozšířit a zpřehlednit, ne vytvářet znovu od nuly.
- Chybějící `robots.txt` s HTTP 404 sám o sobě Google neblokuje. Doplnění je údržbové zlepšení a místo pro odkaz na sitemapu, ne zásadní odblokování indexace.
- Existuje funkční WAV fallback. HTML uvádí čtyři možné zdroje, z nichž tři neexistují; prohlížeč ale nemusí zkoušet všechny, jakmile nalezne přehratelný WAV. Přehrávač tedy není automaticky nefunkční. Potvrzená délka nahrávky je jen 4 sekundy.
- Počet položek v repertoáru je skutečně 174, z toho 16 vlastních. Zápis „170+“ je pravdivé zaokrouhlení, nikoliv věcný rozpor; sjednocení pomůže údržbě.
- Google od 7. 5. 2026 nezobrazuje FAQ rich results. `FAQPage` není priorita kvůli takovým výsledkům. Google také výslovně uvádí, že `llms.txt` nemá kladný ani záporný dopad na jeho vyhledávání.
- Twitter/X a doplňková Open Graph metadata mohou vylepšit sdílení odkazů, nejsou základní SEO ranking oprava. Není potřeba duplikovat celý blok kapely na každé stránce jen pro počet schémat.

## 3. Největší přínosy dalších úprav

| Priorita | Zjištění | Návrh a praktický dopad |
| --- | --- | --- |
| Vysoká | Oba formuláře mají `value="2026-06-20"`, JavaScript nastavuje minimum na aktuální den; 24. 9. je pole neplatné. | Výchozí datum prázdné, s možností „termín ještě neznám“; min odvodit z lokálního data. Návštěvník nemusí nejprve opravovat chybný předvýběr. |
| Vysoká | Tlačítko slibuje odeslání, ale kód pouze otevírá `mailto:`. | Vybrat skutečné serverové doručení a zobrazovat úspěch teprve po jeho potvrzení. Do té doby jasně označit přípravu e-mailu. |
| Vysoká | Čtyřsekundová audio ukázka je označena jako „Rock & Pop Live Medley“. | Vybrat reprezentativní 30–60 s záznam se zpěvem a nástroji; délku a popis uvádět poctivě. Do té doby upřednostnit existující hlavní video. |
| Vysoká | Na homepage je 28 repertoárových karet, reference až za velkým formulářem. | Ukázky zvuku a doložené reference posunout nahoru, repertoár zkrátit na 6 reprezentativních položek. Rychlejší rozhodnutí o poptávce. |
| Střední | Kontakt přetéká na 320–360 px, menu kolem 861 px. | `min-width: 0` tam, kde je potřebné, zalamování dlouhého e-mailu, dřívější mobilní navigace. Ověřit skutečný výsledek, nepřidávat pouze další skrytí overflow. |
| Střední | Ve světlém motivu má text přes tmavou hero fotografii tmavou barvu (`rgb(15,23,42)`). | Popisek přes fotografii má mít vlastní kontrastní barvy nezávislé na motivu. Audit obou témat po dokončení přechodu. |
| Střední | Hero náhled je portrétní fotografie u zdi, ale alt říká „na pódiu“ a popisek odkazuje na živé vystoupení. | Zvolit skutečný snímek videa/pódia nebo opravit popis. Pózovaná fotografie se dobře hodí do představení kapely. |
| Střední | Stejná hlavička/patička a mnoho inline stylů jsou opakované napříč stránkami. | Nejprve sjednotit CSS komponenty, potom případně zavést malý statický generátor. Nedělat současně změnu frameworku i celého obsahu. |
| Střední | 404 stránka všechny neexistující adresy klientsky přesměrovává na homepage. | Zachovat skutečné HTTP 404, zobrazit užitečné odkazy. Výslovná 301 přesměrování řešit pouze pro známé náhrady skutečně měněných URL. |
| Nižší | Chybí viditelné stavy klávesového fokusu u části ovládání, stav filtrů pro čtečky a popisek vyhledávání. | Doplnit focus-visible, label, aria-pressed, srozumitelné hlášení výsledků a omezení animací podle prefers-reduced-motion. |

Další údržba: favicon má přibližně 174 kB; logo JPEG 316 kB. To jsou vhodnější cíle optimalizace než honba za jedním „SEO skóre“. Obrázky komprimovat podle skutečně zobrazovaného rozměru, doplnit rozměry a varianty WebP/AVIF. Tři rodiny fontů načítané přes CSS `@import` zjednodušit; zejména ověřit, zda je Montserrat vůbec potřeba. Videa načítat přes lehký náhled až po kliknutí s dostupným titulkem a odkazem na YouTube.

## 4. Návrh vzhledu a obsahu

Zachovat rozpoznatelnou elektrickou modrou a tmavý pódiový základ. Zredukovat plošné záře a opakování stejných zaoblených karet. Působit především jako skutečná kapela: větší kvalitní snímky, čitelnější typografie, střídání kompozic a jasné hudební ukázky. Teplou barvu používat střídmě jako vedlejší akcent. Současné logo má vlastní charakter; pro malé velikosti připravit jednodušší čitelnou variantu navazující na stávající značku, nikoliv ho bez rozmyslu nahradit obecným monogramem.

První obrazovka:

> **BoneSaver – živá kapela z Pardubic**
>
> Pět muzikantů, saxofon a české i světové hity pro svatby, plesy a firemní večírky. Hrajeme ve východních Čechách i po celé republice.
>
> **Ověřit termín** · **Pustit živou ukázku**

Je to pracovní copy, které vychází ze současného webu; před zveřejněním potvrdit skutečný rozsah služby a aktuální sestavu. Netřeba vtěsnat všechny fráze do H1. Člověk i stroj mají rychle poznat název, činnost, lokalitu a další krok.

Pořadí homepage:

1. Krátká hlavní nabídka, autentická fotografie/video a dvě jasná tlačítka.
2. Jedna kvalitní živá ukázka a několik doložených referencí.
3. Tři cesty podle potřeby: svatby, plesy, firemní/veřejné akce.
4. Co zahrnuje vystoupení: technika, domluva programu a praktické podmínky.
5. Šest ukázek repertoáru a odkaz na kompletní vyhledávatelný seznam.
6. Krátké lidské představení kapely; vlastní tvorba jako samostatný odkaz.
7. Praktické otázky a jednoduchá poptávka. Kontaktní tlačítko dostupné po celou cestu.

Navigaci nerozšiřovat na osm až devět rovnocenných položek. Doporučení: „Pro vaši akci“ se třemi podstránkami, „Ukázky“, „Repertoár“, „O kapele“ a výrazný „Kontakt / Ověřit termín“. Vlastní tvorba bude mít samostatnou stránku propojenou z repertoáru, představení kapely a patičky; nezastíní hlavní nabídku pořadatelům.

Zachovat existující adresy `o-nas.html`, `repertoar.html`, `ukazky.html`, `kontakt.html`. Nové stránky mohou být například `kapela-na-svatbu.html`, `kapela-na-ples.html`, `firemni-a-verejne-akce.html`, `vlastni-tvorba.html`. Není důvod měnit stávající `.html` URL jen kvůli vzhledu adresy. Dělat nové stránky pouze s vlastním užitečným obsahem; nevytvářet desítky klonů pro jednotlivá města.

Na stránkách jednotlivých typů akcí uvést vhodné ukázky, průběh spolupráce, technické podmínky, délku hraní a co ovlivňuje cenu. Pokud majitel nechce veřejný ceník, postačí srozumitelně popsat cenotvorné parametry. Číselné sliby, dojezdové podmínky, reakční dobu a reference před publikací potvrdit. Fotografie lidí, citace i odkazy na pořadatele používat s oprávněním; neoznačovat současné reference za falešné jen proto, že je audit nezávisle neověřil.

## 5. SEO, AI vyhledávání a měření

Nejprve rozlišit dvě věci: nalezení kapely podle názvu a doporučení při obecném dotazu „kapela na svatbu Pardubice“. První stojí na konzistentní značce a entitě, druhé navíc na obsahové relevanci, lokalitě, důvěryhodných zmínkách a skutečných zkušenostech zákazníků. Nikdo nemůže slíbit první místo ani citaci v konkrétní AI odpovědi.

Technický základ:

- Ponechat serverově dostupný HTML obsah. Současných 174 písní je už přímo v HTML a vyhledávání bez diakritiky funguje; toto zachovat.
- Kanonická homepage zůstane `https://www.bonesaver.cz/`. Upravit interní odkazy na `/`, odstranit duplicitní `/index.html` ze sitemap, canonical ponechat. `/index.html` může dál fungovat kvůli starým odkazům. Nepřesměrovávat ho přes meta refresh.
- Sitemap obsahuje jen kanonické veřejné stránky, pravdivé lastmod. Hodnoty priority/changefreq nejsou způsob, jak si u Googlu zlepšit hodnocení.
- Produkční robots.txt má umožnit indexaci veřejného obsahu a odkázat na sitemapu. Kontrola noindex se týká výhradně preview.
- Propojit `MusicGroup` přes stabilní `@id` (např. `https://www.bonesaver.cz/#band`) s `WebSite`, příslušnými stránkami a kontaktem. `MusicGroup` už je podtyp `PerformingGroup`, není potřeba hromadit nadbytečné typy. Aktuální `roleName` přímo u `Person` nahradit správným modelem Role/OrganizationRole, případně jednodušším popisem člena.
- Doplnit pravdivé contactPoint, oblast působení, oficiální profily a vhodné obrázky. `VideoObject` přidávat se skutečným názvem, náhledem, délkou a datem nahrání. Strukturovaná data sama nezaručují video rich result; pro samostatné video vyhledávání zvažovat stránky, kde je konkrétní video hlavním obsahem.
- `Event` zavádět jen pro skutečné veřejné koncerty s konkrétními údaji. Z volných termínů nebo obecné nabídky svatby nedělat události. Nepřidávat hvězdičkové aggregateRating pouze z vlastních neověřených citací.
- Titulky a popisy psát pro jednotlivé záměry a lidi, bez řetězení klíčových slov. OG řeší zejména vzhled sdílení. Meta keywords nepovažovat za SEO práci.

Pro AI je důležitá srozumitelná informace v textu: kdo kapela je, odkud je, kde hraje, sestava, žánry, služby a oficiální kontakt. Krátké přesné odpovědi, reálné reporty z vystoupení a konzistentní zmínky z webů pořadatelů jsou užitečnější než speciální „AI texty“ ukryté před lidmi. ChatGPT vyhledávání používá OAI-SearchBot; povolení pro něj je nezávislé na GPTBot pro trénování. Povolení trénování není podmínkou dohledatelnosti ve vyhledávání.

Ověřit současné profily a údaje v Google Business Profile, Firmy.cz/Mapy a relevantních službách Bingu; zakládat jen skutečně způsobilé profily. Dostupnost Bing Places a jednotlivých funkcí ověřit pro český subjekt. Sjednotit název, oficiální web a kontakty s Facebookem/Instagramem/YouTube. Nové externí účty a registrace nejsou součástí nynější lokální přípravy.

Měřit hlavně počet dokončených poptávek, kliknutí na telefon, e-mail a přehrání ukázek. Google Search Console, Bing Webmaster Tools a Seznam Webmaster poslouží ke kontrole indexace a dotazů. Klik na odeslat není úspěšně doručená poptávka. Pro Core Web Vitals použít jako cíle LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 na 75. percentilu; lokální testy nedokládají dosažení terénních hodnot.

## 6. Formulář na GitHub Pages

GitHub Pages neumí spouštět serverový formulář. Samotné další HTML/JS proto spolehlivé doručení nevytvoří. Doporučuji nejprve vybrat jednoduchou hostovanou formulářovou službu s vhodnými podmínkami a otestovat doručení, antispam, chyby i potvrzení. Druhá možnost je vlastní malý endpoint například přes serverless funkci, která ale přidává provoz a správu tajných klíčů. Klíče nikdy nevkládat do veřejného HTML/JS.

Ve vývoji lze doručování simulovat a formulář neodesílat. Dokud není služba zvolená, zachovat přímý telefon/e-mail a pravdivě pojmenovat „Připravit e-mail“. Pole zkrátit na datum nebo jeho neznalost, místo, typ akce a kontakt; telefon může být nepovinný. Informaci o zpracování osobních údajů přizpůsobit skutečnému toku dat. Nevkládat automaticky povinný souhlas s marketingem do poptávky.

## 7. Realizace bez zásahu do ostrého webu

| Prostředí | Umístění | Účel |
| --- | --- | --- |
| Ostrý web | `main` → GitHub Pages → `https://www.bonesaver.cz/` | Současná veřejná verze. |
| Pracovní kopie | `codex/bonesaver-redesign`, samostatný worktree mimo OneDrive | Úpravy a lokální checkpointy. |
| Lokální náhled | `http://127.0.0.1:4174/` | Kontrola nových stránek na tomto PC. |
| Srovnání | `http://127.0.0.1:4173/` | Zobrazení původních souborů bez přepisování. |

Fáze A – provedeno: oddělený worktree a větev, dva lokální náhledy, kontrola produkčního způsobu nasazení, druhý audit. HTML/CSS/JS ostrého i pracovního webu zůstávají zatím shodné.

Fáze B – první implementační celek: opravit předvýběr data, kontakt na úzkých displejích, breakpoint navigace, kontrast fotografie ve světlém motivu a pravdivé chování poptávky. Opravy ověřit na všech pěti stránkách a obou tématech. Oddělený lokální commit umožní snadnou kontrolu.

Fáze C – nový vzhled homepage: zkrátit a přeskupit obsah, vybrat existující nejlepší živou ukázku, posunout důkazy a reference, navrhnout konkrétní fotografii a logo pro malé rozměry. Doladit desktop a mobil v lokálním náhledu. Bez automaticky přehrávaného zvuku, těžkého pozadí videa nebo zbytečného SPA frameworku.

Fáze D – obsah a SEO: nové stránky pro typy akcí a vlastní tvorbu, úprava textů, propojení, oprava sitemap a 404, strukturovaná data, optimalizace médií. Přesná tvrzení a nové záznamy závisí na skutečných podkladech od kapely. Formulářovou službu připojit až po volbě a ověření jejího doručování.

Fáze E – kontrola k vydání: 320–1440 px včetně hranic breakpointů, klávesnice, světlý/tmavý motiv, 174 skladeb a filtry, funkční ukázky, skutečné doručení formuláře, odkazy a HTTP stavy, canonical/robots/sitemap/schema. Podle dostupnosti doplnit skutečný Android/iPhone. Ověřit, že veřejný výstup neobsahuje preview noindex, localhost URL, interní podklady ani tajné údaje.

Fáze F – GitHub a nasazení připravené verze:

1. Aktualizovat přehled o `origin/main` a sladit případné mezitím přidané změny; nesmazat cizí práci. Ověřit aktuální Pages source. Před vydáním zaznamenat právě nasazený commit/tag, ne spoléhat na měsíce starý výchozí commit tohoto auditu.
2. Pushnout explicitně jen `codex/bonesaver-redesign`. Při ověřeném současném nastavení se tím `main` nemění a nové stránky se na ostré doméně nezveřejní.
3. Vytvořit pull request do `main` s přehledným diffem, snímky a výsledky kontrol. Náhled i změny budou konkrétní a zkontrolovatelné před zveřejněním.
4. Po odsouhlasení hotové verze sloučit ideálně squash mergem do `main`. Toto je vlastní okamžik předání změn do produkčního nasazení; Pages následně sestaví a publikuje web. Úspěch merge ještě neznamená úspěch deploye: počkat na dokončení Pages jobu.
5. Ponechat `CNAME = www.bonesaver.cz`, současné DNS a HTTPS. Ověřit veřejnou homepage, stávající URL, PDF, média, formulář a sitemap. Ověřit i přesměrování `bonesaver.cz` na `www.bonesaver.cz`.

Návrat: vrátit konkrétní release commit přes `git revert` nebo GitHub Revert PR a znovu nasadit Pages. Tím se zachová historie. Pokud se do vydání změní doména, DNS nebo externí formulářová služba, samotný revert souborů jejich nastavení nevrátí; proto tyto systémy zbytečně neměnit v rámci redesignu. Nyní nebyl proveden žádný push, PR, merge, změna Pages ani změna DNS.

Pro pozdější prohlížení z telefonu není `127.0.0.1` na telefonu adresa tohoto počítače. Zde připravený server úmyslně naslouchá jen na PC. Sdílený staging případně zřídit zvlášť s přístupovou ochranou a neindexováním; nepřipojovat k němu produkční doménu. Pro současnou lokální práci není další hosting nutný.

## 8. Zdroje ověřené 24. 9. 2026

- [Poslední úspěšný Pages build z main](https://github.com/BS-band/bonesaver/actions/runs/35974694599)
- [GitHub: publishing source pro Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Google: AI features a běžné SEO požadavky](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: změny FAQ rich results a llms.txt v roce 2026](https://developers.google.com/search/updates)
- [Google: robots.txt a chování při 4xx](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)
- [OpenAI: OAI-SearchBot, GPTBot a nezávislost jejich nastavení](https://developers.openai.com/api/docs/bots)

Snímky z kontroly jsou lokálně v `_dev/output/`. Report neobsahuje neveřejná analytická data ani tvrzení o ověřené pozici kapely ve vyhledávačích.
