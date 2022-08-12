import {useEffect, useRef} from "react";
import RecursiveFileOperation from "../components/RecursiveFileOperation";
import {unzipFileOperation} from "../utils/oprations";

function UnzipFiles() {
    const multipleThreadUnzip = useRef(false)
    const filters = useRef([])
    const filter = (file) => {
        return filters.current.includes(file.suffix)
    }
// 获取参数
    useEffect(() => {
        window.electronAPI.getConfigs(['defaultPath', 'unzipableFile','multipleThreadUnzip']).then(para => {
            filters.current = para.unzipableFile
            ref.current.getFiles(para.defaultPath)
            multipleThreadUnzip.current = para.multipleThreadUnzip
        })
    }, [])

    const confirm = async ({files,setFiles})=>{
        await unzipFileOperation({files,setFiles,unzipableFile:filters.current,multipleThreadUnzip:multipleThreadUnzip.current})
    }

    const ref = useRef(null)
    return <RecursiveFileOperation ref={ref} filter={filter} confirm={confirm}/>
}

export default UnzipFiles
