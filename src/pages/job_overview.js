import React, {useContext, useEffect, useState} from "react";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {FailureModal, ProgressSpinner, useModal, useReadOnlyData} from "../components/generic_control";
import {ProgressButton, ClickableSpanWithSpinner, SmallProgressButton} from "../components/input_elements";
import {postData} from "../http_helper";
import {HiveUrl} from "../App";
import {BusySpinner} from "../components/generic_control";
import {useGenericPage, useGenericReadOnlyPage} from "./generic_page";
import {
    Button,
    Chip,
    Grid,
    LinearProgress,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack
} from "@mui/material";
import {AttachFile, Cancel, PlayArrow, PriorityHigh, Check, Circle} from "@mui/icons-material";
import ScrollDialog from "../components/ScrollDialog";
import {styled} from '@mui/material/styles';
import {DataGrid, gridClasses} from '@mui/x-data-grid';
import {LinearWithValueLabel} from "../components/linear_progress_with_label";
import Box from "@mui/material/Box";
import {List} from "@mui/material"

const ODD_OPACITY = 0.2;

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

function DefaultStripedDataGrid(props) {
    return(
    <div style={{ height: props.height, width: '100%' }}>
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

function AbortRunning(props) {
    return (
        <ClickableSpanWithSpinner callback={async () => {
            await postData(props.url, "")
        }}>
            <Cancel/>
        </ClickableSpanWithSpinner>);
}

function ScheduleTable(props) {

    const root_url = useContext(HiveUrl);
    let url = root_url + "/api/job/"

    const columns = [{ field: 'job_name', headerName: "Job", sortable:false, flex:true}]
    const [rows, setRows] = useState([])

    useEffect ( () => {
        let newRows = []
        if (Array.isArray(props.schedule) && props.schedule.length) {
            let index = 0;
            for (let item of props.schedule) {
                newRows.push({'id': index, 'job_name': item.job.name})
                index++;
            }
        }
        setRows(newRows)
    }, [props.schedule])

    return (
        <>
            <h5>Scheduled:
                <ClickableSpanWithSpinner callback={async () => {
                    await postData(url + "abort_schedule");
                }}>
                    <Cancel/>
                </ClickableSpanWithSpinner>
            </h5>
            <DefaultStripedDataGrid rows={rows} columns={columns} noRowsText={"Nothing scheduled"} height={200}/>
        </>
    )
}


function ScheduleJob() {
    const [job, setJob] = useState({});
    let [modalMessage, show, setShow, cb] = useModal();
    const [filename, setFilename] = useState("");
    const [scheduleDisable, setScheduleDisable] = useState(true);
    const [text, setText] = useState("")
    const [open, setOpen] = useState(false)

    const root_url = useContext(HiveUrl);
    let url = root_url + "/api/job/"

    async function handleFileChange(e) {
        setFilename(e.target.files[0].name);
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(url + 'csv_conversion', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            console.log(JSON.stringify(json_job))
            setText(JSON.stringify(json_job).slice(1, -1))
            setOpen(true)
            setScheduleDisable(true)
        } else {
            setJob(json_job);
            setScheduleDisable(false)
        }
    }

    async function scheduleJob() {
        await postData(url + job?.type, JSON.stringify(job))
        setJob({})
        setFilename("");
    }

    return (
        <div className="clearfix">
            <ScrollDialog title={"Error"} text={text} open={open} onClose={() => {
                setOpen(false)
            }}/>
            <div className="input-group mt-2 mb-2">
                <Button variant="outlined" component="label" endIcon={<AttachFile/>}>
                    Upload
                    <input hidden accept="text/csv" multiple type="file"
                           onClick={(e) => {
                               e.target.value = null;
                           }}
                           onChange={async (e) => await handleFileChange(e)}/>
                </Button>
                <ProgressButton disabled={scheduleDisable} text="Schedule" callback={scheduleJob} icon={<PlayArrow/>}/>
            </div>
        </div>
    );
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function ProgressTable(props) {
    let all_recipes = props.data?.active_job?.job?.recipes;
    let finished_recipes = props.data?.active_job?.finished_recipes;
    let active_recipe = props.data?.active_job?.active_recipe;
    let active_job_id = props.data?.active_job?.job?.name;

    const [rows, setRows] = useState([])

    const root_url = useContext(HiveUrl);
    const columns=[
        { field: 'progress', headerName: "Progress", width: 100, sortable:false,  renderCell: params => {
                return <Box sx={{ width: '100%' }}>
                    <LinearWithValueLabel value={params.value} />
                </Box>
            }},
        { field: 'recipe', headerName: "Recipe", sortable:false, flex:true},
        { field: 'type', headerName: "Type", sortable:false, flex:true},
        { field: 'sample', headerName: "Sample ID", sortable:false, flex:true},
        { field: 'run_time', headerName: "Run Time", sortable:false, flex:true},
    ]

    useEffect( () => {
        let newRows = []

        if (all_recipes && finished_recipes && active_recipe) {
            let index = 0;
            for (let recipe of finished_recipes) {
                let time = new Date(recipe.run_time * 1000).toISOString().substr(11, 8);
                let full_recipe = all_recipes[index];
                newRows[index] = {id: index, 'progress' : 100, 'recipe': recipe.name, 'type': full_recipe.type,
                    'sample': full_recipe.sample, run_time: time};
                index++;
            }

            if (index < all_recipes.length) {
                let time = new Date(active_recipe.run_time * 1000).toISOString().substr(11, 8);
                console.log(active_recipe)
                newRows[index] = {id: index, 'progress': parseFloat(active_recipe.progress), 'recipe': active_recipe.name, 'type': all_recipes[index].type,
                    'sample': all_recipes[index].sample, 'run_time': time};
                index++;
            }

            while (index < all_recipes.length) {
                let item = all_recipes[index];
                newRows.push( {id:index, 'progress' : 0, 'recipe': item.name, 'type': item.type, 'sample': item.sample,
                    'run_time':"0"})
                index++;
            }
        }
        setRows(newRows)
    }, [props.data])


    return (
        <div className="clearfix">
            <h5>Active: {active_job_id} <AbortRunning url={root_url + "/api/job/abort_active"}/></h5>
            <DefaultStripedDataGrid
                rows={rows}
                columns={columns}
                noRowsText={"Nothing active"}
                height={300}
            />
            <hr/>
        </div>
    )
}

export function HardwareStatus() {

    const root_url = useContext(HiveUrl);
    let [rbs_config, rbs_show, rbs_setShow, rbs_modalMessage] = useGenericPage(root_url + "/api/rbs/status", "RBS")

    let aml_x = rbs_config.data?.["aml_x_y"]?.["motor_1_position"];
    let aml_y = rbs_config.data?.["aml_x_y"]?.["motor_2_position"];
    let aml_phi = rbs_config.data?.["aml_phi_zeta"]?.["motor_1_position"];
    let aml_zeta = rbs_config.data?.["aml_phi_zeta"]?.["motor_2_position"];
    let aml_det = rbs_config.data?.["aml_det_theta"]?.["motor_1_position"];
    let aml_theta = rbs_config.data?.["aml_det_theta"]?.["motor_2_position"];
    let current = rbs_config.data?.["motrona"]?.["current(nA)"];
    let charge = rbs_config.data?.["motrona"]?.["charge(nC)"];
    let target_charge = rbs_config.data?.["motrona"]?.["target_charge(nC)"];

    let aml_moving = rbs_config.data?.["aml_x_y"]?.["busy"] || rbs_config.data?.["aml_phi_zeta"]?.["busy"] ||
        rbs_config.data?.["aml_det_theta"]?.["busy"];

    let [erd_config, erd_show, erd_setShow, erd_modalMessage] = useGenericPage(root_url + "/api/erd/status", "ERD")
    let mdrive_z = erd_config.data?.["mdrive_z"]?.["motor_position"];
    let mdrive_theta = erd_config.data?.["mdrive_theta"]?.["motor_position"];
    let mpa3_ad1_count_rate = erd_config.data?.["mpa3"]?.["ad1"]?.["total_rate"];
    let mpa3_ad2_count_rate = erd_config.data?.["mpa3"]?.["ad2"]?.["total_rate"];

    let mdrive_moving = erd_config.data?.["mdrive_z"]?.["moving_to_target"] ||
        erd_config.data?.["mdrive_theta"]?.["moving_to_target"]

    return (<>
        <FailureModal show={rbs_show} setShow={rbs_setShow} message={rbs_modalMessage}/>
        <h1>Hardware Status</h1>

        <Grid container mb={1}>
            <Grid item={true} xs={12} mb={1}><h2>RBS</h2></Grid>
            <Grid item={true} xs={12} mb={1}>
                <Chip label={`Position (x, y, phi, zeta, det, theta) =
                        (${aml_x}, ${aml_y}, ${aml_phi}, ${aml_zeta}, ${aml_det}, ${aml_theta})`}/>
                <BusySpinner busy={aml_moving}/>
            </Grid>
            <Grid item={true} xs={1} mb={1}><Chip label={`Current = ${current} nA`}/></Grid>
            <Grid item={true} xs={1}><Chip label={`Charge = ${charge} nC -> ${target_charge} nC`}/></Grid>
            <Grid item={true} xs={10}/>

            <Grid item={true} xs={1} mb={1}>
                <SmallProgressButton url={root_url + "/api/rbs/load"} popup={rbs_config.popup}
                                     setData={rbs_config.setData} text={"load"}/>
            </Grid>

            <Grid item={true} xs={12} mb={1}><h2>ERD</h2></Grid>
            <Grid item={true} xs={2} mb={1}>
                <Chip label={`Position (theta, z) = (${mdrive_theta}, ${mdrive_z})`}/>
                <BusySpinner busy={mdrive_moving}/>
            </Grid>
            <Grid item={true} xs={1}><Chip label={`AD1 count rate = ${mpa3_ad1_count_rate}`}/></Grid>
            <Grid item={true} xs={1}><Chip label={`AD2 count rate = ${mpa3_ad2_count_rate}`}/></Grid>
            <Grid item={true} xs={8}/>
            <Grid item={true}><SmallProgressButton url={root_url + "/api/erd/load"} popup={erd_config.popup}
                                                   setData={erd_config.setData} text={"load"}/>
            </Grid>

        </Grid>
    </>)
}

export function JobOverview() {
    const root_url = useContext(HiveUrl);
    let state = useReadOnlyData(root_url + "/api/job/state", {})

    return (
        <div>
            <h1>Jobs</h1>

            <ScheduleJob/>
            <ScheduleTable schedule={state["schedule"]}/>
            <ProgressTable data={state}/>
            <HardwareStatus/>

        </div>
    );
}