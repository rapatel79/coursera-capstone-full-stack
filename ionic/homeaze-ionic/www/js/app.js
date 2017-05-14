// Ionic homeazeApp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'homeazeApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'homeazeApp.controllers' is found in controllers.js
angular.module('homeazeApp', ['ionic', 'ionic-datepicker', 'ionic-timepicker', 'homeazeApp.controllers', 'homeazeApp.services'])
.run(function($ionicPlatform, $rootScope, $ionicLoading, $state) {
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('loading:show', function () {
	    $rootScope.isLoading=true;
        $ionicLoading.show({
	        template: '<ion-spinner></ion-spinner> Loading ...'
	    })
	});

	$rootScope.$on('loading:hide', function () {
	    $ionicLoading.hide();
        $rootScope.isLoading=false;
	});

  $rootScope.$on('$stateChangeStart', function () {
	    $rootScope.$broadcast('loading:show');
	});

	$rootScope.$on('$stateChangeSuccess', function () {
	    $rootScope.$broadcast('loading:hide');
	});

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/sidebar.html',
      controller: 'AppCtrl'
     })
    .state('app.login', {
      url: '/login',
      views: {
        'mainContent': {
          templateUrl: 'templates/login.html',
          controller: 'AppCtrl'
        }
      }
    })
    .state('app.add-new', {
        url:'/add',
        views: {
            'mainContent': {
                templateUrl: 'templates/add-new.html',
                controller: 'AddNewController'
            }
        },
        params: {
            contentPage: "add"
        }

    })
    .state('app.home', {
      cache: false,
      url: '/home',
      views: {
        'mainContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeController'
        }
      }
    })
    .state('app.homeall', {
      cache: false,
      url: '/homeall',
      views: {
        'mainContent': {
          templateUrl: 'templates/homeall.html',
          controller: 'HomeAllController'
        }
      }
    })
    .state('app.viewcommitment', {
      cache: false,
      url: '/commitment',
      views: {
        'mainContent': {
          templateUrl: 'templates/view-commitment.html',
          controller: 'ViewCommitmentController'
        }
      },
      params: {
        commitment: null
      }
    })
    .state('app.editcommitment', {
      cache: false,
      url: '/editcommitment',
      views: {
        'mainContent': {
          templateUrl: 'templates/edit-commitment.html',
          controller: 'EditCommitmentController'
        }
      },
      params: {
        commitment: null
      }
    })
    
    ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
})
.run(function($rootScope, $state, $ionicHistory){
        var goHome = function() {
            $state.go('app.home', {}, {reload: true});
        }

        $rootScope.$on('login:successful', function () {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            goHome();
        });
        $rootScope.$on('add-new:successful', function () {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            goHome();
        });
        $rootScope.$on('edit-commitment', function (event, args) {
            console.log('on edit-commitment', event, args);
            $state.go('app.editcommitment', {commitment: args}, {reload: true});
        });
        $rootScope.$on('view-commitment', function (event, args) {
            console.log('on view-commitment', event, args);
            $state.go('app.viewcommitment', {commitment: args}, {reload: true});
        });
        $rootScope.$on('edit:successful', function (event) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            goHome();
        });
        $rootScope.$on('delete:successful', function (event) {
            $state.go($rootScope.previousState.name, {reload: true});
        });
        $rootScope.$on('edit:cancelled', function (event) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            goHome();
        });
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            console.log('stateChangeSuccess', from.name, to.name);
        });
        $rootScope.$on('unauthorized', function (event) {
            $state.go('app.login');
        });
    });
