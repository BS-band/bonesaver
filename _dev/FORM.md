# Poptávkový formulář BoneSaver

Lokální návrh používá Web3Forms stejně jako zdrojový web bsband.cz (`BS-band/BS-band.github.io`, formuláře v `index.html` a `kontakt.html`, kód v `script.js`). Přístupový klíč je stejný na obou stránkách zdrojového webu a je veřejný v jejich HTML. Konfigurace pracovní verze je v `web3forms-config.mjs`; generátor ji vloží do obou statických HTML stránek. Původní web zůstává beze změny. Zdroje uvádějí kontaktní e-mail `bonesavermusic@gmail.com`, ale přiřazení klíče ke schránce se nedá ověřit pouze čtením webu.

Vstupy stávajícího formuláře zůstaly: typ, známé nebo zatím neznámé datum, místo, jméno, e-mail, nepovinný telefon a poznámka. Odesílací požadavek obsahuje standardní pole Web3Forms `access_key`, `subject`, `from_name`, `name`, `email`, `phone`, `message` a prázdné antispamové pole `botcheck`. Zpráva navíc obsahuje typ, datum a místo akce. Úspěch se zobrazí jen po odpovědi `success: true` se stavem HTTP 2xx. Při odmítnutí nebo výpadku zůstávají vstupy vyplněné pro opakování. Po potvrzeném úspěchu se formulář vymaže. Tlačítko je během čekání zakázané a požadavek se po 15 sekundách ukončí.

Text na stránce Soukromí informuje o předání údajů Web3Forms. Při pouhém zobrazení stránky se kontakt s Web3Forms nenavazuje. Přímá e-mailová adresa a telefon zůstávají jako alternativní kontakty.

Automatická kontrola `_dev/verify.cjs` zachytí požadavek uvnitř prohlížeče a vrací simulovaný úspěch či odmítnutí. Kontroluje požadovaná pole, validaci, obnovení tlačítka, zachování údajů při chybě a chování na obou stránkách. Skutečné doručení do schránky, správnost konfigurace domén účtu a limity služby tím potvrzené nejsou. Pro kontrolu před publikací je potřeba jedna skutečná testovací zpráva z lokálního náhledu a ověření doručení majitelem.
