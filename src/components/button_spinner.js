import React, {useState} from "react"


export function ButtonSpinner(props) {
    const [spinner, setSpinner] = useState("none");

    return (
        <>
            <button className="btn btn-outline-primary" onClick={async () => {
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
            <input type="text" className="form-control form-control-sm" placeholder="New Value"
                   value={props.value}
                   onInput={e => props.onInputChange(e.target.value)}/>
            <button className="btn btn-sm btn-outline-primary" onClick={async () => {
                setSpinner("inline-block");
                await props.callback();
                setSpinner("none");
            }}>
                {props.text}
                <span className="ms-1 spinner-border spinner-border-sm" role="status"
                      style={{display: spinner}}> </span>
            </button>
        </div>);
}