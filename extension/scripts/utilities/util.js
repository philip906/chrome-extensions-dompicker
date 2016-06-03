define([], function() {

    var Util = {

        convertHyphenCaseToCamel: function(hyphenString) {
            return hyphenString.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() });
        },

        convertCamelCaseToHyphen: function(camelCase) {
            return camelCase.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },
        /**
         * Returns the value of a cookie given its name
         * @param {string} cookieName the name of the cookie to get
         * @param {string} cookies (optional) - optional cookies to pass to extract from
         * @return {string|undefined} the cookie or undefined if it DNE
         */
        getCookie: function (cookieName, cookiesString) {
            var cookieValue;
            // if optional cookies were passed then extract against that
            var cookies = cookiesString ? cookiesString.split(';') : document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var trimmedCookie = cookies[i].match(/^\s*(.*)/)[1];
                if (trimmedCookie.indexOf(cookieName + "=") === 0) {
                    cookieValue = trimmedCookie.substring(cookieName.length + 1, trimmedCookie.length);
                    break;
                }
            }
            return cookieValue;
        },
        /**
         * Stores a cookie; does not support expiration times.
         * @param {string} cookieName the name of the cookie to set
         * @param {string} value the value for the cookie
         * @param {string|undefined} optional domain to use for setting this cookie
         * @param {string|undefined} optional time to cookie expiration (defaults to 1 week)
         */
        setCookie: function (cookieName, value, expires) {
            var cookieStr = cookieName + "=" + value + "; path=/";
            if (!!expires) {
                cookieStr += "; expires=" + expires;
            } else {
                var weekInMs = 1000 * 60 * 60 * 24 * 7;
                expires = new Date(new Date().getTime() + weekInMs);
                cookieStr += "; expires=" + expires;
            }
            document.cookie = cookieStr;
        },

        removeLastCharacters: function(str, totalCharactersToRemove) {
            return str.substring(0, str.length - totalCharactersToRemove);
        }

    };

    return Util;

});


