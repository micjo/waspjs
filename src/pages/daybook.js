import React, {useContext, useState} from "react";
import {HiveUrl} from "../App";
import {usePollData} from "../components/generic_control";
import {NumberInput} from "../components/elements";
import {postData} from "../http_helper";
import {Box, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {styled} from "@mui/material/styles";
import {DataGrid, gridClasses} from "@mui/x-data-grid";
import Button from "@mui/material/Button";

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: "8px 8px 8px 8px",
    variant: "outlined",
    display: "flex",
    flexDirection: "column"
}));


export function InputField(props) {
    const [value, setValue] = useState(props.initialValue)

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (<TextField multiline value={value} onChange={handleChange} size="small" label={props.label} sx={{"paddingBottom":"8px"}}/>)
}


export function DayBook() {
    const root_url = useContext(HiveUrl);

    return (<div><h1> DayBook</h1>
        <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <h2>Acc-Beam</h2>
                    <StyledPaper>
                        <InputField initialValue={14.0} label={"Alphatross Focus Voltage (kV)"}/>
                        <InputField initialValue={0.15} label={"Alphatross Focus Current (mA)"}/>
                        <InputField initialValue={22.2} label={"Alphatross Bias Voltage (kV)"}/>
                        <InputField initialValue={0.12} label={"Alphatross Bias Current (mA)"}/>
                        <ButtonGroup variant="outlined">
                        <Button>Update</Button>
                        <Button>Download</Button>
                        <Button>Upload</Button>
                        <Button>Range...</Button>
                        </ButtonGroup>
                    </StyledPaper>
                </Grid>
                <Grid item xs={4}>
                    <h2>Dacq</h2>
                    <StyledPaper>
                        <InputField initialValue={"CsCl+W"} label={"Cathode Target"}/>
                        <InputField initialValue={20.0} label={"Bias Voltage (kV)"}/>
                        <InputField initialValue={0.12} label={"Bias Current (mA)"}/>
                        <InputField initialValue={14.0} label={"Focus Voltage (kV)"}/>
                        <ButtonGroup variant="outlined">
                            <Button>Update</Button>
                            <Button>Download</Button>
                            <Button>Upload</Button>
                            <Button>Range...</Button>
                        </ButtonGroup>
                    </StyledPaper>
                </Grid>

                <Grid item xs={4}>
                <h2>ERDcalcheck</h2>
                    <StyledPaper>
                        <InputField initialValue={"CsCl+W"} label={"Cathode Target"}/>
                        <InputField initialValue={20.0} label={"Bias Voltage (kV)"}/>
                        <InputField initialValue={0.12} label={"Bias Current (mA)"}/>
                        <InputField initialValue={14.0} label={"Focus Voltage (kV)"}/>
                        <InputField initialValue={0.0} label={"Focus Current (mA)"}/>
                        <ButtonGroup variant="outlined">
                            <Button>Update</Button>
                            <Button>Download</Button>
                            <Button>Upload</Button>
                            <Button>Range...</Button>
                        </ButtonGroup>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12}>
                    <h2>Advanced</h2>
                    <StyledPaper>
                        <ButtonGroup variant="outlined">
                        <Button>Download daybook table (CSV)</Button>
                        <Button>Download daybook format table (CSV)</Button>
                        <Button>Update Format</Button>
                        <Button>Add Format</Button>
                        </ButtonGroup>
                    </StyledPaper>
                </Grid>
            </Grid>
        </Box>
    </div>
)
}
