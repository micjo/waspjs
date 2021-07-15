import React, {useContext, useState} from "react";
import {Controllers} from "../App";
import {useAml} from "./aml";
import {ConditionalBadge, GenericCard, ModalView, useData, useModal} from "../components/generic_control";
import {ControllerContext} from "../App";
import {useMotrona} from "./motrona";
import {useCaen} from "./caen";
import {TableHeader} from "../components/table_elements";
import {postData} from "../http_helper";
import {ButtonSpinner} from "../components/input_elements";

function AmlCard(props) {
    let {config, show, setShow, modalMessage, table_extra, button_extra} =
        useAml(props.aml.url, props.aml.names, props.aml.loads)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function MotronaCard(props) {
    let {config, show, setShow, modalMessage, table_extra, button_extra} = useMotrona(props.motrona.url)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function CaenCard(props) {
    let {config, show, setShow, modalMessage, table_extra, button_extra} = useCaen(props.caen.url)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function RbsCard(props) {
    let url = "http://localhost:8000/api/rbs"
    let {data, setData, running} = useData(url + "/state");
    const [job, setJob] = useState({});
    let {modalMessage, show, setShow, cb} = useModal();

    async function handleFileChange(e) {
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch('http://localhost:8000/api/rbs/rqm_csv', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            let message = "Failed to parse csv. Error message:\n" + json_job;
            cb(message);
        }
        setJob(json_job);
    }

    return (
        <>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <div className="clearfix">
                <h3 className="float-start">RBS Experiment</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={data["run_status"]}/>
                </h5>
            </div>

            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Sample Id", "Type", "File Stem"]}/>
                <tbody>

                </tbody>
            </table>
            <div className="clearfix">
                <div className="btn-group float-end">
                    <ButtonSpinner text="Abort" callback={async () => {
                        await postData(url + "/abort", "")
                    }}/>
                    <ButtonSpinner text="Pause watchdir" callback={async () => {
                        await postData(url + "/pause_dir_scan", {"pause_dir_scan": true})
                    }}/>
                    <ButtonSpinner text="Resume watchdir" callback={async () => {
                        await postData(url + "/pause_dir_scan", {"pause_dir_scan": false})
                    }}/>
                    <label className="btn btn-outline-primary">
                   Upload CSV <input type="file" id="csv_input" hidden onClick={(e)=>{e.target.value= null;}}
                                     onChange={async (e) =>  await handleFileChange(e)}
                    />
                    </label>
                    <ButtonSpinner text="Run CSV" callback={async () => {
                        await postData(url + "/run", JSON.stringify(job))
                    }}/>
                </div>
            </div>
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
