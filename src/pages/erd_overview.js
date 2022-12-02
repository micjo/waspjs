import {usePollData} from "../components/generic_control";
import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {BackEndConfig, HiveUrl, MillConfig, NectarTitle} from "../App";
import {NumberInput, NumberInputNoButton, ProgressButton, SimpleNumberInput, TextInput} from "../components/elements";
import {Box, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {sendRequest} from "../http_helper";
import Button from "@mui/material/Button";
import {HistogramCaen} from "../components/histogram_caen";
import {ToastPopup} from "../components/toast_popup";
import {PollView} from "../components/poll_view";


async function movePosition(url, pos, setError) {
    if (!isNaN(pos)) {
        await sendRequest(url, {"set_motor_target_position": pos}, setError)
    }
}

function PositionControl(props) {
    const [disabled, setDisabled] = useState(false)

    const [zPosition, setZPosition] = useState()
    const [thetaPosition, setThetaPosition] = useState()

    return (
        <ButtonGroup sx={{display: "flex", width: "100%", paddingTop: "8px"}}>
            <SimpleNumberInput inputLabel="Z" setDisabled={setDisabled} setInput={setZPosition}/>
            <SimpleNumberInput inputLabel="Theta" setDisabled={setDisabled} setInput={setThetaPosition}/>

            <ProgressButton disabled={disabled} text={"move"} callback={async () => {
                await Promise.all([
                        movePosition(props.mdrive_z_url, zPosition, props.setError),
                        movePosition(props.mdrive_theta_url, thetaPosition, props.setError),
                    ]
                )
            }}/>
        </ButtonGroup>)

}


function Control(props) {
    const config = useContext(BackEndConfig)
    let erd_drivers = config?.mill?.erd?.drivers
    let mdrive_z_url = config.urls.mill + erd_drivers?.mdrive_z?.proxy
    let mdrive_theta_url = config.urls.mill + erd_drivers?.mdrive_theta?.proxy
    let mpa3_url = config.urls.mill + erd_drivers?.mpa3?.proxy

    return (
        <ButtonGroup variant="outlined" sx={{display: "flex"}} orientation="vertical">
            <Button onClick={async () =>
                await sendRequest(mpa3_url, {"halt": true}, props.setError)
            }>Stop Acquisition</Button>
            <Button onClick={async () =>
                await sendRequest(mpa3_url, {"start": true}, props.setError)
            }>Start Acquisition</Button>
            <Button onClick={async () =>
                await sendRequest(mpa3_url, {"erase": true}, props.setError)
            }>Clear Acquisition</Button>
            <Button onClick={async () => {
                await Promise.all([
                    sendRequest(mdrive_z_url, {"load": true}, props.setError),
                    sendRequest(mdrive_theta_url, {"load": true}, props.setError)])
            }
            }>Move to load position</Button>

            <ButtonGroup sx={{display: "flex", width: "100%", paddingTop: "8px"}}>
                <TextInput inputLabel={"New Filename"} buttonLabel={"Set"} callback={async (input) =>
                    await sendRequest(mpa3_url, {"set_filename": input}, props.setError)}/>
            </ButtonGroup>
            <ButtonGroup sx={{display: "flex", width: "100%", paddingTop: "8px"}}>
                <NumberInput inputLabel={"Set Runtime"} buttonLabel={"Set"} callback={async (input) =>
                    await sendRequest(mpa3_url, {"set_run_time_setpoint": input}, props.setError)}/>
            </ButtonGroup>
            <PositionControl mdrive_z_url={mdrive_z_url} mdrive_theta_url={mdrive_theta_url} setError={props.setError}/>
        </ButtonGroup>
    )
}

export function ErdOverview() {
    const config = useContext(BackEndConfig)

    const [openDialog, setOpenDialog] = useState(false)
    const [error, setErrorMessage] = useState("")
    const nectarTitle = useContext(NectarTitle);
    useEffect(() => nectarTitle.setTitle("ERD Overview"))

    const setError = useCallback((errorMessage) => {
        setErrorMessage(errorMessage)
        setOpenDialog(true)
    }, [setErrorMessage, setOpenDialog])

    let [erd_data,] = usePollData(config.urls.mill + "/api/erd/status")
    let moving = erd_data?.["mdrive_z"]?.["moving_to_target"] || erd_data?.["mdrive_theta"]?.["moving_to_target"]

    let positionStatus = [
        [`Z`, erd_data?.["mdrive_z"]?.["motor_position"]],
        [`Theta`, erd_data?.["mdrive_theta"]?.["motor_position"]],
        [`Moving`, moving?.toString()]
    ]

    let dacq_status = [
        [`Acquiring `, erd_data?.["mpa3"]?.["acquisition_status"]?.["acquiring"].toString()],
        [`Run Time`, erd_data?.["mpa3"]?.["acquisition_status"]?.["run_time"]],
        [`Data File Stem`, erd_data?.["mpa3"]?.["data_file_stem"]],
    ]

    return (<div>
        <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <h5>Position Coordinates</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <Grid container>
                            <GridHeader header={["Identifier", "Value"]}/>
                            <GridTemplate rows={positionStatus}/>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <h5>Data Acquisition Status</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <Grid container>
                            <GridHeader header={["Identifier", "Value"]}/>
                            <GridTemplate rows={dacq_status}/>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <h5>Control</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <Control setError={setError}/>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <h5>AD1 count rate</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "400px"}}>
                        <PollView setError={setError} valueKey={"erd_ad1_count_rate"}/>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <h5>AD2 count rate</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "400px"}}>
                        <PollView setError={setError} valueKey={"erd_ad2_count_rate"}/>
                    </Paper>
                </Grid>
            </Grid>
        </Box>

        <ToastPopup text={error} open={openDialog} setOpen={setOpenDialog} severity={"error"}/>
    </div>)
}
