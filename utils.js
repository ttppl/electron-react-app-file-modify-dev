// 获取设置
const fs = require("fs");
const path = require("path");

const isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

function getConfig (key) {
    const configFile = fs.readFileSync(path.join(__dirname, 'config.json'),'utf-8')
    const config = JSON.parse(configFile)
    // const config = require('./config.json')
    if (key) {
        return config[key]?.value
    } else {
        return config
    }
}

function modifyConfig (key,value) {
    if(!key){
        return modifyConfigFile(value)
    }
    const configFile = fs.readFileSync(path.join(__dirname, 'config.json'),'utf-8')
    const config = JSON.parse(configFile)
    if(config[key]){
        config[key].value = value
    }else{
        config[key] = {
            name:'新添加的配置',
            value
        }
    }
    fs.writeFileSync(path.join(__dirname, 'config.json'),JSON.stringify(config,null, "\t"))
}

function modifyConfigFile (config) {
    return fs.writeFileSync(path.join(__dirname, 'config.json'),JSON.stringify(config,null, "\t"))
}

module.exports = {
    getConfig,
    modifyConfig,
    modifyConfigFile
}
