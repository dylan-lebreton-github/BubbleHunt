$( function() {
	init();
});

function init() {
	
	// structure (tous les éléments sont dans le fichier HTML) 
	
	
	
	// paramètres (données non modifiables et non modifiées par le jeu) - variables globales 
		
		intervalleRafraichissement = 100;
		intervalleNouvelleBulle = 500;
		proportionBullesNoires = 4;
		tempsLimite = 60000;
		listeCouleurs = {"B" : "#0000ff", "V" : "#00c000", "N" : "#555"};
		intervalleChangementVitesse = 10000;
		incrementVitesse = 3;
		rayonBulleBleue = 10;
		rayonBulleVerte = 5;
		minRayonBulleNoire = 1;
		maxRayonBulleNoire = 20;
		constanteGravite = 0.091;

		
		
	// initialisation des variables
		
		var monCanvas = document.getElementById('dessin');
			if (monCanvas.getContext){
				var ctx = monCanvas.getContext('2d');
				var i = 0;
			}
			else {
			alert('canvas non supporte par ce navigateur');
			}
		
		
		function reinitialisation() {
			tempsJeu = 0;
			ecranCourant = null;
			niveauCourant = 1;
			score = 0;
			
			// position de la souris
			xSourisCanvas = monCanvas.width/2.
			ySourisCanvas = monCanvas.height/2; 
			
			// liste des bulles
			listeBulles = [];
			
			// nombre total de bulles (sans la bulle bleue)
			nbBulles = 0;
			
			// vitesse initiale des bulles en pixels par seconde
			vitesse = 10;
			
			// nombre initial de vie
			nombreVies = 3;
		}
		

	// gestionnaires
	
		// gestion du bouton Jouer
		var boutonJouer = document.getElementById("boutonJouer");
		boutonJouer.addEventListener("click",fonction_boutonJouer,false);
		
		function fonction_boutonJouer() {
			ecranCourant = ecranJeu; 
			afficheEcranJeu();
		}
		
		// gestion du bouton Quitter
		var boutonQuitter = document.getElementById("boutonQuitter");
		boutonQuitter.addEventListener("click",fonction_retourAccueil,false);
		
		
		// gestion du bouton Rejouer
		var boutonRejouer = document.getElementById("boutonRejouer");
		boutonRejouer.addEventListener("click",fonction_boutonRejouer,false);
		
		function fonction_boutonRejouer() {
			reinitialisation();
			ecranCourant = ecranJeu; 
			afficheEcranJeu();
		}
		
		// gestion du bouton Accueil
		var boutonAccueil = document.getElementById("boutonAccueil");
		boutonAccueil.addEventListener("click",fonction_retourAccueil,false);
		
		function fonction_retourAccueil() {
			reinitialisation();
			ecranCourant = "Accueil"; 
			afficheEcranAccueil();
		}
		
		// interactivite sur le canvas
		monCanvas.addEventListener("mousemove",positionSouris,false);
			
		function positionSouris(e) {
			//position de la souris / document
			var xSourisDocument = e.pageX; 
			var ySourisDocument = e.pageY;
				
			//position du canvas / document
			var xCanvas = monCanvas.offsetLeft;
			var yCanvas = monCanvas.offsetTop;
				
			//position du clic / canvas
			xSourisCanvas = xSourisDocument - xCanvas;
			ySourisCanvas = ySourisDocument - yCanvas;
		}
	
	
	
	// moteur de règles
		
		inter = setInterval(regles,intervalleRafraichissement);
		
		function regles() {
			if (ecranCourant == "ecranJeu") {
				// animation
				animer();
			}
		}
				
		function animer() {
			// 1 - temps de jeu
			tempsJeu = tempsJeu + intervalleRafraichissement;
			
			// 1.2 - augmentation de niveau et de vitesse
			if(tempsJeu % intervalleChangementVitesse === 0) {
				//changement de niveau
				vitesse = vitesse + incrementVitesse;
				niveauCourant++; 
			}
			
			// 1.3 - test fin du jeu
			if (tempsJeu % tempsLimite === 0) {
			afficheEcranBilan();
			}
			if (nombreVies === 0) {
			afficheEcranBilan();
			}
			
			// 2 - creation des bulles N et V - test sur le temps
			if (tempsJeu % intervalleNouvelleBulle === 0) {
				// creation d'une nouvelle bulle -> test s'il est temps de creer une verte
				if (listeBulles.length % proportionBullesNoires === 0 && listeBulles.length !== 0) {
					creeBulle("V");
				} else {
					creeBulle("N");
				}
			}
			
			// 3 - dessin et avancement des bulles (avec la règle de gravité)
			ctx.clearRect(0,0, monCanvas.width, monCanvas.height);
			for (var j=0; j<listeBulles.length; j++){
				listeBulles[j][1] = listeBulles[j][1] + (vitesse * (intervalleRafraichissement / 1000)) * constanteGravite * listeBulles[j][3];
				if ((listeBulles[j][1] < monCanvas.height + listeBulles[j][3]) && listeBulles[j][4]) {
					dessineBulle(listeBulles[j], j);
				}
			}
			
			// 4 - dessin de la bille bleue (ne fait pas partie de la liste)
			dessineBulle([xSourisCanvas,ySourisCanvas,"B",rayonBulleBleue,true],null);
			
			// 5 - affichages...
			$("#score").text("Score : ");
			$("#niveau").text("Niveau : ");
			$("#vies").text("Vie(s) restante(s) : ");
			$("#temps").text("Temps écoulé : ");
			$("#score").append(score);
			$("#niveau").append(niveauCourant);
			$("#vies").append(nombreVies);
			$("#temps").append(tempsJeu / 1000);
			
		}
	
		
		function creeBulle(c) {
			//si bulle noire, rayon variable de 1 à 20, si verte, rayon constant à 5
			if(c=="N") {
				R = RandomInt(minRayonBulleNoire,maxRayonBulleNoire);
			}
			else if (c=="V") {
				R = rayonBulleVerte;
			}
			x = RandomInt(R,monCanvas.width-R);
			y = -R;
			tab = [x,y,c,R,true];
			// On ajoute tab à la liste des bulles 
			listeBulles.push(tab); 
		}
		
		
		function dessineBulle(b,i) {
			x = b[0];
			y = b[1];
			c = listeCouleurs[b[2]];
			R = b[3];
			
			// s'il y a collision entre la bulle test, et que la bulle test n'est pas la bulle bleue
			if (collision(x,y,R)&& i!=null) {
				// si bulle test est noire, on décrémente les vies
				if (b[2]=="N") {
					nombreVies = nombreVies - 1;
				} else {
					// si bulle test est verte, on incrémente le score
					score = score + 1;
				}
				// on fait disparaître la bulle test en mettant le booléen de visibilité sur false
				b[4] = false;
			}
			
			ctx.beginPath();
			ctx.arc(x,y,R,0,2 * Math.PI, false);
			ctx.fillStyle = c;
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#00000";
			ctx.stroke();
		}
		
		// fonction retournant un boolean disant la boule testée touche la boule bleue
		// dans la fonction dessineBulle
		function collision(x,y,R) {
			distanceCentreCercles = Distance(xSourisCanvas,ySourisCanvas,x,y);
			// si la distance entre les deux centres moins les deux rayons est <= 0 alors les deux disques se touchent
			if (distanceCentreCercles-R-rayonBulleBleue <= 0) {
				return true
			}
		}
		
		// fonction carré d'un nombre
		function sqr(a) {
			return a*a;
		}
		
		// fonction retournant la distance entre deux points de coordonnées différentes
		function Distance(x1, y1, x2, y2) {
			return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
		}
		
		// fonction retournant un entier sur un intervalle ferme (nécessaire pour savoir où doit apparaître la bulle 
		function RandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		
		
	
	// lancement : affichage de la page d'accueil

		function afficheEcranAccueil() {
			ecranCourant = "accueil";
			$("#ecranAccueil").show();
			$("#ecranJeu").hide();
			$("#ecranBilan").hide();
		}

		function afficheEcranJeu() {
			ecranCourant = "ecranJeu";
			$("#ecranAccueil").hide();
			$("#ecranJeu").show();
			$("#ecranBilan").hide();
		}

		function afficheEcranBilan() {
			ecranCourant = "ecranBilan";
			$("#ecranAccueil").hide();
			$("#ecranJeu").hide();
			$("#ecranBilan").show();
    
			$("#scoreFinal").text("Votre score final est de ");
			$("#scoreFinal").append(score);
			$("#scoreFinal").append(" points.");
			$("#niveauFinal").text("Votre niveau final est le niveau ");
			$("#niveauFinal").append(niveauCourant);
			$("#niveauFinal").append("."); 
		}
			
		reinitialisation();
		afficheEcranAccueil();
		animer();
}

