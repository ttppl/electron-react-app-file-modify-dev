const fs = require("fs");
const readline = require("readline");
const {getConfig} = require("./setting");
const path = require("path");

const logPath = path.join(__dirname,'../log')

//日志打印
module.exports.writeLog = function(...arg) {
    if (getConfig('writeLog')) {
        fs.appendFileSync(logPath, `${new Date().toLocaleString()}:\n` + arg.join('\n') + '\n')
    }
}
//读取日志
module.exports.getLog = function (page){
    const pageSize = getConfig('logPageSize')
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: fs.createReadStream(logPath),
            output: process.stdout,
            terminal: false
        });
        let lineCount = 0
        let lines = []
        rl.on('line', (line) => {
            lineCount++
            if(page){
                if(lineCount>pageSize*(page-1)){
                    if(lineCount>pageSize*page){
                        resolve({lineCount,lines})
                        rl.close()
                        return
                    }
                    lines.push(line)
                }
            }else {
                if(lineCount%pageSize===1){
                    lines = []
                }
                lines.push(line)
            }

        });
        rl.on('close', () => {
            resolve({lineCount,pages:Math.ceil(lineCount/pageSize), lines})
        });
    })
}
//清空日志
module.exports.clearLog = function (){
    fs.writeFileSync(logPath, '')
}
