app.directive('slRegexGenInput', function() {
    return {
        restrict: 'A',
        template:
            '<div class="sl-regex-gen-input-container">' +
                '<input class="sl-input-txt" ng-model="model" >' +
                '<span class="sl-input-placeholder" ' +
                    'ng-hide="!!model" ng-click="inputPlaceholderClick($event)" >{{placeholder}}</span>' +
            '</div>',
        scope: {
            model: "=ngModel",
            placeholder: "@slPlaceholder",
            bindValue: "=slBindValue"
        },
        replace: true,
        link: function(scope, element, attrs) {
            scope.inputPlaceholderClick = function($event) {
                angular.element($event.target).parent().find('input')[0].focus();
            }
        }
    }
});