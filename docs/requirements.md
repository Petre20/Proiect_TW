# Cerințele aplicației – WellTrack

## 1. Scopul documentului

Acest document descrie cerințele funcționale și nefuncționale ale aplicației WellTrack și stabilește prioritatea acestora. Identificatorii cerințelor vor permite asocierea lor cu scenariile de utilizare și verificarea implementării.

## 2. Prioritizarea cerințelor

| Prioritate | Semnificație |
|---|---|
| **P1 – Obligatoriu** | Cerință necesară pentru versiunea de bază a aplicației. |
| **P2 – Recomandat** | Îmbunătățire implementată după finalizarea cerințelor obligatorii. |
| **P3 – Opțional** | Funcționalitate implementată dacă timpul disponibil permite. |

## 3. Cerințe funcționale

Cerințele funcționale descriu acțiunile pe care aplicația le pune la dispoziția utilizatorilor și administratorilor.

| ID | Cerință | Prioritate |
|---|---|---|
| RF-01 | Sistemul permite înregistrarea unui cont folosind numele, o adresă de email unică și o parolă. | P1 |
| RF-02 | Sistemul permite verificarea emailului printr-un token cu expirare și solicitarea unui nou email de verificare. Tokenul anterior devine invalid la retrimitere. | P1 |
| RF-03 | Sistemul permite autentificarea conturilor active și verificate, precum și deconectarea cu invalidarea sesiunii curente. | P1 |
| RF-04 | Utilizatorul poate crea, vizualiza și redenumi propriile tipuri de activități. | P1 |
| RF-05 | Utilizatorul poate adăuga, vizualiza, modifica și șterge activitățile proprii, indicând tipul, data și, opțional, ora, durata, distanța, intensitatea și observațiile. | P1 |
| RF-06 | Utilizatorul poate crea, vizualiza și modifica obiceiuri zilnice sau programate în anumite zile ale săptămânii. | P1 |
| RF-07 | Utilizatorul poate marca sau demarca realizarea unui obicei pentru o dată permisă. Sistemul păstrează cel mult o realizare pentru același obicei și aceeași dată. | P1 |
| RF-08 | Utilizatorul poate crea, vizualiza, modifica, dezactiva și șterge obiective pentru activități sau obiceiuri, specificând ținta, unitatea și perioada. | P1 |
| RF-09 | Sistemul calculează progresul obiectivelor din activitățile și realizările înregistrate, pentru intervalul evaluat. Modificarea datelor sursă este reflectată în progres. | P1 |
| RF-10 | Dashboard-ul afișează activitățile recente, obiceiurile programate pentru ziua curentă și progresul obiectivelor active. | P1 |
| RF-11 | Sistemul afișează statistici și grafice pentru intervalul selectat: număr de activități, minute active, distanță și realizări ale obiceiurilor. | P1 |
| RF-12 | Utilizatorul poate importa activități dintr-un fișier CSV și poate exporta activitățile proprii. Sistemul raportează erorile de validare ale importului. | P1 |
| RF-13 | Administratorul poate vizualiza lista conturilor și poate activa sau dezactiva un cont. Conturile dezactivate nu pot accesa funcționalitățile protejate. | P1 |
| RF-14 | Utilizatorul poate filtra activitățile după intervalul de date și tipul activității. | P2 |
| RF-15 | Utilizatorul poate vizualiza activitățile într-un calendar. | P3 |
| RF-16 | Utilizatorul poate compara progresul între două perioade. | P3 |

## 4. Cerințe nefuncționale

Cerințele nefuncționale descriu calitatea aplicației și condițiile în care aceasta trebuie să funcționeze.

| ID | Cerință | Prioritate |
|---|---|---|
| RNF-01 | Backend-ul verifică autentificarea, rolul și apartenența resurselor la fiecare operație protejată. Un utilizator nu poate accesa datele personale ale altuia prin schimbarea ID-ului din cerere. | P1 |
| RNF-02 | Parolele și tokenurile de autentificare/verificare sunt păstrate în baza de date exclusiv ca hash-uri. Răspunsurile API nu expun aceste valori. | P1 |
| RNF-03 | Backend-ul validează datele primite. Valorile invalide sunt respinse cu mesaje explicite, fără salvarea unor date care încalcă regulile modelului. | P1 |
| RNF-04 | Datele salvate în PostgreSQL rămân disponibile după repornirea aplicației. Operațiile care actualizează mai multe tabele dependente sunt atomice. | P1 |
| RNF-05 | Formularele au etichete, acțiunile principale pot fi utilizate de la tastatură, iar erorile sunt explicate textual. | P1 |
| RNF-06 | Interfața afișează stări de încărcare, confirmări ale operațiilor și mesaje pentru lipsa datelor sau indisponibilitatea serverului. | P1 |
| RNF-07 | Listele care pot crește semnificativ, precum activitățile și conturile, sunt paginate. | P2 |

## 5. Reguli de clarificat înainte de implementare

1. **Perioadele obiectivelor:** stabilirea intervalelor pentru obiectivele zilnice, săptămânale, lunare și personalizate, inclusiv momentul resetării progresului.
2. **Realizarea obiceiurilor:** stabilirea datelor permise pentru bifare și a comportamentului pentru zile neprogramate, viitoare sau anterioare începerii obiceiului.
3. **Ștergerea tipurilor de activități:** stabilirea comportamentului atunci când un tip este utilizat de activități sau obiective existente.
4. **Importul CSV:** definirea coloanelor, formatelor acceptate, tratării duplicatelor și comportamentului în cazul fișierelor care conțin rânduri invalide.
