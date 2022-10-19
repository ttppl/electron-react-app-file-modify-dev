import OperationButton from "../components/OperationButton";
import {useEffect, useRef, useState} from "react";
import FileView from "../components/FileView";
import '../styles/fileOpereationPage.scss'
import {electronApi, showError, showMessage} from "../utils/main";
import Icon from "../components/Icon";

function ZipFile() {
    const fileRef = useRef()
    // 步骤
    const [step, setStep] = useState(1)
    const [password, setPassword] = useState('')
    const [deleteFileAfterzip, setDeleteFileAfterzip] = useState(false)
    const [unzipPassword, setUnzipPassword] = useState('')
    const [deleteFileAfterUnzip, setDeleteFileAfterUnzip] = useState(false)
    const unzipableFile = useRef([])
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
    const [targetFilePath, setTargetFilePath] = useState('')
    const selectTargetFilePath = async () => {
        const fp = await window.electronAPI.selectFilePath(fileRef.current.getFilePath())
        if (fp)
            setTargetFilePath(fp)
    }
    //获取默认参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath', 'zipPassword', 'deleteFileAfterzip','unzipableFile']).then(para => {
            fileRef.current.setFilePath(para.defaultPath)
            setPassword(para.zipPassword)
            setUnzipPassword(para.zipPassword)
            setDeleteFileAfterzip(para.deleteFileAfterzip)
            unzipableFile.current = para.unzipableFile
        })
    }, [])

    //操作记录
    const outputRef = useRef(null)
    const showMsg = (msg) => {
        const div = document.createElement('div')
        div.innerText = msg
        outputRef.current.appendChild(div)
    }

    const zipFile = async (unzip = false) => {
        setStep(0)
        const files = fileRef.current.getFiles().filter(file => {
            if(unzip&&!unzipableFile.current.includes(file.suffix)) return false
            return !file.dir
        })
        const sourcePath = fileRef.current.getFilePath()
        for (let i in files) {
            const file = files[i]
            showMsg(`进度：${parseFloat(i) + 1}/${files.length}`)
            showMsg(`${unzip ? '解压' : '压缩'}文件：${file.path}`)
            const targetPath = targetFilePath ? await electronApi().getFileDir(file.path.replace(sourcePath, targetFilePath)) : file.parent
            showMsg(`目标文件：${targetPath}`)
            document.documentElement.scrollTop = document.body.scrollHeight
            try {
                if (unzip) {
                    await electronApi().unzipFile({
                            filePath: file.path,
                            targetPath: targetPath,
                            password: unzipPassword,
                            deleteFileAfterUnzip: deleteFileAfterUnzip
                        })
                } else {
                    await electronApi().zipFile({
                        filePath: file.path,
                        targetPath: targetPath,
                        password: password,
                        deleteFileAfterzip: deleteFileAfterzip
                    })
                }
                showMsg(`${unzip ? '解压' : '压缩'}完成\n\n`)
            } catch (err) {
                console.log(err)
            }
            document.documentElement.scrollTop = document.body.scrollHeight
        }
        fileRef.current.updateFiles()
    }

    return <div className='xl-main-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={step === 1} onclick={selectFilePath}>选择文件夹</OperationButton>
            <OperationButton focusing={step === 2} onclick={() => setStep(2)}>压缩文件</OperationButton>
            <OperationButton focusing={step === 3} onclick={() => setStep(3)}>解压缩文件</OperationButton>
            <OperationButton focusing={step === 0} onclick={() => setStep(0)}>操作记录</OperationButton>
        </div>
        <div className='xl-main-content'>
            <FileView hidden={step !== 1} ref={fileRef}/>
            <form style={step !== 2 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <p><label><input name="keepOrigName" type="checkbox" value='1'
                                 onChange={e => setDeleteFileAfterzip(!deleteFileAfterzip)}
                                 checked={deleteFileAfterzip}/>
                    压缩后删除文件
                </label></p>
                <p>压缩到指定文件夹（保持目录结构）
                    <button onClick={selectTargetFilePath}>选择目标文件夹</button>
                    {targetFilePath}</p>
                <p><label><span>密码</span><input name="name" value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                type="input"/></label></p>
                <p className='submit-button'>
                    <button type='button' onClick={() => zipFile()}>提交</button>
                </p>

            </form>
            <form style={step !== 3 ? {display: 'none'} : {}} className='xl-form' onSubmit={e => e.preventDefault()}>
                <p><label><input name="keepOrigName" type="checkbox" value='1'
                                 onChange={e => setDeleteFileAfterUnzip(!deleteFileAfterUnzip)}
                                 checked={deleteFileAfterUnzip}/>
                    解压后删除文件
                </label></p>
                <p>解压到指定文件夹（保持目录结构）
                    <button onClick={selectTargetFilePath}>选择目标文件夹</button>
                    {targetFilePath}</p>
                <p><label><span>密码</span><input name="name" value={unzipPassword}
                                                onChange={(e) => setUnzipPassword(e.target.value)}
                                                type="input"/></label></p>
                <p className='submit-button'>
                    <button type='button' onClick={() => zipFile(true)}>提交</button>
                </p>

            </form>
            <div className='xl-output' ref={outputRef} style={step !== 0 ? {display: 'none'} : {}}>
            </div>
        </div>
    </div>
}

export default ZipFile
