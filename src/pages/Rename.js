import OperationButton from "../components/OperationButton";
import {useEffect, useRef, useState} from "react";
import FileView from "../components/FileView";
import '../styles/fileOpereationPage.scss'
import {electronApi, showError, showMessage} from "../utils/main";
import Icon from "../components/Icon";

function Rename() {
    const fileRef = useRef()
    // 步骤
    const [step, setStep] = useState(1)
    //重命名选项
    const [operationType, setOperationType] = useState('name')
    //保留原文件名
    const [keepOrigName, setKeepOrigName] = useState('0')
    //新文件名
    const [name, setName] = useState('')
    // 特殊文本替换
    const [replaceSpecialWords, setReplaceSpecialWords] = useState([])
    // 正则替换
    const [replaceReg, setReplaceReg] = useState('')
    const [regReplaceText, setRegReplaceText] = useState('')
    const selectOperationType = (e) => setOperationType(e.target.value)
    const selectKeepOrigName = (e) => {
        if (keepOrigName === e.target.value) {
            setKeepOrigName('0')
        } else setKeepOrigName('1')
    }

    const selectFilePath = async () => {
        if (step === 1) {
            const fp = await window.electronAPI.selectFilePath(fileRef.current.getFilePath())
            if (fp) {
                fileRef.current.setFilePath(fp)
            }
        } else {
            setStep(1)
        }
    }
    //获取设置
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath', 'replaceSpecialFileWord']).then(para => {
            fileRef.current.setFilePath(para.defaultPath)
            setReplaceSpecialWords(para.replaceSpecialFileWord)
        })
    }, [])

    const saveReplaceSpecialWords = () => {
        electronApi().setConfig('replaceSpecialFileWord', replaceSpecialWords).then(res => {
            showMessage('保存成功！')
        })
    }
    // 测试特殊字符替换
    const testReplace = async (exec) => {
        setStep(0)
        outputRef.current.innerHTML = ''
        try {
            showMsg(`特殊字符：${replaceSpecialWords.join('，')}\n\n`)
            const replaceName = (name) => {
                replaceSpecialWords.forEach(w => {
                    name = name.replaceAll(w, '')
                })
                return name
            }
            const files = fileRef.current.getFiles().filter(n => !n.dir)
            for (let file of files) {
                showMsg(`源文件：${file.path}`)
                const newName = replaceName(file.name) + file.suffix
                if (newName !== file.fullName) {
                    if (exec) {
                        await electronApi().renameFile(file.path, newName)
                    }
                    showMsg(`替换后文件名：${newName}`)
                } else {
                    showMsg(`替换后文件名一致`)
                }
                showMsg('\n\n')
            }
            if (exec) {
                fileRef.current.updateFiles()
            }
        } catch (e) {
            showMsg('执行出错：' + e.message)
            showError(e.message)
        }
    }
    // 测试正则
    const testReg = async (replace, exec) => {
        if (exec) {
            if (!replaceReg) {
                showError('正则表达式不合法！')
                return
            }
            if (!regReplaceText) {
                const res = await showMessage('确定替换文本为空吗？', {type: 'question', buttons: ['取消', '确认']})
                if (res.response === 0) {
                    return
                }
            }
        }
        setStep(0)
        outputRef.current.innerHTML = ''
        try {
            const reg = new RegExp(`${replaceReg}`, 'gm')
            showMsg(`正则表达式：${reg}\n\n`)
            const filesTmp = fileRef.current.getFiles().filter(n => !n.dir)
            for (let file of filesTmp) {
                reg.lastIndex = 0
                showMsg(`源文件：${file.path}`)
                if (replace) {
                    const newName = file.name.replace(reg, regReplaceText) + file.suffix
                    if (newName !== file.fullName) {
                        if (exec) {
                            await electronApi().renameFile(file.path, newName)
                        }
                        showMsg(`替换后文件名：${newName}`)
                    } else showMsg(`替换后文件名一致`)
                } else {
                    showMsg(`匹配结果：${reg.exec(file.name)?.map((n, index) => {
                        if (index == 0) {
                            return `rs：${n || '无匹配'}`
                        } else return `$${index}：${n}`
                    }).join('\n')}`)
                }
                showMsg('\n\n')
            }
            if (exec) {
                fileRef.current.updateFiles()
            }
        } catch (e) {
            showMsg('执行出错：' + e.message)
            showError(e.message)
        }


    }

    const outputRef = useRef(null)
    const showMsg = (msg) => {
        const div = document.createElement('div')
        div.innerText = msg
        outputRef.current.appendChild(div)
    }
    const rename = async (exec) => {
        if (!name) {
            setStep(2)
            showError('请输入新名！')
            return
        }
        const files = fileRef.current.getFiles().filter(file => !file.dir)
        if (!files || files.length < 1) {
            setStep(1)
            showError('该文件夹无文件！')
            return
        }
        if (operationType === 'fullName'&&exec){
            const confirmed = window.confirm('重命名全名可能会会导致扩展名丢失，请确认！')
            if(!confirmed) return
        }
        setStep(0)
        outputRef.current.innerHTML = ''
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            showMsg('源文件：' + file.path)
            if (operationType === 'fullName') {
                const reg = /(.*)\.(.*)/g
                const match = reg.exec(name);
                const newName = match?.[1] || name
                const suffix = match?.[2] ? `.${match[2]}` : ''
                if (exec) {
                    const res = await electronApi().renameFile(file.path, `${newName}${i !== 0 ? `[${(i + 1)}]` : ''}${suffix}`, keepOrigName === '1')
                    showMsg('结果：' + res)
                } else {
                    showMsg(`新文件名：${newName}${i !== 0 ? `[${(i + 1)}]` : ''}${suffix}`)
                }

            }
            if (operationType === 'name') {
                if (exec) {
                    const res = await electronApi().renameFile(file.path, `${name}${i !== 0 ? `[${(i + 1)}]` : ''}${file.suffix}`, keepOrigName === '1')
                    showMsg('结果：' + res)
                } else showMsg(`新文件名：${name}${i !== 0 ? `[${(i + 1)}]` : ''}${file.suffix}`)
            }
            if (operationType === 'suffix') {
                if (exec) {
                    const res = await electronApi().renameFile(file.path, `${file.name}.${name}`, keepOrigName === '1')
                    showMsg('结果：' + res)
                } else showMsg(`新文件名：${file.name}.${name}`)
            }

        }
        fileRef.current.updateFiles()
    }
    //测试添加路径到文件名
    const testRenameWithPath = async (exec = false) => {
        const files = fileRef.current.getFiles().filter(file => !file.dir)
        const filePath = fileRef.current.getFilePath()
        const parentDirName = await electronApi().getFileName(filePath)
        if (!files || files.length < 1) {
            setStep(1)
            showError('该文件夹无文件！')
            return
        }
        setStep(0)
        outputRef.current.innerHTML = ''
        for (let file of files) {
            console.log(file)
            const dirName = file.parent === filePath ? parentDirName : file.parent.replace(filePath, '').replaceAll('\\', '_').slice(1)
            const newName = `${dirName}_${file.fullName}`
            showMsg('源文件：' + file.path)
            if (exec) {
                const res = await electronApi().renameFile(file.path, newName)
                showMsg('结果：' + res)
            } else {
                showMsg(`新文件：${file.parent}\\${newName}`)
            }
            showMsg('\n')
        }
        fileRef.current.updateFiles()
    }
    return <div className='xl-main-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={step === 1} onclick={selectFilePath}>选择文件夹</OperationButton>
            <OperationButton focusing={step === 2} onclick={() => setStep(2)}>重命名</OperationButton>
            <OperationButton focusing={step === 3} onclick={() => setStep(3)}>特殊操作</OperationButton>
            <OperationButton focusing={step === 0} onclick={() => setStep(0)}>操作记录</OperationButton>
        </div>
        <div className='xl-main-content'>
            <FileView hidden={step !== 1} ref={fileRef}/>
            <form style={step !== 2 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <p>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'fullName'} value="fullName"/>全名</label>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'name'} value="name"/>文件名</label>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'suffix'} value="suffix"/>后缀</label>
                </p>
                <p><label><input type="checkbox" value='1'
                                 onChange={selectKeepOrigName} checked={keepOrigName === '1'}/>
                    保留原文件名
                </label></p>
                <p><label><span>文件名</span><input value={name} onChange={e => setName(e.target.value)}
                                                 type="input"/></label></p>
                <p className='submit-button'>
                    <button type='button' onClick={() => rename()}>测试</button>
                    <button type='button' onClick={() => rename(true)}>提交</button>
                </p>

            </form>
            <form style={step !== 3 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <h3>1、特殊文本去除</h3>
                <div>
                    <label><span>特殊字符</span>
                        <div>
                            {replaceSpecialWords.map((v, index) => {
                                return <div className='xl-inline-input' key={'special-word' + index}>
                                    <input value={v} onChange={e => {
                                        const tmp = [...replaceSpecialWords]
                                        tmp[index] = e.target.value
                                        setReplaceSpecialWords(tmp)
                                    }
                                    }/>
                                    <Icon name='close' onClick={e => {
                                        const tmp = [...replaceSpecialWords]
                                        tmp.splice(index, 1)
                                        setReplaceSpecialWords(tmp)
                                    }
                                    }/>
                                </div>

                            })}
                            <button onClick={() => setReplaceSpecialWords([...replaceSpecialWords, ''])}>添加
                            </button>
                            <button className='save-button'
                                    onClick={saveReplaceSpecialWords}>保存
                            </button>
                        </div>
                    </label>

                </div>
                <p className='submit-button'>
                    <button type='button' onClick={() => testReplace()}>测试</button>
                    <button type='button' onClick={() => testReplace(true)}>提交</button>
                </p>

                <h3>2、正则替换</h3>
                <p><label><span>正则表达</span>/<input name="name" value={replaceReg}
                                                   onChange={e => setReplaceReg(e.target.value)}
                                                   type="input"/>/g</label>
                    <button onClick={() => testReg()}>测试</button>
                </p>
                <p><label><span>替换文本</span>&nbsp;<input name="name" value={regReplaceText}
                                                        onChange={e => setRegReplaceText(e.target.value)}
                                                        type="input"/></label>
                    <button onClick={() => testReg(true)}>测试</button>
                </p>
                <p className='submit-button'>
                    <button type='button' onClick={() => testReg(true, true)}>提交</button>
                </p>

                <h3>2、添加路径到文件名</h3>
                <p className='submit-button'>
                    <button type='button' onClick={() => testRenameWithPath()}>测试</button>
                    <button type='button' onClick={() => testRenameWithPath(true)}>提交</button>
                </p>

            </form>
            <div ref={outputRef} style={step !== 0 ? {display: 'none'} : {}}>
            </div>
        </div>
    </div>
}

export default Rename
