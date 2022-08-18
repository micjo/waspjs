import React, {useCallback, useContext, useEffect, useState} from "react";
import {LogbookUrl} from "../App";
import {deleteData, getJson, postData} from "../http_helper";
import MaterialTable from "@material-table/core";
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Button, Dialog, IconButton, Snackbar} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {TableEdit} from "../components/table_edit";
import {ToastPopup} from "../components/toast_popup";

function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}



function useUpdateHeader() {
    const [header, setHeader] = useState([]);
    const logbookUrl = useContext(LogbookUrl)
    const update = useCallback(() => {
        async function fetch_params() {
            console.log("updating header")
            let [, accelerator_keys] = await getJson(logbookUrl + "/check_accelerator_parameters")
            let keys = []
            for (let key of accelerator_keys) {
                if (key === "id") {
                    keys.push({field:key, title:key, editable:"never", width:"10px"})
                }
                else if (key === "epoch") {
                    keys.push({field:key, title:key, editable:"never", width:"200px"})
                }
                else {
                    keys.push({field: key, title: key, width:"200px"})
                }
            }
            setHeader(keys)
        }

        fetch_params().then()
    }, [])

    useEffect(update,[])

    return [header, update]
}

function useUpdateData() {
    const [data, setData] = useState([]);
    const logbookUrl = useContext(LogbookUrl)
    const update = useCallback(() => {
            async function fetch_content() {
                let [, acceleratorParams] = await getJson(logbookUrl + "/get_accelerator_parameters")
                let params = []
                for (let line of acceleratorParams) {
                    line['epoch'] = epochToString(line['epoch'])
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


export function Accelerator() {
    const [header, updateHeader] = useUpdateHeader()
    const [data, updateData] = useUpdateData()
    const logbookUrl = useContext(LogbookUrl)
    const [dialogOpen,setDialogOpen] = useState(false)

    return (
        <div>
            <h1> Accelerator Parameters (Does not work fully yet - Work in progress) </h1>
            <div>
            </div>
            <TableEdit
                title="Accelerator Parameters" columns={header} data={data}
                onRowAdd={ async(newData) => {
                    console.log(newData)
                    await postData(logbookUrl + "/log_accelerator_paramaters", JSON.stringify(newData))
                    updateData()
                }}
                onRowUpdate={ async(newData, oldData) => {
                    console.log(newData);
                    console.log(oldData);
                    setDialogOpen(true)
                }}
                onRowDelete={ async(oldData) => {
                    await deleteData(logbookUrl + "/accelerator_parameters?id=" + oldData.id)
                    updateData()

                }}
            />

            <ToastPopup open={dialogOpen} setOpen={setDialogOpen}/>
        </div>
    );
}
