import React, {useState} from "react"
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Button, CircularProgress,
    LinearProgress,
    ListItem,
    ListItemText,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {ExpandMore, RadioButtonUnchecked} from "@mui/icons-material";
import {makeStyles} from "@mui/styles";
import {delay} from "../http_helper";
import Box from "@mui/material/Box";

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


export function SmallLoadButton(props) {
    return (
        <ProgressButton small={true} text={props.text} callback={props.callback}/>
    );
}

export function ClickableSpan(props) {
    return (
        <a href="#" onClick={async () => {
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

export function SmallProgressButton(props) {
    return <ProgressButton size="small" {...props}/>
}


export function ProgressButton(props) {
    const [loading, setLoading] = useState(false);
    return (
        <>
            <LoadingButton disabled={props.disabled} size={props.size} loading={loading} variant={"contained"}
                           style={props.style} endIcon={props.icon} key={props.key} onClick={async () => {
                setLoading(true);
                await props.callback();
                setLoading(false);
            }}>
                {props.text}
            </LoadingButton>
        </>);
}

export function InputButton(props) {
    return (
        <div className="input-group input-group-sm">
            <input type="number" className="form-control" placeholder="New Value"
                   value={props.value}
                   onInput={e => props.onInputChange(e.target.value)}/>
            <ProgressButton callback={props.callback} text={props.text}/>
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
            <SmallLoadButton callback={props.callback} text={props.text}/>
        </div>
    )
}

export function ListRoItemText(props) {
    return (<ListItem><ListItemText {...props}/></ListItem>)
}

export function ListNumberInput(props) {
    const [input, setInput] = useState("")
    const [disabled, setDisabled] = useState(true)

    return (
        <ListItem>
            <ListItemText primary={props.textPrimary} secondary={props.textSecondary}/>
            <TextField id='outlined-basic' variant='outlined' size='small' type='number' label={props.inputLabel}
                       onChange={
                           (e) => {
                               let text = e.target.value
                               setInput(parseFloat(text))
                               console.log(text)
                               setDisabled(text === "")
                           }
                       }/>
            <ProgressButton variant='contained' disabled={disabled} color='primary'
                            callback={() => props.callback(input)} text={props.buttonLabel}/>
        </ListItem>
    )
}

export function NumberInput(props) {
    const [input, setInput] = useState("")
    const [disabled, setDisabled] = useState(true)

    return (
        <>
            <TextField id='outlined-basic' variant='outlined' size='small' type='number' label={props.inputLabel}
                       onChange={
                           (e) => {
                               let text = e.target.value
                               setInput(parseFloat(text))
                               console.log(text)
                               setDisabled(text === "")
                           }
                       }/>
            <Box ml={2}>
                <ProgressButton variant='contained' disabled={disabled} color='primary'
                                callback={async () => await props.callback(input)} text={props.buttonLabel}/>
            </Box>
        </>
    )
}

export function SwitchInput(props) {
    const [loading, setLoading] = useState(false)
    const [disabled, setDisabled] = useState(false)

    return (
        <>
            <Switch
                checked={!!props.checked}
                disabled={disabled}
                onChange={async (event) => {
                    setLoading(true)
                    setDisabled(true)
                    await props.callback(event.target.checked)
                    setLoading(false)
                    setDisabled(false)
                }
                }/>
            {loading && <CircularProgress size={14}/>}
        </>
    )

}

export function ListSwitch(props) {
    const [loading, setLoading] = useState(false)
    const [disabled, setDisabled] = useState(false)

    return (
        <ListItem>

            <ListItemText primary={props.textPrimary} secondary={props.textSecondary}/>
            {loading && <CircularProgress size={14}/>}
            <Switch
                checked={!!props.checked}
                disabled={disabled}
                onChange={async (event) => {
                    setLoading(true)
                    setDisabled(true)
                    await props.callback(event.target.checked)
                    setLoading(false)
                    setDisabled(false)
                }
                }/>
        </ListItem>
    )
}