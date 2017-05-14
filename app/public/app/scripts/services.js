'use strict';

angular.module('homeazeApp')
.constant("baseURL", "/")
// Local Storage
.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
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
// Spinner Service
.service('SpinnerService', ['usSpinnerService', '$rootScope', function(usSpinnerService, $rootScope) {

    var spinnerService = {};
    var spinnerActive = false;
    var count = 0;
    
    spinnerService.startSpin = function() {
         if (!spinnerActive) {
            console.log('starting spinner');
            usSpinnerService.spin('loading-spinner');
        }
        count++;
    };

    spinnerService.stopSpin = function() {
        count--;
        if (spinnerActive && count === 1) {
            console.log('stopping spinner');
            usSpinnerService.stop('loading-spinner');
        }
    };

    $rootScope.$on('us-spinner:spin', function(event, key) {
      spinnerActive = true;
    });

    $rootScope.$on('us-spinner:stop', function(event, key) {
      spinnerActive = false;
    });

    return spinnerService;

}])
// User Service
.service('UserService', ['$sessionStorage', 'baseURL', '$resource', function($sessionStorage, baseURL, $resource) {

    var userService = {};
    
    userService.findFamilyMembers = function(familyName) {
        return $resource(baseURL + "users?familyName=" + familyName).query();
    };

    return userService;

}])
// Invitation Service
.service('InvitationService', ['$sessionStorage', 'baseURL', '$resource', '$rootScope', 'ngDialog', 'SpinnerService', function($sessionStorage, baseURL, $resource, $rootScope, ngDialog, SpinnerService) {

    var invitationService = {};
    SpinnerService.startSpin();
    invitationService.sendInvitation = function(invitation) {
        return $resource(baseURL + "invitations").save(invitation,
           function(response) {
                console.log('Successfully saved invitation');
                $rootScope.$broadcast('sendInvitation:successful');
                SpinnerService.stopSpin();

           },
           function(response){
               SpinnerService.stopSpin();
               console.log("error", response);
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Cannot send invitation</h3></div>' +
                  '<div><p>' +  response.data.message + 
                  '</p></div>';
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        );
    };

    invitationService.queryPendingInvitations = function(familyName) {
        return $resource(baseURL + "invitations").query();
    }

    return invitationService;

}])
// commitment service
.service('CommitmentService', ['$resource', '$http', '$rootScope', 'baseURL', 'ngDialog','SpinnerService',
                    function($resource, $http, $rootScope, baseURL, ngDialog, SpinnerService) {
    
    var commitmentService = {};
    
    commitmentService.saveCommitment = function(commitmentDetail) {
        SpinnerService.startSpin();
        console.log('Saving ', commitmentDetail);
        $resource(baseURL + "commitments")
        .save(commitmentDetail,
           function(response) {
                console.log('Successfully saved commitment for ', commitmentDetail.category);
                $rootScope.$broadcast('add-new:successful');
                SpinnerService.stopSpin();
           },
           function(response){
             SpinnerService.stopSpin();
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Save Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.message + 
                  '</p><p>' + response.data.name + '</p></div>';
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        );
    };

    commitmentService.updateCommitment = function(commitmentDetail) {
        console.log('Updating ', commitmentDetail);
        SpinnerService.startSpin();
        $resource(baseURL + "commitments/:id", {id: '@id'}).save({id: commitmentDetail._id}, commitmentDetail,
           function(response) {
                console.log('Successfully updated commitment');
                $rootScope.$broadcast('edit:successful');
                SpinnerService.stopSpin();
           },
           function(response){
               SpinnerService.stopSpin();
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Update  Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';
                ngDialog.openConfirm({ template: message, plain: 'true'});
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

    commitmentService.deleteCommitment = function(commitment) {
        SpinnerService.startSpin();
        $resource(baseURL + "commitments/:id", {id: '@id'}).delete({id: commitment._id}, 
        function(response) {
                console.log('Successfully deleted commitment');
                $rootScope.$broadcast('delete:successful');
                SpinnerService.stopSpin();
           },
           function(response){
              SpinnerService.stopSpin();
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Delete Unsuccessful</h3></div>';
                ngDialog.openConfirm({ template: message, plain: 'true'});
           });
    };

    return commitmentService;
}])
// Auth Factory
.factory('AuthFactory', ['$resource', '$http', '$rootScope', 'baseURL', 'ngDialog', '$sessionStorage',
                    function($resource, $http, $rootScope, baseURL, ngDialog, $sessionStorage) {
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var authToken = undefined;
    var familyName = undefined;
    var name = undefined;
    var username = undefined;
    
    authFac.register = function(registerData) {
        console.log('Registering ' + registerData.familyName)    
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
                authFac.login({emailAddress:registerData.emailAddress, password:registerData.password});
                // if (registerData.rememberMe) {
                //     $localStorage.storeObject('userinfo',
                //         {emailAddress:registerData.emailAddress, password:registerData.password});
                // }
                $rootScope.$broadcast('registration:successful');
           },
           function(response){
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.message + 
                  '</p></div>';
                  //<p>' + response.data.err.name + '</p>
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        );
    };

  function loadUserCredentials() {
    var credentials = $sessionStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.token) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $sessionStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
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
     
    authFac.login = function(loginData) {
        console.log('login with', loginData);
        $resource(baseURL + "users/login")
        .save(loginData,
            function(response) {
              storeUserCredentials({username:loginData.emailAddress, token: response.token, familyName: response.familyName, name: response.name});
              $rootScope.$broadcast('login:successful');
           },
           function(response){
              isAuthenticated = false;
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'
              ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

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