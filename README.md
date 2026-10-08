# Sort Adventure

Mini-joc educativ în română, construit cu **Laravel 12, Blade, CSS și JavaScript fără biblioteci frontend**. Include zece niveluri, personaje SVG, schimburi animate, indicii, sunet opțional și progres salvat în sesiune. Nu necesită Node pentru rularea aplicației, bază de date sau compilarea resurselor.

## Pornire Laravel

Ai nevoie de PHP **8.2 sau mai nou**, Composer și extensiile PHP cerute de Laravel. Vezi [cerințele oficiale](https://laravel.com/docs/12.x/deployment#server-requirements).

Dezarhivează proiectul și deschide terminalul în folderul `sort-adventure`:

```bash
composer install
php -r "copy('.env.example', '.env');"
php artisan key:generate
php artisan serve
```

Deschide **http://localhost:8000**. Comanda de copiere este pentru prima instalare: dacă ai deja `.env`, păstrează fișierul existent. Nu este necesară comanda `migrate`.

## Niveluri și mecanică

| Nivel | Lume | Mod | Ordine |
| --- | --- | --- | --- |
| 1 | Pinguini, numere 1–5 | Mutare directă | Crescătoare |
| 2 | Broscuțe, numere pare 2–12 | Mutare directă | Crescătoare |
| 3 | Mașinuțe, numere 1–7 | Mutare directă | Descrescătoare |
| 4 | Pinguini, numere 1–6 | Bubble Sort | Crescătoare |
| 5 | Planete, numere 3, 7, 12, 18, 24, 31, 45 | Bubble Sort | Crescătoare |
| 6 | Mașinuțe, multipli de 5 până la 40 | Bubble Sort | Descrescătoare |
| 7 | Broscuțe, 8 numere impare 1–15 | Mutare directă | Crescătoare |
| 8 | Planete, 8 numere variate 4–60 | Bubble Sort | Crescătoare |
| 9 | Mașinuțe, 9 multipli de 6 până la 54 | Mutare directă | Descrescătoare |
| 10 | Pinguini, 9 numere variate 2–54 | Bubble Sort | Descrescătoare |

**Mutare directă:** apasă un obiect. Numărul ajunge la poziția lui din șirul final și schimbă locul cu obiectul de acolo. Poziția este rangul numărului în șirul ordonat; de exemplu, 12 poate ocupa poziția 3. Numerele deja plasate nu adaugă schimburi.

**Bubble Sort:** sunt evidențiați doi vecini. Apasă oricare dintre ei sau „Compară vecinii”. Jocul schimbă numerele numai dacă sunt în ordinea greșită, apoi avansează o poziție. „Animează o trecere” parcurge automat comparațiile unei singure treceri; poți opri animația. La finalul trecerii, intervalul activ se micșorează. Jocul se termină imediat ce șirul este ordonat.

La terminare se deblochează nivelul următor. Poți rejuca orice nivel deblocat. Sunt păstrate cel mai bun număr de schimburi și partida curentă.

## Progres

În Laravel, progresul este păstrat pe server în sesiuni de tip fișier; browserul primește un cookie de sesiune. Configurația implicită are o durată de inactivitate de 30 de zile. Nu există conturi sau sincronizare între dispozitive. Ștergerea cookie-ului sau expirarea/ștergerea sesiunii pierde accesul la progresul respectiv.

Mutările sunt calculate pe server. Cererile nu pot trimite un șir „rezolvat” sau debloca direct un nivel. Sunt validate obiectele, perechile active și nivelurile accesibile. Identificatorul partidei și revizia resping cererile vechi; blocarea sesiunii serializează cererile concurente. Rutele POST folosesc protecția CSRF Laravel.

## Personalizare

- `config/game.php`: numere, personaje, ordine, mod și titluri.
- `app/Services/SortingGame.php`: regulile jocului.
- `app/Http/Controllers/GameController.php`: validare și progres.
- `resources/views/game.blade.php`: interfața în română.
- `public/assets/game.css`: aspect și adaptare la ecrane mici.
- `public/assets/characters.js`: ilustrații SVG originale.
- `public/assets/game.js`: interacțiune, sunet și animații.

Personaje disponibile: `penguin`, `frog`, `car`, `planet`. Teme: `ice`, `pond`, `race`, `space`. Moduri: `direct`, `bubble`. Direcții: `asc`, `desc`.

Păstrează identificatori consecutivi de la 1 și cel puțin două numere întregi distincte în fiecare nivel. Adăugarea unor niveluri la final păstrează progresul și deblochează următorul nivel pentru cei care au terminat vechiul ultim nivel. Dacă modifici mecanica sau numerele nivelurilor existente, migrează partidele vechi. Demo-ul are propriul `preview/levels.json`, care trebuie actualizat separat.


La prima rulare verifică în browser: terminarea nivelului 1 și accesul la 2, mutările dintre vecini în nivelul 4, reîncărcarea cu progres păstrat, animația unei treceri, sunetul și afișarea pe telefon. Nivelurile 4–10 devin accesibile după terminarea celor precedente.

Resurse: [instalare Laravel](https://laravel.com/docs/12.x/installation), [sesiuni și blocare](https://laravel.com/docs/12.x/session#session-blocking).
