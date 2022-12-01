import React, {useState} from "react"
import {
    ButtonGroup, CircularProgress, FormControl, InputLabel, ListItem, ListItemText, MenuItem, Select, Switch, TextField,
} from "@mui/material";
import {LoadingButton} from "@mui/lab";

export function SmallLoadButton(props) {
    return <ProgressButton small={true} text={props.text} callback={props.callback}/>
}

export function SmallProgressButton(props) {
    return <ProgressButton size="small" {...props}/>
}

export function WideProgressButton(props) {
    return <ProgressButton fullWidth={true} {...props}/>
}

export function LoadButton(props) {
    const [loading, setLoading] = useState(false);
    return (<LoadingButton disabled={props.disabled} size={"small"} loading={loading} variant={"contained"}
                           style={props.style} endIcon={props.icon} key={props.key} onClick={async () => {
        setLoading(true);
        await props.callback();
        setLoading(false);
    }}>
        {props.text}
    </LoadingButton>)
}

export function ProgressButton(props) {
    return (
        <ButtonGroup fullWidth={props.fullWidth}>
            <LoadButton {...props}/>
        </ButtonGroup>
    );
}

export function SimpleNumberInput(props) {

    return (
        <TextField fullWidth id='outlined-basic' variant='outlined' size='small' sx={{width:"100%"}}
                   label={props.inputLabel}
                   onChange={
                       (e) => {
                           let text = e.target.value
                           let value = parseFloat(text)
                           props.setInput(value)
                       }
                   }/>
    )
}

export function NumberInput(props) {
    const [input, setInput] = useState("")
    const [disabled, setDisabled] = useState(true)

    return (
        <>
            <ButtonGroup fullWidth>
                <TextField fullWidth id='outlined-basic' variant='outlined' size='small' type='number'
                           label={props.inputLabel}
                           onChange={
                               (e) => {
                                   let text = e.target.value
                                   setInput(parseFloat(text))
                                   setDisabled(text === "")
                               }
                           }/>
                <ProgressButton variant='contained' disabled={disabled} color='primary'
                                callback={async () => await props.callback(input)} text={props.buttonLabel}/>
            </ButtonGroup>
        </>
    )
}


export function TextInput(props) {
    const [input, setInput] = useState("")
    const [disabled, setDisabled] = useState(true)

    return (
        <>
            <ButtonGroup fullWidth>
                <TextField fullWidth id='outlined-basic' variant='outlined' size='small'
                           label={props.inputLabel}
                           onChange={
                               (e) => {
                                   let text = e.target.value.toString()
                                   setInput(text)
                                   setDisabled(text === "")
                               }
                           }/>
                <ProgressButton variant='contained' disabled={disabled} color='primary'
                                callback={async () => await props.callback(input)} text={props.buttonLabel}/>
            </ButtonGroup>
        </>
    )
}

export function SelectInput(props) {
    const [input, setInput] = useState("")
    const [disabled, setDisabled] = useState(true)
    let items = []
    for (let option of props.options) {
        items.push(<MenuItem key={option} value={option}>{option}</MenuItem>)
    }
    return (
        <>
            <ButtonGroup fullWidth>
                <FormControl fullWidth size={"small"} variant={"outlined"}>
                    <InputLabel id="select-label">{props.selectLabel}</InputLabel>
                    <Select labelId="select-label" id={"demo"} name="select-input" value={input}
                            label={props.selectLabel}
                            onChange={(e) => {
                                setInput((e.target.value))
                                console.log(e.target.value)
                                console.log(props.options)
                                setDisabled(!props.options.includes(e.target.value))
                            }}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {items}
                    </Select>
                </FormControl>
                <ProgressButton variant='contained' disabled={disabled}
                                callback={async () => await props.callback(input)} text={props.buttonLabel}/>
            </ButtonGroup>
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