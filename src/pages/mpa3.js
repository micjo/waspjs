import {useGenericPage} from "./generic_page";
import {TableRow} from "../components/table_elements";
import React, {useContext, useEffect, useState} from "react";
import {ControllerContext, HiveUrl} from "../App";
import {GenericControl, ModalView} from "../components/generic_control";

function useStatus(data) {
    const [acquiring, setAcquiring] = useState(false);
    const [filename, setFilename] = useState("");

    useEffect(() => {
        if ("acquisition_status" in data) {
            setAcquiring(data['acquisition_status']['acquiring'])
        } else {
            setAcquiring(false)
        }

        if ("data_format" in data) {
            setFilename(data['data_format']['file_name'])
        } else {
            setFilename("")
        }
    }, [data])

    return [acquiring, filename]
}


export function useMpa3(url, title) {
    let [config, show, setShow, modalMessage] = useGenericPage(url, title)
    const [acquiring, filename] = useStatus(config.data);

    config.busy = acquiring;

    let table_extra = <>
        <TableRow items={["Acquiring", acquiring, ""]}/>
        <TableRow items={["File Name", filename, ""]}/>

    </>

    let button_extra = <> </>

    return [config, show, setShow, modalMessage, table_extra, button_extra]
}


export function Mpa3(props) {
    const root_url = useContext(HiveUrl);

    const url = root_url + props.hardware_value.proxy;
    const title = props.hardware_value.title;
    console.log(url);

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMpa3(url, title)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl table_extra={table_extra} button_extra={button_extra}/>
        </ControllerContext.Provider>);
}