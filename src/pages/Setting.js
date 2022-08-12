import {useEffect, useState} from "react";
import {electronApi, showError, showMessage} from "../utils/main";
import '../styles/setting.scss'
import {isBoolean, isNumber, isObject, isString} from "../utils/check";
import {setGlobalLoading} from "../components/Loading";
import OperationButton from "../components/OperationButton";

function Setting() {
    const [config, setConfig] = useState({})
    useEffect(() => {
        electronApi().getConfig().then(config => {
            setConfig(config)
        })
    }, [])

    const configValueRender = (value, setValue) => {
        if (isObject(value)) {
            return <div className='xl-config-value-obj'>
                {Object.keys(value).map(key => {
                    const set = (valueNew) => {
                        value[key] = valueNew
                        setValue(value)
                    }
                    return <div className='xl-config-value-obj-item' key={`'xl-config-obj-value-${key}'`}>
                        <span className='xl-config-value-obj-item-key'>{key}</span>
                        <span className='xl-config-value-obj-item-separator'>:</span>
                        {configValueRender(value[key], set)}
                    </div>
                })}
                {/*<button>添加</button>*/}
            </div>
        }
        if (Array.isArray(value)) {
            return <div className='xl-config-value-array'>
                {value.map((v, index) => {
                    const set = (valueNew) => {
                        value[index] = valueNew
                        setValue(value)
                    }
                    return <div key={`'xl-config-array-value-${index}'`}
                                className='xl-config-value-array-item'>{configValueRender(v, set)}</div>
                })}
                {/*<button>添加</button>*/}
            </div>
        } else {
            return <input className='xl-config-input' value={value} onChange={(e) => setValue(e.target.value)}/>
        }
    }

    const getConfigRender = (configs, setConfig) => {
        // const configs = {...config}
        return Object.keys(configs).map(key => {
            const item = configs[key]
            if (item.type === 'dir') {
                const selectPath = async () => {
                    const path = await electronApi().selectFilePath()
                    if (path) {
                        configs[key].value = path
                        setConfig(configs)
                    }
                }
                return <div key={key} className='xl-config-item'>
                    <label className='xl-config-name'>{item.name}</label>
                    <button className='xl-config-button' onClick={selectPath}>选择</button>
                    <input className='xl-config-input' value={item.value} onChange={(e) => {
                        configs[key].value = e.target.value
                        setConfig(configs)
                    }}/>
                </div>
            }
            if (isObject(item.value) || Array.isArray(item.value)) {
                return <div key={key} className='xl-config-item'>
                    <label className='xl-config-name'>{item.name}</label>
                    {configValueRender(item.value, (value) => {
                        configs[key].value = value
                        setConfig(configs)
                    })}
                </div>
            }
            if (isBoolean(item.value)) {
                const changeValue = async () => {
                    configs[key].value = !configs[key].value
                    setConfig(configs)

                }
                return <div key={key} className='xl-config-item'>
                    <label className='xl-config-name'>{item.name}</label>
                    <input className='xl-config-input' type='checkbox' checked={item.value} onChange={changeValue}/>
                </div>
            }
            if (isNumber(item.value)) {
                return <div key={key} className='xl-config-item'>
                    <label className='xl-config-name'>{item.name}</label>
                    <input className='xl-config-input' value={item.value} onChange={(e) => {
                        configs[key].value = parseFloat(e.target.value)
                        setConfig(configs)
                    }}/>
                </div>
            }
            return <div key={key} className='xl-config-item'>
                <label className='xl-config-name'>{item.name}</label>
                <input className='xl-config-input' value={item.value} onChange={(e) => {
                    configs[key].value = e.target.value
                    setConfig(configs)
                }}/>
            </div>

        })
    }

    const submit = async () => {
        setGlobalLoading(true)
        if(isObject(config)) {
            await electronApi().setConfig(config)
        }else {
            try {
                const configObj = JSON.parse(config)
                await electronApi().setConfig(configObj)
            }catch {
                setGlobalLoading(false)
                showError('格式不正确！')
                return
            }
        }
        setGlobalLoading(false)
        showMessage('修改成功！')
    }

    const [type,setType] = useState('json')
    const setConfigFile = (e) => {
        try {
            setConfig(JSON.parse(e.target.value))
            e.target.style.borderColor = 'gray'
        } catch {
            e.target.style.borderColor = 'red'
            setConfig(e.target.value)
        }
    }
    return <div className='xl-setting-page'>
        <div className='xl-operation-bar'>
            <OperationButton focusing={type==='json'} onclick={()=>setType('json')}>JSON</OperationButton>
            <OperationButton focusing={type==='file'} onclick={()=>setType('file')}>文件</OperationButton>
        </div>
        {type==='json'&&<div>{getConfigRender({...config}, setConfig)}</div>}
        {type==='file'&&<div className='xl-config-file'>
            <textarea value={isString(config)?config:JSON.stringify(config,null, "\t")}
            onChange={setConfigFile}/>
        </div>}
        <div className='xl-setting-submit-button'>
            <button onClick={submit}>提交</button>
        </div>

    </div>
}

export default Setting
