import './App.scss';
import {Link, Outlet, useLocation} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";


function App() {
    const location = useLocation()
    // console.log(location)
    const position = useMemo(()=>{
        const paths = location.pathname.split('/')
        return paths.map((p,index)=>{
            if(index===0){
                return <Link key='index-link' to='/'>index</Link>
            }else {
                if (p) {
                    return <Link key={`link-${p}-${index}`} to={paths.slice(0, index).join('/')}>{p}</Link>
                }
            }
        })
    },[location])

    return <>
        <div className='xl-position-bar'>
            位置：{position}
        </div>
        <div className='xl-main-content'>
            <Outlet/>
        </div>
    </>
}

export default App;
