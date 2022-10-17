import '../styles/index.css';
import OperationButton from "../components/OperationButton";
import {routers} from "../index";
import {useMemo} from "react";
function App() {
    const indexRouters = useMemo(()=>{
        const getRouters = (rs)=>{
            return rs.map((router,index)=>{
                if(Array.isArray(router)){
                    return <div className='xl-operation-bar' key={index}>
                        {getRouters(router)}
                    </div>
                }else {
                    return <OperationButton key={router.path} to={router.path}>{router.label}</OperationButton>
                }
            })
        }
        return getRouters(routers[0].children)
    },[])
    return indexRouters
}

export default App;
