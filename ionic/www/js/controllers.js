angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, UserService) {

  $scope.user = {};
  $scope.logged = false;
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.authenticate = function(provider) {
    UserService.authenticate(provider);
  };

  $rootScope.$on('userLoggedIn', function(){
    loadUserData();
    
    $scope.closeLogin();
  });

  // activate function on controller load,
  // so we can load stored token data
  activate();

  function activate() {
    loadUserData();
  }

  function loadUserData() {
    $scope.user   = UserService.getUser();
    $scope.logged = UserService.isAuthenticated();
  }
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
