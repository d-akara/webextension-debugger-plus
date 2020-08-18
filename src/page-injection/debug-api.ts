import * as wx from 'webextension-common'
import { styled } from 'goober';

interface Console extends globalThis.Console {
    profile(name: string): void;
    profileEnd(): void;
}

declare var console:Console

const moduleName = "debug-hooks";
const symbolOriginal = Symbol('original-implementation');

function interceptFunction(object, methodName, beforeFunction, conditionFunction) {

    // Reset original method if it has been overridden
    if (object[methodName][symbolOriginal]) {
        object[methodName] = object[methodName][symbolOriginal];
        delete object[methodName][symbolOriginal];
    }

    const originalMethod = object[methodName];

    if (beforeFunction) {
        object[methodName] = function _debugIntercept() {
                if ((!conditionFunction) || (conditionFunction(methodName, arguments, this))) {
                    if (beforeFunction) {
                        beforeFunction(methodName, arguments, this)
                    }
                    let result = originalMethod.apply(this, arguments);
                    return result;
                } else {
                    return originalMethod.apply(this, arguments);
                }
            }
            // store original method
        object[methodName][symbolOriginal] = originalMethod;
    }
}

// TODO
// function restoreFunction
// function listInterceptors

function interceptProperty(object, propertyName, getFunction, setFunction, conditionFunction) {
    const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);
    const newPropertyDescriptor:any = {
        //enumerable: originalPropertyDescriptor.enumerable,
        configurable: true
    }
    
    function shouldIntercept(object) {
        if ((!conditionFunction) || (conditionFunction(propertyName, arguments, object))) {
            return true;
        }
        return false;
    }
    
    if (getFunction) {
        const conditionalGetFunction = function () {
            if (shouldIntercept(this)) {
                const value = getOriginal.apply(this, arguments);
                getFunction(propertyName, arguments, this);
                return value;
            } else return getOriginal.apply(this, arguments);
        }
        newPropertyDescriptor.get = conditionalGetFunction;
    }
    if (setFunction) {
        const conditionalSetFunction = function (value) {
            if (shouldIntercept(this)) {
                setFunction(propertyName, arguments, this);
                return setOriginal.call(this, value);
            } else setOriginal.call(this, value);
        }
        newPropertyDescriptor.set = conditionalSetFunction;
    }

    function getOriginal() {
        Object.defineProperty(object, propertyName, originalPropertyDescriptor);
        const value = this[propertyName];
        Object.defineProperty(object, propertyName, newPropertyDescriptor);
        return value;
    }
    
    function setOriginal(value) {
        try {
        Object.defineProperty(object, propertyName, originalPropertyDescriptor);
        this[propertyName] = value;
        Object.defineProperty(object, propertyName, newPropertyDescriptor);
        } catch(e) {
            console.log(e);
            Object.defineProperty(object, propertyName, newPropertyDescriptor);
        }
    }        
    console.log('Original property descriptor', originalPropertyDescriptor);
    console.log('Installing new property descriptor', newPropertyDescriptor);
    Object.defineProperty(object, propertyName, newPropertyDescriptor);
}

let _logElementRecursionCount = 0;
function logElement(targetElement, parentElement, methodName) {
    // in case something has replace the log function with something that triggers DOM updates
    if (_logElementRecursionCount > 0) return;
    _logElementRecursionCount++ ; 
    console.groupCollapsed(moduleName + ": " + methodName, targetElement);
    if(parentElement) console.log("parent: ", parentElement);
    console.trace();
    console.groupEnd();
    _logElementRecursionCount--;
}

function testContainsAttribute() {}

const inspectElementsConfig = Object.assign(Object.create(null), {
    appendChild:   {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    insertBefore:  {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    replaceChild:  {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    removeChild:   {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    appendData:    {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    deleteData:    {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    insertData:    {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    replaceData:   {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    substringData: {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    innerHTML:     {prototype: Element.prototype,                   fnInspectWhen: testContainsAttribute},
    outerHTML:     {prototype: Element.prototype,                   fnInspectWhen: testContainsAttribute},
    textContent:   {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    innerText:     {prototype: HTMLElement.prototype,               fnInspectWhen: testContainsAttribute},
    outerText:     {prototype: HTMLElement.prototype,               fnInspectWhen: testContainsAttribute},
    data:          {prototype: CharacterData.prototype,             fnInspectWhen: testContainsAttribute},
    nodeValue:     {prototype: Node.prototype,                      fnInspectWhen: testContainsAttribute},
    checked:       {prototype: HTMLInputElement.prototype,          fnInspectWhen: testContainsAttribute},
    value:         {prototype: HTMLTextAreaElement.prototype,       fnInspectWhen: testContainsAttribute}        
});

const inspectElements_Settings = Object.assign(Object.create(null), {
    inspectWhen: {
        attributeName: null,
        attributeValue: null,   
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

export function inspectElements() {
    const settings = inspectElements_Settings;

    const conditionFunction = function _debugTestContainsAttribute(inspectOnSettings, methodPropertyName, childElement, parentElement) {
        if ( !inspectOnSettings[methodPropertyName]) {
            return false;
        }

        if (typeof childElement.getAttribute != 'function') return false;
        const attributeName = settings.inspectWhen.attributeName;
        const attributeValue = settings.inspectWhen.attributeValue;
        const elementAttributeValue = childElement.getAttribute(attributeName);

        if ((!attributeName) || ((elementAttributeValue) && (!(attributeValue) || elementAttributeValue.indexOf(attributeValue) > -1))) {
            return true;
        }
        return false;
    }
    const conditionChildFunction = function _debugTestChildContainsAttribute(methodPropertyName, originalArguments, parentElement) {
        return conditionFunction(inspectElements_Settings.inspectOn.elementModifiers, methodPropertyName, originalArguments[0], parentElement);
    }  
    const conditionParentFunction = function _debugTestParentContainsAttribute(methodPropertyName, originalArguments, parentElement) {
        return conditionFunction(inspectElements_Settings.inspectOn.textModifiers, methodPropertyName, parentElement, parentElement);
    }
    const conditionMagicPropertyFunction = function _debugTestParentContainsAttribute(methodPropertyName, originalArguments, parentElement) {
        return conditionFunction(inspectElements_Settings.inspectOn.magicProperties, methodPropertyName, parentElement, parentElement);
    }  

    const beforeFunction = function _debugBeforeFunction(methodName, originalArguments, object) {
        logElement(originalArguments[0], object, methodName);
        if (settings.breakOnInspect) debugger;
    }

    const setPropertyFunction = function _debugSetPropertyFunction(methodName, originalArguments, object) {
        logElement(object, null, "set:" + methodName);
        if (settings.breakOnInspect) debugger;
    }        

    for (const methodName in inspectElements_Settings.inspectOn.elementModifiers) {
        interceptFunction(inspectElementsConfig[methodName].prototype, methodName, beforeFunction, conditionChildFunction);
    }
    
    for (const methodName in inspectElements_Settings.inspectOn.textModifiers) {
        interceptFunction(inspectElementsConfig[methodName].prototype, methodName, beforeFunction, conditionParentFunction);
    }        
    
    for (const propertyName in inspectElements_Settings.inspectOn.magicProperties) {
        interceptProperty(inspectElementsConfig[propertyName].prototype, propertyName, null, setPropertyFunction, conditionMagicPropertyFunction );
    }

    console.log("inspecting elements active.  modify returned properties object to configure.");
    return settings;
}

function logEvent(event) {
    console.log(event);
}

export function testEvents(eventType, enable) {
    if (eventType === undefined) {
        console.log("EXAMPLE:  testEvents('keydown', true)");
        return;
    }
    if (enable) {
        document.addEventListener(eventType, logEvent, true);
        console.log("logging all '" + eventType + "' events.");
    } else {
        document.removeEventListener(eventType, logEvent, true);
        console.log("stoped logging all '" + eventType + "' events.");
    }
}

export function profileWaitForTrigger(startEventProperties, duration) {
    if (startEventProperties === undefined) {
        console.log("EXAMPLE:  profileWaitForTrigger({type: 'click'}, 100)");
        return;
    }

    function armProfileTrigger() {
        setEventTrigger(startEventProperties.type, () => profile(duration), (event) => containsProperties(startEventProperties, event), true);
        console.log("profile trigger set.  profiler will start when event matches:", startEventProperties);
    }

    setKeyTrigger({
        ctrlKey: true
    }, armProfileTrigger);

    console.log("profile trigger will be set when you press [ctrl]");
}

export function profile(duration) {
    console.profile(moduleName + " " + new Date().toTimeString());
    if (duration) {
        setTimeout(() => console.profileEnd(), duration);
    } else {
        setTimeout(() => console.profileEnd());
    }
}

export function breakOnTimeout(duration) {
    setTimeout(() => {
        debugger
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
    setEventTrigger('keydown', invokeFunction, (event) => containsProperties(keyEventProperties, event), false);
}

function containsProperties(objectWithProperties, objectToCheck) {
    for (const property of Object.getOwnPropertyNames(objectWithProperties)) {
        if (objectToCheck[property] !== objectWithProperties[property]) {
            return false;
        }
    }
    return true;
}

export function breakOnKeypress(keyEvent) {
    keyEvent = keyEvent || {
        ctrlKey: true
    };
    setKeyTrigger(keyEvent, () => {
        debugger
    });
    console.log("trigger set for key event: ", keyEvent);
}

export function listPrototypes(object) {
    console.group("Prototypes %O", object);
    let prototype = object.prototype || object.__proto__;
    while (prototype) {
        console.log(prototype.constructor.name, prototype);
        prototype = prototype.__proto__;
    }
    console.groupEnd();
}

export function breakOnPropertyAccess(object, propertyName) {
    const breakFn = () => { debugger };
    interceptProperty(object, propertyName, breakFn, breakFn, null);
}

// allow black boxing evaled scripts as 'evaled-script.js'
export function evalScriptsAsEvaledScript() {
    var originalEval = eval;
    //@ts-ignore
    eval = function(script) {
        return originalEval(script + "\n//# sourceURL=evaled-script.js");
    }
}

export function help() {
    const styleFunction = "color:mediumorchid;font-weight: bold;"
    const styleParameters = "color:mediumaquamarine;"
    const styleDescription = "color:lightgray"
    const apis = [
        {function:'listPrototypes', parameters: '(object)', description: 'list all prototypes of the object'},
        {function:'breakOnPropertyAccess', parameters: '(object, propertyName)', description: 'break in debugger when property of object is read or set'},
        {function:'breakOnKeypress', parameters: '(KeyboardEvent)', description: 'break once in debugger when a key is pressed.  Default is ctrl key. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent'},
        {function:'breakOnTimeout', parameters: '(timeoutMilliseconds)', description: 'break in debugger on timeout'},
        {function:'testEvents', parameters: '(eventType, enable)', description: 'log all events of type. enable = true|false.  Event types https://developer.mozilla.org/en-US/docs/Web/Events'},
    ]
    for (const api of apis) {
        console.log("%c%s%c%s %c%s", styleFunction, api.function, styleParameters, api.parameters, styleDescription, api.description);
    }
}

wx.page.subscribeExtensionMessages('signal', () => {
    listPrototypes(window)
    wx.page.sendMessageToContentScript({event:'signal', content:'command executed'})
})

wx.page.subscribeExtensionMessages('debug-hooks.installConsole', (key:string) => {
    const consoleApis:any = window[key] = {}
    consoleApis.help = help
    consoleApis.listPrototypes = listPrototypes;
    consoleApis.breakOnPropertyAccess = breakOnPropertyAccess;
    consoleApis.breakOnKeypress = breakOnKeypress;
    consoleApis.breakOnTimeout = breakOnTimeout;
    consoleApis.testEvents = testEvents;
    console.log(moduleName, "console API installed as global", key)
    console.log(moduleName, key + '.help()', 'display help for console API commands')
})

wx.page.sendMessageToContentScript({event:'debug.installed'})
console.log(moduleName + " module installed");