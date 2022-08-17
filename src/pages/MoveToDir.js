import {useEffect, useRef, useState} from "react";
import RecursiveFileOperation from "../components/RecursiveFileOperation";
import OperationButton from "../components/OperationButton";
import {moveToDirOperation} from "../utils/oprations";

function MoveToDir() {
    const [targetDir,setTargetDir] = useState('')
    const selectTargetDir = async()=>{
        const fp = await window.electronAPI.selectFilePath(targetDir)
        setTargetDir(fp)
    }
// 获取参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath','defaultMoveTargetPath']).then(para => {
            ref.current.getFiles(para.defaultPath)
            setTargetDir(para.defaultMoveTargetPath)
        })
    }, [])

    const confirm = async ({files, setFiles}) => {
        await moveToDirOperation({files, setFiles,targetDir})
    }

    const ref = useRef(null)
    return <RecursiveFileOperation ref={ref} confirm={confirm}
                                   operations={<OperationButton done={targetDir} onclick={selectTargetDir}>选择目标文件夹</OperationButton>}>
        <div className='xl-file-view-path'>目标文件夹：{targetDir}</div>
    </RecursiveFileOperation>
}

export default MoveToDir
