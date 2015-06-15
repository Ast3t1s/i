define('service/built-in/controller', ['angularAMD'], function(angularAMD) {
  angularAMD.controller('ServiceBuiltInController', ['$location', '$state', '$rootScope', '$scope', function($location, $state, $rootScope, $scope) {
    $scope.$location = $location;
    $scope.$state = $state;
  }]);
});

define('service/built-in/bankid/controller', ['angularAMD', 'formData/factory'], function(angularAMD) {
	angularAMD.controller('ServiceBuiltInBankIDController', [
		'$state', '$stateParams', '$scope', 'FormDataFactory', 'ActivitiService', 'oServiceData', 'BankIDAccount', 'ActivitiForm', 'uiUploader',
		function($state, $stateParams, $scope, FormDataFactory, ActivitiService, oServiceData, BankIDAccount, ActivitiForm, uiUploader) {
		
		$scope.oServiceData = oServiceData;
		$scope.account = BankIDAccount;
		$scope.ActivitiForm = ActivitiForm;
		
		$scope.data = $scope.data || {};
		$scope.data.formData = new FormDataFactory();
		$scope.data.formData.initialize(ActivitiForm);
		$scope.data.formData.setBankIDAccount(BankIDAccount, oServiceData);
		
		var currentState = $state.$current;
		$scope.data.region = currentState.data.region;
		$scope.data.city = currentState.data.city;
		//$scope.data.sProcessDefinitionName = currentState.sProcessDefinitionName;
		//$scope.data.sProcessDefinitionName2 = currentState.sProcessDefinitionName2;
                

      angular.forEach($scope.ActivitiForm.formProperties, function(value, key) {
        var sField = value.name;
        var s;
        if (sField === null) {
          sField = "";
        }
        var a = sField.split(";");
        s = a[0].trim();
        value.sFieldLabel = s;
        s = null;
        if (a.length > 1) {
          s = a[1].trim();
          if (s === "") {
            s = null;
          }
        }
        value.sFieldNotes = s;
      });

      $scope.submit = function(form) {
        form.$setSubmitted();
        return form.$valid ?
          ActivitiService
          .submitForm(oServiceData, $scope.data.formData)
          .then(function(result) {
            var state = $state.$current;

            var submitted = $state.get(state.name + '.submitted');
            submitted.data.id = result.id;

            return $state.go(submitted, $stateParams);
          }) :
          false;
      };

      $scope.cantSubmit = function(form) {
        return $scope.isUploading && !form.$valid;
      };

      $scope.isUploading = false;

      var fileKey = function(file){
        return file.name + file.size;
      };
    }
  ]);
});
