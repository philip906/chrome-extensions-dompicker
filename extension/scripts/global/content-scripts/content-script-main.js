require.config ({
    baseUrl: chrome.extension.getURL("/scripts"),
    paths: {
        'jquery': 'lib/jquery/jquery',
        'jquery-ui': 'lib/jquery/jquery-ui',
        'autobuilder-gen': 'modules/autobuilder-gen/content-scripts/autobuilder-gen',
        'testing': 'modules/testing/content-scripts/testing'
    },
    shim: {
        'jquery-ui': ['jquery']
    }
});

require(['ag', 'jquery', 'testing'], function(AutobuiderGen, r$, Testing){

    /**
     * Listen for message from background
     * message format for changeStatus:
            message: {
                'method': 'someMethodName',
                'tool': {
                      'name': 'someName',
                      'type': 'someType',
                      'value': 'someValue'
                  }
     *      }
     */
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        /* we always store the cookies in the chrome extension background for reference */
        var response = {
            'message': 'Content Script recieved message',
            'csCookies': document.cookie
        }
        sendResponse(response);
        window.ContentScriptApi[message.method](message.tool);
    });

    function _sendMessage(message) {
        chrome.runtime.sendMessage(message);
    }

    window.ContentScriptApi = {
        logger: {
            type: {
                info: '[INFO]',
                debug: '[DEBUG]',
                error: '[ERROR]'
            },
            source: {
                cs: 'content-scripts'
            },
            log: function(type, source, method, message, extra) {
                var output = {
                    type: type,
                    source: source,
                    method: method,
                    message: message,
                    extra: extra
                }
                _sendMessage({
                    "method": "log",
                    "output": output
                });
            }
        },
        /**
         * Sends value to background page to be saved and stored as cookie
         * @param tool {object} - the tool we are saving
              tool: {
                  'name': 'someName',
                  'type': 'someType',
                  'value': 'someValue'
              }
         * @param value - the value of the tool (i.e. 'off')
         */
        saveValue: function(tool) {
            _sendMessage({
                "method": "saveValue",
                "tool": tool
            });
        },
        /**
         * Sends notification to the content script letting it know of a value change
         * @param tool {object} - the tool we are notifying
              tool: {
                  'name': 'someName',
                  'type': 'someType',
                  'value': 'someValue'
              }
         */
        notifyCS: function(tool) {
            switch(tool.name) {
                case 'autobuilder-gen':
                    AutobuiderGen.notifyTool(tool.value);
                    break;
                case 'rondavu_debug':
                case 'rondavu_qa':
                case 'rdv_test_group':
                case 'rondavu_bypass_cdn':
                    Testing.notifyTool(tool);
                    break;
            }
        }
    };



});