app.filter('hasValue', function() {
    /**
     * @items {array} - array to filter
     * @name {string} - name of property to check value of
     */
    return function(items, name) {
        var accepted = [];
        angular.forEach(items, function(item) {
            if (item[name]) {
                accepted.push(item);
            }
        });
        return accepted;
    }
});