'use strict';

angular.module('homeazeApp', ['ui.router','ui.bootstrap', 'ui.bootstrap.datetimepicker', 'ngResource','ngDialog', 'angularSpinner'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // route for the landing page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/landing-header.html',
                        controller  : 'LandingHeaderController'
                    },
                    'content': {
                        templateUrl : 'views/landing.html',
                        controller  : 'LandingController'
                    },
                    'footer': {
                        templateUrl : 'views/landing-footer.html',
                    }
                }

            })
            //registration page
            .state('app.register', {
                url:'register',
                views: {
                    'header@': {
                        templateUrl : 'views/register-header.html'
                    },
                    'content@': {
                        templateUrl : 'views/register.html',
                        controller  : 'RegisterController'
                    },
                    'footer@': {// no footer
                    }
                }

            })
            //login page
            .state('app.login', {
                url:'login',
                views: {
                    'header@': {
                        templateUrl : 'views/register-header.html'
                    },
                    'content@': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginController'
                    },
                    'footer@': {// no footer
                    }
                }

            })
            //logged-in home-page
            .state('app.home', {
                url:'home',
                views: {
                    'header@': {
                        templateUrl : 'views/home-header.html',
                        controller  : 'HomeHeaderController'
                    },
                    'content@': {
                        templateUrl : 'views/home-due-next.html',
                        controller  : 'HomeController'
                    },
                    'footer@': {// no footer
                    }
                },
                params: {
                    contentPage: "dueNext"
                }
            })
            //home-all page
            .state('app.homeall', {
                url:'homeall',
                views: {
                    'header@': {
                        templateUrl : 'views/home-header.html',
                        controller  : 'HomeHeaderController'
                    },
                    'content@': {
                        templateUrl : 'views/home-all.html',
                        controller  : 'HomeAllController'
                    },
                    'footer@': {// no footer
                    }
                },
                params: {
                    contentPage: "all"
                }

            })
            //home-add-new page
            .state('app.add-new', {
                url:'add',
                views: {
                    'header@': {
                        templateUrl : 'views/home-header.html',
                        controller  : 'HomeHeaderController'
                    },
                    'content@': {
                        templateUrl : 'views/home-add-new.html',
                        controller  : 'AddNewController'
                    },
                    'footer@': {// no footer
                    }
                },
                params: {
                    contentPage: "add"
                }

            })
            //home-edit page
            .state('app.editcommitment', {
                url:'edit',
                views: {
                    'header@': {
                        templateUrl : 'views/edit-commitment-header.html',
                        controller  : 'EditCommitmentController'
                    },
                    'content@': {
                        templateUrl : 'views/edit-commitment.html',
                        controller  : 'EditCommitmentController'
                    },
                    'footer@': {// no footer
                    }
                },
                params: {
                    commitment: null
                }
            })
            //my family page
            .state('app.my-family', {
                url:'myfamily',
                views: {
                    'header@': {
                        templateUrl : 'views/myfamily-header.html',
                        controller  : 'MyFamilyController'
                    },
                    'content@': {
                        templateUrl : 'views/myfamily.html',
                        controller  : 'MyFamilyController'
                    },
                    'footer@': {// no footer
                    }
                }

            })
            //invitation page
            .state('app.invitation', {
                url:'invite',
                views: {
                    'header@': {
                        templateUrl : 'views/register-header.html'
                    },
                    'content@': {
                        templateUrl : 'views/invitation.html',
                        controller  : 'InvitationController'
                    },
                    'footer@': {// no footer
                    }
                }

            })

            //settings page
            .state('app.settings', {
                url:'settings',
                views: {
                    'header@': {
                        templateUrl : 'views/settings-header.html',
                        controller  : 'SettingsController'
                    },
                    'content@': {
                        templateUrl : 'views/settings.html',
                        controller  : 'SettingsController'
                    },
                    'footer@': {// no footer
                    }
                }

            })
        $urlRouterProvider.otherwise('/');
    })
    .directive('compareTo', function() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };
    
                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    })
    .run(function($rootScope, $state){
        var goHome = function() {
            $state.go('app.home', {}, {reload: true});
        };
        $rootScope.$on('registration:successful', function () {
            goHome();
        });
        $rootScope.$on('login:successful', function () {
            goHome();
        });
        $rootScope.$on('add-new:successful', function () {
            $state.go($rootScope.previousState.name, {}, {reload: true});
        });
        $rootScope.$on('logout', function () {
             $state.go('app');
        });
        $rootScope.$on('edit-commitment', function (event, args) {
            console.log('edit-commitment called with args', args);
            $state.go('app.editcommitment', {commitment: args});
        });
        $rootScope.$on('edit:successful', function (event) {
            $state.go($rootScope.previousState.name);
        });
        $rootScope.$on('delete:successful', function (event) {
            goHome();
        });
        $rootScope.$on('edit:cancelled', function (event) {
            $state.go($rootScope.previousState.name);
        });
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            console.log('stateChangeSuccess', from.name, to.name);
        });
        $rootScope.$on('unauthorized', function (event) {
            $state.go('app.login');
        });
        $rootScope.$on('sendInvitation', function (event) {
            $state.go('app.invitation');
        });
        $rootScope.$on('sendInvitation:successful', function(event) {
            $state.go('app.my-family');
        });
        $rootScope.$on('sendInvitation:cancel', function(event) {
            $state.go('app.my-family');
        });
        
    })
;
