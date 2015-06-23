define('state/index/controller', ['angularAMD', 'service'], function(angularAMD) {
  angularAMD.controller('IndexController', function($scope, $rootScope, $timeout, CatalogService, catalog, AdminService) {
    $scope.catalog = catalog;
      $scope.catalogCounts = {0:0,1:0,2:0};
    $scope.limit = 4;//7//10//limit of services
    $scope.sSearch = null;
    $scope.bAdmin = AdminService.isAdmin();

    $scope.search = function() {
      return CatalogService.getServices($scope.sSearch).then(function(result) {
        $scope.catalog = result;
      });
    };
    
     $scope.$watch('catalog', function(newValue)
     {
         $timeout(function()
         {
             $scope.catalogCounts = {0:0,1:0,2:0};
             angular.forEach(newValue, function(item)
             {
                 angular.forEach(item.aSubcategory, function(subItem)
                 {
                     angular.forEach(subItem.aService, function(aServiceItem)
                     {
                         $scope.catalogCounts[aServiceItem.nStatus] ++ ;
                     })
                 });
             });
         });
     });
  });
});

define('state/subcategory/controller', ['angularAMD'], function(angularAMD) {
  angularAMD.controller('SubcategoryController', function($scope, $stateParams, catalog, $filter) {
      $scope.catalog = catalog;

      $scope.category = $filter('filter')(catalog, {nID: $stateParams.catID})[0];
      $scope.subcategory = $filter('filter')($scope.category.aSubcategory, {nID: $stateParams.scatID})[0];
    }
  );
});