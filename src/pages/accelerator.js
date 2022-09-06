import React, {useCallback, useContext, useEffect, useState} from "react";
import {LogbookUrl, NectarTitle} from "../App";
import {deleteData, getJson, postData} from "../http_helper";
import {ToastPopup} from "../components/toast_popup";
import CrudGrid from "../components/crud_data_grid";

function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}

function useHeader() {
    const [header, setHeader] = useState([]);
    const logbookUrl = useContext(LogbookUrl)
    useEffect(() => {
        async function fetch_params() {
            let [, accelerator_keys] = await getJson(logbookUrl + "/check_accelerator_parameters")
            let keys = []
            for (let key of accelerator_keys) {
                if (key ==="id") {continue}
                if (key === "epoch") {
                    keys.push({field:key, type:'dateTime', width:200, editable: false})
                }
                else {
                    keys.push({field: key, headerName: key, editable:true})
                }
            }
            setHeader(keys)
        }

        fetch_params().then()
    },[])
    return header
}

function useUpdateData() {
    const [data, setData] = useState([]);
    const logbookUrl = useContext(LogbookUrl)
    const update = useCallback(() => {
            async function fetch_content() {
                let [, acceleratorParams] = await getJson(logbookUrl + "/get_accelerator_parameters")
                let params = []
                for (let line of acceleratorParams) {
                    line['epoch'] = line['epoch']
                    params.push(line)
                }
                setData(params)
            }

            fetch_content().then()
        }, []
    )

    useEffect(update,[])

    return [data,update]
}

function useGetData() {
    const logbookUrl = useContext(LogbookUrl)
    return async () => {
                let [, acceleratorParams] = await getJson(logbookUrl + "/get_accelerator_parameters")
                let params = []
                for (let line of acceleratorParams) {
                    line['epoch'] = epochToString(line['epoch'])
                    params.push(line)
                }
                return params
            }
}


export function Accelerator() {
    const header = useHeader()
    const logbookUrl = useContext(LogbookUrl)
    const [dialogText, setDialogText] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Accelerator"))
    const getData = useGetData()

    return (
        <>
            <CrudGrid getData={getData} columns={header}
                      rowAdd={ async(newRow) => {
                          await postData(logbookUrl + "/log_accelerator_paramaters", JSON.stringify(newRow))}}
                      rowDelete= { async(id) => {
                          await deleteData(logbookUrl + "/accelerator_parameters?id=" + id)}}
                      initialEdit="area"/>
            <ToastPopup text={dialogText} open={dialogOpen} setOpen={setDialogOpen} />
        </>
    );
}
