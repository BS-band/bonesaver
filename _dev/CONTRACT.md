# Smlouva o zajištění hudební produkce

Pracovní vzor připraven 24. 9. 2026. Nejde o právní stanovisko ani o podepsanou smlouvu. Nic nebylo zveřejněno na GitHub nebo ostrý web.

## Výstupy a umístění na webu

Oba formáty jsou v `assets/documents/bonesaver-smlouva-hudebni-produkce-vzor` s příponami `.pdf` a `.docx`. PDF je přímý export stejného Word dokumentu, nikoli zvlášť přepsaný text. Dokument má 5 stran včetně technické přílohy, všechny stránky byly vizuálně prohlédnuty.

Odkazy jsou na kontaktu pod poptávkou, před FAQ: `http://127.0.0.1:4174/kontakt.html#dokumenty`. Závěrečná kontaktní sekce na stránkách svateb, plesů, firemních akcí a dalších obsahových podstránkách odkazuje na toto místo. Současná hlavní navigace se nerozšiřovala. Vývojový server podporuje správný DOCX MIME typ.

## Výslovně schválené podmínky od majitele

- Záloha 50 % celkové dohodnuté ceny do 14 dnů od podpisu smlouvy. V textu upřesněno jako podpis poslední ze stran.
- Doplatek 50 % po skončení sjednaného vystoupení.
- Při dobrovolném zrušení pořadatelem storno 50 % ceny. Již uhrazená záloha se započte, neúčtuje se dalších 50 % navíc.
- Kapela může své vystoupení smluvně zrušit pouze pro doložitelné zdravotní potíže člena, nelze-li vystoupit bez něj ani s náhradou.
- Nejdříve hledat řešení: záskok, menší obsazení nebo doporučení jiné kapely. Jiné obsazení a náhradní kapela vyžadují dohodu s pořadatelem.

Přidaná návrhová ustanovení k právnímu odsouhlasení: oznamování na smluvní e-mail, vrácení přeplatků nebo úhrad za zrušené plnění do 14 dnů, lhůta k doplacení storna při neuhrazené záloze, zachování zákonných práv pořadatele a ochrany spotřebitele. Zákonnou nemožnost plnění nelze zaměňovat s volným právem kapely akci rušit.

## Před zveřejněním a prvním podpisem

1. Doporučena kontrola českým advokátem, zejména přiměřenost jednotného 50% storna vůči spotřebitelům i při zrušení s velkým předstihem. Obecná výhrada zákonných práv sama nezaručuje platnost konkrétní výše storna.
2. Potvrdit aktuální identifikační údaje poskytovatele a plátcovství DPH. Převzato z existujícího webu, nikoli z nezávisle prověřeného rejstříku.
3. Doplnit účet, způsob úhrady, skutečnou cenu, daňový režim a všechny údaje konkrétní akce. U termínů sjednaných méně než 14 dnů před hraním dohodnout, jak bude záloha prakticky uhrazena; nezavedena neodsouhlasená zkrácená splatnost.
4. Potvrdit techniku, čas příjezdu, místo, napájení a bezpečné řešení venkovní akce. Do přílohy nebyly dosazeny neověřené technické limity.
5. Podle typu akce vyřešit autorská práva a kolektivní správu. Soukromé a veřejné akce nejsou automaticky stejný licenční případ; záznamy a propagace nejsou automaticky povoleny.
6. Ověřit spotřebitelské informace včetně dopadu § 1837 písm. j) na konkrétní plnění. Text neobsahuje neomezené vzdání se spotřebitelských práv ani tvrzení, že nemoc automaticky ruší veškerou odpovědnost kapely.

## Podklady pro právní kontrolu

Při přípravě byly přečteny relevantní pasáže občanského zákoníku v konsolidovaném znění dostupném na [Zákony pro lidi](https://www.zakonyprolidi.cz/cs/2012-89), zejména § 1746, § 1812 až 1814, § 1837, § 2006 a § 2913. Jde o sekundární zdroj; právník má ověřit aktuální účinné znění a aplikaci na vaši praxi. V dokumentu je uvedena Česká obchodní inspekce jako subjekt ADR pro spotřebitelské spory, nikoli zrušená evropská ODR platforma.

## Údržba a kontrola

Zdroj: `_dev/build-contract.py` (python-docx). Spouštět přes Python z přibaleného runtime, nevyžaduje internet. Veřejné Word/PDF jsou výsledné soubory; po jejich ruční úpravě již nelze spustit generátor bez přenesení změn zpět do zdroje.

V tomto prostředí není dostupný LibreOffice renderer. Jeho spuštění skončilo chybou chybějícího `soffice.exe`; nebyl použit instalovaný LibreOffice. Náhradní `_dev/export-contract.ps1` otevře pouze náš dokument pro čtení ve vlastní skryté instanci Microsoft Word, vyexportuje PDF a tuto instanci uzavře. Existující uživatelské dokumenty neupravuje. PDF pak bylo vykresleno pomocí přibaleného Poppleru a všech pět stran vizuálně zkontrolováno. Odstraněna zděděná barevná čára ve stylu Title.

`_dev/verify-contract.py` ověří textovou shodu DOCX a PDF, počet stran, schválené obchodní podmínky a nepřítomnost maker. Kontrola webu: `_dev/verify.cjs`; navíc test stažení obou souborů, MIME typů a shody stažených bajtů s lokálními výstupy. Výstupy kontrol jsou v ignorovaném `_dev/output/`.

Dokumenty nejsou formulář s automatickým podpisem. Pole se upravují ve Wordu; PDF je určené pro čtení a tisk. Nikdo nebyl jménem majitele kontaktován a žádná smlouva nebyla uzavřena.
