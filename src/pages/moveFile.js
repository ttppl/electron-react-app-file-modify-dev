import OperationButton from "../components/OperationButton";
import {useEffect, useRef, useState} from "react";
import FileView from "../components/FileView";
import '../styles/fileOpereationPage.scss'
import {electronApi, showError, showMessage} from "../utils/main";
import Icon from "../components/Icon";
import {scrollToBottom} from "../utils/dom";

function MoveFile() {
    const fileRef = useRef()
    // 步骤
    const [step, setStep] = useState(1)
    const [keepCategoryStructure, setKeepCategoryStructure] = useState(false)
    const [classifyByType,setClassifyByType] = useState(false)
    //选择文件夹
    const selectFilePath = async () => {
        if (step === 1) {
            const fp = await electronApi().selectFilePath(fileRef.current.getFilePath())
            if (fp) {
                fileRef.current.setFilePath(fp)
            }
        } else {
            setStep(1)
        }
    }
    //选择目标文件夹
    const [targetFilePath, setTargetFilePath] = useState('')
    const selectTargetFilePath = async () => {
        const fp = await electronApi().selectFilePath(fileRef.current.getFilePath())
        if (fp)
            setTargetFilePath(fp)
    }
    //获取默认参数
    useEffect(() => {
        electronApi().getConfigs(['defaultPath']).then(para => {
            fileRef.current.setFilePath(para.defaultPath)
        })
    }, [])

    //操作记录
    const outputRef = useRef(null)
    const showMsg = (msg) => {
        const div = document.createElement('div')
        div.innerText = msg
        outputRef.current.appendChild(div)
    }

    const moveFile = async (exec = false) => {
        if(!targetFilePath){
            window.alert('请选择目标文件夹！')
            return
        }
        setStep(0)
        const files = fileRef.current.getFiles().filter(file => {
            return !file.dir
        })
        const fileDir = fileRef.current.getFilePath()
        const sourcePath = fileRef.current.getFilePath()
        for (let i in files) {
            const file = files[i]
            showMsg(`\n进度：${parseFloat(i) + 1}/${files.length}`)
            showMsg(`移动文件：${file.path}`)
            const targetPath = [targetFilePath]
            if(keepCategoryStructure){
                const structure = file.parent.replace(fileDir,'')
                if(structure){
                    targetPath.push(structure)
                }
            }
            if(classifyByType&&file.suffix.slice(1)){
                targetPath.push(file.suffix.slice(1))

            }
            // const targetPath = targetFilePath ? await electronApi().getFileDir(file.path.replace(sourcePath, targetFilePath)) : file.parent
            showMsg(`目标文件：${targetPath.join('\\')}`)
            scrollToBottom()
            try {
                if(exec) {
                    await electronApi().moveFile(file.path, targetPath.join('\\'))
                    showMsg(`移动完成`)
                }
            } catch (err) {
                console.log(err)
            }
            scrollToBottom()
        }
        fileRef.current.updateFiles()
    }

    return <div className='xl-main-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={step === 1} onclick={selectFilePath}>选择文件夹</OperationButton>
            <OperationButton focusing={step === 2} onclick={() => setStep(2)}>移动文件</OperationButton>
            <OperationButton focusing={step === 0} onclick={() => setStep(0)}>操作记录</OperationButton>
        </div>
        <div className='xl-main-content'>
            <FileView hidden={step !== 1} ref={fileRef}/>
            <form style={step !== 2 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <p><label><input type="checkbox"
                                 onChange={e => setKeepCategoryStructure(!keepCategoryStructure)}
                                 checked={!!keepCategoryStructure}/>
                    保持目录结构
                </label></p>
                <p><label><input type="checkbox"
                                 onChange={e => setClassifyByType(!classifyByType)}
                                 checked={!!classifyByType}/>
                    按类型分类
                </label></p>
                <p><button onClick={selectTargetFilePath}>选择目标文件夹</button>{targetFilePath}</p>
                <p className='submit-button'>
                    <button type='button' onClick={() => moveFile()}>测试</button>
                    <button type='button' onClick={() => moveFile(true)}>提交</button>
                </p>

            </form>
            <div className='xl-output' ref={outputRef} style={step !== 0 ? {display: 'none'} : {}}>
            </div>
        </div>
    </div>
}

export default MoveFile
