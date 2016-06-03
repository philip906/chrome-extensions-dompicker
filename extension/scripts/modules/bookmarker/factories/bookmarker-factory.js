app.factory('bookmarkerFactory', function($http){

	var baseUrl = 'http://local-api.oneuplife.com/v1/chrome/';

    var bookmarkerFactory = {
    	getBookmarks: function() {
    		return $http.get(baseUrl + 'bookmark/');
    	}
    }

    return bookmarkerFactory;

});

