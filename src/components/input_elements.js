import React, {useState} from "react"

export function Toggle(props) {
    const [requestOngoing, setRequestOngoing] = useState(false);

    let disabled = requestOngoing ? "Disabled" : "";
    let checked = props.checked ? "checked" : "";
    let visible = requestOngoing ? "visible" : "hidden";

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

export function SimpleToggle(props) {
    return (
        <div className="input-group-text">
            <input className="form-check-input mt-0" type="checkbox"
                   checked={props.checked} onChange={async () => {
                props.setChecked(!props.checked);
            }
            }/>
        </div>
    );
}


export function SmallButtonSpinner(props) {
    return (
        <ButtonSpinner extraStyle="btn-sm float-end" text={props.text} callback={props.callback}/>
    );
}

export function ClickableSpan(props) {
    return (
        <a href="#" onClick={async () => {
            console.log("clicked");
            await props.callback();
        }}>
            {props.children}

        </a>
    )
}

export function ClickableSpanWithSpinner(props) {
    const [spinner, setSpinner] = useState(false);
    return (
        <div className="float-end">
        <ClickableSpan callback={async () => {
        setSpinner(true);
        await props.callback();
        setSpinner(false);
    }
    }>
        <span className="me-1 spinner-border spinner-border-sm" role="status"
              style={{display: spinner ? "inline-block" : "none"}}> </span>
        {props.children}
    </ClickableSpan>
        </div>);
}


export function ButtonSpinner(props) {
    const [spinner, setSpinner] = useState(false);
    return (
        <>
            <button className={"btn btn-outline-primary " + props.extraStyle} onClick={async () => {
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

export function FloatInputButton(props) {
    return (
        <InputButton
            text={props.text} onInputChange={(v) => {
            if (v) {
                props.setValue(parseFloat(v));
            } else {
                props.setValue("");
            }
        }}
            value={props.value} callback={props.callback}/>
    );
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

export function DropDown(props) {
    let items = []
    for (let select of props.selects) {
        items.push(<option key={select} value={select}>{select}</option>)
    }

    return (
        <select className="form-select form-select-sm" defaultValue="unselected" onChange={(e) => {
            props.setValue((e.target.value))
        }}>
            <option value="unselected">Choose...</option>
            {items}
        </select>
    )
}


export function DropDownButton(props) {

    let items = []
    for (let select of props.selects) {
        items.push(<option key={select} value={select}>{select}</option>)
    }

    return (
        <div className="input-group input-sm">
            <select className="form-select form-select-sm" defaultValue="unselected" onChange={(e) => {
                props.setValue((e.target.value))
            }}>
                <option value="unselected">Choose...</option>
                {items}
            </select>
            <SmallButtonSpinner callback={props.callback} text={props.text}/>
        </div>
    )
}