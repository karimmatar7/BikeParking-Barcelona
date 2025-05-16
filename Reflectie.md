# BikeParking Barcelona
Welkom bij BikeParking Barcelona! Dit project visualiseert de fietsparkeerstations in de stad Barcelona met behulp van live of statische dataverzamelingen. Het is een lichte webapplicatie aangedreven door Node.js en Three.js.

1. Gekozen Dataset
De dataset die in dit project wordt gebruikt, is een fietsparkeren dataset voor de stad Barcelona. Deze data is oorspronkelijk beschikbaar via het Open Data Barcelona portaal, maar is beschermd door een CAPTCHA-beveiliging, waardoor deze niet toegankelijk is via een geautomatiseerde API-aanroep.

Om deze reden is de dataset handmatig gedownload en wordt deze lokaal geserveerd als een JSON-bestand (bike-parking.json).

2. API Endpoint
Aangezien de data beschermd is door CAPTCHA, wordt er geen directe API-endpoint gebruikt in de productieserver. In plaats daarvan is er een lokale server opgezet die de dataset via een proxy serveert.

Lokale Data: Het bike-parking.json bestand wordt lokaal opgeslagen in de data map en wordt geserveerd via een eenvoudige Express server.

API URL:

plaintext
Copy
http://localhost:3000/bike-parking
Dit endpoint serveert de statische fietsparkeren data in JSON-formaat.

3. Data Structuur
De JSON-data bestaat uit records, waarbij elk record een fietsparkeerstation vertegenwoordigt. Hieronder is een voorbeeld van de structuur van de data:

   ```bash
{
  "result": {
    "records": [
      {
        "name": "Station Naam",
        "geo_epgs_4326_lat": "Latitude",
        "geo_epgs_4326_lon": "Longitude",
        "addresses_district_name": "District Naam",
        "addresses_road_name": "Straatnaam",
        "addresses_start_street_number": "Straatnummer",
        "secondary_filters_name": "Type Station"
      }
    ]
  }
}

   ```


name: De naam van het fietsparkeren station.

geo_epgs_4326_lat: De breedtegraad van het station.

geo_epgs_4326_lon: De lengtegraad van het station.

addresses_district_name: Het district van het station.

addresses_road_name: De straatnaam van het station.

addresses_start_street_number: Het straatnummer van het station.

secondary_filters_name: Het type station (bijvoorbeeld “Fietsstation” of “Fietsenstalling”).

4. Hoe de Data Verwerkt Wordt
De fietsparkeren data wordt lokaal geladen en verwerkt in een Three.js visualisatie. De verwerkte gegevens worden geplot op een 3D-kaart van Barcelona, waarbij elk station een 3D-balk vertegenwoordigt. De hoogte van de balk is afhankelijk van het aantal fietsen op dat station (momenteel random gegenereerd).

Stap 1: De JSON-data wordt gelezen vanaf het lokale bestand via een Express API.

Stap 2: Elke fietsstation wordt omgezet naar 3D-objecten in Three.js.

Stap 3: De stations worden gefilterd op district en type met behulp van dropdown-menu's. De zichtbaarheid van de stations wordt dynamisch aangepast op basis van deze filters.

Stap 4: Een tijdlijn wordt toegevoegd om te laten zien hoe het aantal fietsen varieert over de tijd.

5. Ontwerpkeuzes
Visualisatie:
3D Kaart: De stations worden gepositioneerd op een 3D-kaart van Barcelona, waarbij de coördinaten van de stations worden omgezet naar de x- en z-assen van de 3D-scène.

Balken: Elk station wordt weergegeven als een 3D-balk (Cube), waarvan de hoogte overeenkomt met het aantal beschikbare fietsen. De kleur van de balken verandert op basis van het aantal beschikbare fietsen:

Rood: Minder dan 5 fietsen

Geel: Tussen 5 en 9 fietsen

Groen: 10 of meer fietsen

Interactiviteit: Gebruikers kunnen in- en uitzoomen, en klikken op stations voor meer gedetailleerde informatie (zoals het aantal fietsen, district, en adres).

User Interface:
Filters: Gebruikers kunnen filteren op district en type station om specifieke gegevens te visualiseren.

Info Paneel: Wanneer een station wordt aangeklikt, wordt een info-paneel weergegeven met gedetailleerde informatie over dat station, inclusief een trendchart die het aantal fietsen door de tijd toont.

Tooltip: Bij hoveren over een station verschijnt er een tooltip met de naam, district, type, en het huidige aantal fietsen.

Technologieën:
Express.js: Gebruikt voor het serveren van de JSON-gegevens via een lokale API.

Three.js: Gebruikt voor de 3D-weergave van de data en de interactiviteit.

Chart.js: Gebruikt voor het renderen van de tijdlijn grafiek in het info-paneel.

OrbitControls.js: Gebruikt voor het toevoegen van orbitale bewegingen en interactie met de 3D-scène.

6. Conclusie
Dit project biedt een interactieve 3D-visualisatie van de fietsparkeerstations in Barcelona. Gebruikers kunnen de kaart verkennen, informatie krijgen over individuele stations, en de trend in de tijd volgen voor het aantal beschikbare fietsen.

De uitdaging met de CAPTCHA-beveiliging werd opgelost door de gegevens handmatig te downloaden en lokaal te serveren via een proxy. Dit biedt de mogelijkheid om de data op een dynamische en visueel aantrekkelijke manier te presenteren, zonder afhankelijk te zijn van de online API die door CAPTCHA wordt geblokkeerd.


# Korte Reflectie

Tijdens het werken aan dit project heb ik verschillende belangrijke lessen geleerd, zowel op technisch als op ontwerpniveau. Een van de grootste uitdagingen was het omgaan met de CAPTCHA-beveiliging van de Open Data Barcelona API. Deze bescherming maakte het onmogelijk om direct toegang te krijgen tot de live data via geautomatiseerde API-aanroepen. Dit resulteerde in de noodzaak om de gegevens handmatig te downloaden en lokaal te serveren via een proxy. Hoewel dit de voortgang vertraagde, leerde ik veel over werkende met lokale gegevens en het omzeilen van beperkingen in de toegang tot externe APIs.

Een andere uitdaging was het gebruik van een screenshot van de kaart van Barcelona als de basis voor de visualisatie. Omdat de kaart niet dynamisch was en geen echte geografische coördinaten bevatte, was het moeilijk om de stations op de juiste locaties te plaatsen. Dit leidde tot onnauwkeurigheden in de positionering van de 3D-balken die de fietsparkeerstations vertegenwoordigden. In de toekomst zou ik proberen een interactieve kaart API te gebruiken, zoals Mapbox of Google Maps, zodat ik de stations nauwkeuriger kan positioneren.

Aan het begin van het project was ik ook niet zeker hoe ik de gebruikersinterface (UI) zou ontwerpen. Ik wilde een balans vinden tussen interactiviteit en gebruiksgemak, en het was moeilijk om te bepalen hoe ik de filters, de info-panelen en de grafieken moest integreren zonder de gebruikerservaring te overbelasten. Door trial-and-error ben ik uiteindelijk tot een werkende oplossing gekomen, maar dit was een leerproces.

In de toekomst zou ik meer aandacht besteden aan het ontwerpen van een gebruikersvriendelijke interface vanaf het begin, waarbij ik de interactie tussen de gebruiker en de visualisatie meer intuïtief maak. Daarnaast zou ik proberen om de data op een dynamischer en nauwkeuriger manier te visualiseren door gebruik te maken van echte geografische kaarten in plaats van statische afbeeldingen. Ook zou ik willen kijken naar meer geavanceerde technieken zoals machine learning om trends in de fietsdelen te voorspellen, wat de gebruikerservaring zou verbeteren.

Al met al was dit project een leerzame ervaring die me heeft geholpen om zowel technische als ontwerpvaardigheden te verbeteren.