import React, {useEffect, useState} from "react";
import RootCard from "./minimal_card";
import {InputButton, ButtonSpinner} from "./button_spinner";
import {TableRow} from "./table_elements";
import {getJson, sendRequest} from "../http_helper";
import {onChangeSetInt} from "../conversions";

export function AmlCard(props) {
    const [data, setData] = useState({});
    useEffect(() => {
        const interval = setInterval(async () => {
            setData(await getJson(props.url))
        }, 1000);
        return () => clearInterval(interval);
    }, [props.url]);

    const [firstTarget, setFirstTarget] = useState('');
    const [secondTarget, setSecondTarget] = useState('');

    let table_extra =
        <>
            <TableRow items={["Expiry Date", data["expiry_date"], ""]}/>
            <TableRow items={[props.names[0], data["motor_1_position"],
                <InputButton
                    text="move" onInputChange={(v) => onChangeSetInt(v, setFirstTarget)} value={firstTarget}
                    callback={async () => await sendRequest(props.url, {"set_m1_target_position": firstTarget})}
                />]}
            />
            <TableRow items={[props.names[1], data["motor_2_position"],
                <InputButton
                    text="move" onInputChange={(v) => onChangeSetInt(v, setSecondTarget)} value={secondTarget}
                    callback={async () => await sendRequest(props.url, {"set_m2_target_position": secondTarget})}
                />]}/>
        </>

    let button_extra =
        <>
            <ButtonSpinner text="Move Both" callback={async () => {
                await sendRequest(props.url, {"set_m1_target_position" : firstTarget,
                 "set_m2_target_position" :secondTarget});
            }}/>
            <ButtonSpinner text="Load" callback={() => {
               setFirstTarget('100');
               setSecondTarget('200');
            }}/>
        </>

    return (
        <RootCard title={"AML " + props.names[0] + " " + props.names[1]}
                  prefix={"AML" + props.names[0] + props.names[1]}
                  url={props.url}
                  brief_status="brief_status"
                  HwResponse={data}
                  active={false}
                  sanity_status="brief"
                  table_extra={table_extra}
                  button_extra={button_extra}>
        </RootCard>);
}
