import React, {useState} from "react"
import {onChangeSetInt} from "../conversions";


export function SwitchSpinner(props) {
    return (
        <div className="d-flex align-items-center">
        <div className="input-group justify-content-end">
                <label>{props.text}</label>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault"/>
            </div>
        </div>
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="sr-only"/>
        </div>
        </div>


);
}


export function ButtonSpinner(props) {
    const [spinner, setSpinner] = useState("none");

    return (
        <>
            <button className={"btn btn-outline-primary " + props.style} onClick={async () => {
                setSpinner("inline-block");
                await props.callback();
                setSpinner("none");
            }}>
                {props.text}
                <span className="ms-1 spinner-border spinner-border-sm" role="status"
                      style={{display: spinner}}> </span>
            </button>
        </>);
}

export function InputButton(props) {
    const [spinner, setSpinner] = useState("none");

    return (
        <div className="input-group input-group-sm">
            <input type="text" className="form-control" placeholder="New Value"
                   value={props.value}
                   onInput={e => props.onInputChange(e.target.value)}/>
            <ButtonSpinner callback={props.callback} text={props.text}/>
        </div>);
}

export function IntInputButton(props) {
    return (
        <InputButton
            text = {props.text} onInputChange={(v) => onChangeSetInt(v, props.setValue)}
            value={props.value} callback={props.callback}/>
    );
}