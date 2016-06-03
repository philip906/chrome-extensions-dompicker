app.controller("BookmarkerController", function($scope, bookmarkerFactory) {
	bookmarkerFactory.getBookmarks().then(function(response) {
    	var result = response.data.data;
    	var bookmarks = {};
    	if (result) {
    		bookmarks = result;
    	}

    	$scope.bookmarks = bookmarks;
    });
});
