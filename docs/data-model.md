
# 2. Modelul preliminar al bazei de date – WellTrack

## 2.1. Descriere generală

Baza de date a aplicației **WellTrack** va fi implementată folosind **PostgreSQL**.

Modelul preliminar conține 9 tabele:

- `users` – conturile utilizatorilor, verificarea emailului și interesele pentru recomandarea articolelor.
- `sessions` – sesiunile de autentificare.
- `activity_types` – tipurile de activități definite de utilizatori.
- `activities` – istoricul activităților efectuate.
- `habits` – obiceiurile definite de utilizatori.
- `habit_schedule` – zilele programate pentru obiceiuri.
- `habit_completions` – istoricul realizării obiceiurilor.
- `goals` – obiectivele personale.
- `articles` – catalogul comun de articole educaționale.

**Observație:** Activities și Habits sunt independente. Un utilizator poate înregistra activități fără să bifeze obiceiuri și invers.

## 2.2. Structura tabelelor

### Tabelul `users`

Stochează informațiile necesare autentificării, verificării emailului, administrării conturilor și recomandării articolelor după interesele selectate.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `name` | VARCHAR(100) | Numele utilizatorului |
| `email` | VARCHAR(255) | Adresa de email |
| `password_hash` | TEXT | Hash-ul parolei |
| `role` | VARCHAR(20) | `user` sau `admin` |
| `is_active` | BOOLEAN | Starea contului |
| `email_verified` | BOOLEAN | Indică dacă emailul a fost verificat |
| `email_verification_token_hash` | TEXT, NULL | Hash-ul tokenului de verificare |
| `email_verification_expires_at` | TIMESTAMPTZ, NULL | Momentul expirării tokenului |
| `interests` | TEXT[] | Lista temelor de interes selectate, de exemplu `running`, `habits` sau `recovery` |
| `created_at` | TIMESTAMPTZ | Momentul creării contului |

**Constrângeri:**
- `email` trebuie să fie unic, fără diferențiere între litere mari și mici.
- `role` acceptă valorile `user` și `admin`, având implicit `user`.
- `is_active` are implicit valoarea `TRUE`.
- `email_verified` are implicit valoarea `FALSE`.
- Un cont dezactivat nu poate accesa aplicația.
- Autentificarea este permisă numai după verificarea emailului.
- Câmpurile tokenului și expirării sunt fie ambele completate, fie ambele `NULL`.
- Un utilizator poate avea un singur token de verificare valid la un moment dat.
- `interests` este obligatoriu și are implicit valoarea unui tablou gol (`{}`).
- Interesele nu pot conține valori `NULL`, goale sau duplicate. Backend-ul validează valorile folosind același vocabular de teme ca pentru `articles.topic`.

**Observații:**
- Parolele sunt stocate exclusiv sub formă de hash.
- Tokenul de verificare este generat aleatoriu și trimis utilizatorului prin email.
- În baza de date se stochează doar hash-ul tokenului.
- După verificarea emailului, `email_verified` devine `TRUE`, iar câmpurile aferente tokenului sunt resetate la `NULL`.
- La retrimiterea emailului, tokenul anterior este înlocuit și devine invalid.

### Tabelul `sessions`

Stochează sesiunile utilizatorilor autentificați.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `user_id` | BIGINT (FK) | Utilizatorul autentificat |
| `session_token_hash` | TEXT | Hash-ul tokenului de sesiune |
| `created_at` | TIMESTAMPTZ | Momentul creării sesiunii |
| `expires_at` | TIMESTAMPTZ | Momentul expirării sesiunii |

**Constrângeri:**
- `user_id` referă `users(id)`.
- `session_token_hash` trebuie să fie unic.
- `expires_at` trebuie să fie ulterior lui `created_at`.
- Un utilizator poate avea mai multe sesiuni simultan.

**Observații:**
- Aplicația folosește autentificare session-based.
- Sesiunea este creată după autentificarea reușită.
- Browserul primește un cookie `HttpOnly` care conține tokenul sesiunii.
- În baza de date se păstrează doar hash-ul tokenului.
- La logout, sesiunea este invalidată.
- Sesiunile expirate sunt respinse și pot fi eliminate periodic.
- Backend-ul verifică starea contului și permisiunile utilizatorului la accesarea resurselor protejate.
- În producție, cookie-urile vor utiliza `Secure`, o politică `SameSite` adecvată și protecție CSRF.

### Tabelul `activity_types`

Conține tipurile de activități definite individual de fiecare utilizator.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `user_id` | BIGINT (FK) | Utilizatorul care a definit activitatea |
| `name` | VARCHAR(100) | Denumirea activității |
| `created_at` | TIMESTAMPTZ | Momentul definirii activității |

**Constrângeri:**
- `user_id` referă `users(id)`.
- Combinația `(user_id, name)` trebuie să fie unică.
- Fiecare utilizator își poate defini propriile tipuri de activități.
- Tipurile de activități sunt independente de obiceiuri.

### Tabelul `activities`

Stochează fiecare înregistrare a unei activități efectuate de utilizator.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `user_id` | BIGINT (FK) | Utilizatorul asociat |
| `activity_type_id` | BIGINT (FK) | Tipul activității |
| `activity_date` | DATE | Data efectuării activității |
| `start_time` | TIME, NULL | Ora începerii activității |
| `duration_minutes` | INTEGER, NULL | Durata activității |
| `distance_km` | NUMERIC(8,2), NULL | Distanța parcursă |
| `intensity` | VARCHAR(20), NULL | Intensitatea activității |
| `notes` | TEXT, NULL | Observații opționale |
| `created_at` | TIMESTAMPTZ | Momentul înregistrării |

**Constrângeri:**
- `user_id` referă `users(id)`.
- `activity_type_id` referă `activity_types(id)`.
- Tipul activității trebuie să aparțină utilizatorului.
- `duration_minutes` și `distance_km` trebuie să fie pozitive atunci când sunt completate.
- `intensity` acceptă valorile `light`, `moderate`, `hard` sau `NULL`.
- Același tip de activitate poate fi înregistrat de mai multe ori în aceeași zi.

**Observație:** `activity_date` reprezintă data realizării activității, în timp ce `created_at` reprezintă momentul introducerii în aplicație.

### Tabelul `habits`

Stochează obiceiurile repetitive definite de utilizatori.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `user_id` | BIGINT (FK) | Proprietarul obiceiului |
| `name` | VARCHAR(150) | Denumirea obiceiului |
| `frequency` | VARCHAR(20) | `daily` sau `selected_days` |
| `start_date` | DATE | Data începerii obiceiului |
| `is_archived` | BOOLEAN | Indică dacă obiceiul este arhivat |
| `created_at` | TIMESTAMPTZ | Momentul creării |

**Constrângeri:**
- `user_id` referă `users(id)`.
- `frequency` acceptă valorile `daily` și `selected_days`.
- `is_archived` are implicit valoarea `FALSE`.
- Arhivarea unui obicei nu șterge istoricul realizărilor.
- Obiceiurile sunt independente de activități.

### Tabelul `habit_schedule`

Stochează zilele săptămânii în care este programat un obicei.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `habit_id` | BIGINT (PK, FK) | Obiceiul asociat |
| `weekday` | SMALLINT (PK) | Ziua săptămânii (1–7) |

**Constrângeri:**
- `habit_id` referă `habits(id)`.
- Cheia primară este `(habit_id, weekday)`.
- `weekday` acceptă valori între 1 (luni) și 7 (duminică).
- Pentru `selected_days` trebuie selectată cel puțin o zi.
- Pentru `daily`, toate zilele sunt considerate programate implicit.

### Tabelul `habit_completions`

Stochează zilele în care utilizatorul a bifat realizarea unui obicei.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `habit_id` | BIGINT (FK) | Obiceiul realizat |
| `completion_date` | DATE | Data realizării |
| `created_at` | TIMESTAMPTZ | Momentul bifării |

**Constrângeri:**
- `habit_id` referă `habits(id)`.
- Combinația `(habit_id, completion_date)` trebuie să fie unică.
- Un obicei poate fi bifat o singură dată pentru aceeași zi.

**Observație:** Bifarea confirmă realizarea obiceiului, fără stocarea unei cantități numerice.

### Tabelul `goals`

Stochează obiectivele personale ale utilizatorilor.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `user_id` | BIGINT (FK) | Proprietarul obiectivului |
| `activity_type_id` | BIGINT (FK), NULL | Tipul activității urmărite |
| `habit_id` | BIGINT (FK), NULL | Obiceiul urmărit |
| `name` | VARCHAR(150) | Denumirea obiectivului |
| `target_value` | NUMERIC(10,2) | Valoarea țintă |
| `target_unit` | VARCHAR(20) | `sessions`, `minutes`, `km`, `days` |
| `period` | VARCHAR(20) | `daily`, `weekly`, `monthly`, `custom` |
| `start_date` | DATE | Data începerii obiectivului |
| `end_date` | DATE, NULL | Data încheierii |
| `is_active` | BOOLEAN | Starea obiectivului |
| `created_at` | TIMESTAMPTZ | Momentul creării |

**Constrângeri:**
- `user_id` referă `users(id)`.
- `activity_type_id` referă `activity_types(id)`, dacă este completat.
- `habit_id` referă `habits(id)`, dacă este completat.
- `target_value` trebuie să fie pozitiv.
- `end_date` trebuie să fie mai mare sau egală cu `start_date`.
- `activity_type_id` și `habit_id` nu pot fi completate simultan.
- Activitatea sau obiceiul asociat trebuie să aparțină utilizatorului.

**Interpretarea obiectivelor:**
- `activity_type_id` completat: obiectiv pentru o anumită activitate.
- `habit_id` completat: obiectiv pentru un anumit obicei.
- Ambele câmpuri `NULL`: obiectiv pentru toate activitățile.

**Unități permise:**
- Activități: `sessions`, `minutes`, `km`.
- Obiceiuri: `days`.

**Observație:** Progresul obiectivelor nu este stocat separat, ci calculat din `activities` sau `habit_completions`.

### Tabelul `articles`

Stochează articolele educaționale disponibile în secțiunea Learn. Catalogul este comun tuturor utilizatorilor; fiecare articol este stocat o singură dată.

| Câmp | Tip PostgreSQL | Descriere |
|---|---|---|
| `id` | BIGINT (PK) | Identificator unic |
| `title` | VARCHAR(255) | Titlul articolului |
| `summary` | TEXT | Rezumatul afișat în lista articolelor |
| `content` | TEXT, NULL | Conținutul articolului în format Markdown, atunci când este disponibil pentru afișare în aplicație |
| `topic` | VARCHAR(50) | Tema principală, de exemplu `running`, `habits` sau `recovery` |
| `image_url` | TEXT, NULL | Adresa imaginii de prezentare |
| `source_name` | VARCHAR(150), NULL | Denumirea sursei pentru un articol extern |
| `source_url` | TEXT, NULL | Linkul către articolul original, dacă există |
| `published_at` | TIMESTAMPTZ | Momentul publicării articolului |
| `created_at` | TIMESTAMPTZ | Momentul adăugării în catalog |
| `updated_at` | TIMESTAMPTZ | Momentul ultimei actualizări a înregistrării |

**Constrângeri:**

- `title`, `summary` și `topic` sunt obligatorii și nu pot fi șiruri goale sau formate doar din spații.
- Articolul trebuie să aibă fie un `content` nevid, fie un `source_url` nevid, fie ambele.
- `updated_at` trebuie să fie mai mare sau egal cu `created_at`.
- Fiecare articol are o singură temă principală, păstrată direct în câmpul `topic`.

**Observații:**

- Articolele pot fi proprii sau preluate din surse care permit utilizarea conținutului. Alegerea și integrarea unui API extern vor fi stabilite ulterior.
- Dacă este disponibil doar rezumatul și linkul original, utilizatorul va putea deschide articolul la sursă. Lectura integrală în aplicație necesită completarea câmpului `content`.
- Cuprinsul și timpul estimat de lectură pot fi calculate din conținut, fără câmpuri suplimentare.
- Recomandarea articolelor se bazează pe potrivirea dintre `topic` și lista `users.interests`.

### Recomandarea articolelor după interese

Interesele sunt selectate explicit de utilizator și pot fi actualizate ulterior. Pentru această versiune, lista este păstrată direct în `users.interests`, fără un tabel suplimentar.

**Comportament propus:**

1. Backend-ul identifică utilizatorul din sesiune și citește interesele selectate.
2. Selectează articolele a căror temă principală apare în `users.interests` și le ordonează după `published_at` descrescător, apoi după `id` descrescător.
3. Dacă utilizatorul nu a selectat interese sau nu există articole potrivite, afișează cele mai recente articole din catalog ca selecție generală.
4. Modificarea intereselor este reflectată la următoarea solicitare a recomandărilor.

De exemplu, pentru interesele `running` și `recovery`, sunt recomandate articolele cu una dintre aceste teme. Recomandările sunt calculate la cerere; nu se stochează o relație individuală între utilizator și articol.

## 2.3. Relațiile dintre tabele

| Relație | Cardinalitate | Descriere |
|---|---|---|
| `users` → `sessions` | 1:N | Un utilizator poate avea mai multe sesiuni |
| `users` → `activity_types` | 1:N | Un utilizator poate defini mai multe tipuri de activități |
| `users` → `activities` | 1:N | Un utilizator poate înregistra mai multe activități |
| `activity_types` → `activities` | 1:N | Un tip poate avea mai multe înregistrări |
| `users` → `habits` | 1:N | Un utilizator poate defini mai multe obiceiuri |
| `habits` → `habit_schedule` | 1:N | Un obicei poate avea mai multe zile programate |
| `habits` → `habit_completions` | 1:N | Un obicei poate avea mai multe realizări |
| `users` → `goals` | 1:N | Un utilizator poate avea mai multe obiective |
| `activity_types` → `goals` | 1:N (opțional) | Un tip poate fi urmărit de mai multe obiective |
| `habits` → `goals` | 1:N (opțional) | Un obicei poate fi urmărit de mai multe obiective |

Tabelul `articles` reprezintă un catalog comun și nu are o cheie externă către `users`. Potrivirea temelor cu interesele utilizatorului este realizată de backend la calcularea recomandărilor.

## 2.4. Diagrama ERD

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ activity_types : defines
    users ||--o{ activities : records
    users ||--o{ habits : creates
    users ||--o{ goals : sets

    activity_types ||--o{ activities : categorizes
    activity_types o|--o{ goals : targeted_by

    habits ||--o{ habit_schedule : scheduled_on
    habits ||--o{ habit_completions : completed_on
    habits o|--o{ goals : targeted_by

    users {
        bigint id PK
        varchar name
        varchar email UK
        text password_hash
        varchar role
        boolean is_active
        boolean email_verified
        text email_verification_token_hash
        timestamptz email_verification_expires_at
        text[] interests
        timestamptz created_at
    }

    sessions {
        bigint id PK
        bigint user_id FK
        text session_token_hash UK
        timestamptz created_at
        timestamptz expires_at
    }

    activity_types {
        bigint id PK
        bigint user_id FK
        varchar name
        timestamptz created_at
    }

    activities {
        bigint id PK
        bigint user_id FK
        bigint activity_type_id FK
        date activity_date
        time start_time
        integer duration_minutes
        numeric distance_km
        varchar intensity
        text notes
        timestamptz created_at
    }

    habits {
        bigint id PK
        bigint user_id FK
        varchar name
        varchar frequency
        date start_date
        boolean is_archived
        timestamptz created_at
    }

    habit_schedule {
        bigint habit_id PK,FK
        smallint weekday PK
    }

    habit_completions {
        bigint id PK
        bigint habit_id FK
        date completion_date
        timestamptz created_at
    }

    goals {
        bigint id PK
        bigint user_id FK
        bigint activity_type_id FK
        bigint habit_id FK
        varchar name
        numeric target_value
        varchar target_unit
        varchar period
        date start_date
        date end_date
        boolean is_active
        timestamptz created_at
    }

    articles {
        bigint id PK
        varchar title
        text summary
        text content
        varchar topic
        text image_url
        varchar source_name
        text source_url
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
    }

```

## 2.5. Autentificarea și verificarea emailului

Aplicația va utiliza autentificare bazată pe sesiuni, cu stocarea acestora în PostgreSQL.

### Înregistrarea utilizatorului

1. Utilizatorul completează formularul de înregistrare.
2. FastAPI validează datele și creează contul în `users`, cu `email_verified = FALSE`.
3. Sistemul generează un token de verificare.
4. Hash-ul tokenului și data expirării sunt salvate în `users`.
5. Utilizatorul primește un email cu linkul de verificare.
6. La accesarea linkului, FastAPI validează tokenul și expirarea.
7. Dacă verificarea reușește, `email_verified` devine `TRUE`, iar câmpurile aferente tokenului sunt resetate la `NULL`.

Dacă utilizatorul solicită un nou email, sistemul generează un token nou și îl înlocuiește pe cel anterior.

### Autentificarea utilizatorului

1. Utilizatorul introduce emailul și parola.
2. FastAPI verifică datele de autentificare.
3. Sistemul verifică `is_active` și `email_verified`.
4. Dacă verificările reușesc, se creează o înregistrare în `sessions`.
5. Browserul primește un cookie `HttpOnly` cu tokenul de sesiune.
6. La cererile ulterioare, FastAPI validează sesiunea și drepturile utilizatorului.

### Deconectarea utilizatorului

1. Utilizatorul selectează opțiunea Logout.
2. FastAPI invalidează sesiunea curentă.
3. Cookie-ul sesiunii este eliminat din browser.
4. Utilizatorul nu mai poate accesa endpoint-urile protejate folosind sesiunea respectivă.

## 2.6. Calcularea statisticilor

Statisticile vor fi calculate folosind datele existente, fără tabele suplimentare.

| Funcționalitate | Sursa datelor |
|---|---|
| Activități recente | `activities` + `activity_types` |
| Minute active | Suma `duration_minutes` |
| Distanță totală | Suma `distance_km` |
| Statistici săptămânale/lunare | Agregări din `activities` |
| Obiceiuri programate | `habits` + `habit_schedule` |
| Progresul obiceiurilor | `habit_completions` |
| Progresul obiectivelor | `goals` + `activities` sau `habit_completions` |
| Calendarul activităților | Activități grupate după dată |

## 2.7. Principalele endpoint-uri propuse

Backend-ul FastAPI va expune un API REST cu prefixul `/api`. Rutele din tabelele de mai jos sunt relative la acest prefix. Datele vor fi transmise în format JSON, cu excepția fișierelor CSV.

**Reguli de acces:**

- **Public:** nu necesită autentificare.
- **Utilizator autentificat:** necesită o sesiune validă și un cont activ, cu emailul verificat. Accesul este limitat la datele proprii.
- **Administrator:** necesită o sesiune validă și rolul `admin`, pe lângă condițiile unui cont activ și verificat.
- Pentru resursele personale, backend-ul determină utilizatorul din sesiune și verifică apartenența resurselor indicate prin ID. Rolul de administrator nu acordă implicit acces la activitățile, obiceiurile sau obiectivele altor utilizatori.

### 2.7.1. Autentificare și cont

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `POST` | `/auth/register` | Creează un cont cu rolul `user` și inițiază trimiterea emailului de verificare. | Public |
| `POST` | `/auth/verify-email` | Primește tokenul din linkul de verificare, validează hash-ul și expirarea acestuia și marchează emailul ca verificat. | Public |
| `POST` | `/auth/resend-verification` | Primește adresa de email și solicită trimiterea unui token nou de verificare, invalidându-l pe cel anterior. | Public |
| `POST` | `/auth/login` | Verifică emailul, parola și starea contului, creează sesiunea și setează cookie-ul `HttpOnly`. | Public |
| `POST` | `/auth/logout` | Invalidează sesiunea curentă și elimină cookie-ul de autentificare. | Utilizator autentificat |
| `GET` | `/auth/me` | Returnează datele contului autentificat, inclusiv rolul, fără parola hash-uită sau tokenuri. | Utilizator autentificat |

### 2.7.2. Tipuri de activități și activități efectuate

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `GET` | `/activity-types` | Listează tipurile de activități definite de utilizator. | Utilizator autentificat |
| `POST` | `/activity-types` | Creează un tip de activitate, cu denumire unică pentru utilizatorul curent. | Utilizator autentificat |
| `PATCH` | `/activity-types/{id}` | Modifică denumirea unui tip de activitate propriu. | Utilizator autentificat |
| `DELETE` | `/activity-types/{id}` | Solicită ștergerea unui tip de activitate, conform regulilor privind înregistrările și obiectivele asociate. | Utilizator autentificat |
| `GET` | `/activities` | Listează activitățile proprii, cu paginare și filtre opționale după intervalul de date și tipul activității. | Utilizator autentificat |
| `POST` | `/activities` | Înregistrează o activitate, validând tipul asociat, data, durata, distanța și intensitatea. | Utilizator autentificat |
| `GET` | `/activities/{id}` | Returnează detaliile unei activități proprii. | Utilizator autentificat |
| `PATCH` | `/activities/{id}` | Modifică datele unei activități proprii. | Utilizator autentificat |
| `DELETE` | `/activities/{id}` | Șterge o activitate proprie; progresul și statisticile vor reflecta datele rămase. | Utilizator autentificat |

### 2.7.3. Obiceiuri și realizarea acestora

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `GET` | `/habits` | Listează obiceiurile proprii și programarea lor, cu posibilitatea filtrării după starea de arhivare. | Utilizator autentificat |
| `POST` | `/habits` | Creează un obicei și programarea acestuia; pentru `selected_days` primește cel puțin o zi a săptămânii. | Utilizator autentificat |
| `GET` | `/habits/{id}` | Returnează detaliile unui obicei propriu și zilele programate. | Utilizator autentificat |
| `PATCH` | `/habits/{id}` | Actualizează un obicei propriu, inclusiv starea `is_archived`; arhivarea păstrează istoricul realizărilor. | Utilizator autentificat |
| `GET` | `/habits/{id}/completions` | Listează realizările unui obicei propriu pentru un interval de date. | Utilizator autentificat |
| `PUT` | `/habits/{id}/completions/{date}` | Marchează obiceiul ca realizat în ziua indicată. Repetarea cererii nu creează înregistrări duplicate. | Utilizator autentificat |
| `DELETE` | `/habits/{id}/completions/{date}` | Elimină bifarea realizării obiceiului pentru ziua indicată. | Utilizator autentificat |

Parametrul `{date}` va utiliza formatul `YYYY-MM-DD`. Crearea obiceiului și salvarea zilelor programate se vor realiza în aceeași tranzacție.

### 2.7.4. Obiective și progres

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `GET` | `/goals` | Listează obiectivele proprii, cu posibilitatea filtrării după starea activă. | Utilizator autentificat |
| `POST` | `/goals` | Creează un obiectiv, validând ținta, unitatea, perioada și apartenența activității sau obiceiului asociat. | Utilizator autentificat |
| `GET` | `/goals/{id}` | Returnează configurația unui obiectiv propriu. | Utilizator autentificat |
| `PATCH` | `/goals/{id}` | Modifică un obiectiv propriu sau îl dezactivează prin `is_active`. | Utilizator autentificat |
| `DELETE` | `/goals/{id}` | Șterge un obiectiv propriu, fără a șterge activitățile sau realizările obiceiului urmărit. | Utilizator autentificat |
| `GET` | `/goals/{id}/progress` | Returnează intervalul evaluat, valoarea realizată, valoarea țintă și procentul de progres, calculate din activități sau realizările obiceiului. | Utilizator autentificat |

### 2.7.5. Dashboard și statistici

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `GET` | `/dashboard` | Returnează un rezumat cu activitățile recente, obiceiurile programate pentru ziua curentă și progresul obiectivelor active. | Utilizator autentificat |
| `GET` | `/statistics` | Returnează numărul de activități, minutele active, distanța totală și numărul de realizări ale obiceiurilor, cu agregări pentru grafice. | Utilizator autentificat |

Pentru statistici, parametrii propuși sunt `start_date`, `end_date`, `group_by` (`day`, `week`, `month`) și, opțional, `activity_type_id` pentru filtrarea indicatorilor de activitate.

### 2.7.6. Import și export CSV

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `POST` | `/activities/import` | Primește un fișier CSV prin `multipart/form-data`, validează rândurile și importă activități în contul curent. Returnează un rezultat al importului și eventualele erori de validare. | Utilizator autentificat |
| `GET` | `/activities/export` | Returnează un fișier `text/csv` cu activitățile proprii, filtrate opțional după intervalul de date și tipul activității. | Utilizator autentificat |

Structura fișierului CSV și regulile pentru importuri parțiale sau duplicate vor fi stabilite înaintea implementării.

### 2.7.7. Administrarea conturilor

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `GET` | `/admin/users` | Listează conturile cu paginare și filtre după starea activă sau verificarea emailului, fără hash-uri de parole ori tokenuri. | Administrator |
| `PATCH` | `/admin/users/{id}` | Activează sau dezactivează un cont prin modificarea câmpului `is_active`. Un cont dezactivat nu mai poate accesa resursele protejate. | Administrator |

### 2.7.8. Articole și interese

| Metodă | Endpoint | Descriere | Acces |
|---|---|---|---|
| `PATCH` | `/auth/me/interests` | Înlocuiește lista de interese a utilizatorului curent cu temele validate din cerere. O listă goală elimină preferințele selectate. | Utilizator autentificat |
| `GET` | `/articles` | Listează catalogul de articole cu paginare și un filtru opțional după `topic`. | Utilizator autentificat |
| `GET` | `/articles/recommended` | Returnează cu paginare articolele potrivite intereselor utilizatorului sau selecția generală, indicând dacă rezultatele sunt personalizate. | Utilizator autentificat |
| `GET` | `/articles/{id}` | Returnează detaliile unui articol din catalogul comun, inclusiv conținutul disponibil și linkul sursei. | Utilizator autentificat |

Catalogul de articole este comun utilizatorilor autentificați; restricția privind accesul exclusiv la datele proprii se aplică listei personale de interese.

Endpoint-urile reprezintă o propunere preliminară. Regulile încă deschise privind ștergerile, perioadele obiectivelor și modificarea obiceiurilor vor fi clarificate înaintea implementării.

## 2.8. Aspecte de clarificat

Înainte de implementarea efectivă în PostgreSQL, trebuie stabilite următoarele:

1. **Obiective recurente:** modul de calcul pentru obiective zilnice, săptămânale, lunare și cu perioadă personalizată.
2. **Monitorizarea pașilor:** modelul actual nu permite stocarea numerică a pașilor.
3. **Ștergerea datelor:** reguli pentru ștergerea activităților, obiceiurilor, obiectivelor și sesiunilor.
4. **Integritatea datelor:** verificarea apartenenței activităților, obiceiurilor și obiectivelor la utilizator.
5. **Verificarea emailului:** alegerea serviciului SMTP/API, durata de valabilitate a tokenurilor și limitarea retrimiterilor.
6. **Gestionarea sesiunilor:** durata sesiunilor, expirarea și invalidarea acestora la dezactivarea conturilor.
7. **Modificarea emailului:** stabilirea procesului de reverificare atunci când utilizatorul își schimbă adresa.
8. **Validarea obiectivelor:** definirea combinațiilor permise între tipurile de obiective, unitățile de măsură și perioade.

**Notă:** Acesta este modelul preliminar al bazei de date, versiunea 4. Constrângerile de apartenență pot fi implementate prin chei externe compuse și verificări suplimentare în backend.
