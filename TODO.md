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
- [ ] `/editPet` do edycji peta
- [ ] 
