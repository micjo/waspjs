import React, {useContext, useEffect, useState} from "react";
import {HiveUrl} from "../App";
import {usePollData} from "../components/generic_control";
import {useSendRequest} from "../http_helper";
import {WideProgressButton} from "../components/elements";
import {Grid} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {ToastPopup} from "../components/toast_popup";

export function Mpa3(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hardware_value.proxy;

    const [data, setData, error, setError] = usePollData(url)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const sendRequest = useSendRequest(url, setData, setError)
    const [ignoreDisabled, setIgnoreDisabled] = useState(true)

    useEffect(() => {
        if (data?.error) {
            setIgnoreDisabled(data?.error === "Success")
        }
    }, [data])
    useEffect(() => {
        if (error !== "Connected") {
            setText(error)
            setOpen(true)
        }
    }, [error])

    let basicControl = [
        ["Request Acknowledge", data?.request_id, ""],
        ["Request Finish", data?.request_finished ? "true" : "false", ""],
        ["Error", data?.error,
            <WideProgressButton disabled={ignoreDisabled} text={"Ignore"}
                                callback={async () => await sendRequest({"ignore_error": true})}/>],
        ["Acquiring", data?.acquisition_status?.acquiring? "true": "false", ""],
        ["File name", data?.data_format?.filename, ""]
    ]

    return (
        <>
            <h1>{props.hardware_value.title}</h1>
            <Grid container>
                <GridHeader header={["Identifier", "Value", "Control"]}/>
                <GridTemplate rows={basicControl}/>
            </Grid>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
        </>
    )
}