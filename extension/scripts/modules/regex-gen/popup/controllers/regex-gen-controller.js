app.controller("RegexGenController", function($scope, popupFactory) {

    //TROUBLE_SHOOT: when the middle value is changed to not wild there is a problem
    //TROUBLE_SHOOT: when a 3rd value is added under the repeated

	/* exposing popup factory methods */
	$scope.logger = popupFactory.logger;
	$scope.getValue = popupFactory.getValue;

    /* steps:
        0 - changing the new value
        1 - selecting what values can be wild
        2 - selecting what wild values can be wild types
    */
    $scope.current = {
        step: 0,
        newValueParts: [],
        regex: {
            utils: {
                symbol: {
                    wild: {
                        number: '\\d',
                        letter: '[A-Za-z]',
                        any: '.'
                    },
                    repeaters: {
                        zeroOrMore: '*',
                        oneOrMore: '+'
                    }
                },
                /* temp function, need to use underscore */
                union: function(array1, array2) {
                    var obj = {};
                    for (var i = array1.length-1; i >= 0; -- i)
                        obj[array1[i]] = array1[i];
                    for (var i = array2.length-1; i >= 0; -- i)
                        obj[array2[i]] = array2[i];
                    var res = []
                    for (var k in obj) {
                        if (obj.hasOwnProperty(k))  // <-- optional
                        res.push(obj[k]);
                    }
                    return res;
                },
                /**
                * find where in the regexParts this old value existed and pull it out and
                    and slice it into the regexParts array right after the location it was pulled from
                * @param regexPart {object} - the regex part we are toggling
                * @param isSelected {boolean} - indicator if we are making value wild or making value not wild
                **/
                toggleWildValue: function(regexPart, isSelected) {
                    $scope.current.step = 1;
                    if (isSelected) {
                        /* create parent part to nest regexPart in */
                        var parentPart = {
                            topLevelIndex: null,
                            positionIndex: null,
                            indexes: [],
                            value: '',
                            parts: []
                        };

                        /* Step 1: Find what characters can have a wild value */
                        if (!isNaN(regexPart.value)) {
                            /* if value is a number then convert it to a wild number */
                            parentPart.value = $scope.current.regex.utils.symbol.wild.number;
                        } else if (regexPart.value.match(/[A-za-z]/)) {
                             /* else if this is a letter then convert it to a wild letter */
                            parentPart.value = $scope.current.regex.utils.symbol.wild.letter;
                        } else {
                            /* else this is a random character so convert it to a wild character */
                            parentPart.value = $scope.current.regex.utils.symbol.wild.any;
                        }

                        parentPart.indexes.push(regexPart.topLevelIndex);
                        parentPart.parts.push(regexPart);

                        this.root.parts[regexPart.positionIndex] = parentPart;

                        /* post processing: if there is two wild values then combine them to a
                            wild type */
                        var lastWildValue = this.root.parts[0].value;
                        var previousPartWasRepeater = false;
                        for (var i = 1; i < this.root.parts.length; i++) {
                            /* replace the second value with an wild type value */
                            if (lastWildValue === this.root.parts[i].value) {
                                /* if the last value was a repeater then we need to nest this
                                    current part sequence in the repeater part */
                                if (previousPartWasRepeater) {
                                    var regexPartToReplace = this.root.parts.splice(i, 1)[0];
                                    this.root.parts[i - 1].indexes = this.union(this.root.parts[i - 1].indexes, regexPartToReplace.indexes);
                                    this.root.parts[i - 1].parts.push(regexPartToReplace);
                                } else { //create a new repeator and nest the old value in this sequence
                                    var regexPartToReplace = {};
                                    angular.copy(this.root.parts[i], regexPartToReplace);
                                    this.root.parts[i].topLevelIndex = null;
                                    this.root.parts[i].indexes = this.union(this.root.parts[i].indexes, regexPartToReplace.indexes);
                                    this.root.parts[i].value = this.symbol.repeaters.zeroOrMore; //TODO: reimplement this if needed to use other repeaters
                                    this.root.parts[i].parts = [regexPartToReplace];
                                }
                            } else {
                                if (this.root.parts[i].value === this.symbol.repeaters.zeroOrMore ||
                                        this.root.parts[i].value === this.symbol.repeaters.oneOrMore) {
                                    previousPartWasRepeater = true;
                                } else {
                                    previousPartWasRepeater = false;
                                    lastWildValue = this.root.parts[i].value;
                                }
                            }
                        }
                    } else {
                        /* Step 1: replace the regexPart's wild value with its normal value */
                        var reinsertionPath = this.findRegexPartPath(topLevelIndex);
                        // find the child part we are reinserting
                        var childPart = reinsertionPath.pop();
                        // find the parent of the part we are reinserting
                        var parentPart = reinsertionPath.pop();
                        // splice out the child part that we are reinserting
                        parentPart.parts.splice(childPart.positionIndex, 1)[0];

                        var grandparentPart = reinsertionPath.pop();
                        /* if parent part does not have any children then remove */
                        if (!parentPart.parts.length && grandparentPart) {
                            grandparentPart.parts.slice(parentPart.positionIndex, 1)
                        }
                        /* we need to reinsert at the top level */
                        if (!parentPart.parts.length) {
                            this.root.parts.splice(childPart.positionIndex, 1, childPart);
                        } else {
                            this.root.parts.splice(childPart.positionIndex, 0, childPart);
                        }

                        /* post process regex, if we are unselecting a value and there are wild values
                            on the right side then 'un-wild' the right values */
                        var lastValue = this.root.parts[0].value;
                        /* search for a repeater with no wild type to the left of it behind it */
                        for (var i = 1; i < this.root.parts.length; i++) {
                            if ((this.root.parts[i].value === this.symbol.repeaters.zeroOrMore ||
                                this.root.parts[i].value === this.symbol.repeaters.oneOrMore) &&
                                (lastValue !== this.symbol.wild.number &&
                                lastValue !== this.symbol.wild.letter &&
                                lastValue !== this.symbol.wild.any)) {

                                //extract the regex parts to reinsert
                                var regexPartsToReinsert = [];
                                angular.copy(this.root.parts[i].parts, regexPartsToReinsert);

                                /* reinsert the regex parts */
                                this.root.parts.splice(i, 1);
                                var currentIndex = i;
                                for (var j = 0; j < regexPartsToReinsert.length; j++) {
                                    this.root.parts.splice(currentIndex, 0, regexPartsToReinsert[j]);
                                    currentIndex++;
                                }
                            }
                            lastValue = this.root.parts[i].value;
                        }
                    }
                },
                /**
                * Processes all the regex parts and assigns correct positionIndexes
                **/
                processPositionIndexes: function() {

                    /* recursively work through children of this.root.parts */
                    var processChildren = function(childPart, newPositionIndex) {
                        childPart.positionIndex = newPositionIndex;
                        /* iterate through children of this child */
                        angular.forEach(childPart.parts, function(newChildPart, key) {
                            processChildren(newChildPart, key);
                        });
                    };

                    processChildren(this.root, 0);
                },
                findRegexPart: function(index) {
                    var regexPart = null;
                    var isFound = false;
                    var parts = this.root.parts
                    while (!isFound) {
                        angular.forEach(parts, function(part, key) {
                            /* if the part we are looking for is nested inside of this part */
                            if (part.indexes.indexOf(index) !== -1) {
                                /* if we have reached the bottom level */
                                if (part.topLevelIndex === index) {
                                    isFound = true;
                                }
                                regexPart = part;
                                return;
                            }
                        });
                        parts = regexPart.parts;
                    }

                    return regexPart;
                },
                findRegexPartPath: function(topLevelIndex) {
                    var regexPartPath = [];
                    var isFound = false;
                    var parts = this.root.parts
                    while (!isFound) {
                        var currentPart;
                        angular.forEach(parts, function(part) {
                            /* if the part we are looking for is nested inside of this part */
                            if (part.indexes.indexOf(topLevelIndex) !== -1) {
                                regexPartPath.push(part);
                                /* if we have reached the bottom level */
                                if (part.topLevelIndex === topLevelIndex) {
                                    isFound = true;
                                }
                                currentPart = part;
                                return;
                            }
                        });
                        parts = currentPart.parts;
                    }
                    return regexPartPath;
                }
            },
            regexValue: null,
            display: 'none...',
            root: {
                topLevelIndex: null,
                positionIndex: null,
                indexes: null,
                value: null,
                parts: []
            }
        }
    };

	$scope.$watch('current.newValue', function(newValue) {
		if (newValue) {

            /* add new value parts */
            $scope.current.newValueParts = [];
            $scope.current.regex.parts = [];
            for (var i = 0; i < newValue.length; i++) {
                var newValuePart = {
                    index: i,
                    value: newValue[i]
                };
                var regexPart = {
                    topLevelIndex: i,
                    positionIndex: i,
                    indexes: [i],
                    value: newValue[i].replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
                    parts: []
                };
                $scope.current.newValueParts.push(newValuePart);
                $scope.current.regex.parts.push(regexPart);
            }
        } else {
            $scope.current.regex.regexValue = null;
        }
        $scope.current.step = 0;
	});

	$scope.$watch('current.originalValue', function(newValue) {
        $scope.current.newValue = newValue;
    });

    $scope.$watch('root.parts', function(newValue) {
        if ($scope.current.step > 0) {
            $scope.current.regex.utils.processPositionIndexes();
            _updateDisplay();
        }
    });


	$scope.isSpecialCharacter = function(character) {

	    if (character.match(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/)) {
	        return true;
	    }
	    return false;

	}

    function _updateDisplay() {
        var regexString = '';
        angular.forEach(this.root.parts, function(part) {
            regexString += part.value;
        });
        this.regexValue = new RegExp(regexString);
        this.display = this.regexValue ? this.regexValue.toString() : 'none...';
    }

});
