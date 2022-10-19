import './App.scss';
import {Link, Outlet, useLocation} from "react-router-dom";
import {useMemo} from "react";
import {routers} from './index'

function getRouterLabel(path, rs = routers) {
    for (let router of rs) {
        if(Array.isArray(router)){
            const chiLabel = getRouterLabel(path, router)
            if (chiLabel) {
                return chiLabel
            }
        }
        if (router.path === path) {
            return router.label
        }
        if (router.children) {
            const chiLabel = getRouterLabel(path, router.children)
            if (chiLabel) {
                return chiLabel
            }
        }
    }
}

function App() {
    const location = useLocation()
    const position = useMemo(() => {
        const paths = location.pathname.split('/')
        return paths.map((p, index) => {
            if (index === 0) {
                return <Link key='index-link' to='/'>{getRouterLabel('/')}</Link>
            } else {
                if(p) {
                    const path = paths.slice(0, index + 1).join('/')
                    if(path === location.pathname){
                        return <span key={`link-${p}-${index}`}>{getRouterLabel(path)}</span>
                    }
                    return <Link key={`link-${p}-${index}`} to={path}>{getRouterLabel(path)}</Link>
                }
            }
        })
    }, [location])

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
