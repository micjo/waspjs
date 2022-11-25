import React, {useContext, useEffect, useState} from "react";
import {HiveUrl, NectarTitle} from "../App";
import {usePollData} from "../components/generic_control";
import {NumberInput} from "../components/elements";
import {postData} from "../http_helper";
import {Box, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {styled} from "@mui/material/styles";
import {DataGrid, gridClasses} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {TextareaAutosize} from "@mui/material";
import {StripedTable} from "../components/table_templates";
import {LinearWithValueLabel} from "../components/linear_progress_with_label";

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: "8px 8px 8px 8px",
    variant: "outlined",
    display: "flex",
    flexDirection: "column"
}));


function InputField(props) {
    const [value, setValue] = useState(props.initialValue)

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (<TextField multiline value={value} onChange={handleChange} size="small" label={props.label} sx={{"paddingBottom":"8px"}}/>)
}



const rbs_header = ` % Comments
 % Title                 := {mill.recipe.name}_{mill.rbs.detector.name}
 % Section := <raw_data>
 *
 * Filename no extension := {mill.recipe.name}
 * DATE/Time             := {date}
 * MEASURING TIME[sec]   := {mill.recipe.measuring_time}
 * ndpts                 := 1024
 *
 * ANAL.IONS(Z)          := 4.00260
 * ANAL.IONS(symb)       := {daybook.acc_beam.primary_beam}
 * ENERGY[MeV]           := {daybook.acc_beam.energy}
 * Charge[nC]            := {mill.rbs.accumulated_charge}
 *
 * Sample ID             := {mill.recipe.sample}
 * Sample X              := {mill.rbs.x}
 * Sample Y              := {mill.rbs.y}
 * Sample Zeta           := {mill.rbs.zeta}
 * Sample Theta          := {mill.rbs.theta}
 * Sample Phi            := {mill.rbs.phi}
 * Sample Det            := {mill.rbs.detector}
 *
 * Detector name         := {mill.rbs.detector.name}
 * Detector ZETA         := {mill.rbs.detector.zeta}
 * Detector Omega[mSr]   := {mill.rbs.detector.omega}
 * Detector offset[keV]  := {mill.rbs.detector.offset}
 * Detector gain[keV/ch] := {mill.rbs.detector.gain}
 * Detector FWHM[keV]    := {mill.rbs.detector.fwhm}
 *
 % Section :=  </raw_data>
 % End comments 
`

const erd_header = ` % Comments
 % Title                 := {mill.recipe.name}
 % Section := <raw_data>
 *
 * Recipe name           := {mill.recipe.name}
 * DATE/Time             := {date}
 * MEASURING TIME[sec]   := {mill.recipe.measuring_time}
 *
 * ENERGY[MeV]           := {daybook.acc_beam.energy} MeV
 * Beam description      := {daybook.acc_beam.primary_beam}
 * Sample Tilt Degrees   := {daybook.erd_cal.sample_tilt}
 *
 * Sample ID             := {mill.erd_recipe.sample}
 * Sample Z              := {mill.erd.z}
 * Sample Theta          := {mill.erd.theta}
 * Z Start               := {mill.erd_recipe.z_start}
 * Z End                 := {mill.erd_recipe.z_end}
 * Z Increment           := {mill.erd_recipe.z_increment}
 * Z Repeat              := {mill.erd_recipe.z_repeat}
 *
 * Start time            := {mill.recipe.start_time}
 * End time              := {mill.recipe.end_time}
 *
 * Avg Terminal Voltage  := {daybook.acc_beam.terminal_voltage}
 *
 % Section :=  </raw_data>
 % End comments



`


export function Config() {
    const root_url = useContext(HiveUrl);
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Config"))

    const columns = [
        {field: 'id', headerName: "Identifier", flex: true},
        {field: 'value', headerName: "Current Value", flex: true}
    ]

    const rows = [
        {id:"mill.rbs.x", value:"20"},
        {id:"mill.rbs.y", value:"25"},
        {id:"mill.rbs.phi", value:"30"},
        {id:"mill.rbs.zeta", value:"10"},
        {id:"mill.rbs.det", value:"170"},
        {id:"mill.rbs.theta", value:"0.15"},
        {id:"mill.recipe.measuring_time", value:"0"},
        {id:"mill.recipe.start_time", value:"0"},
        {id:"mill.recipe.end_time", value:"0"},
        {id:"mill.recipe.name", value:""},
        {id:"mill.erd_recipe.z_start", value:"0"},
        {id:"mill.erd_recipe.z_end", value:"0"},
        {id:"mill.erd_recipe.z_increment", value:"0"},
        {id:"mill.erd_recipe.z_repeat", value:"0"},
        {id:"mill.rbs.detector", value:"[List] - 1 file created per detector"},
        {id:"mill.rbs.detector[0].name", value:"d01"},
        {id:"mill.rbs.detector[0].zeta", value:"0.2"},
        {id:"mill.rbs.detector[0].omega", value:"5"},
        {id:"mill.rbs.detector[0].offset", value:"5"},
        {id:"mill.rbs.detector[0].gain", value:"8"},
        {id:"mill.rbs.detector[0].fwhm", value:"17.5"},
        {id:"daybook.acc_beam.focus_voltage", value:"14.0"},
        {id:"daybook.acc_beam.focus_current", value:"0.15"},
        {id:"daybook.acc_beam.bias_voltage", value:"22.2"},
        {id:"daybook.acc_beam.bias_current", value:"0.12"},
        {id:"daybook.acc_beam.primary_beam", value:"5"},
        {id:"daybook.acc_beam.energy", value:"6"},
        {id:"daybook.acc_beam.terminal_voltage", value:"6"},
    ]

    return (<div>
            <Box sx={{flexGrow: 1}}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h2>RBS Data header</h2>
                        <StyledPaper>
                            <TextareaAutosize
                                style={{ maxWidth: "100%", height:"600px", marginBottom:"8px"}}
                            >{rbs_header}

                            </TextareaAutosize>
                            <ButtonGroup variant="outlined">
                                <Button>Update</Button>
                                <Button>Download Template</Button>
                                <Button>Download Filled</Button>
                                <Button>Upload</Button>
                            </ButtonGroup>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={6}>
                        <h2>ERD Data header</h2>
                        <StyledPaper>
                            <TextareaAutosize
                                style={{ maxWidth: "100%", height:"600px", marginBottom:"8px"}}
                            >{erd_header}</TextareaAutosize>
                            <ButtonGroup variant="outlined">
                                <Button>Update</Button>
                                <Button>Download Template</Button>
                                <Button>Download Filled</Button>
                                <Button>Upload</Button>
                            </ButtonGroup>
                        </StyledPaper>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <h2>Available Data</h2>
                    <StyledPaper>
                        <StripedTable
                            height={400}
                            rows={rows}
                            columns = {columns}
                        />
                    </StyledPaper>
                </Grid>



            </Box>
        </div>
    )
}
