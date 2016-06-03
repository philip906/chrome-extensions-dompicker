app.directive('slRegexGenNewValuePart', function() {
    return {
        restrict: 'A',
        template: '<span class="new-value-part" ' +
                        'ng-click="toggleWildValue()" ' +
                        'ng-class="{selected: isSelected}" >{{value}}</span>',
        scope: {
            topLevelIndex: "=slIndex",
            value: "=slValue"
        },
        replace: false,
        link: function(scope, element, attrs) {
            scope.isSelected = false;

            scope.toggleWildValue = function() {

                scope.isSelected = !scope.isSelected;
                /* the highest level regex part */
                var newRegexPart = {
                    topLevelIndex: scope.topLevelIndex,
                    positionIndex: scope.topLevelIndex,
                    indexes: null,
                    value: scope.value.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
                    parts: null
                }

                scope.$parent.current.regex.utils.toggleWildValue(newRegexPart, scope.isSelected);

            }
        }
    }
});
