import {usePollData} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {HiveUrl, NectarTitle} from "../App";
import {NumberInput} from "../components/elements";
import {Box, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
import {styled} from "@mui/material/styles";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {postData, sendRequest} from "../http_helper";
import Button from "@mui/material/Button";


export function RbsOverview() {
    const root_url = useContext(HiveUrl);
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("RBS Overview"))

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
    let counting = rbs_data?.["mot"]

    let aml_moving = rbs_data?.["aml_x_y"]?.["busy"] || rbs_data?.["aml_phi_zeta"]?.["busy"] ||
        rbs_data?.["aml_det_theta"]?.["busy"];
    let boards = rbs_data?.["caen"]?.["boards"]


    let positionControl = [
        [`X`, rbs_data?.aml_x_y?.motor_1_position],
        [`Y`, rbs_data?.aml_x_y?.motor_1_position],
        [`Phi`, rbs_data?.aml_x_y?.motor_1_position],
        [`Zeta`, rbs_data?.aml_x_y?.motor_1_position],
        [`Detector`, rbs_data?.aml_x_y?.motor_1_position],
        [`Theta`, rbs_data?.aml_x_y?.motor_1_position]
            // <NumberInput key={'Theta'} buttonLabel={"go"}
            //              callback={async (input) => await postData(
            //                  root_url + "/api/rbs/position", {"theta": input})}/>],

    ]

    let dacq_control = [
        [`Counting`, rbs_data?.["motrona"]?.["status"]],
        [`Charge`, rbs_data?.["motrona"]?.["charge(nC)"]],
        [`Target charge`, rbs_data?.["motrona"]?.["target_charge(nC)"]],
    ]



    if (boards) {
        for (const [board_id, board_value] of Object.entries(boards)) {
            dacq_control.push(['Board ' + board_id + ' Gate', board_value["s_in"].toString()])
        }
    }


    return (<div>
        <Box sx={{ flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <h5>Position Coordinates</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height:"300px"}}>
                        <Grid container>
                            <GridHeader header={["Identifier", "Value"]}/>
                            <GridTemplate rows={positionControl}/>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <h5>Data Acquisition Status</h5>
                    <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height:"300px"}}>
                    <Grid container>
                        <GridHeader header={["Identifier", "Value"]}/>
                        <GridTemplate rows={dacq_control}/>
                    </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <h5>Control</h5>
                        <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px", height:"300px"}}>
                            <ButtonGroup variant="outlined" sx={{display: "flex"}} orientation="vertical" pa>
                            <Button>Clear & Start Counting</Button>
                            <Button>Pause Counting</Button>
                            <Button>Start acquisition</Button>
                            <Button>Stop acquisition</Button>
                                <ButtonGroup sx={{display:"flex", width:"100%", paddingTop:"8px"}}>
                                <TextField sx={{width:"90%"}} size="small" label={"Target Charge (nC)"}></TextField><Button sx={{whiteSpace: "nowrap"}}>Set</Button>
                                </ButtonGroup>
                                <ButtonGroup sx={{display:"flex", width:"100%", paddingTop:"8px"}}>
                                    <TextField sx={{width:"20%"}} label="X" size="small"></TextField>
                                    <TextField sx={{width:"20%"}} label="Y" size="small"></TextField>
                                    <TextField sx={{width:"20%"}} label="Phi" size="small"></TextField>
                                    <TextField sx={{width:"20%"}} label="Zeta" size="small"></TextField>
                                    <TextField sx={{width:"20%"}} label="Detector" size="small"></TextField>
                                    <TextField sx={{width:"20%"}} label="Theta" size="small"></TextField>
                                    <Button sx={{whitespace: "nowrap"}}>Move</Button>
                                </ButtonGroup>
                            </ButtonGroup>


                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper variant={"outlined"}>Graph goes here - todo</Paper>
                </Grid>
            </Grid>
        </Box>



        {/*[`${names?.[1]} Position`, data?.motor_2_position,*/}
        {/*<NumberInput key={names?.[1]} inputLabel={`Move to ${names?.[1]} Position`} buttonLabel={"go"}*/}
        {/*             callback={async (input) => await sendRequest({"set_m2_target_position": input})}/>]*/}
    </div>)
}
