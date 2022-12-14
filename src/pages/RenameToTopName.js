import {useEffect, useRef} from "react";
import RecursiveFileOperation from "../components/RecursiveFileOperation";
import {renameToTopNameOperation} from "../utils/oprations";
import {electronApi} from "../utils/main";

function RenameToTopName() {
    const keepOrigName = useRef(false)
// 获取参数
    useEffect(() => {
        electronApi().getConfigs(['defaultPath', 'keepOrigName']).then(para => {
            ref.current.getFiles(para.defaultPath)
            keepOrigName.current = para.keepOrigName
        })
    }, [])

    const confirm = async ({files, setFiles}) => {
        await renameToTopNameOperation({files, setFiles,keepOrigName:keepOrigName.current})
    }

    const ref = useRef(null)
    return <RecursiveFileOperation ref={ref} confirm={confirm}/>
}

export default RenameToTopName
