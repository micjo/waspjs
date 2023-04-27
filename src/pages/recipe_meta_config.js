import React, {useCallback, useContext, useEffect, useState} from "react";
import {BackEndConfig, HiveUrl, NectarTitle} from "../App";
import {usePollData} from "../components/generic_control";
import {NumberInput} from "../components/elements";
import {getJson, getText, postData} from "../http_helper";
import {Box, ButtonGroup, Grid, Paper, TextField, Typography} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {styled} from "@mui/material/styles";
import {DataGrid, gridClasses} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {TextareaAutosize} from "@mui/material";
import {StripedTable} from "../components/table_templates";
import {LinearWithValueLabel} from "../components/linear_progress_with_label";
import {ToastPopup} from "../components/toast_popup";

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


export function RecipeMetaConfig() {
    const backendConfig = useContext(BackEndConfig);
    const daybookUrl = backendConfig.urls.db
    const millUrl = backendConfig.urls.mill
    const [daybook, setDaybook] = useState({})
    const [erdMeta, setErdMeta] = useState({})
    const [rbsMeta, setRbsMeta] = useState({})
    const [refresh, setRefresh] = useState(false)
    const [error, setErrorMessage] = useState("")
    const [openDialog, setOpenDialog] = useState(false)

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Config"))

    const setError = useCallback((errormessage) => {
        setErrorMessage(errormessage)
        setOpenDialog(true)
    }, [setErrorMessage, setOpenDialog])

    useEffect ( () => {
        const refresh = async () => {
            let status, json_response, text_response;
            [status, json_response] = await getJson(daybookUrl + "/daybook_json")
            setDaybook(json_response)
            if (status !== 200) {setError("Failed to contact db")}

            [status, text_response] = await getText(millUrl + '/api/erd/recipe_meta_template')
            setErdMeta(text_response)
            if (status !== 200) {setError("Failed to contact mill")}

            [status, text_response] = await getText(millUrl + '/api/rbs/recipe_meta_template')
            setRbsMeta(text_response)
            if (status !== 200) {setError("Failed to contact mill")}
        }
        refresh().then()
    }, [refresh, daybookUrl, millUrl, setError, setDaybook])


    let rows = []

    for (const [section,section_value] of Object.entries(daybook)) {
        for (const [key, value] of Object.entries(section_value)) {
            rows.push({id:section+"."+key, value:value})
            console.log({id:section+"."+key, value:value})
        }
    }

    const columns = [
        {field: 'id', headerName: "Identifier", flex: true},
        {field: 'value', headerName: "Current Value", flex: true}
    ]

    async function handleMetaUpload(e, setup_name) {
        let data = new FormData();
        data.append('file', e.target.files[0]);



        let response = await fetch(millUrl + "/api/" + setup_name + "/recipe_meta_template", {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            setError("Invalid toml - ignored")
        }
        setRefresh(true)
    }

    const handleMetaTemplateDownload = (setup_name) => {
        fetch(millUrl +'/api/' + setup_name + "/recipe_meta_template").then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = setup_name + '_meta_template.toml';
                alink.click();
            })
        })
    }

    const handleMetaFilledDownload = (setup_name) => {
        fetch(millUrl +'/api/' + setup_name + "/recipe_meta").then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = setup_name + '_meta.toml';
                alink.click();
            })
        })
    }

    return (<div>
            <ToastPopup text={error} open={openDialog} setOpen={setOpenDialog} severity={"error"}/>
            <Box sx={{flexGrow: 1}}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h2>RBS meta header</h2>
                        <StyledPaper>
                                <TextareaAutosize
                                    disabled
                                    style={{ maxWidth: "100%", height:"300px", marginBottom:"8px", overflow: 'auto'}}
                                    value={String(rbsMeta)}/>
                            <ButtonGroup variant="outlined">
                                <Button onClick={ () => handleMetaTemplateDownload("rbs")}>Download Template</Button>
                                <Button component="label" onClick={(e) => {e.target.value = null;}}
                                        onChange={async (e) => await handleMetaUpload(e, "rbs")}>
                                    Upload Template
                                    <input type="file" hidden/>
                                </Button>
                                <Button onClick={ () => handleMetaFilledDownload("rbs")}>Download Filled</Button>
                            </ButtonGroup>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={6}>
                        <h2>ERD meta header</h2>
                        <StyledPaper>
                            <TextareaAutosize
                                disabled
                                style={{ maxWidth: "100%", height:"300px", marginBottom:"8px", overflow: 'auto'}}
                                value={String(erdMeta)}/>
                            <ButtonGroup variant="outlined">
                                <Button onClick={ () => handleMetaTemplateDownload("erd")}>Download Template</Button>
                                <Button component="label" onClick={(e) => {e.target.value = null;}}
                                        onChange={async (e) => await handleMetaUpload(e, "erd")}>
                                    Upload Template
                                    <input type="file" hidden/>
                                </Button>
                                <Button onClick={ () => handleMetaFilledDownload("erd")}>Download Filled</Button>
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
                            hideFooter = {false}
                        />
                    </StyledPaper>
                </Grid>



            </Box>
        </div>
    )
}
