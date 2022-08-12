export const showError=(title,content)=>{
    return electronApi().showError(title,content)
}

// https://www.electronjs.org/zh/docs/latest/api/dialog#dialogshowmessageboxbrowserwindow-options
export const showMessage=(message,options={})=>{
    return electronApi().showMessage({message,type:'info',...options})
}

export const electronApi = ()=>window.electronAPI
