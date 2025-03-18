# Team Project Todo List

## Frontend Development

## Backend Development

- [x] `/login` i `/register` używając JWT. Przy poprawnym loginie zwróć mi imię, nazwisko i mail
  - gotowe, jesli uzytkownik przy rejestracji podaje imie i nazwisko, to te elementy zostaną zwrócone i dodatkowo login/username
  - `/login` i `/register` zwróca access_token, który potem służy do odczytania ze scieżki `/protected` potrzebnych danych, które zostaną zwrócone
  - dla szczegółów działania jwt we Flasku i jak to odczytać zobacz `https://flask-jwt-extended.readthedocs.io/en/stable/basic_usage.html`
  - wymagane pola w pliku `server/auth/auth.py`
  
- [x] `/editUser` przyjmujący wszystkie pola użytkownika służący do zmienienia danych po zalogowaniu
  - dodane, możliwa zmiana:
    - city
    - postal_code
    - street
    - house_number
    - apartment_number
    - phone_number
  - do zmiany hasła i/lub emailu powinnismy dac inna sciezke z jakąs autoryzacja??
- [ ] GET `/city/:input` służący do zwrócenia ID miasta i nazwy tak, aby użytkownik mógł wpisać w `input` pierwsze litery swojego miasta LUB kod pocztowy i znajdziemy mu w słowniku to miasto abyśmy mogli przypisać je i ogarniać odległość od użytkownika
- [ ] `/createPost` endpoint
- [ ] `/getUserData` endpoint do pobierania PEŁNYCH danych użytkownika żebym mógł mu je uzupełnić przy editData
- [ ] `/addPet` do dodawania peta
- [ ] `/editPet/:petId` do edycji peta
- [ ] `/getPets` dostań wszystkie pety użytkownika
- [ ] `/deletePet/:petId` usuwanie zwierząt (albo flaga deleted)
- [ ] `/searchPosts/:postalCode&:maxDistanceFrom`
- [ ] `/editPost/:postId` (jakaś walidacja żeby nie można było zedytować posta w przeszłości)
- [ ] `/deletePost/:postId` (znowu walidacja na przeszłość)
- [ ] `/report/:userId`
- [ ] `/addReportType` (dla admina)
- [ ] `/applyForCare/:postId`
- [ ] `/acceptCareAgreement/:careId`
- [ ] `/declineCareAgreement/:careId` [POTRZEBNA NOWA KOLUMNA W "CareAgreement" typu STATUS = "ACCEPTED" | "DECLINED", albo zniesienie "agreement_date" NOT NULL  (ustawienie "agreement_date" mówi nam że careAgreement został zawarty)]
- [ ] `/getAllCareAgreementsAsVolunteer` pokazuje wszystkie care agreement na które się zapisaliśmy
- [ ] `/getAllCareAgreements` pokazuje wszystkie nasze care posty i agreementy
- [ ] `/rateOwner/:careAgreementId` oceniamy właściciela na bazie agreementu
- [ ] `/rateVolunteer/:careAgreementId`
- [ ] `/ownerRating` daje nam oceny jako właściciel
- [ ] `/volunteerRating` daje nam oceny jako volunteer
- [ ] Ten `AdditionalServices` tabele to bym wyjebał ???
- [ ] ogarnięcie uprawnień administratora i możliwości zarządzania tym
 