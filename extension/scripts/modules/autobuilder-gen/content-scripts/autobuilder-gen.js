//TODO: allow use of regex
//TODO: allow use of format
//TODO: allow the use of the other attributes
//TODO: check for agCurrentConfig when app loads and see if it needs loaded
//TODO: load require js and move objects and html into their own files
//TODO: after each make specific start at the front and make


define(['jquery', 'jquery-ui'], function(r$) {
    //TODO: find why requirejs is not working here error is define is not defined
    var AutobuilderGen = {

        isLoaded: false,

        toolName: 'Autobuilder Generator 1.2.1',

        notifyTool: function(value) {
            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'notifyTool',
                'Autobuilder Generator Status is ' +  value);
            switch (value) {
                case "on":
                    this.turnOn();
                    break;
                case "off":
                    this.turnOff();
                    break;
                case "reset":
                    this.reset();
                    break;
            }
        },

        turnOn: function() {
            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'turnOn',
                'Turning On Autobuilder Generator...');
            this.init();
            r$('#autobuilder-gen-container').show();
        },

        reset: function() {
            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'reset',
                'Reseting Autobuilder Generator...');
            this.init();
        },

        turnOff: function(isInternal) {
            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'turnOff',
                'Turning off Autobuilder Generator...');
            r$('#autobuilder-gen-container').hide();
            if (isInternal) {
                window.ContentScriptApi.saveValue('autobuilder-gen', 'off');
            }
        },

        init: function() {
            var self = this;
            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'init',
                'loading ' + self.toolName + ' ...');

            var htmlTemplates = {
                autobuilderGenContainer:
                    '<div id="autobuilder-gen-header-container" >' +
                        '<div id="autobuilder-gen-header-hide-options-container">' +
                        '<span id="autobuilder-gen-header-hide-options-hide-btn" class="autobuilder-gen-hide-options-btn">-</span>' +
                        '<span id="autobuilder-gen-header-hide-options-show-btn" class="autobuilder-gen-hide-options-btn">+</span>' +
                        '<span id="autobuilder-gen-header-hide-options-close-btn" class="autobuilder-gen-hide-options-btn">x</span>' +
                        '</div>' +
                        '<div id="autobuilder-gen-header-lbl">' + self.toolName + '</div>' +
                        '</div>' +
                        '<div id="autobuilder-gen-menu-container">' +
                        '<span id="autobuilder-gen-new-config-item-btn" class="autobuilder-gen-menu-item autobuilder-gen-selected-menu-item" >New Config Item</span>' +
                        '<span id="autobuilder-gen-current-config-btn" class="autobuilder-gen-menu-item" >Current Config</span>' +
                        '</div>' +
                        '<div id="autobuilder-gen-menu-container-border"></div>' +
                        '<div id="autobuilder-gen-new-config-item-panel" class="autobuilder-gen-selected-panel">' +
                        '<span id="autobuilder-gen-new-search" class="autobuilder-gen-button">New Search</span>' +
                        '<span id="autobuilder-gen-parent" class="autobuilder-gen-button">Parent</span>' +
                        '<span id="autobuilder-gen-child" class="autobuilder-gen-button">Child</span>' +
                        '<span id="autobuilder-gen-prev-sibling" class="autobuilder-gen-button">Prev Sibling</span>' +
                        '<span id="autobuilder-gen-next-sibling" class="autobuilder-gen-button">Next Sibling</span>' +
                        '<div id="autobuilder-gen-no-element-clicked-container" >' +
                        '<span id="autobuilder-gen-no-element-clicked-lbl" >You need to hover over you element you want and then press shift.</span>' +
                        '</div>' +
                        '<div id="autobuilder-gen-value-to-extract-container">' +
                        '<select id="autobuilder-gen-value-to-extract-list">' +
                        '</select>' +
                        '<div id="autobuilder-gen-extracted-value-container">' +
                        '<span id="autobuilder-gen-extracted-value-lbl" ></span><span id="autobuilder-gen-extracted-value"></span><br />' +
                        '</div>' +
                        '</div>' +
                        '<div id="autobuilder-gen-scraper-object-list-container" >' +
                        '   <select id="autobuilder-gen-scraper-object-list">' +
                        '       <option value="1">-- scraper object --</option>' +
                        '       <option value="pautobuilder-gene">pautobuilder-gene</option>' +
                        '       <option value="primary-mo">primary-mo</option>' +
                        '       <option value="mos">mos</option>' +
                        '       <option value="user">user</option>' +
                        '   </select>' +
                        '</div>' +
                        '<div id="autobuilder-gen-scraper-object-type-list-container"></div>' +
                        '<div id="autobuilder-gen-generate-preview-container" >' +
                        '<span id="autobuilder-gen-generate-preview-btn" class="autobuilder-gen-button" >Preview</span>' +
                        '</div>' +
                        '<div id="autobuilder-gen-generated-preview-container" >' +
                        '<textarea id="autobuilder-gen-generated-preview-txt" ></textarea> <br />' +
                        '<span id="autobuilder-gen-selector-lbl" >Selector: </span><span id="autobuilder-gen-selector"></span><br />' +
                        '<span id="autobuilder-gen-add-to-config-btn" class="autobuilder-gen-button" >Add</span>' +
                        '<span id="autobuilder-gen-make-less-specific-btn" class="autobuilder-gen-button" >Make Less Specific</span>' +
                        '</div>' +
                        '</div>' +
                        '<div id="autobuilder-gen-current-config-panel">' +
                        '<div id="autobuilder-gen-current-config-container" >' +
                        '<textarea id="autobuilder-gen-current-config-txt" placeholder="You have not added any items yet." ></textarea>' +
                        '</div>' +
                    '</div>',

                scraperList: {
                    mo:
                        '<select id="autobuilder-gen-scraper-object-type-list" >' +
                            '   <option value="1">-- what to scrape for --</option>' +
                            '   <option value="id">id</option>' +
                            '   <option value="type">type</option>' +
                            '   <option value="name">name</option>' +
                            '   <option value="detail-url">detail-url</option>' +
                            '   <option value="picture-primary">picture-primary</option>' +
                            '   <option value="picture-secure">picture-secure</option>' +
                            '   <option value="description">description</option>' +
                            '   <option value="primary-tag">primary-tag</option>' +
                            '   <option value="tags,item">item (tags)</option>' +
                            '   <option value="retail-price">retail-price</option>' +
                            '   <option value="sale-price">sale-price</option>' +
                            '   <option value="currency">currency</option>' +
                            '   <option value="price-description">price-description</option>' +
                            '   <option value="do-promote">do-promote</option>' +
                            '   <option value="marketing-areas">marketing-areas</option>' +
                            '   <option value="release-date-date">release-date-date</option>' +
                            '   <option value="release-date-time">release-date-time</option>' +
                            '   <option value="create-facebook-event">create-facebook-event</option>' +
                            '   <option value="facebook-event-id">facebook-event-id</option>' +
                            '   <option value="event-information,dates,start-date">start-date (event-information dates)</option>' +
                            '   <option value="event-information,dates,start-time">start-time (event-information dates)</option>' +
                            '   <option value="event-information,dates,end-date">end-date (event-information dates)</option>' +
                            '   <option value="event-information,dates,end-time">end-time (event-information dates)</option>' +
                            '   <option value="event-information,dates,timezone">timezone (event-information dates)</option>' +
                            '   <option value="event-information,location,id">id (event-information location)</option>' +
                            '   <option value="event-information,location,name">name (event-information location)</option>' +
                            '   <option value="event-information,location,address-line-1">address-line-1 (event-information location)</option>' +
                            '   <option value="event-information,location,address-line-2">address-line-2 (event-information location)</option>' +
                            '   <option value="event-information,location,city">city (event-information location)</option>' +
                            '   <option value="event-information,location,state">state (event-information location)</option>' +
                            '   <option value="event-information,location,country">country (event-information location)</option>' +
                            '   <option value="event-information,location,venue">venue (event-information location)</option>' +
                            '   <option value="event-information,location,latitude">latitude (event-information location)</option>' +
                            '   <option value="event-information,location,longitude">longitude (event-information location)</option>' +
                            '   <option value="categories,item">item (categories)</option>' +
                            '</select>',

                    page:
                        '   <select id="autobuilder-gen-scraper-object-type-list" >' +
                            '   <option value="1">-- what to scrape for --</option>' +
                            '   <option value="tags,item">item (tags)</option>' +
                            '   <option value="registration">registration</option>' +
                            '   <option value="purchase-information,id">id (purchase-information)</option>' +
                            '   <option value="purchase-information,total">total (purchase-information)</option>' +
                            '   <option value="purchase-information,currency">currency (purchase-information)</option>' +
                            '   <option value="purchase-information,seat-info">seat-info (purchase-information)</option>' +
                            '   <option value="tracking,name">name (tracking)</option>' +
                            '   <option value="tracking,value">value (tracking)</option>' +
                            '   <option value="primary-category">primary-category</option>' +
                            '   <option value="marketing-area">marketing-area</option>' +
                            '   <option value="user-filter-id">user-filter-id</option>' +
                            '   <option value="user-filter-type">user-filter-type</option>' +
                            '   <option value="language">language</option>' +
                            '   </select>',

                    user:
                        '   <select id="autobuilder-gen-scraper-object-type-list" >' +
                            '   <option value="1">-- what to scrape for --</option>' +
                            '   <option value="id">id</option>' +
                            '   <option value="email">email</option>' +
                            '   <option value="first-name">first-name</option>' +
                            '   <option value="last-name">last-name</option>' +
                            '   <option value="tracking,name">name (tracking)</option>' +
                            '   <option value="tracking,value">value (tracking)</option>' +
                            '   </select>'
                }
            };

            var config = {
                elements: {

                    page: {
                        name: 'page',
                        isUsed: false,
                        children: {
                            'tags': {
                                name: 'tags',
                                isUsed: false,
                                children: {
                                    item: {
                                        name: 'item',
                                        html: ''
                                    }
                                }
                            },
                            'registration': {
                                name: 'registration',
                                html: ''
                            },
                            'purchase-information': {
                                name: 'purchase-information',
                                isUsed: false,
                                children: {
                                    'id': {
                                        name: 'id',
                                        html: ''
                                    },
                                    'total': {
                                        name: 'total',
                                        html: ''
                                    },
                                    'currency': {
                                        name: 'currency',
                                        html: ''
                                    },
                                    'seat-info': {
                                        name: 'seat-info',
                                        html: ''
                                    }
                                }
                            },
                            'tracking': {
                                name: 'tracking',
                                isUsed: false,
                                children: {
                                    'name': {
                                        name: 'name',
                                        html: ''
                                    },
                                    'value': {
                                        name: 'value',
                                        html: ''
                                    }
                                }
                            },
                            'primary-category': {
                                name: 'primary-category',
                                html: ''
                            },
                            'marketing-area': {
                                name: 'marketing-area',
                                html: ''
                            },
                            'user-filter-id': {
                                name: 'user-filter-id',
                                html: ''
                            },
                            'user-filter-type': {
                                name: 'user-filter-type',
                                html: ''
                            },
                            'language': {
                                name: 'language',
                                html: ''
                            }
                        }
                    },

                    'primary-mo': {
                        name: 'primary-mo',
                        isUsed: false,
                        children: {
                            'id': {
                                name: 'id',
                                html: ''
                            },
                            'type': {
                                name: 'type',
                                html: ''
                            },
                            'name': {
                                name: 'name',
                                html: ''
                            },
                            'detail-url': {
                                name: 'detail-url',
                                html: ''
                            },
                            'picture-primary': {
                                name: 'picture-primary',
                                html: ''
                            },
                            'picture-secure': {
                                name: 'picture-secure',
                                html: ''
                            },
                            'description': {
                                name: 'description',
                                html: ''
                            },
                            'primary-tag': {
                                name: 'primary-tag',
                                html: ''
                            },
                            'tags': {
                                name: 'tags',
                                isUsed: false,
                                children: {
                                    item: {
                                        name: 'item',
                                        html: ''
                                    }
                                }
                            },
                            'retail-price': {
                                name: 'retail-price',
                                html: ''
                            },
                            'sale-price': {
                                name: 'sale-price',
                                html: ''
                            },
                            'currency': {
                                name: 'currency',
                                html: ''
                            },
                            'price-description': {
                                name: 'price-description',
                                html: ''
                            },
                            'do-promote': {
                                name: 'do-promote',
                                html: ''
                            },
                            'event-information': {
                                name: 'event-information',
                                isUsed: false,
                                children: {
                                    'dates': {
                                        name: 'dates',
                                        isUsed: false,
                                        children: {
                                            'start-date': {
                                                name: 'start-date',
                                                html: ''
                                            },
                                            'start-time': {
                                                name: 'start-time',
                                                html: ''
                                            },
                                            'end-date': {
                                                name: 'end-date',
                                                html: ''
                                            },
                                            'end-time': {
                                                name: 'end-time',
                                                html: ''
                                            },
                                            'timezone': {
                                                name: 'timezone',
                                                html: ''
                                            }
                                        }
                                    },
                                    'location': {
                                        name: 'location',
                                        isUsed: false,
                                        children: {
                                            'id': {
                                                name: 'id',
                                                html: ''
                                            },
                                            'name': {
                                                name: 'name',
                                                html: ''
                                            },
                                            'address-line-1': {
                                                name: 'address-line-1',
                                                html: ''
                                            },
                                            'address-line-2': {
                                                name: 'address-line-2',
                                                html: ''
                                            },
                                            'city': {
                                                name: 'city',
                                                html: ''
                                            },
                                            'state': {
                                                name: 'state',
                                                html: ''
                                            },
                                            'country': {
                                                name: 'country',
                                                html: ''
                                            },
                                            'venue': {
                                                name: 'venue',
                                                html: ''
                                            },
                                            'latitude': {
                                                name: 'latitude',
                                                html: ''
                                            },
                                            'longitude': {
                                                name: 'longitude',
                                                html: ''
                                            }
                                        }
                                    }
                                }
                            },
                            'create-facebook-event': {
                                name: 'create-facebook-event',
                                html: ''
                            },
                            'facebook-event-id': {
                                name: 'facebook-event-id',
                                html: ''
                            },
                            'categories': {
                                name: 'categories',
                                isUsed: false,
                                children: {
                                    'item': {
                                        name: 'item',
                                        html: ''
                                    }
                                }
                            },
                            'marketing-areas': {
                                name: 'marketing-areas',
                                html: ''
                            },
                            'release-date-date': {
                                name: 'release-date-date',
                                html: ''
                            },
                            'release-date-time': {
                                name: 'release-date-time',
                                html: ''
                            }
                        }
                    },

                    mos: {
                        name: 'mos',
                        isUsed: false,
                        children: {
                            'id': {
                                name: 'id',
                                html: ''
                            },
                            'type': {
                                name: 'type',
                                html: ''
                            },
                            'name': {
                                name: 'name',
                                html: ''
                            },
                            'detail-url': {
                                name: 'detail-url',
                                html: ''
                            },
                            'picture-primary': {
                                name: 'picture-primary',
                                html: ''
                            },
                            'picture-secure': {
                                name: 'picture-secure',
                                html: ''
                            },
                            'description': {
                                name: 'description',
                                html: ''
                            },
                            'primary-tag': {
                                name: 'primary-tag',
                                html: ''
                            },
                            'tags': {
                                name: 'tags',
                                isUsed: false,
                                children: {
                                    item: {
                                        name: 'item',
                                        html: ''
                                    }
                                }
                            },
                            'retail-price': {
                                name: 'retail-price',
                                html: ''
                            },
                            'sale-price': {
                                name: 'sale-price',
                                html: ''
                            },
                            'currency': {
                                name: 'currency',
                                html: ''
                            },
                            'price-description': {
                                name: 'price-description',
                                html: ''
                            },
                            'do-promote': {
                                name: 'do-promote',
                                html: ''
                            },
                            'event-information': {
                                name: 'event-information',
                                isUsed: false,
                                children: {
                                    'dates': {
                                        name: 'dates',
                                        isUsed: false,
                                        children: {
                                            'start-date': {
                                                name: 'start-date',
                                                html: ''
                                            },
                                            'start-time': {
                                                name: 'start-time',
                                                html: ''
                                            },
                                            'end-date': {
                                                name: 'end-date',
                                                html: ''
                                            },
                                            'end-time': {
                                                name: 'end-time',
                                                html: ''
                                            },
                                            'timezone': {
                                                name: 'timezone',
                                                html: ''
                                            }
                                        }
                                    },
                                    'location': {
                                        name: 'location',
                                        isUsed: false,
                                        children: {
                                            'id': {
                                                name: 'id',
                                                html: ''
                                            },
                                            'name': {
                                                name: 'name',
                                                html: ''
                                            },
                                            'address-line-1': {
                                                name: 'address-line-1',
                                                html: ''
                                            },
                                            'address-line-2': {
                                                name: 'address-line-2',
                                                html: ''
                                            },
                                            'city': {
                                                name: 'city',
                                                html: ''
                                            },
                                            'state': {
                                                name: 'state',
                                                html: ''
                                            },
                                            'country': {
                                                name: 'country',
                                                html: ''
                                            },
                                            'venue': {
                                                name: 'venue',
                                                html: ''
                                            },
                                            'latitude': {
                                                name: 'latitude',
                                                html: ''
                                            },
                                            'longitude': {
                                                name: 'longitude',
                                                html: ''
                                            }
                                        }
                                    }
                                }
                            },
                            'create-facebook-event': {
                                name: 'create-facebook-event',
                                html: ''
                            },
                            'facebook-event-id': {
                                name: 'facebook-event-id',
                                html: ''
                            },
                            'categories': {
                                name: 'categories',
                                isUsed: false,
                                children: {
                                    'item': {
                                        name: 'item',
                                        html: ''
                                    }
                                }
                            },
                            'marketing-areas': {
                                name: 'marketing-areas',
                                html: ''
                            },
                            'release-date-date': {
                                name: 'release-date-date',
                                html: ''
                            },
                            'release-date-time': {
                                name: 'release-date-time',
                                html: ''
                            }
                        }
                    },

                    user: {
                        name: 'user',
                        isUsed: false,
                        children: {
                            'id': {
                                name: 'id',
                                html: ''
                            },
                            'email': {
                                name: 'email',
                                html: ''
                            },
                            'first-name': {
                                name: 'first-name',
                                html: ''
                            },
                            'last-name': {
                                name: 'last-name',
                                html: ''
                            },
                            'tracking': {
                                name: 'tracking',
                                isUsed: false,
                                children: {
                                    'name': {
                                        name: 'name',
                                        html: ''
                                    },
                                    'value': {
                                        name: 'value',
                                        html: ''
                                    }
                                }
                            }
                        }
                    }
                },

                resetConfigHtml: function() {
                    var self = this;
                    var resetChild = function(parent, currentIndention) {
                        parent.isUsed = false;
                        r$.each(parent.children, function(i, child) {
                            if (child.isUsed) {
                                resetChild(child, currentIndention + '    ');
                            } else if (child.html) {
                                child.html = '';
                            }
                        });
                    };
                    r$.each(this.elements, function(i, element) {
                        if (element.isUsed) {
                            resetChild(element, '');
                        }
                    });
                },

                /*
                 *  Generate Html given current config
                 */
                generateConfigHtml: function() {
                    var self = this;
                    var complete = '';
                    var getChildHtml = function(parent, currentIndention) {
                        complete += currentIndention + '<' + parent.name + '>\n';
                        r$.each(parent.children, function(i, child) {
                            if (child.isUsed && !r$.isEmptyObject(child.children)) {
                                getChildHtml(child, currentIndention + '    ');
                            } else if (child.html) {
                                complete += currentIndention + '    ' + child.html + '\n';
                            }
                        });
                        complete += currentIndention + '</' + parent.name + '>\n';
                    };
                    r$.each(this.elements, function(i, element) {
                        if (element.isUsed) {
                            getChildHtml(element, '');
                        }
                    });

                    return complete;
                },

                /*
                 *  Store previous config
                 */
                parseOldConfigHtml: function(currentConfig) {
                    var currentTreeTraversal = [];
                    var self = this;
                    this.resetConfigHtml();

                    var currentConfigElements = currentConfig.split('\n');
                    var hasNoChildrenRegex = /<.*\/>/;
                    currentTreeTraversal.push(self.elements);
                    /* iterate through each element in the current config */
                    for (var i = 0; i < currentConfigElements.length; i++) {
                        var currentConfigElement = currentConfigElements[i].trim(); //trim off the tabs and spaces
                        var elementTagRegex = /<(.*?)[\s\/>]/;
                        /* if this is correctly formatted element then continue */
                        if (currentConfigElement && currentConfigElement.match(elementTagRegex).length > 1) {
                            var currentConfigElementTag = currentConfigElement.match(elementTagRegex)[1]; //extract the tag from element
                            /* if there are children then continue traversing */
                            if (currentConfigElement.match(hasNoChildrenRegex)) {
                                var currentElementInTree = currentTreeTraversal[currentTreeTraversal.length - 1];
                                currentElementInTree.children[currentConfigElementTag].html = currentConfigElement;
                            } else if (currentConfigElementTag && !currentConfigElementTag.match(/\//)) {
                                /*
                                 *  if this isn't an end tag that then traverse deeper into the
                                 *  tree and set elements as used
                                 */
                                var currentElementInTree = currentTreeTraversal[currentTreeTraversal.length - 1];
                                if (currentElementInTree.children !== undefined) {
                                    currentTreeTraversal.push(currentElementInTree.children[currentConfigElementTag]);
                                } else {
                                    currentTreeTraversal.push(currentElementInTree[currentConfigElementTag]);
                                }
                                /* if this is the root then handle it differently */
                                if (currentElementInTree.children) {
                                    currentElementInTree.children[currentConfigElementTag].isUsed = true;
                                } else {
                                    currentElementInTree[currentConfigElementTag].isUsed = true;
                                }

                            } else {
                                /*
                                 * we are now are the end of the nested elements so we need to move up one on the tree
                                 */
                                currentTreeTraversal.pop();
                            }
                        }
                    }
                },

                getConfigHtml: function() {
                    var self = this;
                    var currentConfig = r$('#autobuilder-gen-current-config-txt').val();
                    if (currentConfig) {
                        this.parseOldConfigHtml(currentConfig);
                    }

                    /*
                     * add previewed object to config
                     */
                    self.elements[selectedScraperObject].isUsed = true;
                    var selectedScraperParts = selectedScraperObjectType.split(',');
                    var parentSelectedScraper = self.elements[selectedScraperObject].children[selectedScraperParts[0]];
                    if (selectedScraperParts.length > 1) {
                        selectedScraperParts.splice(0, 1);
                        /*
                         * if the current selector is a nested element then iterate through until
                         * we reach the parent of the last child
                         */
                        while (selectedScraperParts.length > 0) {
                            parentSelectedScraper.isUsed = true;
                            parentSelectedScraper = parentSelectedScraper.children[selectedScraperParts[0]];
                            selectedScraperParts.splice(0, 1);
                        }
                    }

                    parentSelectedScraper.html = '<' + parentSelectedScraper.name + ' type="selector" selector="' + selectorStringWithValueType + '" />';

                    return this.generateConfigHtml();
                }
            };

            var selectedScraperObject = '';
            var selectedScraperObjectType = '';
            var selectedScraperValueType = '';
            var valueFromConfig = '';
            var selectorString = '';
            var selectorStringWithValueType = '';
            var startedOver = false;
            var currentElement;
            var makeLessSpecific = false;

            /* the very beginning of flow */
            function goToBeginning() {
                r$('#autobuilder-gen-no-element-clicked-container').hide();
                r$('#autobuilder-gen-value-to-extract-container').hide();
                r$('#autobuilder-gen-scraper-object-list-container').hide();
                r$('#autobuilder-gen-scraper-object-type-list-container').hide();
                r$('#autobuilder-gen-generate-preview-container').hide();
                r$('#autobuilder-gen-generated-preview-container').hide();
            }

            /* before new search is clicked */
            function goToNewSearch() {
                r$(currentElement).css('border', '');
                r$('#autobuilder-gen-no-element-clicked-container').show();
                r$('#autobuilder-gen-value-to-extract-container').hide();
                r$('#autobuilder-gen-scraper-object-list-container').hide();
                r$('#autobuilder-gen-scraper-object-type-list-container').hide();
                r$('#autobuilder-gen-generate-preview-container').hide();
                r$('#autobuilder-gen-generated-preview-container').hide();
            }

            /* after element is on page is selected */
            function goToSelectValueToExtract() {
                r$(currentElement).css('border', '5px solid purple');
                selectedScraperValueType = 'text';

                var valueToExtractListHtml = '<option value="1">-- value to extract --</option>';
                if (r$(currentElement).text()) {
                    valueToExtractListHtml += '<option value="text" data-value="' + r$(currentElement).text() + '">text</option>';
                }
                for (var i = 0; i < currentElement.attributes.length; i++) {
                    if (r$(currentElement).attr(currentElement.attributes[i].name)) {
                        valueToExtractListHtml += '<option value="' + currentElement.attributes[i].name + '" data-value="' + r$(currentElement).attr(currentElement.attributes[i].name) + '" >' + currentElement.attributes[i].name + '</option>';
                    }
                }

                r$('#autobuilder-gen-child, #autobuilder-gen-parent, #autobuilder-gen-next-sibling, #autobuilder-gen-prev-sibling').hide();
                r$('#autobuilder-gen-value-to-extract-list').html(valueToExtractListHtml);
                if (r$(currentElement).children().length) {
                    r$('#autobuilder-gen-child').show();
                }
                if (r$(currentElement).parent().length) {
                    r$('#autobuilder-gen-parent').show();
                }
                if (r$(currentElement).next().length) {
                    r$('#autobuilder-gen-next-sibling').show();
                }
                if (r$(currentElement).prev().length) {
                    r$('#autobuilder-gen-prev-sibling').show();
                }

                r$('#autobuilder-gen-no-element-clicked-container').hide();
                r$('#autobuilder-gen-value-to-extract-container').show();
                r$('#autobuilder-gen-extracted-value-container').hide();
                r$('#autobuilder-gen-scraper-object-list-container').hide();
                r$('#autobuilder-gen-scraper-object-type-list-container').hide();
                r$('#autobuilder-gen-generate-preview-container').hide();
                r$('#autobuilder-gen-generated-preview-container').hide();
            }

            function goToSelectScraperObject() {
                r$('#autobuilder-gen-scraper-object-list-container').show();
                r$('#autobuilder-gen-generated-preview-container').hide();
                if (startedOver) {
                    r$('#autobuilder-gen-scraper-object-type-list-container').show();
                    goToGeneratePreview();
                }


            }

            function goToSelectScraperObjectType() {
                startedOver = true;
                r$('#autobuilder-gen-scraper-object-type-list-container').show();
            }

            function goToGeneratePreview() {
                r$('#autobuilder-gen-generate-preview-container').show();
            }

            /* step after generate config is clicked */
            function generatePreview() {
                generateSelector();

                if (selectedScraperValueType !== 'text') {
                    selectorStringWithValueType = selectorString +  '/' + selectedScraperValueType;
                } else {
                    selectorStringWithValueType = selectorString;
                }
                r$('#autobuilder-gen-generated-preview-txt').val('<' + selectedScraperObjectType.split(',')[selectedScraperObjectType.split(',').length - 1] + ' type="selector" selector="' + selectorStringWithValueType + '"/>');
                r$('#autobuilder-gen-selector').text(selectorString);

                r$('#autobuilder-gen-generated-preview-container').show();
            }

            function generateSelector() {
                var tempCurrentElement = currentElement;
                var parentElement;
                var elements = [];

                var lastIdentifierWasDirectChild = true;
                var getBestIdentifier = function() {
                    var id = tempCurrentElement.id;
                    var classes = tempCurrentElement.classList;
                    var tagName = tempCurrentElement.tagName.toLowerCase();
                    var children = parentElement.children();
                    var childIndex = r$.inArray(tempCurrentElement, children);
                    var nthChildIndex = childIndex + 1;
                    var isFirstChild = childIndex === 0;
                    var isLastChild = childIndex === children.length - 1;
                    var typeCharacterForFilter = lastIdentifierWasDirectChild && selectorString ? '> ' : '';
                    var typeCharacter = lastIdentifierWasDirectChild && selectorString ? ' > ' : selectorString ? ' ' : '';

                    /*
                     *  perform comparison to see if we successfully only found 1 element
                     *  with the current selector
                     */
                    var isTempSelectorUnique = function(identifier) {
                        return parentElement.find('> ' + getNewSelector(identifier)).length === 1;
                    };

                    var isSelectorUnique = function() {
                        return parentElement.find('> ' + selectorString).length === 1;
                    };

                    var getNewSelector = function(identifier) {
                        return identifier + typeCharacter + selectorString;
                    };


                    /* try to use an id */
                    if (id && !makeLessSpecific) {
                        id = '#' + id;
                        if (isTempSelectorUnique(id)) {
                            selectorString = getNewSelector(id);
                        } else if (isTempSelectorUnique(tagName + id)) {
                            selectorString = getNewSelector(tagName + tempSelectorString);
                        } else if (isFirstChild && isTempSelectorUnique(id + ':first-child')) {
                            selectorString = getNewSelector(id + ':first-child');
                        } else if (isLastChild && isTempSelectorUnique(id + ':last-child')) {
                            selectorString = getNewSelector(id + ':last-child');
                        } else if (isTempSelectorUnique(id + ':nth-child(' + nthChildIndex + ')')) {
                            selectorString = getNewSelector(id + ':nth-child(' + nthChildIndex + ')');
                        }
                    } else { /* try to use a class */
                        for (var i = 0; i < classes.length; i++) {
                            var currentClass = '.' + classes[i];
                            if (isTempSelectorUnique(currentClass)) {
                                selectorString = getNewSelector(currentClass);
                                break;
                            } else if (isTempSelectorUnique(tagName + currentClass)) {
                                selectorString = getNewSelector(tagName + currentClass);
                                break;
                            } else if (isFirstChild && isTempSelectorUnique(currentClass + ':first-child')) {
                                selectorString = getNewSelector(currentClass + ':first-child');
                                break;
                            } else if (isLastChild && isTempSelectorUnique(currentClass + ':last-child')) {
                                selectorString = getNewSelector(currentClass + ':last-child');
                                break;
                            } else if (isTempSelectorUnique(currentClass + ':nth-child(' + nthChildIndex + ')')) {
                                selectorString = getNewSelector(currentClass + ':nth-child(' + nthChildIndex + ')');
                                break;
                            }
                        }
                    }

                    /* try to use tags */
                    if (!isSelectorUnique()) {
                        if (isTempSelectorUnique(tagName)) {
                            selectorString = getNewSelector(tagName);
                        } else if (isFirstChild && isTempSelectorUnique(tagName + ':first-child')) {
                            selectorString = getNewSelector(tagName + ':first-child');
                        } else if (isLastChild && isTempSelectorUnique(currentClass + ':last-child')) {
                            selectorString = getNewSelector(tagName + ':last-child');
                        } else if (isTempSelectorUnique(currentClass + ':nth-child(' + nthChildIndex + ')')) {
                            selectorString = getNewSelector(tagName + ':nth-child(' + nthChildIndex + ')');
                        }
                    }

                    /* if we did not find a specific enough selector and this wasn't the first element found then we remove that selector */
                    if (r$(selectorString).length > 1 && selectorString.match(/\s/)) {
                        if (lastIdentifierWasDirectChild) {
                            selectorString = selectorString.replace(/.*?\s+>/, '');
                        } else {
                            selectorString = selectorString.replace(/.*?\s+/, '');
                        }
                        lastIdentifierWasDirectChild = false;
                    } else {
                        lastIdentifierWasDirectChild = true;
                    }
                };

                selectorString = "";
                while (elements.length !== 1 && tempCurrentElement.tagName.toUpperCase() !== 'BODY') {
                    parentElement = r$(tempCurrentElement).parent();
                    getBestIdentifier();
                    elements = r$(selectorString);
                    tempCurrentElement = parentElement[0];
                }

                if (elements.length !== 1 && selectorString) {
                    selectorString = 'body ' + selectorString;
                    if (elements.length !== 1) {
                        selectorString = selectorString.replace('body ', 'body > ');
                    }
                }
            }

            if (!r$('#autobuilder-gen-container').length) {
                r$('body').append('<div id="autobuilder-gen-container" ></div>');
            }
            r$('#autobuilder-gen-container').html(htmlTemplates.autobuilderGenContainer).draggable();

            r$('#autobuilder-gen-container *').on('click', function(e) {
                e.stopPropagation();
            });

            r$('#autobuilder-gen-new-config-item-btn').on('click', function() {
                r$('#autobuilder-gen-new-config-item-panel').show();
                r$('#autobuilder-gen-current-config-panel').hide();
                r$(this).addClass('autobuilder-gen-selected-menu-item');
                r$('#autobuilder-gen-current-config-btn').removeClass('autobuilder-gen-selected-menu-item');
            });

            r$('#autobuilder-gen-current-config-btn').on('click', function() {
                r$('#autobuilder-gen-new-config-item-panel').hide();
                r$('#autobuilder-gen-current-config-panel').show();
                r$(this).addClass('autobuilder-gen-selected-menu-item');
                r$('#autobuilder-gen-new-config-item-btn').removeClass('autobuilder-gen-selected-menu-item');
            });

            r$('#autobuilder-gen-parent').on('click', function() {
                r$(currentElement).css('border', '');
                currentElement = r$(currentElement).parent()[0];
                goToSelectValueToExtract();
            });

            r$('#autobuilder-gen-child').on('click', function() {
                r$(currentElement).css('border', '');
                currentElement = r$(currentElement).children()[0];
                goToSelectValueToExtract();
            });

            r$('#autobuilder-gen-prev-sibling').on('click', function() {
                r$(currentElement).css('border', '');
                currentElement = r$(currentElement).prev()[0];
                goToSelectValueToExtract();
            });

            r$('#autobuilder-gen-next-sibling').on('click', function() {
                r$(currentElement).css('border', '');
                currentElement = r$(currentElement).next()[0];
                goToSelectValueToExtract();
            });

            r$('#autobuilder-gen-new-search').on('click', function() {
                goToNewSearch();
                r$('body *').on('mouseenter', function(e) {
                    r$(currentElement).css('border', '');
                    /* check that this isn't inside of the ag-container */
                    if (r$('#autobuilder-gen-container').find(e.target).length === 0) {
                        var parent = r$(e.target).parent();
                        /* remove the border from every parent */
                        while (!parent.is(r$('body'))) {
                            r$(parent).css('border', '');
                            parent = r$(parent).parent();
                        }
                        r$(e.target).css('border', '5px solid purple');
                        currentElement = e.target;
                    }
                });
                r$('body *').on('mouseleave', function(e) {
                    /* check that this isn't inside of the autobuilder-gen-container */
                    if (r$('#autobuilder-gen-container').find(e.target).length === 0) {
                        r$(e.target).css('border', '');
                        currentElement = r$(':hover')[r$(':hover').length - 1];
                        r$(currentElement).css('border', '5px solid purple');
                    }
                });

                r$(document).on('keyup', function(e) {
                    if (e.keyCode === 16 && currentElement) {
                        r$('body *').unbind('mouseenter');
                        r$('body *').unbind('mouseleave');
                        r$('body').unbind('keyUp');
                        goToSelectValueToExtract();
                    }
                });
            });

            r$('#autobuilder-gen-scraper-object-list').on('change', function() {
                var value = r$(this).find("option:selected").attr("value");
                selectedScraperObject = value;
                value = (value === 'primary-mo' || value === 'mos') ? 'mo' : value;
                if (value !== "1") {
                    r$('#autobuilder-gen-scraper-object-type-list-container').html(htmlTemplates.scraperList[value]);
                    goToSelectScraperObjectType();
                } else {
                    goToSelectScraperObject();
                }
            });

            r$('#autobuilder-gen-header-hide-options-hide-btn').on('click', function() {
                r$(this).hide();
                r$('#autobuilder-gen-header-hide-options-show-btn').show();
                r$('#autobuilder-gen-container').addClass('autobuilder-gen-container-hidden');
            });

            r$('#autobuilder-gen-header-hide-options-show-btn').on('click', function() {
                r$(this).hide();
                r$('#autobuilder-gen-header-hide-options-hide-btn').show();
                r$('#autobuilder-gen-container').removeClass('autobuilder-gen-container-hidden');
            });

            r$('#autobuilder-gen-header-hide-options-close-btn').on('click', function() {
                self.turnOff(true);
            });

            r$('#autobuilder-gen-scraper-object-type-list-container').on('change', '#autobuilder-gen-scraper-object-type-list', function() {
                selectedScraperObjectType = r$('#autobuilder-gen-scraper-object-type-list').find("option:selected").attr("value");
                goToGeneratePreview();
            });

            r$('#autobuilder-gen-value-to-extract-list').on('change', function() {
                var value = r$(this).find("option:selected").attr("data-value");
                r$('#autobuilder-gen-extracted-value').html("'" + value + "'");
                selectedScraperValueType = r$(this).find("option:selected").attr("value");
                if (selectedScraperValueType === 'text') {
                    valueFromConfig = r$(currentElement).text();
                } else if (value) {
                    valueFromConfig = r$(currentElement).attr(selectedScraperValueType);
                }

                if (value) {
                    r$('#autobuilder-gen-extracted-value-lbl').text("Value: ");
                    r$('#autobuilder-gen-extracted-value').text("'" + valueFromConfig + "'");
                    r$('#autobuilder-gen-extracted-value-container').show();
                    goToSelectScraperObject();
                } else {
                    r$('#autobuilder-gen-extracted-value-container').hide();
                    goToSelectValueToExtract();
                }
            });

            r$('#autobuilder-gen-generate-preview-btn').on('click', function() {
                makeLessSpecific = false;
                generatePreview();
                r$('#autobuilder-gen-make-less-specific-btn').show();
            });

            r$('#autobuilder-gen-make-less-specific-btn').on('click', function() {
                makeLessSpecific = true;
                r$(this).hide();
                generatePreview();
            });

            r$('#autobuilder-gen-add-to-config-btn').on('click', function() {
                var currentConfig = config.getConfigHtml();
                r$('#autobuilder-gen-current-config-txt').val(currentConfig);
                goToBeginning();
            });

            ContentScriptApi.logger.log(
                ContentScriptApi.logger.type.info,
                'content-scripts:autobuilder-gen.js',
                'init',
                self.toolName + ' loaded successfully!');
        }
    };

    return AutobuilderGen;
});
