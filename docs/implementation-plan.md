# Planul de implementare – WellTrack

## 1. Scopul documentului

Documentul justifică tehnologiile alese, stabilește strategia de versionare, împarte implementarea în faze, prioritizează activitățile și repartizează responsabilitățile între membrii echipei.

Referințe: cerințele (`requirements.md`), cazurile de utilizare (`use-cases.md`), arhitectura (`architecture.md`), modelul de date și endpoint-urile (`data-model.md`) și wireframe-urile (`wireframes/`).

## 2. Justificarea tehnologiilor

| Componentă | Tehnologie | De ce a fost aleasă |
|---|---|---|
| Interfață | **React**, JavaScript, HTML5, CSS3 | Interfața are multe ecrane cu elemente care se repetă (sidebar, tabele, formulare, carduri de progres). React permite construirea lor ca componente reutilizabile. Starea se actualizează simplu după fiecare acțiune, de exemplu după adăugarea unei activități. |
| Backend | **Python**, **FastAPI** | Oferă validarea automată a datelor primite (RNF-03) și documentație interactivă a API-ului, utilă la integrarea cu frontend-ul. Este suficient de simplu pentru un proiect de acest ordin, fără configurări complicate. |
| Bază de date | **PostgreSQL** | Datele sunt puternic relaționale (utilizatori, activități, obiceiuri, obiective). Cheile externe, constrângerile și tranzacțiile asigură integritatea datelor (RNF-04). Modelul din `data-model.md` este gândit relațional. |
| API | **REST**, JSON | Este un standard simplu de documentat și de testat. Separă clar frontend-ul de backend, care pot fi dezvoltate în paralel pe baza endpoint-urilor din `data-model.md`. |
| Autentificare | **Sesiuni** stocate în PostgreSQL, cookie `HttpOnly` | Sesiunea poate fi invalidată imediat la deconectare sau la dezactivarea contului (RF-13). Tokenul nu este accesibil din JavaScript, ceea ce reduce riscul de furt prin scripturi. Parolele și tokenurile se păstrează doar ca hash-uri (RNF-02). |
| Email | **Resend** (opțional, cum este marcat în `architecture.md`) | Trimite emailurile de verificare a contului prin API, fără configurarea unui server SMTP. Cheia API se păstrează în variabile de mediu, nu în repository. |
| Versionare | **Git**, **GitHub** | Permite lucrul în paralel pe ramuri, revizuirea modificărilor și păstrarea istoricului. |
| Design | **Figma** | Mock-up-urile ghidează implementarea interfeței și reprezintă documentația ecranelor. |

**Alegeri încă de făcut.** Documentele existente nu fixează următoarele, iar echipa trebuie să le stabilească în Faza 0:
- accesul la baza de date (ORM sau interogări parametrizate; `architecture.md` le menționează pe ambele) și instrumentul pentru migrări;
- biblioteca de grafice pentru pagina Statistics;
- soluția de stilizare (CSS simplu sau o bibliotecă);
- modul de testare (de exemplu `pytest` pentru backend);
- locul unde se rulează aplicația la prezentare (local sau un serviciu de hosting).

## 3. Strategia de versionare

### 3.1. Organizarea repository-ului

- Un singur repository GitHub, cu `docs/` pentru documentație, `frontend/` pentru aplicația React și `backend/` pentru API-ul FastAPI.
- Fișierele cu secrete (`.env`, cheia Resend) nu se adaugă în repository. Se versionează un fișier `.env.example`, cu variabilele necesare și fără valori reale.

### 3.2. Ramuri

- **`main`** conține întotdeauna o versiune stabilă, care pornește și trece testele existente.
- Fiecare funcționalitate se dezvoltă pe o ramură separată, cu numele `frontend/<subiect>` sau `backend/<subiect>`, de exemplu `backend/auth` sau `frontend/habits-page`.
- Modificările ajung în `main` printr-un **pull request**, revizuit de celălalt membru al echipei. Faza de documentație s-a lucrat direct pe `main`. Din Faza 1, când apare cod, se trece la pull request-uri.
- Ramurile se șterg după integrare, iar ramurile vechi nu se păstrează.

### 3.3. Commit-uri

- Mesaje scurte, la imperativ, care descriu o singură schimbare: `Add activities endpoints`, `Fix goal progress for weekly period`.
- Un commit conține o modificare coerentă. Nu se combină în același commit schimbări fără legătură.
- Nu se rescrie istoricul de pe `main`. Dacă este nevoie de corecții, se face un commit nou.

### 3.4. Versiuni

| Versiune | Conținut |
|---|---|
| `v0.1` | Prototipul: cazurile de utilizare UC-01 – UC-08 (cont, autentificare, obiceiuri, obiective, activități, dashboard, statistici). |
| `v0.2` | Restul cerințelor P1: import/export CSV (RF-12) și administrarea conturilor (RF-13). |
| `v1.0` | Versiunea finală, cu cerințele P2 și, dacă timpul permite, P3, plus documentația completă. |

Fiecare versiune este marcată printr-un tag Git (`v0.1`, `v0.2`, `v1.0`) pe `main`.

### 3.5. Urmărirea sarcinilor

Sarcinile se urmăresc ca **issue-uri GitHub**, etichetate cu prioritatea (`P1`, `P2`, `P3`) și cu zona (`frontend`, `backend`, `db`, `docs`). Fiecare issue indică ID-ul cerinței pe care o implementează (de exemplu `RF-07`), iar pull request-ul îl închide.

## 4. Planul de implementare

Duratele sunt estimări relative și se ajustează în funcție de termenele stabilite de curs. Fazele se execută în ordine, pentru că fiecare se bazează pe cea anterioară, dar frontend-ul și backend-ul lucrează în paralel în interiorul unei faze.

| Faza | Conținut | Cerințe / cazuri de utilizare | Rezultat | Durată estimată |
|---|---|---|---|---|
| **0. Pregătire** | Structura repository-ului, mediul de lucru, conectarea la PostgreSQL, alegerile din secțiunea 2, clarificarea regulilor deschise din `requirements.md` și `data-model.md`. | – | Proiectul pornește local la ambii membri, iar regulile deschise au răspuns scris. | 1 săptămână |
| **1. Fundație** | Schema bazei de date și migrările. Înregistrare, verificarea emailului, autentificare, deconectare. Structura frontend-ului: ecranul Login, sidebar-ul și rutele protejate. | RF-01, RF-02, RF-03, RNF-01, RNF-02, UC-01, UC-02 | Un utilizator își poate crea cont, se poate autentifica și vede o pagină goală protejată. | 2 săptămâni |
| **2. Funcționalități de bază** | Tipuri de activități și activități. Obiceiuri și bifarea lor. Obiective și calcularea progresului. Ecranele Activities, Habits și Goals. | RF-04 – RF-09, RNF-03, RNF-04, UC-03 – UC-06 | Utilizatorul își gestionează datele proprii, iar progresul obiectivelor se calculează corect. | 3 săptămâni |
| **3. Dashboard și statistici** | Endpoint-urile pentru dashboard și statistici, ecranele Dashboard și Statistics, graficele. | RF-10, RF-11, UC-07, UC-08 | **Prototipul complet (`v0.1`).** | 2 săptămâni |
| **4. Import/export și administrare** | Import și export CSV cu raport de erori. Lista conturilor și activarea sau dezactivarea lor. Ecranele Import / Export, Profile and settings, Admin. | RF-12, RF-13 | Toate cerințele P1 acoperite (`v0.2`). | 2 săptămâni |
| **5. Finalizare** | Filtre și paginare. Stările de încărcare și de eroare. Accesibilitate. Varianta pentru mobil. Testare, corectarea defectelor, documentație finală. | RF-14, RNF-05, RNF-06, RNF-07 | **Versiunea finală (`v1.0`).** | 2 săptămâni |
| **6. Opțional** | Calendar al activităților, compararea perioadelor, insigne. | RF-15, RF-16 | Funcționalități suplimentare, doar dacă a rămas timp. | după Faza 5 |

**Ordinea în interiorul fiecărei funcționalități:** mai întâi se stabilește contractul API (endpoint-ul și forma JSON), apoi backend-ul implementează endpoint-ul, iar frontend-ul construiește ecranul. Frontend-ul poate folosi date simulate până când endpoint-ul este gata, astfel încât niciun membru nu așteaptă celălalt.

## 5. Prioritizarea activităților

Prioritățile urmează clasificarea din `requirements.md`.

| Prioritate | Activități | Faza |
|---|---|---|
| **P1 – Obligatoriu** | Cont, verificare email, autentificare. Activități. Obiceiuri. Obiective și progres. Dashboard. Statistici. Import/export CSV. Administrare conturi. Securitate (RNF-01, RNF-02), validare (RNF-03), persistența datelor (RNF-04), accesibilitate și mesaje de stare (RNF-05, RNF-06). | 1 – 4 |
| **P2 – Recomandat** | Filtrare după interval și tip (RF-14). Paginarea listelor (RNF-07). | 5 |
| **P3 – Opțional** | Calendar (RF-15). Compararea perioadelor (RF-16). | 6 |

**De ce această ordine:**
1. Autentificarea și baza de date vin primele, pentru că toate celelalte date aparțin unui utilizator.
2. Activitățile, obiceiurile și obiectivele sunt înaintea dashboard-ului și a statisticilor, care doar afișează și agregă aceste date.
3. Importul CSV și administrarea sunt ultimele dintre cele obligatorii: sunt independente de restul și nu blochează prototipul.
4. Funcționalitățile P3 nu se încep până când P1 și P2 nu sunt terminate și testate.

## 6. Repartizarea responsabilităților

Repartizarea urmează cea din README.

| Membru | Zona de responsabilitate |
|---|---|
| **Hotea Emanuel** | Frontend (React): ecranele și componentele reutilizabile după wireframe-uri, rutele, formularele și validarea preliminară, integrarea cu API-ul REST, stările de încărcare și de eroare, varianta responsive și accesibilitatea. |
| **Lupu Eugen** | Backend (FastAPI) și bază de date (PostgreSQL): schema și migrările, autentificarea și sesiunile, verificarea emailului, autorizarea și validarea datelor, endpoint-urile, calcularea progresului și a statisticilor, importul și exportul CSV, administrarea conturilor. |
| **Ambii** | Contractul API (endpoint-uri și forme JSON), integrarea componentelor, revizuirea pull request-urilor, testarea, documentația, gestionarea repository-ului și prezentarea proiectului. |

### 6.1. Repartizarea pe faze

| Faza | Hotea Emanuel (frontend) | Lupu Eugen (backend / bază de date) |
|---|---|---|
| 0 | Structura aplicației React, instrumentele de lucru. | Structura FastAPI, conectarea la PostgreSQL, migrările. |
| 1 | Login, Register, sidebar, rute protejate. | Schema bazei de date, endpoint-urile `/auth/*`, sesiuni, trimiterea emailului. |
| 2 | Activities, Habits, Goals. | Endpoint-uri pentru activități, obiceiuri și obiective, calculul progresului. |
| 3 | Dashboard, Statistics, grafice. | Endpoint-uri pentru dashboard și statistici. |
| 4 | Import / Export, Profile and settings, ecranele de administrare. | Import și export CSV, validarea rândurilor, administrarea conturilor. |
| 5 | Stări de încărcare și de eroare, accesibilitate, mobil, filtre și paginare în interfață. | Filtre și paginare în API, teste, corectarea defectelor. |
| 6 | Calendar, compararea perioadelor. | Endpoint-uri necesare pentru acestea. |

În toate fazele, funcționalitatea unui membru este revizuită de celălalt înainte de integrare, iar documentația fiecărei faze se actualizează de cel care a implementat-o.

## 7. Riscuri

| Risc | Măsură |
|---|---|
| Regulile deschise (perioadele obiectivelor, ștergerea tipurilor de activități, formatul CSV) blochează implementarea. | Se decid în Faza 0 și se notează în `requirements.md` și `data-model.md`. |
| Frontend-ul și backend-ul se dezvoltă în paralel și nu se potrivesc. | Contractul API se stabilește înainte de implementare. Integrarea se face la finalul fiecărei faze, nu la sfârșitul proiectului. |
| Timpul nu ajunge pentru toate cerințele. | Se respectă ordinea P1, P2, P3. Funcționalitățile P3 pot fi omise fără să afecteze restul aplicației. |
| Serviciul de email este indisponibil sau nu este configurat la prezentare. | Trimiterea emailului este izolată într-un singur modul, iar verificarea poate fi dezactivată în mediul de dezvoltare. |
| Un membru este indisponibil o perioadă. | Fiecare funcționalitate este revizuită de celălalt membru, deci ambii cunosc codul. Sarcinile și starea lor sunt vizibile în issue-urile GitHub. |

## 8. Criterii de finalizare

O funcționalitate este considerată terminată atunci când:
1. cerința sau cazul de utilizare asociat funcționează, de la interfață la baza de date;
2. datele invalide sunt respinse cu mesaje explicite, iar un utilizator nu poate accesa datele altuia;
3. a fost revizuită printr-un pull request și integrată în `main`;
4. documentația afectată (endpoint-uri, model de date, README) este actualizată.
