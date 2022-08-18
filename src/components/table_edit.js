import MaterialTable from "@material-table/core";
import {ExportCsv, ExportPdf} from "@material-table/exporters";
import React from "react";

export function TableEdit(props) {
    return (
    <MaterialTable
        {...props}
        options={{
            // tableLayout: "fixed",
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
            onRowAdd: props.onRowAdd,
            onRowUpdate: props.onRowUpdate,
            onRowDelete: props.onRowDelete,
        }}
    />)
}