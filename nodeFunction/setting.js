const fs = require("fs");
const path = require("path");

const configFilePath = process.env.NODE_ENV==='development'?path.join(__dirname,'../config-dev.json'):path.join(__dirname,'../config.json')

//获取设置(单个)
module.exports.getConfig = function  (key) {
    const configFile = fs.readFileSync(configFilePath,'utf-8')
    const config = JSON.parse(configFile)
    // const config = require('./config.json')
    if (key) {
        return config[key]?.value
    } else {
        return config
    }
}
//获取设置（多个）
module.exports.getConfigs = (keys) => {
    const config = {}
    keys.map(key => {
        config[key] = this.getConfig(key)
    })
    return config
}
//更改单个设置
module.exports.setConfig = function  (key,value) {
    if(!key){
        return this.modifyConfigFile(value)
    }
    const configFile = fs.readFileSync(configFilePath,'utf-8')
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
//更改设置文件内容
module.exports.modifyConfigFile = function  (config) {
    if(config||config==='') {
        return fs.writeFileSync(configFilePath, JSON.stringify(config, null, "\t"))
    }
}
