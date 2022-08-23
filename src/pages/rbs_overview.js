import React, {useContext, useState} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {useAml} from "./aml";
import {
    ProgressSpinner,
    ConditionalBadge,
    GenericCard,
    FailureModal,
    useModal,
    useReadOnlyData
} from "../components/generic_control";
import {ControllerContext} from "../App";
import {useMotrona} from "./motrona";
import {useCaen} from "./caen";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {postData, getUniqueIdentifier} from "../http_helper";
import {ProgressButton, ClickableSpanWithSpinner} from "../components/elements";
import {HistogramCaen} from "../components/histogram_caen";
import {BsCheck, BsDot, BsX, BsXSquare} from "react-icons/bs";

function AmlCard(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hw.proxy;

    let [config, show, setShow, modalMessage, table_extra, button_extra] =
        useAml(url, props.hw.names, props.hw.loads, props.hw.title)

    return (
        <ControllerContext.Provider value={config}>
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function MotronaCard(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hw.proxy;

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMotrona(url, props.hw.title)

    return (
        <ControllerContext.Provider value={config}>
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function CaenCard(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hw.proxy;

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useCaen(url, props.hw.title)
    let histogram = <HistogramCaen url={url}/>

    return (
        <ControllerContext.Provider value={config}>
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}
                         extra={histogram}/>
        </ControllerContext.Provider>);
}

function ProgressTable(props) {

    let all_recipes = props.data.active_rqm?.rqm?.recipes;
    let finished_recipes = props.data.active_rqm?.finished_recipes;
    let active_recipe = props.data.active_rqm?.active_recipe;

    let table = []
    if (all_recipes && finished_recipes && active_recipe) {


        let index = 0;
        for (let recipe of finished_recipes) {
            let time = new Date(recipe.run_time * 1000).toISOString().substr(11, 8);
            let full_recipe = all_recipes[index];
            table[index] = <SuccessTableRow key={recipe.recipe_id}
                                            items={[recipe.recipe_id, full_recipe.type, full_recipe.sample_id, time, "100%"]}/>
            index++;
        }

        if (index < all_recipes.length) {
            let time = new Date(active_recipe.run_time * 1000).toISOString().substr(11, 8);
            let fraction = parseFloat(active_recipe.accumulated_charge_corrected) / parseFloat(active_recipe.accumulated_charge_target);
            let percentage = (fraction * 100).toFixed(2);
            table[index] =
                <WarningTableRow key={active_recipe.recipe_id}
                                 items={[active_recipe.recipe_id, all_recipes[index].type, all_recipes[index].sample_id, time,
                                     <ProgressSpinner text={percentage + "%"}/>]}/>
            index++;
        }

        while (index < all_recipes.length) {
            let item = all_recipes[index];
            table.push(<TableRow key={item.file_stem} items={[item.file_stem, item.type, item.sample_id, "0", "0%"]}/>)
            index++;
        }
    }

    return (
        <div className="clearfix">
            <h5>Active: {props.data.active_rqm.job_id} <AbortRunning url={props.url}/></h5>
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

function ScheduleTable(props) {
    let table = []
    if (Array.isArray(props.schedule) && props.schedule.length) {
        let index = 0
        for (let item of props.schedule) {
            table.push(<TableRow key={item.rqm.job_id + index} items={[item.rqm.job_id,
            ]}/>)
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

function DoneTable(props) {
    let table = []
    let index = 0;


    if (Array.isArray(props.done) && props.done.length) {
        for (let item of props.done) {
            table.push(<TableRow key={item.rqm.job_id + index} items={[item.rqm.job_id]}/>)
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
            table.push(<TableRow key={item.rqm.job_id + index} items={[item.rqm.job_id, item.error_state]}/>)
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

function HardwareCards() {
    let hardwareCards = []
    let hiveConfig = useContext(HiveConfig);

    for (let [key, item] of Object.entries(hiveConfig['rbs']['hardware'])) {
        if (item.type === "aml") {
            hardwareCards.push(<AmlCard hw={item} collapse={key} key={key}/>)
        }
        if (item.type === "motrona") {
            hardwareCards.push(<MotronaCard hw={item} collapse={key} key={key}/>)
        }
        if (item.type === "caen") {
            hardwareCards.push(<CaenCard hw={item} collapse={key} key={key}/>)
        }
    }
    return (<> {hardwareCards} </>);
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

function ScheduleRbs(props) {
    let url = props.url;
    const [job, setJob] = useState({});
    let [modalMessage, show, setShow, cb] = useModal();
    const [filename, setFilename] = useState("");
    const [fileValid, setFileValid] = useState("");

    async function handleFileChange(e) {
        setFilename(e.target.files[0].name);
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(url + 'rqm_csv', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            let message = <>Failed to parse csv. <br/>Error message:
                <div className="alert alert-dark text-monospace">{json_job}</div></>;
            cb(message);
            setFileValid("invalid");
            setJob({})
        } else {
            setJob(json_job);
            setFileValid("valid");
        }
    }

    async function scheduleRqm() {
        await postData(url + "run", JSON.stringify(job))
        setJob({})
        setFilename("");
        setFileValid("")
    }

    return (
        <div className="clearfix">
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
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
                <ProgressButton text="Schedule CSV" callback={scheduleRqm}/>
            </div>
        </div>
    );
}

function RbsExperiment() {
    const root_url = useContext(HiveUrl);

    let url = root_url + "/api/rbs/"
    let initialState = {
        "queue": [], "active_rqm": {"recipes": [], "job_id": "", "detectors": []}, "active_rqm_status": []
    }
    let state = useReadOnlyData(url + "state", initialState);

    let run_status = state?.["run_status"]
    let job_id = state?.["active_rqm"]?.["rqm"]?.["job_id"];
    if (!job_id) {
        job_id = "None";
    }

    return (
        <div>
            <div className="clearfix">
                <h3 className="float-start">RBS RQM</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={run_status + ": " + job_id}/>
                </h5>
            </div>
            <ScheduleRbs url={url}/>
            <RbsControl url={url}/>
            <hr/>
            <ScheduleTable schedule={state["schedule"]} url={url}/>
            <ProgressTable data={state} url={url}/>
            <DoneTable done={state["done"]}/>
            <FailedTable failed={state["failed"]}/>
        </div>);
}

function RbsControl(props) {
    return (
        <div>
            <div className="clearfix">
                <div className="float-end btn-group">
                    <ProgressButton text="Get Logs" callback={async () => {
                        let response = await fetch(props.url + "logs");
                        let blob = await response.blob()
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = getUniqueIdentifier() + "_logs.txt";
                        link.click();
                    }}/>
                </div>
            </div>
        </div>
    );
}


export function RbsOverview() {

    return (
        <div className="row">
            <div className="col-sm">
                <RbsExperiment/>
            </div>
            <div className="col-sm">
                <HardwareCards/>
            </div>

        </div>
    );
}

function AbortRunning(props) {
    return (
        <ClickableSpanWithSpinner callback={async () => {
            await postData(props.url + "abort_active", "")
        }}>
            <BsXSquare/>
        </ClickableSpanWithSpinner>);
}
