// Déclaration du module 'home'
angular.module('ecMobileApp.home', [
    'ngRoute',
    'ecMobileApp.shared'
]);

// Configuration du module 'home'
angular.module('ecMobileApp.home').config(function($routeProvider) {

    // TODO Définir les routes spécifiques au module 'home' ici
});

// Contrôleur principal du module 'home'
// Usage de la syntaxe 'controller as', pas besoin du '$scope'
angular.module('ecMobileApp.home').controller('homeCtrl', function(userService) {

    var self = this;

    // ...

});
