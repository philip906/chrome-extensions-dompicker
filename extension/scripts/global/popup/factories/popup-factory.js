app.factory('popupFactory', function(){

    function _saveValue(toolName, value) {
        chrome.extension.getBackgroundPage().BackgroundApi.saveValue(toolName, value, true);
    }

    function _notifyContentScript(toolName, value) {
        chrome.extension.getBackgroundPage().BackgroundApi.notifyContentScript(toolName, value);
    }

    var popupFactory = {
        /*
        * returns the value currently stored in a background cookie for a tool
        * @param tool {object} - the tool we are getting value for
            tool: {
                'name': 'someName',
                'type': 'someType',
                'value': 'someValue'
            }
        * @return {string} - the current value of the tool
        */
        getValue: function(tool) {
            return chrome.extension.getBackgroundPage().BackgroundApi.getValue(tool);
        },

        /*
        * When action is clicked we notify the content scripts of the changes, we then see if
            we need to keep the data or not and if so save it
        * @param tool {object} - the tool we are saving
            tool: {
                'name': 'someName',
                'type': 'someType',
                'value': 'someValue'
            }
        */
        optionActionClick: function(tool) {
            _notifyCS(tool);
            _saveValue(tool);
        },
        logger: {
            type: {
                info: '[INFO]',
                debug: '[DEBUG]',
                error: '[ERROR]'
            },
            log: function(type, source, method, message, extra) {
                chrome.extension.getBackgroundPage().BackgroundApi.logger.log(type, source, method, message, extra);
            }
        }
    }

    return popupFactory;

});

