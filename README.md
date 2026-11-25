
# WellTrack

WellTrack este o aplicatie web destinata monitorizarii activitatilor fizice si a obiceiurilor sanatoase. Platforma permite utilizatorilor sa isi organizeze activitatile, sa stabileasca obiective personale si sa urmareasca progresul in timp.

Proiect dezvoltat in cadrul disciplinei **Tehnologii Web**, anul universitar 2026–2027.

## 1. Problema abordata

Mentinerea unui stil de viata echilibrat presupune organizarea activitatilor fizice si respectarea unor obiceiuri sanatoase. Monitorizarea manuala a acestora poate fi dificila, mai ales atunci cand utilizatorii urmaresc mai multe obiective simultan.

WellTrack propune o solutie centralizata prin care utilizatorii isi pot inregistra activitatile, gestiona obiceiurile zilnice si analiza progresul personal.

## 2. Obiectivele proiectului

- Dezvoltarea unei aplicatii web interactive si responsive.
- Implementarea unui sistem de autentificare si gestionare a conturilor.
- Gestionarea activitatilor fizice si a obiceiurilor personale.
- Stabilirea si monitorizarea obiectivelor individuale.
- Vizualizarea progresului prin statistici si grafice.
- Asigurarea persistentei si securitatii datelor utilizatorilor.

## 3. Utilizatori vizati

Aplicatia se adreseaza persoanelor care doresc sa isi organizeze activitatile fizice, sa dezvolte obiceiuri sanatoase si sa urmareasca atingerea obiectivelor personale.

Sistemul include doua roluri:

- **Utilizator:** gestioneaza activitatile, obiceiurile si obiectivele proprii.
- **Administrator:** gestioneaza conturile utilizatorilor si accesul la aplicatie.

## 4. Functionalitati propuse

### Functionalitati obligatorii

- **Autentificare si gestionarea contului:** inregistrare, verificarea emailului, autentificare si deconectare.
- **Gestionarea activitatilor:** definirea tipurilor de activitati si inregistrarea sesiunilor efectuate.
- **Gestionarea obiceiurilor:** crearea rutinelor zilnice sau saptamanale si marcarea realizarii acestora.
- **Gestionarea obiectivelor:** stabilirea obiectivelor personale si calcularea progresului.
- **Dashboard:** afisarea informatiilor relevante despre activitati, obiceiuri si obiective.
- **Statistici:** vizualizarea evolutiei activitatilor si a progresului prin grafice.
- **Import/Export CSV:** importul si exportul datelor despre activitati.
- **Administrare:** vizualizarea si gestionarea conturilor utilizatorilor.

### Functionalitati optionale

- Calendar interactiv pentru vizualizarea activitatilor.
- Sistem de realizari si insigne virtuale.
- Compararea progresului intre diferite perioade.

## 5. Tehnologii utilizate

| Componenta | Tehnologii |
|---|---|
| Frontend | React, JavaScript, HTML5, CSS3 |
| Backend | Python, FastAPI |
| Baza de date | PostgreSQL |
| API | REST |
| Autentificare | Session-based authentication |
| Versionare | Git, GitHub |
| Design UI/UX | Figma |

### Arhitectura

Aplicatia utilizeaza o arhitectura client-server:

- **React** gestioneaza interfata si interactiunea cu utilizatorul.
- **FastAPI** implementeaza API-ul REST, logica aplicatiei si validarea datelor.
- **PostgreSQL** asigura stocarea persistenta a informatiilor.

Comunicarea dintre frontend si backend se realizeaza prin cereri HTTP, folosind formatul JSON.

## 6. Echipa proiectului


### Student 1 – Hotea Emanuel

**Responsabilitati:**
- Dezvoltarea frontend-ului folosind React.
- Implementarea interfetelor si a componentelor reutilizabile.
- Integrarea frontend-ului cu API-ul REST.
- Participarea la testare si documentatie.

### Student 2 – Lupu Eugen

**Responsabilitati:**
- Dezvoltarea backend-ului folosind FastAPI.
- Proiectarea si implementarea bazei de date PostgreSQL.
- Implementarea autentificarii, autorizarii si validarii datelor.
- Participarea la testare si documentatie.

Ambii membri contribuie la integrarea componentelor, gestionarea repository-ului si prezentarea proiectului.

## 8. Limitari

WellTrack este destinat exclusiv monitorizarii activitatilor si obiceiurilor personale.

Aplicatia nu ofera diagnostic medical, interpretarea clinica a datelor sau recomandari medicale automate.


