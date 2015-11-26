'use strict';
angular.module('dashboardJsApp').controller('NavbarCtrl', function($scope, $location, Auth) {
  $scope.menu = [{
    'title': 'Задачі',
    'link': '/tasks'
  }];

  $scope.isCollapsed = true;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;

  $scope.getCurrentUserName = function() {
    var user = Auth.getCurrentUser();
    return user.firstName + ' ' + user.lastName;
  };

  $scope.goToServices = function() {
    $location.path('/services');
  };

  $scope.goToTasks = function() {
    $location.path('/tasks');
  };

  $scope.goToEscalations = function() {
    $location.path('/escalations');
  };
  
  $scope.goToReports = function () {
    $location.path('/reports');
  }

  $scope.logout = function() {
    Auth.logout();
    $location.path('/login');
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };
});
