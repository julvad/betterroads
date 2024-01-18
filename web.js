// Définition de la varibale permettant l'édition mise a false par défaut
			var editTime = false
			// Définition de la variable du filtre de selection de données
			var filtre = "tout"
			// Stockage de la fonction de clustering dans une variable
			var markers = L.markerClusterGroup();
			
			// Configuration de l'application WEB de Firebase
			const firebaseConfig = {
				apiKey: "AIzaSyAFi6K6wW8tal_malQcWTTjjPnTej2eNFU",
				authDomain: "geo6303-vp.firebaseapp.com",
				databaseURL: "https://geo6303-vp-default-rtdb.firebaseio.com",
				projectId: "geo6303-vp",
				storageBucket: "geo6303-vp.appspot.com",
				messagingSenderId: "739486646869",
				appId: "1:739486646869:web:d09b6f17751354f51b4adc"
			}

			// Initialisation de Firebase
			firebase.initializeApp(firebaseConfig)
			
			// Préparation de la référence à la bd
			db = firebase.database()
			ref = db.ref('features')
			
			// Stockage du fond de carte (pathway) dans une variable					
			fondDeCarte = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoianVsdmFkIiwiYSI6ImNsOHVjajVkaDAyamkzdW5zZ2xoOWJpZnAifQ.O_b7V65Y6Myn6bTGEL8aSA')
			
			// Création de la carte avec tout les paramètres
			maCarte = L.map('Carte', {
				center: [45.52,-73.63], // centrage
				zoom: 11, // zoom par défaut
				layers: fondDeCarte, // utilisation du fond de carte
				zoomControl: false
			})
			
			// Méthode Firebase pour récupérer les données de la BD en temps réel
			ref.on('value',getData)
			
			// Fonction appelée par ref.on à chaque qu'il y a un changement dans la BD
			// Récupèration des données des points sur FireBase et stockage dans des variables pour visualisation
			function getData (data) {
				features = data.val();
				console.log(features)
				f = []
				for (key in features) {
					f.push(features[key])
				}
				dessiner()
			}
			
			// Permet de dessiner les points sur la carte en prenant en compte le filtre de données
			function dessiner()	{
				for (i in f) {
			
					if (f[i].properties.typeAccident == filtre || filtre == 'tout') {
					
					var marker = L.marker([f[i].geometry.coordinates[0], f[i].geometry.coordinates[1]],
						{
							icon: chooseIcon(f[i].properties.typeAccident)
						}
					)
					// Informations contenues dans les pop-up des points
					marker.bindPopup(
						'<div><b>Type : </b>' + f[i].properties.typeAccident + '<br><br/>' + 
						'<b>Nom de la rue : </b>' + f[i].properties.streetName + '<br><br/>' +
						'<b>Description : </b>'+ f[i].properties.descriptionAccident + '<br><br/>' +
						'<b>Date : </b>' + f[i].properties.timeAccident +
						'</div>'
						)
					markers.addLayer(marker)
					}
				}
				maCarte.addLayer(markers)
			}
			
			// Event Listener du click sur de la carte pour l'ajout d'un point (si editTime est true)
			maCarte.on('click', addMarker);
			var point

			// Permet d'ajouter un point par un click et ajout d'un Pop-Up
			function addMarker(e){
				if (editTime == true) {
					point = e.latlng
					openForm()	
				}
				// Changement du style du curseur "Éditer la carte" quand editTime est de-nouveau false
				document.getElementById("Carte").style.cursor='grab';
				document.getElementById("BoutonEdit").style.background='#808080';
			}
			
			// Enregistre les données du formulaire + les coordonnées quand on click sur 'Enregistrer'			
			saveListener = document.getElementById("saveBouton")
			saveListener.addEventListener('click', function(event) {
				saveDataInputs(point)
			})
			
			// Permet de faire apparaitre le formulaire
			function openForm() {
				document.getElementById("myForm").style.display = "block";;
			}

			// Permet de faire disparaitre le formulaire
			function closeForm() {
				document.getElementById("myForm").style.display = "none";
				editTime = false
			}

			// Permet de sauvegarder les données du formulaire
			function saveDataInputs(coor){
			    var accType = document.getElementById("accident_type").value;
			    var accDesc = document.getElementById("accDescription").value;
			    var stName = document.getElementById("streetName").value;
				var accDate = document.getElementById("dateData").value;
    
				// Si les inputs du formulaire ne sont pas remplis, déclenchement d'une fonction pour faire une alerte
				if (accType == "" || accDesc == "" || stName == "" || accDate == "") {
					alertTrigger()
				}
				//Si tout les inputs sont remplis alors les données sont stockées dans des variables et 
				else {
					var properties = {
						  typeAccident : accType,
						  descriptionAccident : accDesc,
						  streetName : stName,
						  timeAccident : accDate,
						};
						PtgeoJSON = {"type": "Feature", "properties": properties, "geometry": {"coordinates": [coor.lat,coor.lng], "type": "Point"}}
						console.log(PtgeoJSON)
						// Ajout du GeoJSON dans Firebase
						ref.push(PtgeoJSON)
						
						// Remise a jour des données (au cas ou)
						var accType = 0
						var accDesc = 0
						var stName = 0
						var accDate = 0		
						coor = 0
					
					closeForm()
				}
			}
			
			// Permet d'activer ou de désactiver le mode d'édition en changeant le style du curseur et du bouton d'édition
			function editSwitch() {
				if (editTime == true) {
					editTime = false
					document.getElementById("Carte").style.cursor='grab';
					document.getElementById("BoutonEdit").style.background='#808080';
				}
				else {
					editTime = true
					document.getElementById("Carte").style.cursor='crosshair';
					document.getElementById("BoutonEdit").style.background='#00A300';
				}
			}
			
			
			// Permet de choisir l'icone correspondant au type de données
			function chooseIcon(acc) {
				if (acc == "Nid poules") {
					var markerIcon = L.icon({
						iconUrl: 'icones/NidPoule.png',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
				})
				}
				else if (acc == "Travaux") {
					var markerIcon = L.icon({
						iconUrl: 'icones/Travaux.png',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
				})
				}
				else if (acc == "Fissures") {
					var markerIcon = L.icon( {
						iconUrl: 'icones/Attention.png',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
				})
				}
				
				return markerIcon
			}
			
			// Lancement de l'alerte si le formulaire n'est pas remplis
			function alertTrigger() {
				alert("Veuillez remplir le formulaire au complet !");
				return false;
			}
			
			// Event sur le menu déroulant pour appliquer un filtre de donnée
			inputVar = document.getElementById("variable")
			inputVar.addEventListener('change', function(event) {
				filtre = event.target.value
				console.log(filtre)
				markers.clearLayers();
				dessiner()
			})
			
			// Ajout des références dans la carte WEB
			maCarte.attributionControl.addAttribution('Fond de plan OSM & MapBox, production par Julien Vadnais et Sylvain Passet');
			
			
			// Localisation de la légende
			legende = L.control(
				{
					position : 'bottomright' // Localisation de la légende dans la page WEB
				}
			)
			// Création et affichage de la légende
			legende.onAdd = function(map) {
				// Création d'un élément <div> dans le DOM, permettant une séparation en HTML
				div = L.DomUtil.create('div', 'legende') // stylisé en fonction des deux classes
				
				// Création de liste pour itérer à travers
				var accLegende = ["Fissures","Nids de poule","Travaux"]
				var imgLegende = ['icones/Attention.png', 'icones/NidPoule.png', 'icones/Travaux.png']
				
				// Initialisation de la chaîne de caractères qui contiendra le code HTML de la légende
				elementLegende = "<h4>Type d'accidents</h4><hr>"

				// Boucle traversant les listes des noms de données et d'images pour construire un code HTML produisant la légende
				for (var i = 0; i < accLegende.length; i++) {
					elementLegende +=
						(" <img src="+ imgLegende[i] +" height='40' width='40'>") + '     ' + accLegende[i] + '<br>';
				}
				div.innerHTML = elementLegende
				return div
			}
			// Ajout de la légende a la carte
			legende.addTo(maCarte)
