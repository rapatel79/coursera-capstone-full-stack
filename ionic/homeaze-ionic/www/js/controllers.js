angular.module('homeazeApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, AuthFactory, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginFailure=false;
  $scope.loginData = {};

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

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
        console.log('Logging in', $scope.loginData);
        AuthFactory.login($scope.loginData).$promise
        .then(function(response){
            AuthFactory.storeUserCredentials({username:$scope.loginData.emailAddress, token: response.token, familyName: response.familyName, name: response.name});
            $scope.loginFailure=false;
            $rootScope.$broadcast('login:successful');
            console.log('Completed login');
        }).catch(function(response){
            console.log('error', response)
            $scope.loginFailure=true;
        });
    };
})
.controller('HomeController', ['$scope', 'AuthFactory', 'CommitmentService', '$rootScope', '$ionicPopup',
  function ($scope, AuthFactory, CommitmentService, $rootScope, $ionicPopup) {
    $scope.logout = function() {
        AuthFactory.logout();
    }

    $rootScope.$broadcast('loading:show');
    CommitmentService.getMyCommitments().
        $promise
        .then(function(response){
          console.log('getMyCommitments', response);
            $scope.commitments = response;
            $rootScope.$broadcast('loading:hide');
        })
        .catch(function(err) {
            console.log('Ooops', err);
            if (err.status === 403 || err.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            $rootScope.$broadcast('loading:hide');
        });
    
    $scope.hasCommitments = function() {
        return $scope.commitments && $scope.commitments.length;
    }

    $scope.isLoading = function() {
        return $rootScope.isLoading;
    }
    
    $scope.viewCommitment = function(commitment) {
        CommitmentService.viewCommitment(commitment);
    }

}])
.controller('HomeAllController', ['$scope', 'AuthFactory', 'CommitmentService', '$rootScope', '$ionicPopup',
  function ($scope, AuthFactory, CommitmentService, $rootScope, $ionicPopup) {
    $scope.logout = function() {
        AuthFactory.logout();
    }

    $scope.familyName = AuthFactory.getFamilyName();

    $rootScope.$broadcast('loading:show');
    CommitmentService.getFamilyCommitments().
        $promise
        .then(function(response){
          console.log('getFamilyCommitments', response);
            $scope.commitments = response;
            $rootScope.$broadcast('loading:hide');
        })
        .catch(function(err) {
            console.log('Ooops', err);
            if (err.status === 403 || err.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            $rootScope.$broadcast('loading:hide');
        });
    
    $scope.hasCommitments = function() {
        return $scope.commitments && $scope.commitments.length;
    }

    $scope.isLoading = function() {
        return $rootScope.isLoading;
    }
    
    $scope.viewCommitment = function(commitment) {
        CommitmentService.viewCommitment(commitment);
    }

}])
.controller('ViewCommitmentController', ['$scope', '$stateParams', 'CommitmentService', '$ionicPopup', '$rootScope', function($scope, $stateParams, CommitmentService, $ionicPopup, $rootScope) {
    console.log('ViewCommitmentController initialised');
    
    $rootScope.$broadcast('loading:show');
    CommitmentService.getCommitment($stateParams.commitment.id).$promise
        .then(function(commitmentDetail) {
            $scope.commitmentDetail = commitmentDetail;
            console.log('Retrieved commitment', $scope.commitmentDetail);
            $rootScope.$broadcast('loading:hide');
        }).catch(function(err) {
            console.log(err);
            $rootScope.$broadcast('loading:hide');
        });
    $scope.isLoading = function() {
        return $rootScope.isLoading;
    }
    $scope.hasAddress = function() {
        if (!$scope.commitmentDetail)
            return false;
        return $scope.commitmentDetail.providerAddr1 ? true : false;
    };
    $scope.hasProviderTel = function() {
        if (!$scope.commitmentDetail)
            return false;
        return $scope.commitmentDetail.providerTel ? true : false;
    };
    $scope.hasNotes = function() {
        if (!$scope.commitmentDetail)
            return false;
        return $scope.commitmentDetail.notes ? true : false;
    };
    $scope.deleteCommitment = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this commitment?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('OK to delete commitment', $scope.commitmentDetail);
                CommitmentService.deleteCommitment($scope.commitmentDetail);
                //$cordovaVibration.vibrate(2000);
            } else {
                console.log('Canceled deletion of commitment');
            }
        });
    }
    $scope.editCommitment = function() {
        CommitmentService.editCommitment($scope.commitmentDetail);
    }

}])
.controller('EditCommitmentController', ['$scope', 'AuthFactory', 'CommitmentService', 'ionicDatePicker', '$filter', 'ionicTimePicker', '$rootScope', '$stateParams',
        function ($scope, AuthFactory, CommitmentService, ionicDatePicker, $filter, ionicTimePicker, $rootScope, $stateParams) {
    
    $scope.dateFormat = CommitmentService.getDateFormat();
    $scope.dateTimeFormat = CommitmentService.getDateTimeFormat();

    $rootScope.$broadcast('loading:show');
    CommitmentService.getCommitment($stateParams.commitment._id).$promise
    .then(function(commitmentDetail) {
        $scope.commitmentDetail = commitmentDetail;
        $scope.controlReminderDateTime = new Date(commitmentDetail.reminderDate)
        $scope.controlRenewalDate = new Date(commitmentDetail.renewalDate);
        $scope.renewalDateButtonText = $filter('date')($scope.controlRenewalDate, $scope.dateFormat);
        $scope.reminderDateButtonText = $filter('date')($scope.controlReminderDateTime, $scope.dateTimeFormat);
        console.log('Retrieved commitment', $scope.commitmentDetail);
        $rootScope.$broadcast('loading:hide');
    }).catch(function(err){
        console.log(err);
        $rootScope.$broadcast('loading:hide');
    });

    
    $scope.saveCommitment = function() {
        $scope.commitmentDetail.renewalDate = $scope.controlRenewalDate.toISOString();
        $scope.commitmentDetail.reminderDate = $scope.controlReminderDateTime.toISOString();
        CommitmentService.updateCommitment($scope.commitmentDetail);
    }
    
    $scope.cancel = function() {
        console.log('Cancel called');
        $rootScope.$broadcast('edit:cancelled');
    }

    // ionicDatePicker
    $scope.renewalDateButtonText = 'Select';
    $scope.reminderDateButtonText = 'Select';
    var renewalDateConfig = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.controlRenewalDate = new Date(val);
        $scope.renewalDateButtonText = $filter('date')($scope.controlRenewalDate, $scope.dateFormat);
      },
      disabledDates: [],
      from: new Date(),
      to: getMaxDate,
      inputDate: new Date(),
      mondayFirst: true,     
      disableWeekdays: [0],
      closeOnSelect: true,      
      templateType: 'popup'       
    };

    function getRenewalDate(scope) {
        return scope.controlRenewalDate;
    }

    function getMaxDate() {
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 3650);
        return maxDate;
    };
    $scope.openRenewalDatePicker = function() {
        renewalDateConfig.inputDate = $scope.controlRenewalDate;
        ionicDatePicker.openDatePicker(renewalDateConfig);
    };

    // reminderDatePicker
    var reminderDateConfig = {
      callback: function (val) {
        console.log('Return value from the reminder datepicker popup is : ' + val, new Date(val));
        $scope.controlReminderDate = new Date(val);
        $scope.reminderDateButtonText = $filter('date')($scope.controlReminderDate, $scope.dateFormat);
        reminderTimeConfig.inputTime = $scope.controlReminderDateTime.getHours()*3600 + $scope.controlReminderDateTime.getMinutes()*60;
        ionicTimePicker.openTimePicker(reminderTimeConfig);
      },
      disabledDates: [],
      from: new Date(),
      to: getMaxDate,
      inputDate: new Date(),
      mondayFirst: true,     
      disableWeekdays: [0],
      closeOnSelect: true,      
      templateType: 'popup'       
    };
    $scope.openReminderDatePicker = function() {
      reminderDateConfig.inputDate = $scope.controlReminderDateTime;
      ionicDatePicker.openDatePicker(reminderDateConfig);
    };

    var reminderTimeConfig = {
        callback: function (seconds) {
        if (typeof (seconds) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedHours = Math.floor(seconds/(3600));
            var selectedMinutes = (seconds - selectedHours*3600)/60;
            console.log('Time selected', seconds, selectedHours, selectedMinutes);
            $scope.controlReminderDateTime = new Date($scope.controlReminderDate.getFullYear(), 
                                                            $scope.controlReminderDate.getMonth(),
                                                            $scope.controlReminderDate.getDate(),
                                                            selectedHours,
                                                            selectedMinutes);
            $scope.reminderDateButtonText = $filter('date')($scope.controlReminderDateTime, $scope.dateTimeFormat);
        }
        },
        inputTime: 50400,
        format: 24,
        step: 5,
        setLabel: 'Set'
  };
}])
.controller('AddNewController', ['$scope', 'AuthFactory', 'CommitmentService', 'ionicDatePicker', '$filter', 'ionicTimePicker', '$rootScope',
        function ($scope, AuthFactory, CommitmentService, ionicDatePicker, $filter, ionicTimePicker, $rootScope) {
    
    $scope.categories = CommitmentService.getCategories();
    $scope.productTypesByCategory = CommitmentService.getProductsByCategory();

    $scope.dateFormat = CommitmentService.getDateFormat();
    $scope.dateTimeFormat = CommitmentService.getDateTimeFormat();
    
    $scope.commitmentDetail = {
        notes: '',
        providerAddr1: '',
        providerAddr2: '',  
        providerTel: ''
        //renewalDate
        //reminderDate
    };
    $scope.produtTypesForSelectedCategory = function() {
        if ($scope.commitmentDetail.category) {
            return CommitmentService.getProductsByCategory($scope.commitmentDetail.category);
        }
        return [];
    }
    
    $scope.resetModel = function() {
        $scope.commitmentDetail = {
            notes: '',
            providerAddr1: '',
            providerAddr2: '',  
            providerTel: ''
        };
        $scope.initialiseDates();
    };
    $scope.initialiseDates = function() {
        $scope.controlRenewalDate = {};
        $scope.renewalDateButtonText = "Select"
        $scope.controlReminderDate = {};
        $scope.reminderDateButtonText = "Select";
        $scope.controlReminderDateTime = {};
    };
    $scope.saveCommitment = function() {
        $scope.commitmentDetail.renewalDate = $scope.controlRenewalDate.toISOString();
        $scope.commitmentDetail.reminderDate = $scope.controlReminderDateTime.toISOString();
        CommitmentService.saveCommitment($scope.commitmentDetail);
        $scope.resetModel();        
    }
    $scope.cancel = function() {
        console.log('Cancel called');
        $scope.resetModel();
        $rootScope.$broadcast('edit:cancelled');
    }

    // ionicDatePicker
    $scope.renewalDateButtonText = "Select"
    $scope.reminderDateButtonText = "Select";
    var renewalDateConfig = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.controlRenewalDate = new Date(val);
        $scope.renewalDateButtonText = $filter('date')($scope.controlRenewalDate, $scope.dateFormat);
      },
      disabledDates: [],
      from: new Date(),
      to: getMaxDate,
      inputDate: new Date(),
      mondayFirst: true,     
      disableWeekdays: [0],
      closeOnSelect: true,      
      templateType: 'popup'       
    };
    function getMaxDate() {
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 3650);
        return maxDate;
    };
    $scope.openRenewalDatePicker = function() {
      ionicDatePicker.openDatePicker(renewalDateConfig);
    };

    // reminderDatePicker
    var reminderDateConfig = {
      callback: function (val) {
        console.log('Return value from the reminder datepicker popup is : ' + val, new Date(val));
        $scope.controlReminderDate = new Date(val);
        $scope.reminderDateButtonText = $filter('date')($scope.controlReminderDate, $scope.dateFormat);
        ionicTimePicker.openTimePicker(reminderTimeConfig);
      },
      disabledDates: [],
      from: new Date(),
      to: getMaxDate,
      inputDate: new Date(),
      mondayFirst: true,     
      disableWeekdays: [0],
      closeOnSelect: true,      
      templateType: 'popup'       
    };
    $scope.openReminderDatePicker = function() {
      ionicDatePicker.openDatePicker(reminderDateConfig);
    };

    var reminderTimeConfig = {
        callback: function (seconds) {
        if (typeof (seconds) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedHours = Math.floor(seconds/(3600));
            var selectedMinutes = (seconds - selectedHours*3600)/60;
            console.log('Time selected', seconds, selectedHours, selectedMinutes);
            $scope.controlReminderDateTime = new Date($scope.controlReminderDate.getFullYear(), 
                                                            $scope.controlReminderDate.getMonth(),
                                                            $scope.controlReminderDate.getDate(),
                                                            selectedHours,
                                                            selectedMinutes);
            $scope.reminderDateButtonText = $filter('date')($scope.controlReminderDateTime, $scope.dateTimeFormat);
        }
        },
        inputTime: 50400,
        format: 24,
        step: 5,
        setLabel: 'Set'
  };
}])
;
