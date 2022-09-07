import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    randomId,
} from '@mui/x-data-grid-generator';
import {
    DataGrid,
    GridActionsCellItem,
    GridRowModes,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector, GridToolbar,
} from '@mui/x-data-grid';
import Pagination from '@mui/material/Pagination';
import {useEffect, useState} from "react";
import LinearProgress from "@mui/material/LinearProgress";


function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: props.edit},
        }));
    };

    return (
            <Button size="small" color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
    );
}

EditToolbar.propTypes = {
    setRowModesModel: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
};

function CustomToolbar(props) {


    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
            <EditToolbar setRowModesModel={props.setRowModesModel} setRows={props.setRows} edit={props.initialEdit}/>
        </GridToolbarContainer>
    );
}

function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    );
}


export default function CrudGrid(props) {
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [update, setUpdate] = useState(false)
    const initialEdit = props.initialEdit


    useEffect( () => {
        async function fetch_content() {
            let newRows = await props.getData()
            setRows(newRows)
        }
        fetch_content().then()
    }, [update])

    const handleRowEditStart = (params, event) => {
        event.defaultMuiPrevented = true;
        console.log("row edit start")
    };

    const handleRowEditStop = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => async () => {
        setRows(rows.filter((row) => row.id !== id));
        await props.rowDelete(id)
        setUpdate(true)
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = async (newRow) => {
        console.log(newRow)
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        await props.rowAdd(updatedRow)
        setUpdate(true)
        return updatedRow;
    };


    const columns = [
        {
            field: 'actions',
            type: 'actions',
            headerName: "Actions",
            width: 80,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
        ...props.columns];

    return (
        <Box
            sx={{
                height: 800,
                // width: '100%',
                // '& .actions': {
                //     color: 'text.secondary',
                // },
                // '& .textPrimary': {
                //     color: 'text.primary',
                // },
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStart={handleRowEditStart}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                components={{
                    Toolbar: CustomToolbar,
                    Pagination: CustomPagination,
                }}
                componentsProps={{
                    toolbar: { setRows, setRowModesModel, initialEdit},
                }}
                experimentalFeatures={{ newEditingApi: true }}
            />
        </Box>
    );
}


export function RoDataGrid(props) {
    return (
        <Box sx={{ height: 800, width: '100%' }}>
            <DataGrid
                rows = {props.rows}
                columns = {props.columns}
                pagination
                pageSize={20}
                loading={props.loading}
                components={{
                    Toolbar: GridToolbar,
                    Pagination: CustomPagination,
                    LoadingOverlay: LinearProgress,
                }}
            />
        </Box>
    );
}



