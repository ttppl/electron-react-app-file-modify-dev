import OperationButton from "../components/OperationButton";
import {useEffect, useRef, useState} from "react";
import FileView from "../components/FileView";
import '../styles/rename.scss'
import {electronApi, showError} from "../utils/main";

function Rename() {
    const fileRef = useRef()
    const [step, setStep] = useState(1)
    const [operationType, setOperationType] = useState('name')
    const [keepOrigName, setKeepOrigName] = useState('0')
    const [name, setName] = useState('')
    const selectOperationType = (e) => setOperationType(e.target.value)
    const selectKeepOrigName = (e) => {
        if (keepOrigName === e.target.value) {
            setKeepOrigName('0')
        } else setKeepOrigName('1')
    }
    const selectFilePath = async () => {
        if (step === 1) {
            const fp = await window.electronAPI.selectFilePath(fileRef.current.getFilePath())
            fileRef.current.setFilePath(fp)
        } else {
            setStep(1)
        }
    }
    const selectPara = () => {
        if (step === 2) {

        } else {
            setStep(2)
        }
    }
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath']).then(para => {
            fileRef.current.setFilePath(para.defaultPath)
        })
    }, [])

    const outputRef = useRef(null)
    const showMsg = (msg) => {
        const div = document.createElement('div')
        div.innerText = msg
        outputRef.current.appendChild(div)
    }
    const rename = async () => {
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
        setStep(3)
        outputRef.current.innerHTML = ''
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            showMsg('源文件：' + file.path)
            if (operationType === 'fullName') {
                const reg = /(.*)\.(.*)/g
                const match = reg.exec(name);
                const newName = match?.[1] || name
                const suffix = match?.[2] || ''
                const res = await electronApi().renameFile(file.path, `${newName}${i !== 0 ? `[${(i + 1)}]` : ''}.${suffix}`, keepOrigName === '1')
                showMsg('结果：' + res)
            }
            if (operationType === 'name') {
                const res = await electronApi().renameFile(file.path, `${name}${i !== 0 ? `[${(i + 1)}]` : ''}${file.suffix}`, keepOrigName === '1')
                showMsg('结果：' + res)            }
            if (operationType === 'suffix') {
                const res = await electronApi().renameFile(file.path, `${file.name}.${name}`, keepOrigName === '1')
                showMsg('结果：' + res)            }

        }
        fileRef.current.updateFiles()
    }
    return <div className='xl-rename-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={step === 1} onclick={selectFilePath}>选择文件夹</OperationButton>
            <OperationButton focusing={step === 2} onclick={selectPara}>参数选择</OperationButton>
            <OperationButton focusing={step === 3} onclick={rename}>重命名</OperationButton>
        </div>
        <div className='xl-rename-viewer'>
            <FileView hidden={step !== 1} ref={fileRef}/>
            <form style={step !== 2?{display:'none'}:{}} className='xl-form'>
                <p>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'fullName'} value="fullName"/>全名</label>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'name'} value="name"/>文件名</label>
                    <label><input name="operationType" type="radio" onChange={selectOperationType}
                                  checked={operationType === 'suffix'} value="suffix"/>后缀</label>
                </p>
                <p><label><input name="keepOrigName" type="checkbox" value='1'
                                 onChange={selectKeepOrigName} checked={keepOrigName === '1'}/>
                    保留原文件名
                </label></p>
                <p><label><span>文件名</span><input name="name" value={name} onChange={e => setName(e.target.value)}
                                                 type="input"/></label></p>

            </form>
            <div ref={outputRef} style={step !== 3?{display:'none'}:{}}>
            </div>
        </div>
    </div>
}

export default Rename
