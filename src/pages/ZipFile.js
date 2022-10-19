import OperationButton from "../components/OperationButton";
import {useEffect, useRef, useState} from "react";
import FileView from "../components/FileView";
import '../styles/rename.scss'
import {electronApi, showError, showMessage} from "../utils/main";
import Icon from "../components/Icon";

function ZipFile() {
    const fileRef = useRef()
    // 步骤
    const [step, setStep] = useState(1)
    const [password,setPassword] = useState('')
    const [deleteFileAfterzip,setDeleteFileAfterzip] = useState(false)
    //选择文件夹
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
    const [targetFilePath,setTargetFilePath] = useState('')
    const selectTargetFilePath = async () => {
        const fp = await window.electronAPI.selectFilePath(fileRef.current.getFilePath())
        if(fp)
        setTargetFilePath(fp)
    }
    //获取默认参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath', 'zipPassword','deleteFileAfterzip']).then(para => {
            fileRef.current.setFilePath(para.defaultPath)
            setPassword(para.zipPassword)
            setDeleteFileAfterzip(para.deleteFileAfterzip)
        })
    }, [])

    //操作记录
    const outputRef = useRef(null)
    const showMsg = (msg) => {
        const div = document.createElement('div')
        div.innerText = msg
        outputRef.current.appendChild(div)
    }

    const zipFile = async ()=>{
        setStep(0)
        const files = fileRef.current.getFiles().filter(file => !file.dir)
        const sourcePath = fileRef.current.getFilePath()
        for (let file of files) {
            showMsg(`压缩文件：${file.path}`)
            const targetPath = targetFilePath?await electronApi().getFileDir(file.path.replace(sourcePath,targetFilePath)):file.parent
            showMsg(`目标文件：${targetPath}`)
            try {
                await electronApi().zipFile({
                    filePath:file.path,
                    targetPath:targetPath,
                    password:password,
                    deleteFileAfterzip:deleteFileAfterzip
                })
                showMsg('压缩完成\n\n')
            }catch (err){
                console.log(err)
            }


        }
    }

    return <div className='xl-rename-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={step === 1} onclick={selectFilePath}>选择文件夹</OperationButton>
            <OperationButton focusing={step === 2} onclick={() => setStep(2)}>压缩文件</OperationButton>
            <OperationButton focusing={step === 0} onclick={() => setStep(0)}>操作记录</OperationButton>
        </div>
        <div className='xl-rename-viewer'>
            <FileView hidden={step !== 1} ref={fileRef}/>
            <form style={step !== 2 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <p><label><input name="keepOrigName" type="checkbox" value='1'
                                 onChange={e=> setDeleteFileAfterzip(!deleteFileAfterzip)} checked={!!deleteFileAfterzip}/>
                    压缩后删除文件
                </label></p>
                <p>压缩到指定文件夹（保持目录结构）<button onClick={selectTargetFilePath}>选择目标文件夹</button>{targetFilePath}</p>
                <p><label><span>密码</span><input name="name" value={password} onChange={(e)=>setPassword(e.target.value)}
                                                 type="input"/></label></p>
                <p className='submit-button'>
                    <button type='button' onClick={()=>zipFile()}>提交</button>
                </p>

            </form>
            <div ref={outputRef} style={step !== 0 ? {display: 'none'} : {}}>
            </div>
        </div>
    </div>
}

export default ZipFile
