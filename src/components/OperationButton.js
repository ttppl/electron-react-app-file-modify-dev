import '../styles/operationButton.scss'
import {useNavigate} from "react-router-dom";
import {getClass} from "../utils/dom";
function OperationButton(props){
    const navigate = useNavigate()

    const buttonClick = ()=>{
        if(props.to){
            navigate(props.to)
        }
        if(props.onclick){
            props.onclick()
        }
    }
    return <button className={getClass(['xl-operation-button',{done:props.done,focusing:props.focusing}])} onClick={buttonClick}>{props.children}</button>
}

export default OperationButton
