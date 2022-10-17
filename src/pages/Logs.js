import {useEffect, useState} from "react";
import {electronApi} from "../utils/main";
import '../styles/Logs.scss'
function Logs(){
    const [logLines,setLogLines] = useState([])
    const [pages,setPages] = useState(0)
    const [currentPage,setCurrentPage] = useState(0)
    useEffect(()=>{
        electronApi().getLog().then(res=>{
            setLogLines(res.lines)
            setPages(res.pages)
            setCurrentPage(res.pages)
        })
    },[])

    const getPage = (page)=>{
        if(page<1) return
        electronApi().getLog(page).then(res=>{
            setLogLines(res.lines)
            setCurrentPage(page)
        })
    }
    const clearLog = ()=>{
        electronApi().clearLog().then(()=>{
            electronApi().getLog().then(res=>{
                setLogLines(res.lines)
                setPages(res.pages)
                setCurrentPage(res.pages)
            })
        })

    }
    return <div className='xl-logs'>
        <div className='xl-logs-nav'>
            <p>
                <button onClick={()=>getPage(currentPage-1)}>上一页</button>
                <span className='xl-logs-page'>{currentPage}/{pages}</span>
                <button onClick={()=>getPage(currentPage+1)}>下一页</button>
            </p>
            <button onClick={clearLog}>清空日志</button>
        </div>

        {
        logLines.map((line,index)=>{
            return <div className='xl-log-line' key={index}>{line||'\n'}</div>
        })
    }</div>
}

export default Logs
