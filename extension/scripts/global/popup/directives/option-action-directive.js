app.directive('slOptionAction', function() {
    return {
        restrict: 'A',
        template:
            '<span ' +
                'class="option-action button" ' +
                'ng-click="optionActionClick()">' +
                '{{title}}' +
            '</span>',
        replace: true,
        scope: {
            toolValues: "@slArgToolValues",
            isDefault: "@slArgIsDefault",
            title: "@slArgTitle"
        },
        link: function(scope, $element, attrs) {
            var toolValues = scope.toolValues.split(',');
            scope.tool = {
                name: toolValues[0],
                type: toolValues[1],
                value: toolValues[2]
            }
            updateVisibility(scope.$parent.getValue(scope.tool));

            scope.optionActionClick = function() {
                scope.$parent.optionActionClick(scope.tool);
                updateVisibility(scope.tool.value);
            };

            function updateVisibility(currentValue) {
                scope.currentValue = currentValue;
                if (scope.currentValue === scope.tool.value) {
                    $element.parent().children().removeClass('ng-hide');
                    $element.addClass('ng-hide');
                } else if (!scope.currentValue && scope.isDefault) {
                    $element.parent().children().addClass('ng-hide');
                    $element.removeClass('ng-hide');
                }
            }

        }
    }
});