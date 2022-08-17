import {useEffect, useRef} from "react";
import RecursiveFileOperation from "../components/RecursiveFileOperation";
import {renameUnzippableFileOperation} from "../utils/oprations";

function RenameUnZippableFile() {
    const unzippableFile = useRef()
    const filters = useRef([])
    const filter = (file) => {
        return filters.current.includes(file.suffix)
    }
// 获取参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath', 'zipFile']).then(para => {
            unzippableFile.current = para.zipFile
            filters.current = para.zipFile.map(n => n.suffix)
            ref.current.getFiles(para.defaultPath)

        })
    }, [])

    const rename = async ({files, setFiles}) => {
        await renameUnzippableFileOperation({files, setFiles,unzippableFile:unzippableFile.current})
    }

    const ref = useRef(null)
    return <RecursiveFileOperation ref={ref} filter={filter} confirm={rename}/>
}

export default RenameUnZippableFile
