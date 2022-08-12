import {getClass} from "../utils/dom";
import '../styles/Icon.scss'
Icon.defaultProps = {
    className:'',
    name:'loading',
    size:20,
    rotate:false
}

function Icon(props){
    return <img className={getClass([props.className,{'xl-icon-rotate':props.rotate}])} style={{width:props.size,height:props.size}} src={process.env.PUBLIC_URL +`/icons/${props.name}.svg`}/>
}

export default Icon
