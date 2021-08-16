import React, {useContext, useState} from "react";
import {Controllers} from "../App";
import {useAml} from "./aml";
import {
    ProgressSpinner,
    ConditionalBadge,
    GenericCard,
    ModalView,
    useModal,
    useReadOnlyData
} from "../components/generic_control";
import {ControllerContext} from "../App";
import {useMotrona} from "./motrona";
import {useCaen} from "./caen";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {postData} from "../http_helper";
import {ButtonSpinner} from "../components/input_elements";
import {HistogramCaen} from "../components/histogram_caen";

function AmlCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] =
        useAml(props.aml.url, props.aml.names, props.aml.loads)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function MotronaCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMotrona(props.motrona.url)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function CaenCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useCaen(props.caen.url)
    let histogram = <HistogramCaen url={props.caen.url}/>

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}
                         extra={histogram}/>
        </ControllerContext.Provider>);
}

const exection = {
    TODO: "TODO",
    DOING: "DOING",
    DONE: "DONE"
}

function ProgressTable(props) {

    let table = []
    if (!props.data["rqm"]) {
        return <></>
    }
    let itemExecuting = exection.DONE;
    for (let item of props.data.rqm.recipes) {
        if (item.sample_id === props.data.active_recipe) {
            itemExecuting = exection.DOING;
        }
        if (itemExecuting === exection.TODO) {
            table.push(<TableRow key={item.file_stem} items={[item.sample_id, item.type, item.file_stem, "0%"]}/>)
        }
        if (itemExecuting === exection.DONE) {
            table.push(<SuccessTableRow key={item.file_stem} items={[item.sample_id, item.type, item.file_stem, "100%"]}/>)
        }
        if (itemExecuting === exection.DOING) {
            let fraction = parseFloat(props.data.accumulated_charge)/ parseFloat(props.data.accumulated_charge_target);
            let percentage = (fraction * 100).toFixed(2);
            table.push(<WarningTableRow key={item.file_stem} items={[item.sample_id, item.type, item.file_stem,
                <ProgressSpinner text={percentage + "%"}/>]}/>
            )
            itemExecuting = exection.TODO;
        }
    }

    return (
        <>
            <h5>RQM: {props.data.rqm.rqm_number}</h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Sample Id", "Type", "File Stem", "Active"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </>
    )
}

function ScheduleTable(props) {
    let table = []
    if (Array.isArray(props.schedule) && props.schedule.length) {
         for (let item of props.schedule) {
             table.push(<TableRow key={item} items={[item]} />)
         }
    }


    return (
        <>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </>
    )

}

function RbsCard() {
    let url = "/hive/api/rbs"
    let data = useReadOnlyData(url + "/state");
    let schedule = useReadOnlyData(url + "/schedule")
    const [job, setJob] = useState({});
    let [modalMessage, show, setShow, cb] = useModal();

    async function handleFileChange(e) {
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(url + '/rqm_csv', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            let message = <>Failed to parse csv. <br/>Error message:
                            <div className="alert alert-dark text-monospace">{json_job}</div></>;
            cb(message);
        }
        setJob(json_job);
    }


    async function scheduleRqm() {
        await postData(url + "/run", JSON.stringify(job))
    }

    let rqm_number = "";
    let run_status = "";
    if (data["run_status"]) {
        run_status = data["run_status"]
    }
    if (data["rqm"]) {
        rqm_number = data["rqm"]["rqm_number"]
    }

    return (
        <>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <div className="clearfix">
                <h3 className="float-start">RBS Experiment</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={run_status + ": " + rqm_number}/>
                </h5>
            </div>

            <ProgressTable data={data}/>

            <div className="clearfix">
                <div className="btn-group float-end">
                    <ButtonSpinner text="Abort" callback={async () => {
                        await postData(url + "/abort", "")
                    }}/>
                    <label className="btn btn-outline-primary">
                        Upload CSV <input type="file" id="csv_input" hidden onClick={(e) => {
                        e.target.value = null;
                    }}
                                          onChange={async (e) => await handleFileChange(e)}
                    />
                    </label>
                    <ButtonSpinner text="Schedule CSV" callback={scheduleRqm}/>
                </div>
            </div>
            <h5>RBS Schedule</h5>
            <ScheduleTable schedule={schedule}/>
        </>);

}


export function Rbs() {
    let context = useContext(Controllers);

    return (
        <div className="row">
            <div className="col-sm">
                <AmlCard aml={context.aml_x_y} collapse={1}/>
                <AmlCard aml={context.aml_det_theta} collapse={2}/>
                <AmlCard aml={context.aml_phi_zeta} collapse={3}/>
                <MotronaCard motrona={context.motrona_rbs} collapse={4}/>
                <CaenCard caen={context.caen_rbs} collapse={5}/>
            </div>
            <div className="col-sm">
                <RbsCard/>
            </div>

        </div>
    );
}
