import {usePollData} from "../components/generic_control";
import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {BackEndConfig, HiveUrl, MillConfig, NectarTitle} from "../App";
import {NumberInput, NumberInputNoButton, ProgressButton, SimpleNumberInput} from "../components/elements";
import {Box, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
import {styled} from "@mui/material/styles";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {postData, sendRequest, useSendRequestWithData} from "../http_helper";
import Button from "@mui/material/Button";
import {HistogramCaen} from "../components/histogram_caen";
import {ToastPopup} from "../components/toast_popup";
import {PollView} from "../components/poll_view";


const StyledTextField = styled(TextField)(({theme}) => ({
    width: "20%",
    size: "small"
}));


async function movePosition(url, first, second, setError) {
    if (!isNaN(first) && !isNaN(second)) {
        await sendRequest(url, {"set_m1_target_position": first, "set_m2_target_position": second}, setError)
    } else if (!isNaN(first)) {
        await sendRequest(url, {"set_m1_target_position": first}, setError)
    } else if (!isNaN(second)) {
        await sendRequest(url, {"set_m2_target_position": second}, setError)
    }
}


function PositionControl(props) {
    const [disabled, setDisabled] = useState(false)

    const [xPosition, setXPosition] = useState()
    const [yPosition, setYPosition] = useState()
    const [phiPosition, setPhiPosition] = useState()
    const [zetaPosition, setZetaPosition] = useState()
    const [detPosition, setDetPosition] = useState()
    const [thetaPosition, setThetaPosition] = useState()

    return (
        <ButtonGroup sx={{display: "flex", width: "100%", paddingTop: "8px"}}>
            <SimpleNumberInput inputLabel="X" setDisabled={setDisabled} setInput={setXPosition}/>
            <SimpleNumberInput inputLabel="Y" setDisabled={setDisabled} setInput={setYPosition}/>

            <SimpleNumberInput inputLabel="Phi" setDisabled={setDisabled} setInput={setPhiPosition}/>
            <SimpleNumberInput inputLabel="Zeta" setDisabled={setDisabled} setInput={setZetaPosition}/>

            <SimpleNumberInput inputLabel="Detector" setDisabled={setDisabled} setInput={setDetPosition}/>
            <SimpleNumberInput inputLabel="Theta" setDisabled={setDisabled} setInput={setThetaPosition}/>

            <ProgressButton disabled={disabled} text={"move"} callback={async () => {
                await Promise.all([
                        movePosition(props.aml_x_y_url, xPosition, yPosition, props.setError),
                        movePosition(props.aml_phi_zeta_url, phiPosition, zetaPosition, props.setError),
                        movePosition(props.aml_det_theta_url, detPosition, thetaPosition, props.setError)
                    ]
                )
            }}/>
        </ButtonGroup>)

}


function Control(props) {
    const config = useContext(BackEndConfig)
    let rbs_drivers = config?.mill?.rbs?.drivers
    let motrona_url = config.urls.mill + rbs_drivers?.motrona_charge?.proxy
    let aml_x_y_url = config.urls.mill + rbs_drivers?.aml_x_y?.proxy
    let aml_phi_zeta_url = config.urls.mill + rbs_drivers?.aml_phi_zeta?.proxy
    let aml_det_theta_url = config.urls.mill + rbs_drivers?.aml_det_theta?.proxy
    let caen_url = config.urls.mill + rbs_drivers?.caen?.proxy

    return (
        <ButtonGroup variant="outlined" sx={{display: "flex"}} orientation="vertical">
            <Button onClick={async () =>
                await sendRequest(motrona_url, {"clear-start_counting": true}, props.setError)
            }>Clear & Start Counting</Button>
            <Button onClick={async () =>
                await sendRequest(motrona_url, {"pause_counting": true}, props.setError)
            }>Pause Counting</Button>
            <Button onClick={async () =>
                await sendRequest(caen_url, {"start": true}, props.setError)
            }>Start Acquisition</Button>
            <Button onClick={async () =>
                await sendRequest(caen_url, {"stop": true}, props.setError)
            }>Stop Acquisition</Button>
            <Button onClick={async () =>
                await sendRequest(caen_url, {"clear": true}, props.setError)
            }>Clear Acquisition</Button>
            <Button onClick={async () => {
                await Promise.all([
                    sendRequest(aml_x_y_url, {"load": true}, props.setError),
                    sendRequest(aml_phi_zeta_url, {"load": true}, props.setError),
                    sendRequest(aml_det_theta_url, {"load": true}, props.setError)])
            }
            }>Move to load position</Button>

            <ButtonGroup sx={{display: "flex", width: "100%", paddingTop: "8px"}}>
                <NumberInput inputLabel={"New Target Charge"} buttonLabel={"Set"} callback={async (input) =>
                    await sendRequest(motrona_url, {"target_charge": input}, props.setError)}/>
            </ButtonGroup>
            <PositionControl aml_x_y_url={aml_x_y_url} aml_phi_zeta_url={aml_phi_zeta_url}
                             aml_det_theta_url={aml_det_theta_url} setError={props.setError}/>
        </ButtonGroup>
    )
}

export function RbsOverview() {
    const config = useContext(BackEndConfig)

    const [openDialog, setOpenDialog] = useState(false)
    const [error, setErrorMessage] = useState("")
    const nectarTitle = useContext(NectarTitle);
    useEffect(() => nectarTitle.setTitle("RBS Overview"))

    const setError = useCallback((errorMessage) => {
        setErrorMessage(errorMessage)
        setOpenDialog(true)
    }, [setErrorMessage, setOpenDialog])

    let [rbs_data,] = usePollData(config.urls.mill + "/api/rbs/status")
    let aml_moving = rbs_data?.["aml_x_y"]?.["busy"] || rbs_data?.["aml_phi_zeta"]?.["busy"] ||
        rbs_data?.["aml_det_theta"]?.["busy"];
    let boards = rbs_data?.["caen"]?.["boards"]


    let positionControl = [
        [`X`, rbs_data?.aml_x_y?.motor_1_position],
        [`Y`, rbs_data?.aml_x_y?.motor_2_position],
        [`Phi`, rbs_data?.aml_phi_zeta?.motor_1_position],
        [`Zeta`, rbs_data?.aml_phi_zeta?.motor_2_position],
        [`Detector`, rbs_data?.aml_det_theta?.motor_1_position],
        [`Theta`, rbs_data?.aml_det_theta?.motor_2_position],
        [`Moving`, aml_moving?.toString()]
    ]

    let dacq_status = [
        [`Counting`, rbs_data?.["motrona"]?.["status"]],
        [`Charge`, rbs_data?.["motrona"]?.["charge(nC)"]],
        [`Target charge`, rbs_data?.["motrona"]?.["target_charge(nC)"]],
        [`Acquiring`, rbs_data?.["caen"]?.["acquisition_active"].toString()],
    ]


    if (boards) {
        for (const [board_id, board_value] of Object.entries(boards)) {
            dacq_status.push(['Board ' + board_id + ' Gate', board_value["s_in"].toString()])
        }
    }


    return (<div>
        <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <h5>Position Coordinates</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <Grid container>
                            <GridHeader header={["Identifier", "Value"]}/>
                            <GridTemplate rows={positionControl}/>
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
                    <h5>Histogram</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <HistogramCaen setError={setError} initialDetector={"d01"}/>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <h5>Trending</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height: "350px"}}>
                        <PollView setError={setError} valueKey={"rbs_current"} keyStart={"rbs"}/></Paper>
                </Grid>
            </Grid>
        </Box>

        <ToastPopup text={error} open={openDialog} setOpen={setOpenDialog} severity={"error"}/>
    </div>)
}
