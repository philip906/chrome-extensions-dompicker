define([], function() {

    var Testing = {
        /**
         * Notifys testing module of changes
         * @param tool {object} - the testing tool we are using
              tool: {
                  'name': 'someName',
                  'type': 'someType',
                  'value': 'someValue'
              }
         */
        notifyTool: function(tool) {
            if (tool.type === 'cookie') {
    			      document.cookie = tool.name + '=' + tool.value + "; path=/";
        		    console.log('[INFO] ' + tool.name + ' cookie executed with value ' + tool.value);
            } else if (tool.type === 'query') {
                var currentLocation = window.location.href;
                if (currentLocation.indexOf(tool.name) === -1) {
                    var queryParameter = tool.name + '=' + tool.value;
                    window.location.href = currentLocation + (currentLocation.indexOf('?') > 0 ? '&' : '?') + queryParameter;
                }
                ContentScriptApi.logger.log(
                  ContentScriptApi.logger.type.info,
                  'content-scripts:testing.js',
                  'notifyTool',
                  'url query parameter was added: ' + tool.value);
            } else {
                ContentScriptApi.logger.log(
                  ContentScriptApi.logger.type.debug,
                  'content-scripts:testing.js',
                  'notifyTool',
                  tool.type + ' was not an accepted tool.type');
            }
        }
    };

    return Testing;

});