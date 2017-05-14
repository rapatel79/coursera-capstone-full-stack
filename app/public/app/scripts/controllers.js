'use strict';

angular.module('homeazeApp')

.controller('RegisterController', ['$scope', 'AuthFactory', '$rootScope', function ($scope, AuthFactory, $rootScope) {
    $scope.registration = {};
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);
        AuthFactory.register($scope.registration);
        console.log('Completed registration');
    };
    setEmailAddressInRegistration = function() {
        if ($rootScope.signUpEmailAddress) {
            $scope.registration.emailAddress = $rootScope.signUpEmailAddress;
        }
    }
    setEmailAddressInRegistration();
}])
.controller('LoginController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    $scope.login = {};
    $scope.doLogin = function() {
        console.log('Logging in', $scope.login);
        AuthFactory.login($scope.login);
        console.log('Completed login');
    };
}])
.controller('LandingHeaderController', ['$scope', function ($scope) {
        
}])
.controller('LandingController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.signUpEmailAddress;
    $scope.signUpWithEmail = function() {
        $rootScope.signUpEmailAddress = $scope.signUpEmailAddress;
    }
    $scope.isEmailNotValid = function() {
        return $scope.signUpEmailAddress === undefined;
    }
}])
.controller('HomeController', ['$scope', 'AuthFactory', 'CommitmentService', '$rootScope', 'SpinnerService', 
function ($scope, AuthFactory, CommitmentService, $rootScope, SpinnerService) {
    var startLoading = function() {
        $scope.isLoading = true;
        SpinnerService.startSpin();
    }
    var stopLoading = function() {
        $scope.isLoading = false;
        SpinnerService.stopSpin();
    }
    $scope.logout = function() {
        AuthFactory.logout();
    }
    
    startLoading();
    CommitmentService.getMyCommitments().
        $promise
        .then(function(response){
            $scope.commitments = response;
        })
        .catch(function(err) {
            console.log('Ooops', err);
            if (err.status === 403 || err.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
        })
        .finally(function(){
            stopLoading();
        });
    
    $scope.hasCommitments = function() {
        return $scope.commitments && $scope.commitments.length;
    }
    
    $scope.editCommitment = function(commitment) {
        CommitmentService.editCommitment(commitment);
    }
}])
.controller('HomeAllController', ['$scope', 'AuthFactory', 'CommitmentService', '$rootScope', 'SpinnerService',
function ($scope, AuthFactory, CommitmentService, $rootScope, SpinnerService) {
    var startLoading = function() {
        $scope.isLoading = true;
        SpinnerService.startSpin();
    }
    var stopLoading = function() {
        $scope.isLoading = false;
        SpinnerService.stopSpin();
    }
    $scope.logout = function() {
        AuthFactory.logout();
    }
    startLoading();
    $scope.commitments = CommitmentService.getFamilyCommitments().
        $promise
        .then(function(response){
            $scope.commitments = response;
        })
        .catch(function(err) {
            console.log('Ooops', err);
            if (err.status === 403) {
                $rootScope.$broadcast('unauthorized');
            }
        })
        .finally(function(){
            stopLoading();
        });

    $scope.hasCommitments = function() {
        return $scope.commitments && $scope.commitments.length;
    }
    
    $scope.editCommitment = function(commitment) {
        CommitmentService.editCommitment(commitment);
    }
    $scope.isMyCommitment = function(commitment) {
        console.log('Is Mine?', commitment.username, AuthFactory.getUsername());
        return AuthFactory.getUsername() === commitment.username;
    }
}])
.controller('HomeHeaderController', ['$scope', '$stateParams', 'AuthFactory', function ($scope, $stateParams, AuthFactory) {
    $scope.setActive = function(menuItem) {
        $scope.activeMenu = menuItem;
    }

    $scope.determineActiveMenu = function(contentVal) {
        $scope.setActive($scope.menuItems[2]);
        if (contentVal === "dueNext") {
            $scope.setActive($scope.menuItems[0]);
        } else if (contentVal === "all") {
            $scope.setActive($scope.menuItems[1]);
        } else if (contentVal === "add") {
            $scope.setActive($scope.menuItems[2]);
        }
    }     

    $scope.getUrl = function(item) {
        if (item === $scope.menuItems[0]) {
            return '#/home';
        } else if (item === $scope.menuItems[1]) {
            return '#/homeall';
        } else if (item === $scope.menuItems[2]) {
            return '#/add';
        }
    }

    $scope.getTitle = function(item) {
        if (item === $scope.menuItems[0]) {
            return 'Only commitments created by you are shown here.' + 
             'Please select "All" to see your family\'s full list of commitments';
        } else if (item === $scope.menuItems[1]) {
            return 'Commitments for all your family are shown here.';
        } else if (item === $scope.menuItems[2]) {
            return 'Add a new commitment';
        }
    };

    $scope.today=new Date();
    $scope.menuItems = ['Mine', 'All', 'Add New'];
    $scope.activeMenu = $scope.menuItems[0];
    $scope.menuItemTargetView = 'home';
    $scope.activeMenuItem = $scope.determineActiveMenu($stateParams.contentPage);
    $scope.familyName = AuthFactory.getFamilyName();

    
}])
.controller('EditCommitmentController', ['$scope', 'AuthFactory', '$stateParams', 'CommitmentService', '$rootScope', 'SpinnerService',
function ($scope, AuthFactory, $stateParams, CommitmentService, $rootScope, SpinnerService) {
    var startLoading = function() {
        $scope.isLoading = true;
        SpinnerService.startSpin();
    }
    var stopLoading = function() {
        $scope.isLoading = false;
        SpinnerService.stopSpin();
    }
    $scope.logout = function() {
        AuthFactory.logout();
    }

    $scope.familyName = AuthFactory.getFamilyName();
    
    startLoading();
    CommitmentService.getCommitment($stateParams.commitment.id).$promise
    .then(function(commitmentDetail) {
        $scope.commitmentDetail = commitmentDetail;
        $scope.controlReminderDate = new Date(commitmentDetail.reminderDate)
        $scope.controlReminderTime = new Date(commitmentDetail.reminderDate);
        $scope.controlRenewalDate = new Date(commitmentDetail.renewalDate);
    }).finally(function(){
        stopLoading();
    });
    
    $scope.deleteCommitment = function() {
        $scope.isLoading = true;
        CommitmentService.deleteCommitment($scope.commitmentDetail);
    }
    
    $scope.updateCommitment = function() {
        $scope.isLoading = true;
        $scope.commitmentDetail.renewalDate = $scope.controlRenewalDate.toISOString();
        $scope.commitmentDetail.reminderDate = new Date($scope.controlReminderDate.getFullYear(), 
                                                        $scope.controlReminderDate.getMonth(),
                                                        $scope.controlReminderDate.getDate(),
                                                        $scope.controlReminderTime.getHours(),
                                                        $scope.controlReminderTime.getMinutes()).toISOString();
        CommitmentService.updateCommitment($scope.commitmentDetail);
    }

    $scope.cancelEdit = function() {
        $rootScope.$broadcast('edit:cancelled');
    }

    $scope.dateFormat = 'dd MMMM yyyy';
    $scope.renewalDatePopup = {
        opened: false
    };
    $scope.popupRenewalDate = function() {
        $scope.renewalDatePopup.opened = true;
    };
    $scope.reminderDatePopup = {
        opened: false
    };
    $scope.popupReminderDate = function() {
        $scope.reminderDatePopup.opened = true;
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yyyy',
        maxDate: getMaxDate,
        minDate: new Date(),
        startingDay: 1
    };

    function getReminderDate() {
        return $scope.commitmentDetail.reminderDate;
    };

    function getMaxDate() {
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 3650);
        return maxDate;
    };
    function disabled(data) {
        // no dates are disabled
    }
}])
.controller('AddNewController', ['$scope', 'AuthFactory', 'CommitmentService', function ($scope, AuthFactory, CommitmentService) {
    $scope.logout = function() {
        AuthFactory.logout();
    }
    // TODO: get from the back end
    $scope.categories = ['Home', 'Car', 'Leisure', 'Medical', 'Finance'];
    $scope.productTypesByCategory = {
        'Home': ['Buildings Insurance', 'Contents Insurance', 'Gas Provider', 'Electricity Provider', 'Telephone Provider', 'Mobile Service Provider', 'Council Tax'],
        'Car': ['Car Insurance', 'Breakdown Cover', 'MOT'],
        'Leisure': ['Travel Insurance'],
        'Medical': ['Health Insurance', 'Life Insurance', 'Accident Cover', 'Pet Insurance'],
        'Finance': ['Credit Card', 'Mortgage', 'Loan']
    };
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
            return $scope.productTypesByCategory[$scope.commitmentDetail.category];
        }
        return [];
    }
    $scope.saveCommitment = function() {
        $scope.commitmentDetail.renewalDate = $scope.controlRenewalDate.toISOString();
        $scope.commitmentDetail.reminderDate = new Date($scope.controlReminderDate.getFullYear(), 
                                                        $scope.controlReminderDate.getMonth(),
                                                        $scope.controlReminderDate.getDate(),
                                                        $scope.controlReminderTime.getHours(),
                                                        $scope.controlReminderTime.getMinutes()).toISOString();
        CommitmentService.saveCommitment($scope.commitmentDetail);
    }
    
    // *******************************
    // Date time controls
    $scope.controlRenewalDate;
    $scope.controlReminderDate;
    $scope.controlReminderTime;

    $scope.dateFormat = 'dd MMMM yyyy';
    $scope.renewalDatePopup = {
        opened: false
    };
    $scope.popupRenewalDate = function() {
        $scope.renewalDatePopup.opened = true;
    };
    $scope.reminderDatePopup = {
        opened: false
    };
    $scope.popupReminderDate = function() {
        $scope.reminderDatePopup.opened = true;
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yyyy',
        maxDate: getMaxDate,
        minDate: new Date(),
        startingDay: 1
    };

    function getMaxDate() {
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 3650);
        return maxDate;
    };
    function disabled(data) {
        // no dates are disabled
    }
    // *******************************


    // $scope.options = {
    //     customClass: getDayClass,
    //     minDate: new Date(),
    //     showWeeks: true
    // };

    // function getDayClass(data) {
    //     var date = data.date,
    //     mode = data.mode;
    //     if (mode === 'day') {
    //         var dayToCheck = new Date(date).setHours(0,0,0,0);
    //         for (var i = 0; i < $scope.events.length; i++) {
    //             var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
    //             if (dayToCheck === currentDay) {
    //                 return $scope.events[i].status;
    //             }
    //         }
    //     }
    //     return '';
    // }
}])
.controller('MyFamilyController', ['$scope', 'AuthFactory', 'UserService', '$rootScope', 'InvitationService', 'SpinnerService', 
function ($scope, AuthFactory, UserService, $rootScope, InvitationService, SpinnerService) {
    var startLoading = function() {
        $scope.isLoading = true;
        SpinnerService.startSpin();
    }
    var stopLoading = function() {
        $scope.isLoading = false;
        SpinnerService.stopSpin();
    }
    $scope.logout = function() {
        AuthFactory.logout();
    }
    $scope.familyName = AuthFactory.getFamilyName();
    $scope.name = AuthFactory.getName();
    $scope.familyMembers = [];
    $scope.pendingInvitations = [];
    
    startLoading();
    UserService.findFamilyMembers($scope.familyName).$promise
    .then(function(familyMembers) {
        $scope.familyMembers = familyMembers;
        console.log('Family Members are: ', familyMembers);
        // Get pending invitations
        InvitationService.queryPendingInvitations($scope.familyName).$promise
        .then(function(pendingInvitations) {
            $scope.pendingInvitations = pendingInvitations;
            console.log('Pending Invitations: ', pendingInvitations);
        }).finally(function(){
            stopLoading();
        });
    });

    $scope.sendInvitation = function() {
        console.log('Sending invitation');
        $rootScope.$broadcast('sendInvitation');
    };

    $scope.hasPendingInvitations = function() {
        return $scope.pendingInvitations && $scope.pendingInvitations.length;
    }
}])
.controller('InvitationController', ['$scope', 'AuthFactory', 'InvitationService', '$rootScope',
 function ($scope, AuthFactory, InvitationService, $rootScope) {
    $scope.logout = function() {
        AuthFactory.logout();
    }
    $scope.familyName = AuthFactory.getFamilyName();
    $scope.invitation = {
        familyName: $scope.familyName
    };
    $scope.sendInvitation = function() {
        console.log("Sending invitation to " + $scope.invitation.name + ' at email address ' + $scope.invitation.emailAddress);
        InvitationService.sendInvitation($scope.invitation);
        console.log('Invitation sent');
    }
    $scope.cancelSend = function() {
        $rootScope.$broadcast('sendInvitation:cancel');
    }
    
}])

.controller('SettingsController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    $scope.logout = function() {
        AuthFactory.logout();
    }
    $scope.familyName = AuthFactory.getFamilyName();
    
}])
;