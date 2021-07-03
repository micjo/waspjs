import React, {useEffect, useState} from "react"
import RootCard from "./minimal_card";
import {TableRow} from "./table_elements";
import {ButtonSpinner, InputButton} from "./button_spinner";
import {getJson, sendRequest} from "../http_helper";

export default function MotronaCard(props) {
    const [data, setData] = useState({});
    useEffect(() => {
        const interval = setInterval(async () => {setData(await getJson(props.url))}, 1000)
        return () => clearInterval(interval);
    });


    const [targetInput, setTargetInput] = useState();
    function onTargetChange(value) {
        let intValue = parseInt(value);
        if (intValue) {setTargetInput(intValue); }
    }


    let table_extra =
        <>
            <TableRow items={["Counts:", data["counts"], ""]}/>
            <TableRow items={["Counting Status:", data["status"], ""]}/>
            <TableRow items={["Charge (nC):", data["charge(nC)"], ""]}/>
            <TableRow items={["Counting time (msec):", data["counting_time(msec)"], ""]}/>
            <TableRow items={["Current (nA):", data["current(nA)"], ""]}/>
            <TableRow items={["Target Charge (nC)", data["target_charge(nC)"],
                <InputButton text ="Set" onInputChange={onTargetChange} callback={async() => {
                    let json_response = await sendRequest(props.url, {"target_charge": targetInput})
                    setData(json_response);
                    }
                    }/>
            ]}/>
        </>

    let button_extra =
        <>
            <ButtonSpinner text="Pause" callback={async () => {
                await sendRequest(props.url, {"pause_counting": true})
            }}/>
            <ButtonSpinner text="Clear Start" callback={async () => {
                await sendRequest(props.url, {"clear-start_counting": true})
            }}/>
        </>

    return (
        <RootCard title="Motrona" prefix="motrona" brief_status="brief_status" HwResponse={data} active={false}
                  sanity_status="brief" table_extra={table_extra} button_extra={button_extra} url={props.url}>
        </RootCard>);
}
