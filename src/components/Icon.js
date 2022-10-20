import {getClass} from "../utils/dom";
import '../styles/Icon.scss'
Icon.defaultProps = {
    className:'',
    name:'loading',
    size:20,
    rotate:false,
    onClick:null,
    style:{}
}

function Icon({className,name,size,rotate,onClick,style}){
    return <img className={getClass([className,{'xl-icon-rotate':rotate}])}
                style={{width:size,height:size,...style}}
                src={process.env.PUBLIC_URL +`/icons/${name}.svg`}
        onClick={onClick}
    />
}

export default Icon
