import {getJson} from "../http_helper";
import React, {useEffect, useState} from "react";
import {Chip, CircularProgress} from "@mui/material";


export function ConditionalBadge(props) {
    let element;
    if (props.error) {
        element = <Chip label={props.text} color="error" size="small"/>
    } else {
        element = <Chip label={props.text} color="success" size="small"/>
    }
    return element;
}


export function BusySpinner(props) {
    return (
        props.busy && <CircularProgress color={"inherit"} size={20}/>
    )
}

export function usePollData(url){
    const [data, setData] = useState({})
    const [error, setError] = useState("")

    useEffect(() => {
            const getControllerData = async () => {
                let [status, json_response] = await getJson(url);
                if (status === 404) {
                    setError("Cannot reach controller: HTTP 404")
                } else {
                    setError("Connected");
                    setData(json_response);
                }
            }
            getControllerData().then()
            const interval = setInterval(getControllerData, 1000);
            return () => clearInterval(interval);
        }, [url]
    );

    return [data, setData, error, setError]
}

