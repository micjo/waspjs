import React, {useContext, useState} from "react";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {
    ConditionalBadge,
    LoadButton,
    ModalView,
    ProgressSpinner,
    useModal,
    useReadOnlyData
} from "../components/generic_control";
import {ButtonSpinner, ClickableSpanWithSpinner} from "../components/input_elements";
import {postData} from "../http_helper";
import {BsCheck, BsDot, BsX, BsXSquare} from "react-icons/bs";
import {HiveUrl} from "../App";
import {BusySpinner} from "../components/generic_control";
import {useGenericPage, useGenericReadOnlyPage} from "./generic_page";


function AbortRunning(props) {
    return (
        <ClickableSpanWithSpinner callback={async () => {
            await postData(props.url, "")
        }}>
            <BsXSquare/>
        </ClickableSpanWithSpinner>);
}

function ScheduleTable(props) {
    let table = []
    if (Array.isArray(props.schedule) && props.schedule.length) {
        let index = 0;
        for (let item of props.schedule) {
            table.push(<TableRow key={item.job.job_id + index} items={[item.job.job_id]}/>)
            index++;
        }
    }
    return (
        <>
            <h5>Scheduled:
                <ClickableSpanWithSpinner callback={async () => {
                    await postData(props.url + "abort_schedule");
                }}>
                    <BsXSquare/>
                </ClickableSpanWithSpinner>
            </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function FileValidBadge(props) {
    if (props.fileValid === "valid") {
        return <span className="input-group-text bg-success">
                        <BsCheck style={{color: "white"}}/>
                </span>
    } else if (props.fileValid === "invalid") {
        return <span className="input-group-text bg-danger">
                        <BsX style={{color: "white"}}/>
                </span>
    } else {
        return <span className="input-group-text">
                        <BsDot/>
                </span>
    }
}

function ScheduleJob() {
    const [job, setJob] = useState({});
    let [modalMessage, show, setShow, cb] = useModal();
    const [filename, setFilename] = useState("");
    const [fileValid, setFileValid] = useState("");

    const root_url = useContext(HiveUrl);
    let url = root_url + "/api/job/"

    async function handleFileChange(e) {
        setFilename(e.target.files[0].name);
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(url + 'csv_conversion', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            cb(JSON.stringify(json_job));
            setFileValid("invalid");
            setJob({})
        } else {
            setJob(json_job);
            setFileValid("valid");
        }
    }

    async function scheduleJob() {
        await postData(url + "schedule", JSON.stringify(job))
        setJob({})
        setFilename("");
        setFileValid("")
    }

    return (
        <div className="clearfix">
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <div className="input-group mt-2 mb-2">
                <span className="input-group-text" id="inputGroup-sizing-sm">Add</span>
                <span className="input-group-text flex-grow-1">{filename}</span>
                <FileValidBadge fileValid={fileValid}/>
                <label className="btn btn-outline-primary align-middle">Upload CSV
                    <input type="file" id="csv_input" hidden
                           onClick={(e) => {
                               e.target.value = null;
                           }}
                           onChange={async (e) => await handleFileChange(e)}/>
                </label>
                <ButtonSpinner text="Schedule CSV" callback={scheduleJob}/>
            </div>
        </div>
    );
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function ProgressTable(props) {
    let all_recipes = props.data?.active_job?.job?.recipes;
    let finished_recipes = props.data?.active_job?.finished_recipes;
    let active_recipe = props.data?.active_job?.active_recipe;
    let active_job_id = props.data?.active_job?.job?.job_id;

    const root_url = useContext(HiveUrl);

    let table = []
    if (all_recipes && finished_recipes && active_recipe) {
        let index = 0;
        for (let recipe of finished_recipes) {
            let time = new Date(recipe.run_time * 1000).toISOString().substr(11, 8);
            let full_recipe = all_recipes[index];
            table[index] = <SuccessTableRow key={uuidv4()}
                                            items={[recipe.recipe_id, full_recipe.type, full_recipe.sample_id, time, "100%"]}/>
            index++;
        }

        if (index < all_recipes.length) {
            let time = new Date(active_recipe.run_time * 1000).toISOString().substr(11, 8);
            table[index] =
                <WarningTableRow key={uuidv4()}
                                 items={[active_recipe.recipe_id, all_recipes[index].type, all_recipes[index].sample_id, time,
                                     <ProgressSpinner text={active_recipe.progress}/>]}/>
            index++;
        }

        while (index < all_recipes.length) {
            let item = all_recipes[index];
            table.push(<TableRow key={uuidv4()} items={[item.file_stem, item.type, item.sample_id, "0", "0%"]}/>)
            index++;
        }
    }

    return (
        <div className="clearfix">
            <h5>Active: {active_job_id} <AbortRunning url={root_url + "/api/job/abort_active"}/></h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Recipe", "Type", "Sample id", "Run time", "Progress"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </div>
    )
}

function DoneTable(props) {
    let table = []
    let index = 0;


    if (Array.isArray(props.done) && props.done.length) {
        for (let item of props.done) {
            table.push(<TableRow key={item.job.job_id + index} items={[item.job.job_id]}/>)
            index++;
        }
    }
    return (
        <>
            <h5>Done: </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function FailedTable(props) {
    let table = []
    if (Array.isArray(props.failed) && props.failed.length) {
        let index = 0;
        for (let item of props.failed) {
            table.push(<TableRow key={item.job.job_id + index} items={[item.job.job_id, item.error_state]}/>)
            index++;
        }
    }
    return (
        <>
            <h5>Failed: </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name", "Failure"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function TitleBadge(props) {
    return (
        <span className={"badge bg-secondary me-2"}>{props.children}</span>
    );
}

function StatusBadge(props) {
    return (
        <span className={"badge bg-success me-2"}>{props.children}</span>
    );
}

export function HardwareStatus() {

    const root_url = useContext(HiveUrl);
    let [config, show, setShow, modalMessage] = useGenericPage(root_url+ "/api/rbs/status", "RBS")

    let aml_x = config.data?.["aml_x_y"]?.["motor_1_position"];
    let aml_y = config.data?.["aml_x_y"]?.["motor_2_position"];
    let aml_phi = config.data?.["aml_phi_zeta"]?.["motor_1_position"];
    let aml_zeta = config.data?.["aml_phi_zeta"]?.["motor_2_position"];
    let aml_det = config.data?.["aml_det_theta"]?.["motor_1_position"];
    let aml_theta = config.data?.["aml_det_theta"]?.["motor_2_position"];
    let current = config.data?.["motrona"]?.["current(nA)"];

    return (<>
        <ModalView show={show} setShow={setShow} message={modalMessage} />
        <h1>Hardware Status</h1>
        <div className="clearfix mb-2">
            <h4>
                <TitleBadge>RBS</TitleBadge>
                <LoadButton url={root_url + "/api/rbs/load"} popup={config.popup} setData={config.setData}/>
                <StatusBadge>Position (x,y,phi,zeta,det,theta) =
                    ({aml_x},{aml_y},{aml_phi},{aml_zeta},{aml_det},{aml_theta}) </StatusBadge>
                <StatusBadge>Current = {current} nA </StatusBadge>
                <StatusBadge>Event counter = </StatusBadge>
            </h4>
        </div>

        <div className="clearfix">
            <h4>
                <TitleBadge>ERD</TitleBadge>
                <ButtonSpinner text={"Load"} extraStyle={"me-2"}/>
                <StatusBadge>Position (phi, z) = </StatusBadge>
                <StatusBadge>AD1 count rate = </StatusBadge>
                <StatusBadge>AD2 count rate = </StatusBadge>
            </h4>
        </div>
    </>)
}

export function JobOverview() {
    const root_url = useContext(HiveUrl);
    let state = useReadOnlyData(root_url + "/api/job/state", {})

    let run_status = state?.["run_status"]
    let job_id = state?.["active_job"]?.["job"]?.["job_id"];

    return (
        <div>
            <div className="clearfix">
                <h3 className="float-start">Jobs</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={run_status + ": " + job_id}/>
                </h5>
            </div>

            <ScheduleJob/>
            <ScheduleTable/>
            <ProgressTable data={state}/>
            <DoneTable done={state["done"]}/>
            <FailedTable failed={state["failed"]}/>
            <HardwareStatus/>


        </div>
    );
}


