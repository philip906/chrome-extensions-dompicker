require.config({
    baseUrl: 'scripts',
});

require(['lib/underscore', 'utilities/util'], function(_, Util) {



    /**
     * Listen for message from content script wrapper
     * message format for saveValues:
           message: {
               'method': 'methodName',
               'tool': {
                   'name': 'someName',
                   'type': 'someType',
                   'value': 'someValue'
                }

           }
    **/
    chrome.runtime.onMessage.addListener(function(message){
        BackgroundApi.logger.log(
            BackgroundApi.logger.type.info,
            'background:background-main.js',
            'chrome.runtime.onMessage',
            'recieving message from Content Script');
        switch(message.method) {
            case 'saveValue':
                BackgroundApi.saveValue(message.tool);
                break;
            case 'log':
                BackgroundApi.logger.log(
                    message.output.type,
                    message.output.source,
                    message.output.method,
                    message.output.message,
                    message.output.extra);
                break;
            default:
                BackgroundApi.logger.log(
                    BackgroundApi.logger.type.debug,
                    'background:background-main.js',
                    'chrome.runtime.onMessage',
                    'did not find a method in the message');
                break;
        }
    });

    chrome.webNavigation.onDOMContentLoaded.addListener(_restoreState);

    function _restoreState() {
        var slToolCookie = Util.getCookie('sl-tool');
        if (slToolCookie) {
            slToolValues = slToolCookie.split('|');
            for (var i = 0; i < slToolValues.length; i++) {
                var savedTool = _parseSavedTool(slToolValues[i]);
                window.BackgroundApi.notifyCS(savedTool);
            }
        }
    }


    function _sendMessageToContentScript(message) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                if (response) {
                    BackgroundApi.logger.log(
                        BackgroundApi.logger.type.info,
                        'background:background-main.js',
                        '_sendMessageToCS',
                        'message sent successfully to Content Script',
                        message);
                    window.BackgroundApi.contentScriptCookies = response.contentScriptCookies;
                } else {
                    BackgroundApi.logger.log(
                        BackgroundApi.logger.type.debug,
                        'background:background-main.js',
                        '_sendMessageToCS',
                        'something happened to the message',
                        message);
                }
            });
        });
    }

    /**
    * parses saved tool and creates a json object
    * @param savedTool {array} - array of tool values
        i.e. savedTool = ['toolName', 'toolType', 'toolValue']
    * @return {object} - json object of tool values
        tool: {
            'name': 'toolName',
            'type': 'toolType',
            'value': 'toolValue'
        }
    **/
    function _parseSavedTool(savedTool) {
        var toolValues = savedTool.split(',');

        return {
            "name": toolValues[0],
            "type": toolValues[1],
            "value": toolValues[2]
        }
    }

    window.BackgroundApi = {
        util: Util,
        logger: {
            type: {
                info: '[INFO]',
                debug: '[DEBUG]',
                error: '[ERROR]'
            },
            /**
            * the method by which eveything is logged
            * @param type {enum} - the type of method to log
                note: is you simply want to log to the console just put the message as the type param
            * @param source {enum} - the source of this message
                format: scriptType:scriptName
            * @param method {string} - the method that this was called from
            * @param message {string} - the message to log
            * @param extra {object/string} - any extra data to log
            **/
            log: function(type, source, method, message, extra) {
                if (!source) {
                    console.log(type);
                } else {
                    console.log(type + ' ' + source + '(' + method + ') - ' + message, extra);
                }
            }
        },
        /**
         * Called from the popup this will save a value of a tool
         * @param tool {object} - the tool we are saving
              tool: {
                  'name': 'someName',
                  'type': 'someType',
                  'value': 'someValue'
              }
         * @param shouldNotifyCS {boolean} - whether we should notify the Content Script Wrapper of the change
        **/
        saveValue: function(tool, shouldNotifyContentScript) {
            var newSLToolValue = '';
            var isNewValue = true;
            var slToolCookie = this.util.getCookie('sl-tool');
            //if there is a cookie then we iterate through and keep the previous values
            if (slToolCookie)  {
                slToolValues = slToolCookie.split('|');
                for (var i = 0; i < slToolValues.length; i++) {
                    var savedTool = _parseSavedTool(slToolValues[i]);
                    //if we found the tool we are looking for we update
                    if (savedTool.name === tool.name) {
                        newSLToolValue += tool.name + ',' + tool.type + ',' + tool.value + '|';
                        isNewValue = false;
                    } else { //else we keep the saved tool the same
                        newSLToolValue += savedTool.name + ',' + savedTool.type + ',' + savedTool.value + '|';
                    }
                }
                newSLToolValue = this.util.removeLastCharacters(newSLToolValue, 1);
            } else { //else we create the cookie
                newSLToolValue =  tool.name + ',' + tool.type + ',' + tool.value;
            }
            // check if this tool was not saved previously
            if (isNewValue) {
                newSLToolValue += '|' + tool.name + ',' + tool.type + ',' + tool.value;
            }

            this.util.setCookie('sl-tool', newSLToolValue); //store the new cookie
            if (shouldNotifyContentScript) {
                this.notifyContentScript(tool);
            }
        },

        getValue: function(tool) {
            /* if this is a cookie tool then we want to pass the contentScriptCookies to the getCookie
                and find if there is a value */
            if (tool.type === 'cookie') {
                return this.util.getCookie(tool.name, this.contentScriptCookies);
            } else if (tool.type === 'tool' || tool.type === 'query') {
                var slToolCookie = this.util.getCookie('sl-tool');
                if (slToolCookie) {
                    slToolValues = slToolCookie.split('|');
                    for (var i = 0; i < slToolValues.length; i++) {
                        var savedTool = _parseSavedTool(slToolValues[i]);

                        if (savedTool.name === tool.name) {
                            return savedTool.value;
                        }
                    }
                }
            } else {
                this.logger.log(
                    this.logger.type.debug,
                    'background:background-main.js',
                    'BackgroundApi.getValue',
                    tool.type + ' is not an accepted tool type...');
            }
        },

        notifyContentScript: function(tool) {
            _sendMessageToContentScript({
                    "method": "notifyContentScript",
                    "tool": tool
                }
            )
        },
        /* populated when content scripts are called */
        contentScriptCookies: ''
    };

});