/*
 * Common-Utils
 * https://github.com/axin/common-utils
 * Author: Alexey Sazikin
 * Licensed under MIT license
 */

var CommonUtils = (module && module.exports) || {};

(function (exports) {
    exports.isObject = isObject;
    exports.isObjectButNotArray = isObjectButNotArray;
    exports.isNotEmptyString = isNotEmptyString;
    exports.isNotNullObject = isNotNullObject;
    exports.cloneObject = cloneObject;

    function isObject(val) {
        if (typeof val === 'object') {
            return true;
        }

        return false;
    }

    function isObjectButNotArray(val) {
        if (isObject(val) && !Array.isArray(val)) {
            return true;
        }

        return false;
    }

    function isNotEmptyString(value) {
        if (value && typeof value === 'string') {
            return true;
        }

        return false;
    }

    function isNotNullObject(value) {
        if (value && typeof value === 'object') {
            return true;
        }

        return false;
    }

    function cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}(CommonUtils));
