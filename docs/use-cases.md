# WellTrack – Cazuri de utilizare (prototip)

Documentul descrie cazurile de utilizare acoperite de **prototipul** aplicației. Funcționalitățile planificate pentru versiunea completă (import/export CSV, administrare, calendar, insigne etc.) sunt listate separat în secțiunea 4 și nu fac parte din prototip.

## 1. Actori

| Actor | Descriere |
|---|---|
| **Vizitator** | Persoană neautentificată; poate doar să își creeze un cont sau să se autentifice. |
| **Utilizator** | Persoană autentificată; își gestionează propriile obiceiuri, obiective și activități. |

## 2. Prezentare generală

| ID | Caz de utilizare | Actor |
|---|---|---|
| UC-01 | Înregistrare cont | Vizitator |
| UC-02 | Autentificare și deconectare | Vizitator / Utilizator |
| UC-03 | Gestionare obiceiuri | Utilizator |
| UC-04 | Bifare obicei ca realizat | Utilizator |
| UC-05 | Gestionare obiective | Utilizator |
| UC-06 | Înregistrare sesiune de activitate | Utilizator |
| UC-07 | Vizualizare dashboard | Utilizator |
| UC-08 | Vizualizare statistici | Utilizator |

## 3. Descrierea cazurilor de utilizare

### UC-01 – Înregistrare cont

- **Actor:** Vizitator
- **Flux principal:**
  1. Vizitatorul completează numele, emailul și parola.
  2. Sistemul validează datele și creează contul (parola este stocată sub formă de hash).
  3. Sistemul îl autentifică și îl redirecționează către dashboard.
- **Alternativ:** Email deja folosit sau date invalide → mesaj de eroare, contul nu se creează.

### UC-02 – Autentificare și deconectare

- **Actor:** Vizitator / Utilizator
- **Flux principal:**
  1. Vizitatorul introduce emailul și parola.
  2. Sistemul verifică datele, creează o sesiune și redirecționează către dashboard.
  3. Utilizatorul se poate deconecta oricând; sesiunea este invalidată.
- **Alternativ:** Credențiale incorecte → mesaj generic de eroare.
- **Regulă:** Paginile aplicației sunt accesibile doar cu sesiune validă, iar fiecare utilizator vede exclusiv datele proprii.

### UC-03 – Gestionare obiceiuri

- **Actor:** Utilizator
- **Flux principal:**
  1. Utilizatorul deschide lista obiceiurilor.
  2. Creează un obicei (nume, frecvență: zilnic sau anumite zile ale săptămânii) sau modifică / șterge unul existent.
  3. Sistemul validează și salvează modificările.
- **Alternativ:** Nume gol sau frecvență invalidă → eroare de validare.

### UC-04 – Bifare obicei ca realizat

- **Actor:** Utilizator
- **Precondiție:** Există cel puțin un obicei programat pentru ziua curentă.
- **Flux principal:**
  1. Utilizatorul bifează un obicei din dashboard.
  2. Sistemul înregistrează realizarea pentru ziua respectivă și actualizează progresul.
- **Alternativ:** Utilizatorul debifează obiceiul → realizarea este eliminată. Eroare de server → bifarea revine la starea anterioară.
- **Regulă:** O singură realizare pe obicei pe zi.

### UC-05 – Gestionare obiective

- **Actor:** Utilizator
- **Flux principal:**
  1. Utilizatorul creează un obiectiv (titlu, valoare țintă, perioadă), de exemplu „3 antrenamente pe săptămână”.
  2. Sistemul calculează automat progresul pe baza sesiunilor înregistrate.
  3. Utilizatorul poate modifica sau șterge obiectivul.
- **Alternativ:** Țintă ≤ 0 sau perioadă invalidă → eroare de validare.
- **Regulă:** Obiectivul este marcat „atins” când progresul ajunge la țintă.

### UC-06 – Înregistrare sesiune de activitate

- **Actor:** Utilizator
- **Flux principal:**
  1. Utilizatorul alege „Adaugă sesiune” și completează tipul activității, data, durata și, opțional, notițe.
  2. Sistemul validează datele, salvează sesiunea și actualizează progresul obiectivelor.
- **Alternativ:** Durată ≤ 0 sau dată în viitor → eroare de validare.

### UC-07 – Vizualizare dashboard

- **Actor:** Utilizator
- **Flux principal:**
  1. După autentificare, sistemul afișează o vedere compactă cu:
     - obiceiurile de azi, cu casete de bifare (UC-04);
     - obiectivele active, cu bară de progres;
     - ultimele sesiuni înregistrate.
  2. Utilizatorul poate adăuga rapid un obicei, un obiectiv sau o sesiune direct de aici.
- **Alternativ:** Utilizator fără date → stări goale cu îndrumare („Creează primul tău obicei”).

### UC-08 – Vizualizare statistici

- **Actor:** Utilizator
- **Flux principal:**
  1. Utilizatorul alege un interval (ultimele 7 sau 30 de zile).
  2. Sistemul afișează grafice simple: timp activ pe zi și rata de realizare a obiceiurilor.
- **Alternativ:** Nu există date în interval → mesaj informativ în locul graficelor.

## 4. În afara prototipului (versiunea completă)

Următoarele funcționalități din README sunt planificate, dar **nu** sunt acoperite de prototip:

- verificarea adresei de email și resetarea parolei;
- gestionarea tipurilor de activități (în prototip se folosește o listă fixă);
- istoric detaliat și serii (streak) pentru obiceiuri;
- import / export CSV;
- administrarea conturilor (rol de administrator);
- calendar interactiv, insigne și compararea perioadelor.
