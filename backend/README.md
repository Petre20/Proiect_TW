# Backend WellTrack

Backend-ul foloseste FastAPI, SQLAlchemy, Alembic si PostgreSQL. Sunt implementate tabelele `users` si `sessions`, inregistrarea, verificarea emailului, autentificarea prin cookie, datele utilizatorului curent si logout-ul.

## 1. Mediul Python

Din directorul `backend/`, cu Python 3.11 sau mai nou:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

## 2. Configurarea locala

PostgreSQL trebuie sa fie pornit. Copiaza configuratia exemplu si completeaza parola locala a utilizatorului aplicatiei:

```sh
cp .env.example .env
```

Fisierul `.env` este exclus din Git. La pregatirea initiala pe acest laptop, el contine deja o parola generata local pentru `welltrack_app`; pastreaza fisierul existent. Fiecare coleg isi configureaza propria baza locala si propriile credentiale.

Pentru instalarea Homebrew configurata sa permita conexiuni locale administratorului, scriptul urmator creeaza rolul `welltrack_app` si baza `welltrack`, fara a inlocui obiecte existente:

```sh
python scripts/create_local_database.py --admin-user NUMELE_UTILIZATORULUI_LOCAL
```

Rolul aplicatiei este proprietarul bazei `welltrack`, are drept de conectare si nu are privilegii de superutilizator sau de creare a altor baze/roluri. Scriptul este destinat configurarii locale; alte servere pot necesita configurarea autentificarii administratorului.

## 3. Aplicarea migrarilor

```sh
alembic upgrade head
alembic current
```

Migrarea `0001` creeaza `users`, indexul unic pe `lower(email)` si constrangerile pentru rol, tokenul de verificare si valorile obligatorii. Alembic creeaza si tabelul tehnic `alembic_version`, care tine evidenta versiunii schemei.

Migrarea `0002` creeaza `sessions`, cu tokenuri unice, indexuri pentru utilizator si expirare si eliminarea sesiunilor la stergerea utilizatorului asociat. Sesiunile expira dupa 7 zile in configuratia implicita; backend-ul verifica expirarea si starea contului la fiecare acces protejat.

Interesele sunt stocate ca `TEXT[]`. Validarea vocabularului de teme, eliminarea duplicatelor si respingerea intereselor goale vor fi implementate odata cu endpoint-ul de actualizare a intereselor.

Modificarile viitoare ale modelelor se aplica prin migrari noi:

```sh
alembic revision --autogenerate -m "Describe schema change"
# Verifica migrarea generata inainte de aplicare.
alembic upgrade head
```

## 4. Pornirea API-ului

```sh
uvicorn app.main:app --reload
```

- Verificarea conexiunii: <http://127.0.0.1:8000/api/health>
- Documentatia API: <http://127.0.0.1:8000/docs>

Endpoint-ul health returneaza `200` daca poate interoga baza si `503` daca baza nu este disponibila. Nu creeaza tabele si nu introduce date.

In pgAdmin, dupa Refresh, tabelul apare sub `Databases → welltrack → Schemas → public → Tables → users`. Pentru o conexiune separata a aplicatiei poti folosi host `127.0.0.1`, port `5432`, baza `welltrack`, utilizatorul `welltrack_app` si parola din `.env`.

## 5. Verificari

```sh
pytest -q
alembic check
```

Testele care verifica efectiv constrangerile PostgreSQL se activeaza explicit, dupa aplicarea migrarilor:

```sh
WELLTRACK_RUN_DB_TESTS=1 pytest -q
```

Aceste teste folosesc baza configurata in `.env` si anuleaza inserarile prin rollback. Secventa identificatorilor poate avansa chiar daca inserarile sunt anulate.

## 6. Autentificare si emailuri locale

| Metoda | Endpoint | Rezultat |
|---|---|---|
| POST | `/api/auth/register` | Creeaza contul si pregateste emailul de verificare; raspunde cu 201. |
| POST | `/api/auth/verify-email` | Valideaza tokenul si confirma emailul; raspunde cu 200. |
| POST | `/api/auth/resend-verification` | Solicita un token nou, cu pauza de cel putin 60 de secunde; raspunde generic cu 202. |
| POST | `/api/auth/login` | Verifica parola si contul, seteaza cookie-ul si returneaza datele publice ale utilizatorului. |
| GET | `/api/auth/me` | Returneaza datele utilizatorului cu sesiune valida. |
| POST | `/api/auth/logout` | Sterge sesiunea curenta si cookie-ul; raspunde cu 204. |

Toate cererile POST necesita headerul `X-Requested-With: WellTrack`, afisat si ca parametru in Swagger. Backend-ul verifica originile cererilor pentru protectie CSRF. Cererile GET nu necesita acest header.

Parolele de inregistrare trebuie sa aiba intre 12 si 128 de caractere si sunt stocate ca hash-uri Argon2id. Rolul este stabilit de server la `user`. Parolele, hash-urile si tokenurile nu sunt incluse in raspunsurile API. Emailurile sunt normalizate la litere mici.

Implicit, `EMAIL_DELIVERY=local`: nu se trimit emailuri pe internet. Continutul este salvat in fisiere JSON private din `backend/.local/emails/`, director exclus din Git. Aceste fisiere contin linkuri de verificare si trebuie pastrate local. Tokenurile expira dupa 60 de minute si devin invalide dupa folosire sau retrimitere.

### Testarea manuala in Swagger

1. Porneste backend-ul si deschide <http://127.0.0.1:8000/docs>.
2. Executa `POST /api/auth/register`, completand `X-Requested-With` cu `WellTrack` si corpul cererii:

   ```json
   {"name": "Test User", "email": "test@example.com", "password": "O-parola-de-test-2026!"}
   ```

3. Deschide cel mai recent fisier JSON din `.local/emails/`. Campul `verification_url` contine `token=...`; copiaza valoarea tokenului. Linkul vizeaza viitoarea pagina React `/verify-email`, care nu este implementata in backend.
4. Executa `POST /api/auth/verify-email`, cu acelasi header si corpul `{"token": "valoarea-copiata"}`.
5. Executa `POST /api/auth/login` cu emailul, parola si acelasi header. Browserul pastreaza cookie-ul `welltrack_session`.
6. Executa `GET /api/auth/me`, apoi `POST /api/auth/logout`. Dupa logout, `/me` raspunde cu 401.

Login-ul este respins pentru email neverificat sau cont dezactivat. O sesiune expirata ori inexistenta primeste 401. Un cont dezactivat primeste 403 inclusiv atunci cand are deja o sesiune.

### Integrarea React

Frontend-ul trimite cererile cu `credentials: "include"` si headerul personalizat pentru POST. Pentru dezvoltare folositi acelasi nume de host, de exemplu frontend pe `127.0.0.1:5173` si API pe `127.0.0.1:8000`, pentru compatibilitate cu politica `SameSite=Lax` a cookie-ului.

```javascript
const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "WellTrack"
  },
  body: JSON.stringify({ email, password })
});
```

Originile permise sunt configurabile prin `CORS_ORIGINS`; wildcard-urile nu sunt acceptate. Cookie-ul este `HttpOnly`, astfel incat React identifica utilizatorul prin `/auth/me`.

### Trimiterea reala prin Resend

Completeaza local in `.env` valorile `EMAIL_DELIVERY=resend`, `RESEND_API_KEY` si `EMAIL_FROM`, folosind un expeditor configurat in contul Resend, apoi reporneste backend-ul. Trimiterea foloseste API-ul HTTPS Resend prin HTTPX. Nu adauga cheia API in Git.

Pentru productie, `APP_ENV=production` necesita `SESSION_COOKIE_SECURE=true`, `FRONTEND_URL` si origini CORS HTTPS si trimitere reala prin Resend. Toate acestea sunt documentate si in `.env.example`.

Limitarea incercarilor de autentificare este locala, pe IP si endpoint, implicit 10 cereri pe minut. Contoarele sunt in memorie si se reseteaza la repornire; o instalare cu mai multe procese necesita un mecanism comun de limitare. Testele Resend folosesc raspunsuri simulate si nu trimit emailuri reale.
