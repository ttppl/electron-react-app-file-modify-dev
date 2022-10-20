import '../styles/MutipleSelect.scss'
import {useCallback, useEffect, useRef, useState} from "react";
import Icon from "./Icon";

function MultipleSelect({value,placeholder,options,onChange}){
    const selectRef = useRef(null)
    const [showOptions,setShowOptions] = useState(false)
    const selectOption = useCallback((option)=>{
        if(!option){
            onChange?.([])
            return
        }
        if(value.includes(option.value)){
            const tmp = new Set(value)
            tmp.delete(option.value)
            onChange?.(Array.from(tmp))
        }else {
            onChange?.([...value,option.value])
        }
    },[value])
    useEffect(()=>{
        const clickOutside = (e)=>{
            if(!selectRef.current.contains(e.target)){
                setShowOptions(false)
            }
        }
        window.addEventListener('click',clickOutside)
        return ()=>window.removeEventListener('click',clickOutside)
    },[selectRef])

    return <div ref={selectRef} className='xl-multiple-select'>
        <label title={value.join(',')} onClick={()=>setShowOptions(!showOptions)}>
            {value.length>0?value.join(','):placeholder}
            <Icon className='clear' style={{display:value.length>0?'':'none'}} name='close' onClick={(e)=> {
                e.preventDefault()
                selectOption()
            }}/>
        </label>
        <ul className='xl-select-options' style={{display:showOptions?'block':'none'}}>
            {options.map(option=>{
                return <li className='xl-select-option' data-selected={value.includes(option.value)}
                           key={option.value}
                           onClick={(e)=> {
                               e.stopPropagation()
                               e.preventDefault()
                               selectOption(option)
                           }}>
                    {option.label}
                </li>
            })}
        </ul>
    </div>
}

export default MultipleSelect
