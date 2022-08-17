import {isObject, isString} from "./check";

export const getClass=(className)=>{
    const classNames = []
    if(isString(className)){
        classNames.push(className)
    }
    if(Array.isArray(className)){
        className.forEach(classNameItem=>classNames.push(getClass(classNameItem)))
    }
    if(isObject(className)){
        Object.keys(className).forEach(key=>{
            if((className)[key]){
                classNames.push(key)
            }
        })
    }
    return classNames.join(' ')
}
