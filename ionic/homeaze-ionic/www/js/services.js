'use strict';

angular.module('homeazeApp.services', ['ngResource'])
        .constant("baseURL","http://localhost:3443/")
        .service('menuFactory', ['$resource', 'baseURL', function($resource,baseURL) {
            this.getDishes = function(){
                return $resource(baseURL+"dishes/:id",null,  {'update':{method:'PUT' }});
            };
        }])
// Session storage
.factory('$sessionStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.sessionStorage.setItem(key, value);
        },
        get: function (key, defaultValue) {
            return $window.sessionStorage.getItem(key) || defaultValue;
        },
        remove: function (key) {
            $window.sessionStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.sessionStorage.setItem(key, $window.JSON.stringify(value));
        },
        getObject: function (key, defaultValue) {
            return $window.JSON.parse($window.sessionStorage.getItem(key)) || defaultValue;
        },
        clear: function() {
            $window.sessionStorage.clear();
        }
    }
}])
// commitment service
.service('CommitmentService', ['$resource', '$rootScope', 'baseURL',
                    function($resource, $rootScope, baseURL) {
    var commitmentService = {};

    commitmentService.getCategories = function() {
        return ['Home', 'Car', 'Leisure', 'Medical', 'Finance']
    };

    var productTypesByCategory = {
            'Home': ['Buildings Insurance', 'Contents Insurance', 'Gas Provider', 'Electricity Provider', 'Telephone Provider', 'Mobile Service Provider', 'Council Tax'],
            'Car': ['Car Insurance', 'Breakdown Cover', 'MOT'],
            'Leisure': ['Travel Insurance'],
            'Medical': ['Health Insurance', 'Life Insurance', 'Accident Cover', 'Pet Insurance'],
            'Finance': ['Credit Card', 'Mortgage', 'Loan']
    };
    
    commitmentService.getProductsByCategory = function(category) {
        return productTypesByCategory[category];
    };

    commitmentService.getDateFormat = function() {
        return 'dd MMMM yyyy';
    };

    commitmentService.getDateTimeFormat = function() {
        return 'dd MMMM yyyy @ HH:mm';
    };
    
    commitmentService.saveCommitment = function(commitmentDetail) {
        $rootScope.$broadcast('loading:show');
        $resource(baseURL + "commitments")
        .save(commitmentDetail,
           function(response) {
                console.log('Successfully saved commitment for ', commitmentDetail.category);
                $rootScope.$broadcast('add-new:successful');
                $rootScope.$broadcast('loading:hide');
           },
           function(response){
              console.log('error', response);
              $rootScope.$broadcast('loading:hide');
           }
        );
    };

    commitmentService.updateCommitment = function(commitmentDetail) {
        console.log('Updating ', commitmentDetail);
        $rootScope.$broadcast('loading:show');
        $resource(baseURL + "commitments/:id", {id: '@id'}).save({id: commitmentDetail._id}, commitmentDetail,
           function(response) {
                console.log('Successfully updated commitment');
                $rootScope.$broadcast('edit:successful');
                $rootScope.$broadcast('loading:hide');
           },
           function(response){
              console.log('error', response);
              $rootScope.$broadcast('loading:hide');
           }
        );
    };

    commitmentService.getCommitment = function(commitmentId) {
        console.log('Getting commitment for id', commitmentId);
        return $resource(baseURL + "commitments/:id", {id: '@id'}).get({id: commitmentId});
    };
    
    commitmentService.getMyCommitments = function() {
        console.log('Getting my commitments');
        return $resource(baseURL + "commitments").query();
    };

    commitmentService.getFamilyCommitments = function() {
        console.log('Getting commitments');
        return $resource(baseURL + "commitments/all").query();
    };

    commitmentService.editCommitment = function(commitment) {
        $rootScope.$broadcast('edit-commitment', commitment);
    };

    commitmentService.viewCommitment = function(commitment) {
        $rootScope.$broadcast('view-commitment', commitment);
    };

    commitmentService.deleteCommitment = function(commitment) {
        $rootScope.$broadcast('loading:show');
        $resource(baseURL + "commitments/:id", {id: '@id'}).delete({id: commitment._id}, 
        function(response) {
                console.log('Successfully deleted commitment');
                $rootScope.$broadcast('loading:hide');
                $rootScope.$broadcast('delete:successful');
           },
           function(response){
              console.log('error', response)
              $rootScope.$broadcast('loading:hide');
           });
    };

    return commitmentService;
}])
// Auth Factory
.factory('AuthFactory', ['$resource', '$http', '$rootScope', 'baseURL', '$sessionStorage',
                    function($resource, $http, $rootScope, baseURL, $sessionStorage) {
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var authToken = undefined;
    var familyName = undefined;
    var name = undefined;
    var username = undefined;
    
    authFac.register = function(registerData) {
        console.log('Registering ' + registerData.familyName)
        $rootScope.$broadcast('loading:show');
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
                authFac.login({emailAddress:registerData.emailAddress, password:registerData.password});
                $rootScope.$broadcast('registration:successful');
                $rootScope.$broadcast('loading:hide');
           },
           function(response){
              console.log('error', response);
              $rootScope.$broadcast('loading:hide');
           }
        );
    };

  function loadUserCredentials() {
    var credentials = $sessionStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.token) {
      useCredentials(credentials);
    }
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    authToken = credentials.token;
    familyName = credentials.familyName;
    name = credentials.name;
    username = credentials.username;
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
    console.log('Credentials loaded');
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    familyName = undefined;
    name = undefiend;
    isAuthenticated = false;
    username = undefined;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $sessionStorage.remove(TOKEN_KEY);
    console.log('Credentials removed');
  }

  function clearSessionData() {
    $sessionStorage.clear();
    console.log('Session cleared');
  }
     
  authFac.storeUserCredentials = function(credentials) {
    $sessionStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
    authFac.login = function(loginData) {
        console.log('login with', loginData);
        return $resource(baseURL + "users/login").save(loginData);
    };

    authFac.logout = function() {
        console.log('logging out')
        $resource(baseURL + "users/logout").get(function(response){
            $rootScope.$broadcast('logout');
            console.log('logged out', response.message);
        });
        destroyUserCredentials();
        clearSessionData();
    };

    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };

    authFac.getFamilyName = function() {
        return familyName;  
    };

    authFac.getName = function() {
        return name;
    };

    authFac.getUsername = function() {
        return username;
    }

    loadUserCredentials();

    return authFac;
    
}])
;
