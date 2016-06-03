app.controller("TestingController", function($scope, popupFactory) {

    $scope.getValue = popupFactory.getValue;
    $scope.optionActionClick = popupFactory.optionActionClick;

});
