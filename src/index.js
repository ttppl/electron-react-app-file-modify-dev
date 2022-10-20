import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {HashRouter, Route, Routes} from "react-router-dom";
import Rename from "./pages/Rename";
import Index from "./pages/index"
import RenameUnZippableFile from "./pages/RenameUnZippableFile";
import RecursiveUnZipFiles from "./pages/RecursiveUnZipFiles";
import RenameToTopName from "./pages/RenameToTopName";
import MoveToDir from "./pages/MoveToDir";
import CompositeOperation from "./pages/CompositeOperation";
import Setting from "./pages/Setting";
import Logs from "./pages/Logs";
import ZipFile from "./pages/ZipFile";
import MoveFile from "./pages/moveFile";

export const routers = [{
    label:'主页',
    path:'/',
    element:<App/>,
    children:[[{
        label:'主页',
        path:'/',
        element:<Index/>,
    },{
        label:'递归重命名压缩文件',
        path:'/renameUnZippableFile',
        element:<RenameUnZippableFile/>,
    },{
        label:'递归解压缩文件',
        path:'/unzipFiles',
        element:<RecursiveUnZipFiles/>,
    },{
        label:'递归重命名为上层文件名',
        path:'/renameToTopName',
        element:<RenameToTopName/>,
    },{
        label:'递归移动文件到指定文件夹',
        path:'/moveToDir',
        element:<MoveToDir/>,
    },{
        label:'组合拳',
        path:'/CompositeOperation',
        element:<CompositeOperation/>,
    }],[{
        label:'重命名',
        path:'/rename',
        element:<Rename/>,
    },{
        label:'移动',
        path:'/moveFile',
        element:<MoveFile/>,
    },{
        label:'压缩文件',
        path:'/zipFile',
        element:<ZipFile/>,
    },{
        label:'设置',
        path:'/setting',
        element:<Setting/>,
    },{
        label:'日志',
        path:'/logs',
        element:<Logs/>,
    }]]
}]

const getRouter = (rs)=>{
    return rs.map(r=>{
        if(r.children){
            return <Route key={`subRoute-${r.path}`} path={r.path} element={r.element}>
                {getRouter(r.children)}
                <Route key={`subRoute-${r.path}-last`}
                    path="*"
                    element={
                        <main style={{padding: "1rem"}}>
                            <p>There's nothing here!</p>
                        </main>
                    }
                />
            </Route>
        }else {
            if(Array.isArray(r)){
                return getRouter(r)
            }
            return <Route key={`route-${r.path}`} path={r.path} element={r.element}/>
        }
    })
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HashRouter>
            <Suspense fallback={<div>Router loading...</div>}>
                <Routes>
                    {getRouter(routers)}
                    {/*<Route path="/" element={<App/>}>*/}
                    {/*    <Route path="/" element={<Index/>}/>*/}
                    {/*    <Route path="/rename" element={<Rename/>}/>*/}
                    {/*    <Route*/}
                    {/*        path="*"*/}
                    {/*        element={*/}
                    {/*            <main style={{padding: "1rem"}}>*/}
                    {/*                <p>There's nothing here!</p>*/}
                    {/*            </main>*/}
                    {/*        }*/}
                    {/*    />*/}
                    {/*</Route>*/}

                </Routes>
            </Suspense>
        </HashRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
