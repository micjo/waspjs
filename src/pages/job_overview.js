import {useContext, useEffect, useState} from "react";
import {BusySpinner,usePollData} from "../components/generic_control";
import {LoadButton, ProgressButton, SmallProgressButton} from "../components/elements";
import {postData} from "../http_helper";
import {HiveUrl, NectarTitle} from "../App";
import {Button, Chip, Grid, Typography, Paper, InputBase, Divider, IconButton} from "@mui/material";
import {AttachFile, Cancel, PlayArrow, Upload, Play, Telegram} from "@mui/icons-material";
import ScrollDialog from "../components/ScrollDialog";
import {LinearWithValueLabel} from "../components/linear_progress_with_label";
import Box from "@mui/material/Box";
import {StripedTable} from "../components/table_templates";



function ScheduleTable(props) {

    const root_url = useContext(HiveUrl);
    let url = root_url + "/api/job/"

    const columns = [{field: 'job_name', headerName: "Job", sortable: false, flex: true}]
    const [rows, setRows] = useState([])

    useEffect(() => {
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
            <h5>Scheduled</h5>
            <StripedTable rows={rows} columns={columns} noRowsText={"Nothing scheduled"} height={200}/>
            <Grid container justifyContent="flex-end">
            <LoadButton text={"Cancel"} icon={<Cancel/>} callback={async () => {
                await postData(url + "abort_schedule");
            }}>
                <Cancel/>
            </LoadButton>
            </Grid>
        </>
    )
}


function ScheduleJob() {
    const [job, setJob] = useState({});
    const [filename, setFilename] = useState("filename.csv");
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
        setScheduleDisable(true);
    }

    return (
        <div className="clearfix">
            <ScrollDialog title={"Error"} text={text} open={open} onClose={() => {
                setOpen(false)
            }}/>
                <h5>Schedule CSV</h5>
                <Paper
                    component="form"
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                >

                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        readOnly={true}
                        disabled={scheduleDisable}
                        value={filename}
                        inputProps={{ 'aria-label': 'search google maps' }}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search" component="label">
                        <Upload color="primary"/>
                        <input hidden accept="text/csv" multiple type="file"
                               onClick={(e) => {
                                   e.target.value = null;
                               }}
                               onChange={async (e) => await handleFileChange(e)}/>
                    </IconButton>
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton color="primary" disabled={scheduleDisable} sx={{ p: '10px' }} aria-label="directions"
                        onClick={scheduleJob}>
                        <Telegram />
                    </IconButton>
                </Paper>
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
    console.log(props.data)

    const [rows, setRows] = useState([])

    const root_url = useContext(HiveUrl);
    const columns = [
        {
            field: 'progress', headerName: "Progress", width: 100, sortable: false, renderCell: params => {
                return <Box sx={{width: '100%'}}>
                    <LinearWithValueLabel value={params.value}/>
                </Box>
            }
        },
        {field: 'recipe', headerName: "Recipe", sortable: false, flex: true},
        {field: 'type', headerName: "Type", sortable: false, flex: true},
        {field: 'sample', headerName: "Sample ID", sortable: false, flex: true},
        {field: 'run_time', headerName: "Run Time", sortable: false, flex: true},
    ]

    useEffect(() => {
        let newRows = []

        if (all_recipes && finished_recipes && active_recipe) {
            let index = 0;
            for (let recipe of finished_recipes) {
                let time = new Date(recipe.run_time * 1000).toISOString().substr(11, 8);
                let full_recipe = all_recipes[index];
                newRows[index] = {
                    id: index, 'progress': 100, 'recipe': recipe.name, 'type': full_recipe.type,
                    'sample': full_recipe.sample, run_time: time
                };
                index++;
            }

            if (index < all_recipes.length) {
                let time = new Date(active_recipe.run_time * 1000).toISOString().substr(11, 8);
                newRows[index] = {
                    id: index,
                    'progress': parseFloat(active_recipe.progress),
                    'recipe': active_recipe.name,
                    'type': all_recipes[index].type,
                    'sample': all_recipes[index].sample,
                    'run_time': time
                };
                index++;
            }

            while (index < all_recipes.length) {
                let item = all_recipes[index];
                newRows.push({
                    id: index, 'progress': 0, 'recipe': item.name, 'type': item.type, 'sample': item.sample,
                    'run_time': "0"
                })
                index++;
            }
        }
        setRows(newRows)
    }, [props.data])


    return (
        <div className="clearfix">
            <h5>Active: {active_job_id}</h5>
            <StripedTable
                rows={rows}
                columns={columns}
                noRowsText={"Nothing active"}
                height={300}
            />
            <Grid container justifyContent="flex-end">
                <LoadButton text={"Cancel"} icon={<Cancel/>} callback={async () => {
                    await postData(root_url + "/api/job/abort_active");
                }}>
                    <Cancel/>
                </LoadButton>
            </Grid>
            <hr/>
        </div>
    )
}

export function HardwareStatus() {

    const root_url = useContext(HiveUrl);
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")

    let [rbs_data,] = usePollData(root_url + "/api/rbs/status")

    let aml_x = rbs_data?.["aml_x_y"]?.["motor_1_position"];
    let aml_y = rbs_data?.["aml_x_y"]?.["motor_2_position"];
    let aml_phi = rbs_data?.["aml_phi_zeta"]?.["motor_1_position"];
    let aml_zeta = rbs_data?.["aml_phi_zeta"]?.["motor_2_position"];
    let aml_det = rbs_data?.["aml_det_theta"]?.["motor_1_position"];
    let aml_theta = rbs_data?.["aml_det_theta"]?.["motor_2_position"];
    let current = rbs_data?.["motrona"]?.["current(nA)"];
    let charge = rbs_data?.["motrona"]?.["charge(nC)"];
    let target_charge = rbs_data?.["motrona"]?.["target_charge(nC)"];

    let aml_moving = rbs_data?.["aml_x_y"]?.["busy"] || rbs_data?.["aml_phi_zeta"]?.["busy"] ||
        rbs_data?.["aml_det_theta"]?.["busy"];

    let [erd_data,] = usePollData(root_url + "/api/erd/status")

    let mdrive_z = erd_data?.["mdrive_z"]?.["motor_position"];
    let mdrive_theta = erd_data?.["mdrive_theta"]?.["motor_position"];
    let mpa3_ad1_count_rate = erd_data?.["mpa3"]?.["ad1"]?.["total_rate"];
    let mpa3_ad2_count_rate = erd_data?.["mpa3"]?.["ad2"]?.["total_rate"];
    let mdrive_moving = erd_data?.["mdrive_z"]?.["moving_to_target"] ||
        erd_data?.["mdrive_theta"]?.["moving_to_target"]

    return (<>
        <ScrollDialog title={"Load"} text={text} open={open} onClose={() => {
            setOpen(false)
        }}/>
        <h1>Hardware Status</h1>
        <h2>RBS</h2>
        <Chip label={`Position (x, y, phi, zeta, det, theta) =
                        (${aml_x}, ${aml_y}, ${aml_phi}, ${aml_zeta}, ${aml_det}, ${aml_theta})`}
                icon={<BusySpinner busy={aml_moving}/>}
        />
        <Chip label={`Current = ${current} nA`}/>
        <Chip label={`Charge = ${charge} nC -> ${target_charge} nC`}/>
        <SmallProgressButton text={"load"}
                             callback={async () => await postData(root_url + "/api/rbs/load?load=true")}/>
        <h2>ERD</h2>
        <Chip label={`Position (theta, z) = (${mdrive_theta}, ${mdrive_z})`} icon={<BusySpinner busy={mdrive_moving}/>}/>
        <Chip label={`AD1 count rate = ${mpa3_ad1_count_rate}`}/>
        <Chip label={`AD2 count rate = ${mpa3_ad2_count_rate}`}/>
        <SmallProgressButton text={"load"}
                             callback={async () => await postData(root_url + "/api/erd/load?load=true")}/>
    </>)
}

export function JobOverview() {
    const root_url = useContext(HiveUrl);
    let [state,] = usePollData(root_url + "/api/job/state", {})
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Jobs"))

    return (
        <div>
            <ScheduleJob/>
            <ScheduleTable schedule={state["schedule"]}/>
            <ProgressTable data={state}/>
            <HardwareStatus/>

        </div>
    );
}