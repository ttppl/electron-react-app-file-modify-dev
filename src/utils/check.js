export const isString = function (obj) {
    return Object.prototype.toString.call(obj) === '[object String]'
}

export const isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

export const isBoolean = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Boolean]'
}

export const isNumber = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Number]'
}

export const isNum = function (num) {
    return isNumber(num) ? true : /^-?\d*\.?\d*$/.test(num)
}
