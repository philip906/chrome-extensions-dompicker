app.directive('slOptionLbl', function() {
    return {
        restrict: 'A',
        template:
            '<div class="option-lbl-container" ng-click="toggleSelected()">' +
                '<span class="option-arrow-left">&lt;</span>' +
                '<span class="option-lbl">{{title}}</span>' +
                '<span class="option-arrow-right">&gt;</span>' +
            '</div>',
        replace: true,
        scope: {
            title: "@slArgTitle"
        },
        link: function(scope, element, attrs) {
            scope.isSelected = false;
            scope.toggleSelected = function() {
                scope.isSelected = !scope.isSelected;
                if (scope.isSelected) {
                    angular.element(element).parent().parent().children().addClass('not-selected'); //siblings of parent
                    angular.element(element).parent().removeClass('not-selected').addClass('selected');
                } else {
                    angular.element(element).parent().parent().children().removeClass('not-selected');
                    angular.element(element).parent().removeClass('selected');
                }
            };
        }
    }
});