(function () {
    //"use strict";
    var moduleName = "debug";
    var symbolOriginal = Symbol('original-implementation');
    function interceptFunction(object, methodName, beforeFunction, conditionFunction) {
        // Reset original method if it has been overridden
        if (object[methodName][symbolOriginal]) {
            object[methodName] = object[methodName][symbolOriginal];
            delete object[methodName][symbolOriginal];
        }
        var originalMethod = object[methodName];
        if (beforeFunction) {
            object[methodName] = function _debugIntercept() {
                if ((!conditionFunction) || (conditionFunction(methodName, arguments, this))) {
                    if (beforeFunction) {
                        beforeFunction(methodName, arguments, this);
                    }
                    var result = originalMethod.apply(this, arguments);
                    return result;
                }
                else {
                    return originalMethod.apply(this, arguments);
                }
            };
            // store original method
            object[methodName][symbolOriginal] = originalMethod;
        }
    }
    // TODO
    // function restoreFunction
    // function listInterceptors
    function interceptProperty(object, propertyName, getFunction, setFunction, conditionFunction) {
        var originalPropertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);
        var newPropertyDescriptor = {
            //enumerable: originalPropertyDescriptor.enumerable,
            configurable: true
        };
        function shouldIntercept(object) {
            if ((!conditionFunction) || (conditionFunction(propertyName, arguments, object))) {
                return true;
            }
            return false;
        }
        if (getFunction) {
            var conditionalGetFunction = function () {
                if (shouldIntercept(this)) {
                    var value = getOriginal.apply(this, arguments);
                    getFunction(propertyName, arguments, this);
                    return value;
                }
                else
                    return getOriginal.apply(this, arguments);
            };
            newPropertyDescriptor.get = conditionalGetFunction;
        }
        if (setFunction) {
            var conditionalSetFunction = function (value) {
                if (shouldIntercept(this)) {
                    setFunction(propertyName, arguments, this);
                    return setOriginal.call(this, value);
                }
                else
                    setOriginal.call(this, value);
            };
            newPropertyDescriptor.set = conditionalSetFunction;
        }
        function getOriginal() {
            Object.defineProperty(object, propertyName, originalPropertyDescriptor);
            var value = this[propertyName];
            Object.defineProperty(object, propertyName, newPropertyDescriptor);
            return value;
        }
        function setOriginal(value) {
            try {
                Object.defineProperty(object, propertyName, originalPropertyDescriptor);
                this[propertyName] = value;
                Object.defineProperty(object, propertyName, newPropertyDescriptor);
            }
            catch (e) {
                console.log(e);
                Object.defineProperty(object, propertyName, newPropertyDescriptor);
            }
        }
        console.log('Original property descriptor', originalPropertyDescriptor);
        console.log('Installing new property descriptor', newPropertyDescriptor);
        Object.defineProperty(object, propertyName, newPropertyDescriptor);
    }
    var _logElementRecursionCount = 0;
    function logElement(targetElement, parentElement, methodName) {
        // in case something has replace the log function with something that triggers DOM updates
        if (_logElementRecursionCount > 0)
            return;
        _logElementRecursionCount++;
        console.groupCollapsed(moduleName + ": " + methodName, targetElement);
        if (parentElement)
            console.log("parent: ", parentElement);
        console.trace();
        console.groupEnd();
        _logElementRecursionCount--;
    }
    function testContainsAttribute() { }
    var inspectElementsConfig = Object.assign(Object.create(null), {
        appendChild: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        insertBefore: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        replaceChild: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        removeChild: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        appendData: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        deleteData: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        insertData: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        replaceData: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        substringData: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        innerHTML: { prototype: Element.prototype, fnInspectWhen: testContainsAttribute },
        outerHTML: { prototype: Element.prototype, fnInspectWhen: testContainsAttribute },
        textContent: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        innerText: { prototype: HTMLElement.prototype, fnInspectWhen: testContainsAttribute },
        outerText: { prototype: HTMLElement.prototype, fnInspectWhen: testContainsAttribute },
        data: { prototype: CharacterData.prototype, fnInspectWhen: testContainsAttribute },
        nodeValue: { prototype: Node.prototype, fnInspectWhen: testContainsAttribute },
        checked: { prototype: HTMLInputElement.prototype, fnInspectWhen: testContainsAttribute },
        value: { prototype: HTMLTextAreaElement.prototype, fnInspectWhen: testContainsAttribute }
    });
    var inspectElements_Settings = Object.assign(Object.create(null), {
        inspectWhen: {
            attributeName: null,
            attributeValue: null
        },
        inspectOn: {
            elementModifiers: {
                appendChild: true,
                insertBefore: true,
                replaceChild: true,
                removeChild: false
            },
            textModifiers: {
                appendData: true,
                deleteData: false,
                insertData: true,
                replaceData: true,
                substringData: false
            },
            magicProperties: {
                innerHTML: true,
                outerHTML: true,
                textContent: true,
                innerText: true,
                outerText: true,
                data: true,
                nodeValue: true,
                checked: true,
                value: true
            },
            inspect_insertAdjacentHTML: true,
            inspect_selectOptions: true
        },
        breakOnInspect: false
    });
    function inspectElements() {
        var settings = inspectElements_Settings;
        var conditionFunction = function _debugTestContainsAttribute(inspectOnSettings, methodPropertyName, childElement, parentElement) {
            if (!inspectOnSettings[methodPropertyName]) {
                return false;
            }
            if (typeof childElement.getAttribute != 'function')
                return false;
            var attributeName = settings.inspectWhen.attributeName;
            var attributeValue = settings.inspectWhen.attributeValue;
            var elementAttributeValue = childElement.getAttribute(attributeName);
            if ((!attributeName) || ((elementAttributeValue) && (!(attributeValue) || elementAttributeValue.indexOf(attributeValue) > -1))) {
                return true;
            }
            return false;
        };
        var conditionChildFunction = function _debugTestChildContainsAttribute(methodPropertyName, originalArguments, parentElement) {
            return conditionFunction(inspectElements_Settings.inspectOn.elementModifiers, methodPropertyName, originalArguments[0], parentElement);
        };
        var conditionParentFunction = function _debugTestParentContainsAttribute(methodPropertyName, originalArguments, parentElement) {
            return conditionFunction(inspectElements_Settings.inspectOn.textModifiers, methodPropertyName, parentElement, parentElement);
        };
        var conditionMagicPropertyFunction = function _debugTestParentContainsAttribute(methodPropertyName, originalArguments, parentElement) {
            return conditionFunction(inspectElements_Settings.inspectOn.magicProperties, methodPropertyName, parentElement, parentElement);
        };
        var beforeFunction = function _debugBeforeFunction(methodName, originalArguments, object) {
            logElement(originalArguments[0], object, methodName);
            if (settings.breakOnInspect)
                debugger;
        };
        var setPropertyFunction = function _debugSetPropertyFunction(methodName, originalArguments, object) {
            logElement(object, null, "set:" + methodName);
            if (settings.breakOnInspect)
                debugger;
        };
        for (var methodName in inspectElements_Settings.inspectOn.elementModifiers) {
            interceptFunction(inspectElementsConfig[methodName].prototype, methodName, beforeFunction, conditionChildFunction);
        }
        for (var methodName in inspectElements_Settings.inspectOn.textModifiers) {
            interceptFunction(inspectElementsConfig[methodName].prototype, methodName, beforeFunction, conditionParentFunction);
        }
        for (var propertyName in inspectElements_Settings.inspectOn.magicProperties) {
            interceptProperty(inspectElementsConfig[propertyName].prototype, propertyName, null, setPropertyFunction, conditionMagicPropertyFunction);
        }
        console.log("inspecting elements active.  modify returned properties object to configure.");
        return settings;
    }
    function logEvent(event) {
        console.log(event);
    }
    function testEvents(eventType, enable) {
        if (eventType === undefined) {
            console.log("EXAMPLE:  testEvents('keydown', true)");
            return;
        }
        if (enable) {
            document.addEventListener(eventType, logEvent, true);
            console.log("logging all '" + eventType + "' events.");
        }
        else {
            document.removeEventListener(eventType, logEvent, true);
            console.log("stoped logging all '" + eventType + "' events.");
        }
    }
    function profileWaitForTrigger(startEventProperties, duration) {
        if (startEventProperties === undefined) {
            console.log("EXAMPLE:  profileWaitForTrigger({type: 'click'}, 100)");
            return;
        }
        function armProfileTrigger() {
            setEventTrigger(startEventProperties.type, function () { return profile(duration); }, function (event) { return containsProperties(startEventProperties, event); }, true);
            console.log("profile trigger set.  profiler will start when event matches:", startEventProperties);
        }
        setKeyTrigger({
            ctrlKey: true
        }, armProfileTrigger);
        console.log("profile trigger will be set when you press [ctrl]");
    }
    function profile(duration) {
        console.profile(moduleName + " " + new Date().toTimeString());
        if (duration) {
            setTimeout(function () { return console.profileEnd(); }, duration);
        }
        else {
            setTimeout(function () { return console.profileEnd(); });
        }
    }
    function breakOnTimeout(duration) {
        setTimeout(function () {
            debugger;
        }, duration);
    }
    function setEventTrigger(eventType, invokeFunction, conditionFunction, proccessEvent) {
        document.addEventListener(eventType, function listener(event) {
            if ((!conditionFunction) || (conditionFunction(event))) {
                document.removeEventListener(eventType, listener, true);
                if (!proccessEvent) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
                invokeFunction();
            }
        }, true);
    }
    function setKeyTrigger(keyEventProperties, invokeFunction) {
        setEventTrigger('keydown', invokeFunction, function (event) { return containsProperties(keyEventProperties, event); }, false);
    }
    function containsProperties(objectWithProperties, objectToCheck) {
        for (var _i = 0, _a = Object.getOwnPropertyNames(objectWithProperties); _i < _a.length; _i++) {
            var property = _a[_i];
            if (objectToCheck[property] !== objectWithProperties[property]) {
                return false;
            }
        }
        return true;
    }
    function breakOnKeypress(keyEvent) {
        keyEvent = keyEvent || {
            ctrlKey: true
        };
        setKeyTrigger(keyEvent, function () {
            debugger;
        });
        console.log("trigger set for key event: ", keyEvent);
    }
    function listPrototypes(object) {
        console.group("Prototypes %O", object);
        var prototype = object.prototype || object.__proto__;
        while (prototype) {
            console.log(prototype.constructor.name, prototype);
            prototype = prototype.__proto__;
        }
        console.groupEnd();
    }
    function breakOnPropertyAccess(object, propertyName) {
        var breakFn = function () { debugger; };
        interceptProperty(object, propertyName, breakFn, breakFn, null);
    }
    // allow black boxing evaled scripts as 'evaled-script.js'
    function evalScriptsAsEvaledScript() {
        var originalEval = eval;
        //@ts-ignore
        eval = function (script) {
            return originalEval(script + "\n//# sourceURL=evaled-script.js");
        };
    }
    /* --------------------- Export public functions -------------------- */
    var exports = Object.assign(Object.create(null), {
        profileWaitForTrigger: profileWaitForTrigger, breakOnKeypress: breakOnKeypress, testEvents: testEvents, inspectElements: inspectElements, profile: profile, breakOnTimeout: breakOnTimeout, listPrototypes: listPrototypes, breakOnPropertyAccess: breakOnPropertyAccess, evalScriptsAsEvaledScript: evalScriptsAsEvaledScript
    });
    window.d = exports;
    console.log(moduleName + " module installed");
})();
