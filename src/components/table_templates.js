import MaterialTable from "@material-table/core";
import {ExportCsv, ExportPdf} from "@material-table/exporters";
import React from "react";
import {Stack} from "@mui/material";
import {styled} from "@mui/material/styles";
import {DataGrid, gridClasses} from "@mui/x-data-grid";

const StripedDataGrid = styled(DataGrid)(({theme}) => ({
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: theme.palette.grey[200],
        '&:hover, &.Mui-hovered': {
            backgroundColor: theme.palette.grey[300]
        },
    },
    [`& .${gridClasses.row}.odd`]: {
        '&:hover, &.Mui-hovered': {
            backgroundColor: theme.palette.grey[300]
        },
    }
}));

export function MaterialTableTemplate(props) {
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
            }],
            pageSizeOptions: [5, 10, 20, 1000],
        }}

        editable={{
            onRowAdd: props.onRowAdd,
            onRowDelete: props.onRowDelete,
            onRowUpdate: props.onRowUpdate
        }}
    />)
}

export function StripedTable(props) {
    return (
        <div style={{height: props.height, width: '100%'}}>
            <StripedDataGrid
                density={"compact"}
                disableColumnMenu={true}
                disableSelectionOnClick={true}
                hideFooter={true}
                components={{
                    NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                            {props.noRowsText}
                        </Stack>
                    )
                }}
                getRowClassName={(params) => {
                    let even_or_odd = params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    let done = "done"
                    return `${even_or_odd} ${done}`
                }}
                {...props}/>
        </div>)
}