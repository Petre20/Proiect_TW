# Cerintele aplicatiei – WellTrack

## 1. Scopul documentului

Acest document descrie cerintele functionale si nefunctionale ale aplicatiei WellTrack si stabileste prioritatea acestora. Identificatorii cerintelor vor permite asocierea lor cu scenariile de utilizare si verificarea implementarii.

## 2. Prioritizarea cerintelor

| Prioritate | Semnificatie |
|---|---|
| **P1 – Obligatoriu** | Cerinta necesara pentru versiunea de baza a aplicatiei. |
| **P2 – Recomandat** | Imbunatatire implementata dupa finalizarea cerintelor obligatorii. |
| **P3 – Optional** | Functionalitate implementata daca timpul disponibil permite. |

## 3. Cerinte functionale

Cerintele functionale descriu actiunile pe care aplicatia le pune la dispozitia utilizatorilor si administratorilor.

| ID | Cerinta | Prioritate |
|---|---|---|
| RF-01 | Sistemul permite inregistrarea unui cont folosind numele, o adresa de email unica si o parola cu lungimea intre 8 si 128 de caractere. | P1 |
| RF-02 | Sistemul permite verificarea emailului printr-un token cu expirare si solicitarea unui nou email de verificare. Tokenul anterior devine invalid la retrimitere. | P1 |
| RF-03 | Sistemul permite autentificarea conturilor active si verificate, precum si deconectarea cu invalidarea sesiunii curente. | P1 |
| RF-04 | Utilizatorul poate crea, vizualiza si redenumi propriile tipuri de activitati. | P1 |
| RF-05 | Utilizatorul poate adauga, vizualiza, modifica si sterge activitatile proprii, indicand tipul, data si, optional, ora, durata, distanta, intensitatea si observatiile. | P1 |
| RF-06 | Utilizatorul poate crea, vizualiza si modifica obiceiuri zilnice sau programate in anumite zile ale saptamanii. | P1 |
| RF-07 | Utilizatorul poate marca sau demarca realizarea unui obicei pentru o data permisa. Sistemul pastreaza cel mult o realizare pentru acelasi obicei si aceeasi data. | P1 |
| RF-08 | Utilizatorul poate crea, vizualiza, modifica, dezactiva si sterge obiective pentru activitati sau obiceiuri, specificand tinta, unitatea si perioada. | P1 |
| RF-09 | Sistemul calculeaza progresul obiectivelor din activitatile si realizarile inregistrate, pentru intervalul evaluat. Modificarea datelor sursa este reflectata in progres. | P1 |
| RF-10 | Dashboard-ul afiseaza activitatile recente, obiceiurile programate pentru ziua curenta si progresul obiectivelor active. | P1 |
| RF-11 | Sistemul afiseaza statistici si grafice pentru intervalul selectat: numar de activitati, minute active, distanta si realizari ale obiceiurilor. | P1 |
| RF-12 | Utilizatorul poate importa activitati dintr-un fisier CSV si poate exporta activitatile proprii. Sistemul raporteaza erorile de validare ale importului. | P1 |
| RF-13 | Administratorul poate vizualiza lista conturilor si poate activa sau dezactiva un cont. Conturile dezactivate nu pot accesa functionalitatile protejate. | P1 |
| RF-14 | Utilizatorul poate filtra activitatile dupa intervalul de date si tipul activitatii. | P2 |
| RF-15 | Utilizatorul poate vizualiza activitatile intr-un calendar. | P3 |
| RF-16 | Utilizatorul poate compara progresul intre doua perioade. | P3 |

## 4. Cerinte nefunctionale

Cerintele nefunctionale descriu calitatea aplicatiei si conditiile in care aceasta trebuie sa functioneze.

| ID | Cerinta | Prioritate |
|---|---|---|
| RNF-01 | Backend-ul verifica autentificarea, rolul si apartenenta resurselor la fiecare operatie protejata. Un utilizator nu poate accesa datele personale ale altuia prin schimbarea ID-ului din cerere. | P1 |
| RNF-02 | Parolele si tokenurile de autentificare/verificare sunt pastrate in baza de date exclusiv ca hash-uri. Raspunsurile API nu expun aceste valori. | P1 |
| RNF-03 | Backend-ul valideaza datele primite. Valorile invalide sunt respinse cu mesaje explicite, fara salvarea unor date care incalca regulile modelului. | P1 |
| RNF-04 | Datele salvate in PostgreSQL raman disponibile dupa repornirea aplicatiei. | P1 |
| RNF-05 | Formularele au etichete, actiunile principale pot fi utilizate de la tastatura, iar erorile sunt explicate textual. | P1 |
| RNF-06 | Interfata afiseaza stari de incarcare, confirmari ale operatiilor si mesaje pentru lipsa datelor sau indisponibilitatea serverului. | P1 |
| RNF-07 | Listele care pot creste semnificativ, precum activitatile si conturile, sunt paginate. | P2 |

## 5. Reguli de clarificat inainte de implementare

1. **Perioadele obiectivelor:** stabilirea intervalelor pentru obiectivele zilnice, saptamanale, lunare si personalizate, inclusiv momentul resetarii progresului.
2. **Realizarea obiceiurilor:** stabilirea datelor permise pentru bifare si a comportamentului pentru zile neprogramate, viitoare sau anterioare inceperii obiceiului.
3. **Stergerea tipurilor de activitati:** stabilirea comportamentului atunci cand un tip este utilizat de activitati sau obiective existente.
4. **Importul CSV:** definirea coloanelor, formatelor acceptate, tratarii duplicatelor si comportamentului in cazul fisierelor care contin randuri invalide.
