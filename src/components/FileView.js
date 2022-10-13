import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import '../styles/fileView.scss'
import {getClass} from "../utils/dom";
import Icon from "./Icon";

const FileView = forwardRef(FileViewFun)

FileView.defaultProps = {
    filePath: '',
    files: [],
    setFilePath: null,//(filepath)=>void
    viewType: 'preview',//list
    showPath: false,
    recursive: false,
    fullControl:false

}

function FileViewFun(props, ref) {
    const [filePath, setFilePath] = useState(props.filePath)
    const [files, setFiles] = useState(props.files || [])
    const [parentDir, setParentDir] = useState('')
    const [recursive, setRecursive] = useState(props.recursive)
    const [showPath,setShowPath] = useState(props.showPath)
    const toogleRecursive = () => {
        getFiles(filePath, !recursive)
        setRecursive(!recursive)
    }
    useEffect(() => {
        window.electronAPI.getFileDir(filePath).then(dir => {
            setParentDir(dir)
        })
    }, [])
    const getFiles = async (path, all) => {
        if (path) {
            const files = await window.electronAPI.getFiles(path, all)
            files.sort((a,b)=>{
                if((a.dir&&b.dir)||(!a.dir&&!b.dir)){
                    return 0
                }else return a.dir?-1:1
            })
            setFiles(files)
            const dir = await window.electronAPI.getFileDir(path)
            setParentDir(dir)
        } else {
            setFiles([])
            setParentDir('')
        }
    }
    useImperativeHandle(ref, () => ({
        getFiles: () => files,
        getFilePath: () => filePath,
        setFiles: (files) => setFiles(files),
        setFilePath: (filePath, getFile = true) => {
            setFilePath(filePath)
            if (getFile) {
                getFiles(filePath, recursive)
            }
        },
        updateFiles: () => getFiles(filePath, recursive)
    }), [filePath, files, recursive])
    // 返回上一级
    const goBack = async () => {
        const path = await window.electronAPI.getFileDir(filePath)
        setFilePath(path)
        props.setFilePath?.(path)
        getFiles(path, recursive)
    }
    //进入目录
    const goIntoDir = async (path) => {
        setFilePath(path)
        getFiles(path, recursive)
    }

    const imgError = (e) => {
        e.target.src = process.env.PUBLIC_URL + '/imgs/file.jpg'
    }

    // 预览模式
    const [viewType, setViewType] = useState(props.viewType || 'preview')
    return <div style={props.hidden ? {display: 'none'} : {}}>
        <div className='xl-file-view-nav'>
            <div className='xl-file-view-path'>{filePath}</div>
            <div>{files.filter(n=>n.done).length}/{files.length}</div>
            {!props.fullControl && <div className='xl-file-view-nav-operation'>
                <label className='xl-file-recursive'>
                    <input type='checkbox' onChange={toogleRecursive} checked={recursive}/>递归</label>
                <label className='xl-file-recursive'>
                    <input type='checkbox' onChange={() => setShowPath(!showPath)} checked={showPath}/>显示路径</label>
                <label className='xl-file-viewType'>
                    <select value={viewType} onChange={e => setViewType(e.target.value)}>
                        <option value='preview'>预览</option>
                        <option value='list'>列表</option>
                    </select>
                </label>
            </div>}

        </div>

        <div className={getClass(['xl-file-view-container', viewType])}>
            {parentDir && !props.recursive && <div className='xl-file' onClick={goBack}>
                <img className="xl-file-preview" src={process.env.PUBLIC_URL + '/imgs/filefolder.jpg'}/>
                <div className='xl-file-detail'>
                    <span className='xl-file-name'>...</span>
                </div>
            </div>}
            {
                files.map(file => {
                    if(props.hideCompleteFile&&file.done) return
                    if (file.dir) {
                        return <div key={`file-${file.path}`} className='xl-file' onClick={() => goIntoDir(file.path)}>
                            <img className="xl-file-preview" src={process.env.PUBLIC_URL + '/imgs/filefolder.jpg'}/>
                            <div className='xl-file-detail'>
                                <span className='xl-file-name'>{file.fullName}</span>
                            </div>
                        </div>
                    }
                    return <div className={getClass(['xl-file', {'operating': file.loading || file.done}])}
                                key={`file-${file.path}`}>
                        {!file.done && file.loading && <Icon className='xl-operation-icon' name='loading' rotate/>}
                        {file.done && <Icon className='xl-operation-icon' name='done'/>}
                        <img className="xl-file-preview" src={file.path} onError={imgError}/>
                        <div className='xl-file-detail'>
                            <span className='xl-file-name' title={props.viewType === 'preview' ? file.fullName : ''}>
                                {file.fullName}
                            </span>
                            {showPath && <span className='xl-file-path' title={file.path}>{file.path}</span>}
                        </div>

                    </div>
                })
            }</div>
    </div>
}

export default FileView
