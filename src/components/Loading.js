import {useMemo} from "react";
import ReactDOM from 'react-dom'
import '../styles/loading.scss'
import {isNumber} from "../utils/check";
function Loading(props) {
    const loadingStyle = useMemo(()=>{
        const style = {}
        if(props.size){
            const size = isNumber(props.size)?`${props.size}px`:props.size
            style.width=size
            style.height=size
        }
        return style
    },[props.size])
    const pathStyle = useMemo(()=>{
        const style = {}
        if(isNumber(props.size)){
            style.strokeWidth=`${props.size/10}px`
        }
        props.strokeWidth&&(style.strokeWidth = `${props.strokeWidth}px`)
        return style
    },[props.size,props.strokeWidth])

    return <>
        <svg style={loadingStyle} viewBox="25 25 50 50" className="xl-loading-circle-svg">
            <circle style={pathStyle} cx="50" cy="50" r="20" fill="none" className="path"/>
        </svg>
        <span className='xl-loading-children'>{props.children}</span>
        <p className='xl-loading-label'>{props.label}</p>
    </>
}

const GlobalLoading = {
    isLoading: false,
    container: null,
    target: null
}
// options:{
//    label:string,

// }
export function setGlobalLoading(show, options) {
    if (!GlobalLoading.container) {
        GlobalLoading.container = document.createElement('div')
        GlobalLoading.container.className = 'xl-loading-container mask'
        GlobalLoading.container.style.position='fixed'
    }
    if (!GlobalLoading.target) {
        GlobalLoading.target = document.body
    }
    if (show) {
        if(GlobalLoading.isLoading){
            return
        }
        ReactDOM.render(<Loading {...options} />, GlobalLoading.container)
        GlobalLoading.target.appendChild(GlobalLoading.container)
        GlobalLoading.isLoading=true
    } else {
        ReactDOM.unmountComponentAtNode(GlobalLoading.container)
        if (GlobalLoading.target.contains(GlobalLoading.container)) {
            GlobalLoading.target.removeChild(GlobalLoading.container)
        }
        GlobalLoading.isLoading=false
    }
}


export default Loading
