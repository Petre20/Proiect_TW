
# WellTrack

WellTrack este o aplicație web destinată monitorizării activităților fizice și a obiceiurilor sănătoase. Platforma permite utilizatorilor să își organizeze activitățile, să stabilească obiective personale și să urmărească progresul în timp.

Proiect dezvoltat în cadrul disciplinei **Tehnologii Web**, anul universitar 2026–2027.

## 1. Problema abordată

Menținerea unui stil de viață echilibrat presupune organizarea activităților fizice și respectarea unor obiceiuri sănătoase. Monitorizarea manuală a acestora poate fi dificilă, mai ales atunci când utilizatorii urmăresc mai multe obiective simultan.

WellTrack propune o soluție centralizată prin care utilizatorii își pot înregistra activitățile, gestiona obiceiurile zilnice și analiza progresul personal.

## 2. Obiectivele proiectului

- Dezvoltarea unei aplicații web interactive și responsive.
- Implementarea unui sistem de autentificare și gestionare a conturilor.
- Gestionarea activităților fizice și a obiceiurilor personale.
- Stabilirea și monitorizarea obiectivelor individuale.
- Vizualizarea progresului prin statistici și grafice.
- Asigurarea persistenței și securității datelor utilizatorilor.

## 3. Utilizatori vizați

Aplicația se adresează persoanelor care doresc să își organizeze activitățile fizice, să dezvolte obiceiuri sănătoase și să urmărească atingerea obiectivelor personale.

Sistemul include două roluri:

- **Utilizator:** gestionează activitățile, obiceiurile și obiectivele proprii.
- **Administrator:** gestionează conturile utilizatorilor și accesul la aplicație.

## 4. Funcționalități propuse

### Funcționalități obligatorii

- **Autentificare și gestionarea contului:** înregistrare, verificarea emailului, autentificare și deconectare.
- **Gestionarea activităților:** definirea tipurilor de activități și înregistrarea sesiunilor efectuate.
- **Gestionarea obiceiurilor:** crearea rutinelor zilnice sau săptămânale și marcarea realizării acestora.
- **Gestionarea obiectivelor:** stabilirea obiectivelor personale și calcularea progresului.
- **Dashboard:** afișarea informațiilor relevante despre activități, obiceiuri și obiective.
- **Statistici:** vizualizarea evoluției activităților și a progresului prin grafice.
- **Import/Export CSV:** importul și exportul datelor despre activități.
- **Administrare:** vizualizarea și gestionarea conturilor utilizatorilor.

### Funcționalități opționale

- Calendar interactiv pentru vizualizarea activităților.
- Sistem de realizări și insigne virtuale.
- Compararea progresului între diferite perioade.

## 5. Tehnologii utilizate

| Componentă | Tehnologii |
|---|---|
| Frontend | React, JavaScript, HTML5, CSS3 |
| Backend | Python, FastAPI |
| Bază de date | PostgreSQL |
| API | REST |
| Autentificare | Session-based authentication |
| Versionare | Git, GitHub |
| Design UI/UX | Figma |

### Arhitectură

Aplicația utilizează o arhitectură client-server:

- **React** gestionează interfața și interacțiunea cu utilizatorul.
- **FastAPI** implementează API-ul REST, logica aplicației și validarea datelor.
- **PostgreSQL** asigură stocarea persistentă a informațiilor.

Comunicarea dintre frontend și backend se realizează prin cereri HTTP, folosind formatul JSON.

## 6. Echipa proiectului


### Student 1 – [Hotea Emanuel]

**Responsabilități:**
- Dezvoltarea frontend-ului folosind React.
- Implementarea interfețelor și a componentelor reutilizabile.
- Integrarea frontend-ului cu API-ul REST.
- Participarea la testare și documentație.

### Student 2 – [Lupu Eugen]

**Responsabilități:**
- Dezvoltarea backend-ului folosind FastAPI.
- Proiectarea și implementarea bazei de date PostgreSQL.
- Implementarea autentificării, autorizării și validării datelor.
- Participarea la testare și documentație.

Ambii membri contribuie la integrarea componentelor, gestionarea repository-ului și prezentarea proiectului.

## 8. Limitări

WellTrack este destinat exclusiv monitorizării activităților și obiceiurilor personale.

Aplicația nu oferă diagnostic medical, interpretarea clinică a datelor sau recomandări medicale automate.


