import React, {useContext, useEffect, useState, Suspense} from "react";
import {LogbookUrl} from "../App";
import {getJson, postData} from "../http_helper";
import MaterialTable from "@material-table/core";
import {ExportCsv, ExportPdf} from '@material-table/exporters';

function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}

export function Trends() {
    const logbookUrl = useContext(LogbookUrl)

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
            async function fetch_params() {
                let [, accelerator_keys] = await getJson(logbookUrl + "/check_trending")
                let header = []
                for (let key of accelerator_keys) {
                    header.push({field: key, title: key})
                }
                setColumns(header)
            }

            fetch_params().then()
        }, [logbookUrl]
    )

    useEffect(() => {
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
        }, [logbookUrl]
    )

    return (
        <div>
            <h1> Trends (Does not work fully yet - Work in progress) </h1>
            <div>
            </div>
            <MaterialTable options={{
                // Allow user to hide/show
                // columns from Columns Button
                columnsButton: true,
                exportMenu: [{
                    label: 'Export PDF',
                    exportFunc: (cols, datas) => ExportPdf(cols, datas, 'myPdfFileName')
                }, {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) => ExportCsv(cols, datas, 'myCsvFileName')
                }]
            }}

                           editable={{
                               onRowAdd: newData =>
                                   new Promise((resolve, reject) => {
                                       setTimeout(() => {
                                           {
                                               const data = this.state.data;
                                               data.push(newData);
                                               this.setState({ data }, () => resolve());
                                           }
                                           resolve()
                                       }, 1000)
                                   }),
                               onRowUpdate: (newData, oldData) =>
                                   new Promise((resolve, reject) => {
                                       setTimeout(() => {
                                           {
                                               const data = this.state.data;
                                               const index = data.indexOf(oldData);
                                               data[index] = newData;
                                               this.setState({ data }, () => resolve());
                                           }
                                           resolve()
                                       }, 1000)
                                   }),
                               onRowDelete: oldData =>
                                   new Promise((resolve, reject) => {
                                       setTimeout(() => {
                                           {
                                               let data = this.state.data;
                                               const index = data.indexOf(oldData);
                                               data.splice(index, 1);
                                               this.setState({ data }, () => resolve());
                                           }
                                           resolve()
                                       }, 1000)
                                   }),
                           }}

                           title="Trends" columns={columns} data={data}


            />
        </div>
    );
}
