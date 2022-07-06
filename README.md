
# Documentation

Hier vindt je een korte uitleg om de website Hoeve Lootens te bewerken.

## Home

De home page kunt u vinden onder de file `index.html`.

Naast de volgende uitleg om artikelen toe tevoegen kunt u in theorie alle tekst veranderen in deze file die zichtbaar is op de website. Al is dit niet 100% aangeraden.

### Nieuws

- #### Zigzag regel
    Er bestaan twee soorten artikelen waarbij de ene start met een afbeelding en de andere met tekst.
    
    **Het eerste artikel moet altijd starten met een afbeelding.** 
    
    De volgorde van de artikelen moet altijd als volgt zijn:

    - Type 1 (start met **afbeelding**)
    - Type 2 (start met **tekst**) 
    - Type 1
    - Type 2
    - ...

- #### Template
    Voeg de gewenste code toe aan de hand van het gewenste type.
    - **Type 1**
    ```html
    <section class="section slideUp bottom">
		<div class="container">
			<div class="row">
				<div class="col-md-6 align-self-center text-center text-md-left">
					<div class="block content">
						<h3 class="font-weight-bold mb-4 font-size-60">
							ARTIKEL TITEL
						</h3>
						<p>ARTIKEL TEKST</p>
                        <!--EXTRA TEKST-->
					</div>
				</div>
				<div class="col-md-6 text-center mb-5 mb-md-0">
					<img class="side-image" src="images\AFBEELDING NAAM">
				</div>
			</div>
		</div>
	</section>
    ```
    - **Type 2**
    ```html
    <section class="section slideUp bottom">
		<div class="container">
			<div class="row">
				<div class="col-md-6 text-center mb-5 mb-md-0">
					<img class="side-image" src="images\AFBEELDING NAAM" alt="Boomgaardcafé">
				</div>
				<div class="col-md-6 align-self-center text-center text-md-left">
					<div class="block content">
						<h3 class="font-weight-bold mb-4 font-size-60">
							ARTIKEL TITEL
						</h3>
						<p>ARTIKEL TEKST</p>
                        <!--EXTRA TEKST-->
					</div>
				</div>
			</div>
		</div>
	</section>
    ```

- #### Customize
    - **Titel**

        Vervang **ARTIKEL TITEL** door uw gewenste titel tekst.

    - **Tekst**

        Vervang **ARTIKEL TEKST** door uw gewenste tekst.
        
        Indien u een extra tekst lijn wenst, vervang `<!--EXTRA TEKST-->` met `<p>ARTIKEL TEKST</p>` (Vervang natuurlijk **ARTIKEL TEKST** door uw gewenste tekst.).

        - **Bold tekst**
            
            Vervang de gewenste bold tekst met `<span class="email">BOLD TEKST</span>`. Hierna vervangt u **BOLD TEKST** met de gewenste bold tekst.
    
    - **Afbeelding**

        Voordat u begint zorg er voor dat de gewenste afbeelding zich bevindt in de folder **images**.
        
        Hierna vervang je **AFBEELDING NAAM** met de naam van uw gewenste afbeelding + het formaat van de afbeelding (.png, .jpg, .webp, ...).

    - **Knop**

        Voeg onder uw laatste tekst de volgende code:

        `<a class="btn btn-main btn-main-sm" href="BUTTON LINK" role="button">BUTTON TEKST</a>`

        Zoals het voorbeeld hieronder:
        ```
        <div class="block content">
            <h3 class="font-weight-bold mb-4 font-size-60">
				ARTIKEL TITEL
			</h3>
			<p>ARTIKEL TEKST</p>
            <a class="btn btn-main btn-main-sm" href="BUTTON LINK" role="button">BUTTON TEKST</a>
        </div>
        ```

        Vervang hierna **BUTTON TEKST** met de tekst die u wenst op de knop.

        Indien u een link wilt gebruiken van een andere website, Vervangt u **BUTTON LINK** met de gewenste link.

        Maar indien u een pagina wilt openen van de website Hoeve Lootens zelf, kunt u de onderstaande tabel raadplegen om de nodige link te vinden.

        | Pagina        | Link          |
        | ------------- |-------------| 
        | Kalender      | `html/kalender.html` | 
        | Reserveren      | `html/reserveren.html` | 
        | Maatschappelijke projecten      | `html/maatschappelijk.html` | 
        | Geschiedenis      | `html/geschiedenis.html` | 
        | Contact      | `html/contact.html` | 