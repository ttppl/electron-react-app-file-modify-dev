import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import '../styles/fileView.scss'
import {getClass} from "../utils/dom";
import Icon from "./Icon";

const FileView = forwardRef(FileViewFun)

FileView.defaultProps = {
    filePath:'',
    files:[],
    setFilePath:null,//(filepath)=>void
    viewType:'preview',//list
    showPath:false,
    recursive:false

}

function FileViewFun(props,ref) {
    const [filePath, setFilePath] = useState(props.filePath)
    const [files, setFiles] = useState(props.files||[])
    const [parentDir,setParentDir] = useState('')
    useEffect(()=>{
        window.electronAPI.getFileDir(filePath).then(dir=>{
            setParentDir(dir)
        })
    },[])
    const getFiles = async (path, all) => {
        if (path) {
            const files = await window.electronAPI.getFiles(path, all)
            setFiles(files)
            const dir = await window.electronAPI.getFileDir(path)
            setParentDir(dir)
        }
    }
    useImperativeHandle(ref,()=>({
        getFiles:()=>files,
        getFilePath:()=>filePath,
        setFiles:(files)=>setFiles(files),
        setFilePath:(filePath,getFile=true)=>{
            setFilePath(filePath)
            if(getFile) {
                getFiles(filePath, props.recursive)
            }
        },
        updateFiles:()=>getFiles(filePath,props.recursive)
    }),[filePath,files])
    // 返回上一级
    const goBack = async () => {
        const path = await window.electronAPI.getFileDir(filePath)
        setFilePath(path)
        props.setFilePath?.(path)
        getFiles(path,props.recursive)
    }
    //进入目录
    const goIntoDir = async (path)=>{
        setFilePath(path)
        getFiles(path,props.recursive)
    }

    const imgError = (e)=>{
        e.target.src = process.env.PUBLIC_URL +'/imgs/file.jpg'
    }

    // 预览模式
    const [viewType, setViewType] = useState(props.viewType || 'preview')
    return <div style={props.hidden?{display:'none'}:{}}>
        <div className='xl-file-view-path'>{filePath}</div>
        <div className={getClass(['xl-file-view-container', viewType])}>
            {parentDir&&!props.recursive && <div className='xl-file' onClick={goBack}>
                <img className="xl-file-preview" src={process.env.PUBLIC_URL +'/imgs/filefolder.jpg'}/>
                <div className='xl-file-detail'>
                    <span className='xl-file-name'>...</span>
                </div>
            </div>}
            {
                files.map(file => {
                    if (file.dir) {
                        return <div key={`file-${file.path}`} className='xl-file' onClick={()=>goIntoDir(file.path)}>
                            <img className="xl-file-preview" src={process.env.PUBLIC_URL +'/imgs/filefolder.jpg'}/>
                            <div className='xl-file-detail'>
                                <span className='xl-file-name'>{file.fullName}</span>
                            </div>
                        </div>
                    }
                    return <div className={getClass(['xl-file',{'operating':file.loading||file.done}])} key={`file-${file.path}`}>
                        {!file.done&&file.loading&&<Icon className='xl-operation-icon' name='loading' rotate/>}
                        {file.done&&<Icon className='xl-operation-icon' name='done'/>}
                        <img className="xl-file-preview" src={file.path} onError={imgError}/>
                        <div className='xl-file-detail'>
                            <span className='xl-file-name' title={props.viewType==='preview'?file.fullName:''}>
                                {file.fullName}
                            </span>
                            {props.showPath && <span className='xl-file-path'>{file.path}</span>}
                        </div>

                    </div>
                })
            }</div>
    </div>
}

export default FileView
