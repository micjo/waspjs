import React, {useEffect, useState} from "react";
import {getJson, sendRequest} from "../http_helper";
import {TableRow} from "./table_elements";
import {ButtonSpinner} from "./button_spinner";
import RootCard from "./minimal_card";

export function CaenCard(props) {
    const [data, setData] = useState({});
    useEffect(() => {
        const interval = setInterval(async () => {setData(await getJson(props.url))}, 1000);
        return () => clearInterval(interval);
    }, [props.url]);

    let table_extra =
        <>
            <TableRow items={["Acquiring Data", data["acquisition_active"]?"True":"False", ""]}/>
        </>

    let button_extra =
        <>
            <ButtonSpinner text="Connect and Configure" callback={async () => {
                await sendRequest(props.url, {
                    "open_connection": true,
                    "write_registry": true,
                    "acquire_data": true,
                    "start_acquisition": true
                });
            }}/>
            <ButtonSpinner text="Start Acquisition" callback={async () => {
                await sendRequest(props.url, {
                    "start_acquisition": true
                });
            }}/>
            <ButtonSpinner text="Stop Acquisition" callback={async () => {
                await sendRequest(props.url, {
                    "stop_acquisition": true
                });
            }}/>
            <ButtonSpinner text="Reset" callback={async () => {
                await sendRequest(props.url, {
                    "stop_acquisition": true
                });
            }}/>
        </>

    return (
        <RootCard title={"CAEN"}
                  prefix={"caen"}
                  url={props.url}
                  brief_status={data["acquisition_active"]?"Acquiring":"Idle"}
                  HwResponse={data}
                  active={false}
                  sanity_status="brief"
                  table_extra={table_extra}
                  button_extra={button_extra}>
        </RootCard>);
}
