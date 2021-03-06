// Déclaration du module 'magasin'
angular.module('ecMobileApp.magasin', [
	'ngRoute',
	'ngStorage',
	'ecMobileApp.shared'
	]);

// Configuration du module 'magasin'
angular.module('ecMobileApp.magasin').config(function($routeProvider) {

    $routeProvider
    .when("/magasin", {
        templateUrl: "magasin/template/magasin.tpl.html",
        controller: "magasinCtrl",
        controllerAs: "magasinCtrl"
    })
    .when("/panier", {
        templateUrl: "magasin/template/panier.tpl.html",
        controller: "panierCtrl",
        controllerAs: "panierCtrl"
    })
    .when("/detailsProduit/:id", {
        templateUrl: "magasin/template/detailsProduit.tpl.html",
        controller: "detailsProduitsCtrl",
        controllerAs: "detailsProduitsCtrl"
    })
    .when("/secure/effectuerPaiement", {
        templateUrl: "magasin/template/effectuerPaiement.tpl.html",
        controller: "payerCtrl",
        controllerAs: "payerCtrl"
    });
});

// Contrôleur principal du module 'magasin'
// Usage de la syntaxe 'controller as', pas besoin du '$scope'
angular.module('ecMobileApp.magasin').controller('magasinCtrl', function(userService, magasinService, panierService, $scope, $routeParams, $location, BORNES_PRIX_PRODUITS) {

    var magasinCtrl = this;
    magasinCtrl.minPrice = 0;
    magasinCtrl.maxPrice = Number.MAX_VALUE;

    magasinCtrl.borne1 = BORNES_PRIX_PRODUITS[0];
    magasinCtrl.borne2 = BORNES_PRIX_PRODUITS[1];
    magasinCtrl.borne3 = BORNES_PRIX_PRODUITS[2];
    magasinCtrl.borne4 = BORNES_PRIX_PRODUITS[3];


    magasinCtrl.listProduits = [];

    magasinCtrl.getProduits = function(){
        magasinService.getProduits()
        .then(function (result){
            magasinCtrl.listProduits = result;
        });
    };

    magasinCtrl.getProduits();

    magasinCtrl.addToPanier = function(idProduit) {
        panierService.addToPanier(idProduit, 1);
        panierService.CalculQte($scope);
    };

    magasinCtrl.detailsProduit = function(idProduit){
        $location.path("/detailsProduit/" +idProduit);
    };

    //TODO : vérifier retour des données depuis le service

    magasinCtrl.getDetailsProduit = function(){
        magasinService.getDetailsProduit($routeParams.id).then(function (result){
            magasinCtrl.produitSelectionne = result;
        });
    };

});

// Contrôleur principal du module 'magasin'
// Usage de la syntaxe 'controller as', pas besoin du '$scope'
angular.module('ecMobileApp.magasin').controller('detailsProduitsCtrl', function(magasinService, panierService, $scope, $routeParams) {

	var self = this;

	self.addToPanier = function(idProduit) {
		panierService.addToPanier(idProduit, 1);
		panierService.CalculQte($scope);
	};

	self.getDetailsProduit = function(){
		magasinService.getDetailsProduit($routeParams.id).then(function (result){
			self.produitSelectionne = result;
		});
	};

	self.getDetailsProduit();
});

// Contrôleur principal du module 'panier'
// Usage de la syntaxe 'controller as', pas besoin du '$scope'
angular.module('ecMobileApp.magasin').controller('panierCtrl', function(userService, panierService, payerService,$scope, $location,$route) {

    var panierCtrl = this;

    /*$scope.handleClick = function (msg) {
		$scope.$emit('eventName', { message: msg });
	};*/

    panierCtrl.augmenterQuantite = function(id_produit){
        panierCtrl.panier.forEach(function(produit){
            if(produit.id === id_produit){
                produit.quantite += 1; //augmentation de la quantite du produit du controller
                panierService.addToPanier(produit.id, 1); //augmentation de la quantite du produit du $localStorage
            }
        });
        panierCtrl.updateTotalPanier();
        panierService.CalculQte($scope);
    };

	panierCtrl.totalPrix = 0;

	panierCtrl.updateTotalPanier = function(){
		panierCtrl.totalPrix = 0;
		panierCtrl.panier.forEach(function(produit){
			panierCtrl.totalPrix = panierCtrl.totalPrix + (produit.prix * produit.quantite);
		});
	};

	panierCtrl.getPanier = function(){
		panierService.getPanier().then(function (result){
			panierCtrl.panier = result;
			panierCtrl.updateTotalPanier();
		});
	};

	panierCtrl.getPanier();

	panierCtrl.diminuerQuantite = function(id_produit){
		panierCtrl.panier.forEach(function(produit){
			if(produit.id === id_produit){
				if(produit.quantite > 1){
					produit.quantite -= 1;
					panierService.addToPanier(produit.id, -1);
				}
			}
		});
		panierCtrl.updateTotalPanier();
		panierService.CalculQte($scope);
	};

    panierCtrl.removeFromPanier = function(idProduit) {
        panierService.removeFromPanier(idProduit);
        panierCtrl.getPanier();
		panierService.CalculQte($scope);
    };

	panierCtrl.effectuerPaiement = function(totalPrix){
		payerService.setTotalPrix(totalPrix);
		$location.path("/secure/effectuerPaiement");
	};

	this.isConnected=function(){
		return userService.isConnected();
	};
});


angular.module('ecMobileApp.magasin').controller('payerCtrl', function(userService, panierService, payerService, $localStorage, $location,$modal,$log) {
	var payerCtrl = this;
	var typeCard = "CB";
	var typeCheque = "Chèque";
	payerCtrl.userInfos = userService.getInfosUser(); // pour recuperer les infos utilisateur stockees dans le localStorage


	console.log(payerCtrl.userInfos); // test de recup des donnees

	function getPanier (){
		panierService.getPanier()
		.then(function (result){
			payerCtrl.panier = result;
		});
	}

	getPanier();

    payerCtrl.displayMontant = function() {
        panierService.calculerMontant().then(function(montant) {
            payerService.setTotalPrix(montant);
            payerCtrl.montant = payerService.getTotalPrix();
        });
    };

    payerCtrl.displayMontant();

    payerCtrl.ajouterFraisLivraison = function(frais) {
        payerService.ajoutFraisLivraison(frais);
        // Mise à jour du montant dans l'écran
        payerCtrl.displayMontant();
    };

	payerCtrl.modal = function(){
		var modalInstance = $modal.open({
				animation : payerCtrl.animationsEnabled,
				templateUrl : 'magasin/template/modalValidation.html',
				controller : 'modalCtrl',
				controllerAs : 'modalCtrl',
			});
	};


	payerCtrl.payerByCheque = function(){
		payerService.setFraisLivraison(payerCtrl.confLivraison[payerCtrl.nomLivraison].prix);

		payerService.payerByCheque(userService.getInfosUser(),payerCtrl.totalPrix,payerCtrl.panier,typeCheque)
		.then(function(){
			payerCtrl.modal();
		});
	};

    payerCtrl.payer = function(form, typePaiement) {
        // TODO : activer la validation
//        if (form.$invalid) {return;}


        // TODO : passer l'adresse de facuration à la place de 2 fois l'adresse
        // de livraison
        payerService.payer(payerCtrl.adresseLivraison, payerCtrl.adresseLivraison, typePaiement)
        .then(function(){
            payerCtrl.modal();
        });
    };

	payerCtrl.payerByCheque = function(form) {
        payerCtrl.payer(form, "Par chèque");
	};

    payerCtrl.payerByCB = function(form) {
        payerCtrl.payer(form, "Par CB");
    };

	payerCtrl.annuler = function(){
		$location.path("/magasin");
	};

	payerCtrl.animationsEnabled = true;

	payerCtrl.open = function(size){

		var modalInstance = $modal.open({
			animation : payerCtrl.animationsEnabled,
			templateUrl : 'magasin/template/modal.html',
			controller : 'modal2Ctrl',
			controllerAs : 'modal2Ctrl',
			size: size
		});
	};

	payerCtrl.confLivraison = {
		classique: {
			name: 'Envoi classique',
			prix: 0.0
		},
		colissimo: {
			name: "Colissimo",
			prix: 9.60
		},
		fedex: {
			name: "Fedex",
			prix: 14.20
		}

   };



});

angular.module('ecMobileApp.magasin').controller('modalCtrl', function( userService,payerService,$modalInstance,$location) {
	var modalCtrl = this;
	modalCtrl.ok = function(){
		$modalInstance.close();
		$location.path("/");

	};
});

angular.module('ecMobileApp.magasin').controller('modal2Ctrl', function( userService,payerService,$modalInstance,$location) {

	var modal2Ctrl = this;
	modal2Ctrl.ok = function(){
		$modalInstance.close();
	};
});



angular.module('ecMobileApp.magasin').filter('filterByPriceMinAndMax', function() {
  function filter(produits, min, max) {
    var produitsFiltres = produits.filter(function(produit) {
        return (produit.prix >= min && produit.prix <= max);
    });

    return produitsFiltres;

  }
  return filter;

});




