import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import OperationButton from "../components/OperationButton";
import FileView from "../components/FileView";
import {setGlobalLoading} from "./Loading";
import '../styles/recursiveFileOperation.scss'
import {electronApi} from "../utils/main";

const RecursiveFileOperation = forwardRef(RecursiveFileOperationFun)

RecursiveFileOperation.defaultProps = {
    confirm: ({files, setFiles}) => {},
    filter:file=>file,
    operations:null
}

function RecursiveFileOperationFun(props,ref) {
    const [filePath, setFilePath] = useState('')
    const fileRef = useRef()
    useImperativeHandle(ref,()=>({
        getFiles:async (path)=>{
            if(path) {
                setFilePath(path)
                fileRef.current.setFilePath(path,false)
                return await getFiles(path)
            }else {
                return await getFiles(filePath)
            }
        }
    }),[filePath])
    // 获取文件
    const getFiles = async (path) => {
        const files = await electronApi().getFiles(path, true)
        if(props.filter) {
            fileRef.current.setFiles(files.filter(props.filter))
        }else {
            fileRef.current.setFiles(files)
        }
        return [...files]
    }

    const selectFilePath = async () => {
        const fp = await electronApi().selectFilePath(filePath)
        setFilePath(fp)
        if (fp) {
            fileRef.current.setFilePath(fp)
        } else {
            fileRef.current.setFilePath([])
        }
    }

    const confirm = async () => {
        if(fileRef.current.getFiles()?.length>0) {
            setGlobalLoading(true,{label:'执行中...'})
            await props.confirm?.({files:fileRef.current.getFiles(), setFiles:fileRef.current.setFiles})
            setGlobalLoading(false)
        }else {
            electronApi().showError('无匹配文件！')
        }
    }
    return <div className='xl-recursive-operation-page'>
        <div className='xl-operation-bar'>
            <OperationButton done={filePath} onclick={selectFilePath}>选择文件夹</OperationButton>
            {props.operations}
            <OperationButton onclick={confirm}>确认</OperationButton>
        </div>
        <div className='xl-recursive-operation-content'>
            {props.children}
            <FileView ref={fileRef} fullControl recursive showPath viewType='list' hideCompleteFile={props.hideCompleteFile}/>
        </div>
    </div>
}


export default RecursiveFileOperation
