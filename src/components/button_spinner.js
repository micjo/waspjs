import React, {useEffect, useState} from "react"
import {onChangeSetInt} from "../conversions";
import {sendRequest} from "../http_helper";

export function Toggle(props) {
    const [requestOngoing, setRequestOngoing] = useState(false);

    let disabled = requestOngoing ? "Disabled" : "";
    let checked = props.data[props.keyGet] ? "checked" : "";
    let visible = requestOngoing? "visible" : "hidden";

    return (
        <div className="d-flex align-items-center">
            <div className="input-group justify-content-end">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" disabled={disabled}
                           checked={checked} onChange={async () => {
                        setRequestOngoing(true);
                        await props.callback();
                        setRequestOngoing(false);
                    }
                    }/>
                </div>
            </div>
            <div>
                <div className="spinner-border spinner-border-sm" role="status"
                     style={{visibility: visible}}>
                    <div className="sr-only"/>
                </div>
            </div>
        </div>
    );
}


export function SmallButtonSpinner(props) {
    return (
        <ButtonSpinner style="btn-sm float-end" text={props.text} callback={props.callback}/>
    );
}

export function ButtonSpinner(props) {
    const [spinner, setSpinner] = useState(false);
    return (
        <>
            <button className={"btn btn-outline-primary " + props.style} onClick={async () => {
                setSpinner(true);
                await props.callback();
                setSpinner(false);
            }}>
                {props.text}
                <span className="ms-1 spinner-border spinner-border-sm" role="status"
                      style={{display: spinner ? "inline-block" : "none"}}> </span>
            </button>
        </>);
}

export function InputButton(props) {
    return (
        <div className="input-group input-group-sm">
            <input type="number" className="form-control" placeholder="New Value"
                   value={props.value}
                   onInput={e => props.onInputChange(e.target.value)}/>
            <ButtonSpinner callback={props.callback} text={props.text}/>
        </div>);
}

export function IntInputButton(props) {
    return (
        <InputButton
            text={props.text} onInputChange={(v) => {
            if (v) {
                props.setValue(parseInt(v));
            } else {
                props.setValue("");
            }
        }}
            value={props.value} callback={props.callback}/>
    );
}