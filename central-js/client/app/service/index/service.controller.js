angular.module('app')
  .controller('ServiceController',
  ['$scope', '$rootScope', '$timeout', 'CatalogService', 'AdminService', '$filter', 'statesRepository', 'RegionListFactory', 'LocalityListFactory', 'messageBusService', 'EditServiceTreeFactory', '$location', '$stateParams', '$state', '$anchorScroll', 'TitleChangeService',
  function($scope, $rootScope, $timeout, CatalogService, AdminService, $filter, statesRepository, RegionListFactory, LocalityListFactory, messageBusService, EditServiceTreeFactory, $location, $stateParams, $state, $anchorScroll, TitleChangeService) {
    $rootScope.isOldStyleView = !!statesRepository.isDFS();
    if ($rootScope.isOldStyleView) $scope.spinner = true;
    $rootScope.catalogTab = 1;
    $scope.catalog = [];
    // $scope.catalogCounts = {0: 0, 1: 0, 2: 0};
    $scope.limit = 4;
    $scope.nLimitCategory = function(nID){
        if(statesRepository.isCatalogCategoryShowAll(nID)){
            return 999;
        }else{
            return 4;
        }
    };
    $scope.bAdmin = AdminService.isAdmin();
    $scope.recalcCounts = true;
    $scope.mainSpinner = true;
    $scope.isKyivCity = !!statesRepository.isKyivCity();

    $scope.mailInputText = '';
    $scope.sendMailRequest = function () {
      $.post('/api/messages/sendMail',{message:$scope.mailInputText}).success(function () {
        $scope.mailInputText = '';
        $scope.$apply()
      })
    }
    /*$scope.isCatalogCategoryShowAll = function(nID){
        return statesRepository.isSearch(nID);
    };*/

    $scope.categoryEditor = EditServiceTreeFactory.category;
    $scope.subcategoryEditor = EditServiceTreeFactory.subcategory;
    $scope.serviceEditor = EditServiceTreeFactory.service;

    var subscriptions = [];
    var subscriberId = messageBusService.subscribe('catalog:update', function(data) {
      $scope.mainSpinner = false;
      $rootScope.fullCatalog = data;
      $scope.catalog = data;
      if ($rootScope.isOldStyleView) {
        $rootScope.busSpinner = false;
        $scope.spinner = false;
      }
      $rootScope.rand = (Math.random() * 10).toFixed(2);
    }, false);
    subscriptions.push(subscriberId);


    subscriberId = messageBusService.subscribe('catalog:updatePending', function() {
      $scope.catalog = [];
    });
    subscriptions.push(subscriberId);
    $scope.$on('$destroy', function() {
      subscriptions.forEach(function(item) {
        messageBusService.unsubscribe(item);
      });
    });

    $scope.filterByStatus = function(status) {
      $scope.selectedStatus = status;
      var ctlg = angular.copy($scope.fullCatalog);
      angular.forEach(ctlg, function(item) {
        angular.forEach(item.aSubcategory, function(subItem) {
          subItem.aService = $filter('filter')(subItem.aService, {nStatus: status});
        });
      });
      $scope.catalog = ctlg;
    };

    $scope.isSfs = function() {
      if(location.hostname.indexOf('sfs') >= 0){
        $('.sfs-favicon').remove();
        $('<link/>',{rel:'shortcut icon', href:'../../assets/images/icons/favicon-sfs.png', class:'sfs-favicon'}).appendTo('head');
        return true
      } else {
        return false
      }
    };

    $scope.stateCheck = $state.params.catID;

    $scope.changeCategory = function (num) {
      if(num){
        $rootScope.catalogTab = num;
      }
      else if($state.params) {
        $rootScope.catalogTab = $state.params.catID;
        return $rootScope.catalogTab;
      }
      else {
        return $rootScope.catalogTab;
      }
    };

    $scope.isSubdomain = function () {
      var idPlaces = statesRepository.getIDPlaces();
      return idPlaces.length > 0
    };

    $scope.goToService = function (nID) {
      $location.path("/service/"+nID+"/general");
    };

    $scope.$on('$stateChangeStart', function(event, toState) {
      $scope.spinner = true;
      if(toState.name === 'index') {
        CatalogService.getCatalogTreeTag(1).then(function (res) {
          $scope.catalog = res;
          $scope.catalog = $scope.catalog.map(function (val) {
            val.aServiceTag_Child = val.aServiceTag_Child.map(function (item) {
              var to = item.sName_UA.indexOf(']');
              item.sName_UA = item.sName_UA.substr(to+1);
              return item
            })
            return val
          });

          $scope.changeCategory();
          $scope.spinner = false;
          $scope.mainSpinner = false;
          TitleChangeService.defaultTitle();
        });
      }
      if (toState.resolve) {
        $scope.spinner = true;
      }
    });

    $scope.$on('$stateChangeSuccess', function(event, toState) {
      $scope.spinner = false;
    });
    $scope.$on('$stateChangeError', function(event, toState) {
      if (toState.resolve) {
        $scope.spinner = false;
      }
    });
    $rootScope.$watch('catalog', function () {
      if ($scope.catalog.length !== 0) $scope.spinner = false;
    });
    $anchorScroll();
  }]);
