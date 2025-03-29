# Team Project Todo List

## Frontend Development

## Backend Development

### In Progress
- [ ] `/searchPosts/:postalCode&:maxDistanceFrom`
  - searching by distance and city need to be added
  - now it's return posts in order by post_id
- [ ] `/editPost/:postId` (jakaś walidacja żeby nie można było zedytować posta w przeszłości)
  - now it's return only the post info that is stored in database
  - editing of post need logic to be discussed
- [ ] `/user/:userId` ale nie zwracaj jego danych osobowych, tylko imię, nazwisko, rating jako volunteer, rating jako owner, i ewentualnie zwierzaki ( to jest jak ktoś wchodzi na czyjś profil )


### TO DO
- [ ] `/report/:userId`
- [ ] `/addReportType` (dla admina)
- [ ] `/applyForCare/:postId`
- [ ] `/careAgreementStatus/:careId` zwracający status jako odrzucona lub zaakceptowana
- [ ] `/careFullData` zwracający pełne dane z umowy (imo nie powinniśmy zwracać czyjegoś adresu dokładnie xd troche za risky security wise... Ja bym zwrócił tylko adres email i numer kontaktowy i niech się już osoby dogadają... Jeśli nie chcemy zwracać pełnego adresu użytkownika w umowach to można go też wywalić z `User` tabeli i zostawić tylko postal_code i city)
- [ ] `/rateOwner/:careAgreementId` oceniamy właściciela na bazie agreementu
- [ ] `/rateVolunteer/:careAgreementId`
- [ ] Tą `AdditionalServices` tabele to bym wyjebał ???
- [ ] ogarnięcie uprawnień administratora i możliwości zarządzania tym
- [ ] `/ban/:userId` (dla admina)


### Done
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
- [x] GET `/city/:input` służący do zwrócenia ID miasta i nazwy tak, aby użytkownik mógł wpisać w `input` pierwsze litery swojego miasta LUB kod pocztowy i znajdziemy mu w słowniku to miasto abyśmy mogli przypisać je i ogarniać odległość od użytkownika
- [x] `/createPost` endpoint
- [x] `/userData` endpoint do pobierania PEŁNYCH danych użytkownika żebym mógł mu je uzupełnić przy editData
  - done endpoint /edit_user przy metodzie GET
  - plik server/auth/auth.py
- [x] `/addPet` do dodawania peta
  - endpoint /add_pet przyjmuje wszystkie dane jak z tabeli sql
  - plik server/pets/pets.py
- [x] `/getPets` dostań wszystkie pety użytkownika
  - done, /getPets/<user_id>
  - daj znać czy dodawać login użytkownika w odp, albo coś innego z nim związane
- [x] `/deletePet/:petId` usuwanie zwierząt (albo flaga deleted)
  - dodałem do bazy flagę is_deleted, bo jak usuniemy rekord to nam się wszystko inne posypie, bo baza jest zrobiona kaskadowo
  - dobra czutka z tym, w poscie będzie tak samo jak go zrobię i przerobię xd
  - endpoint done
- [x] `/deletePost/:postId` (znowu walidacja na przeszłość)
  - `/getPost/<int:post_id>/delete` only can delete if Post.is_active == True
- [x] `/acceptCareAgreement/:careId`
  - `/getPost/<int:post_id>/acceptApplication/<int:user_id>`
- [x] `/declineCareAgreement/:careId` [POTRZEBNA NOWA KOLUMNA W "CareAgreement" typu STATUS = "ACCEPTED" | "DECLINED", albo zniesienie "agreement_date" NOT NULL  (ustawienie "agreement_date" mówi nam że careAgreement został zawarty)]
  - `/getPost/<int:post_id>/declineApplication/<int:user_id>`
- [x] `/getAllCareAgreements` pokazuje wszystkie nasze care posty i agreementy
  - `/getPost/<int:post_id>/applications` returns the applications for specific post ONLY for the owner
  -  `/getMyPosts` returns the number of applications for specific post for the owner
- [x] `/getAllCareAgreementsAsVolunteer` pokazuje wszystkie care agreement na które się zapisaliśmy
  - `/getMyApplications` returns the posts that we applied to with the status of application
- [x] `/getMyApplications/<post_id>/cancel` allows to cancel application for specific post
