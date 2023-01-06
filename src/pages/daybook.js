import React, {useCallback, useContext, useEffect, useState} from "react";
import {BackEndConfig, HiveUrl, NectarTitle} from "../App";
import {usePollData} from "../components/generic_control";
import {NumberInput} from "../components/elements";
import {getJson, postData} from "../http_helper";
import {Box, ButtonGroup, Grid, IconButton, Paper, TextField} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {styled} from "@mui/material/styles";
import {DataGrid, gridClasses} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {PollView} from "../components/poll_view";
import {ToastPopup} from "../components/toast_popup";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Upload} from "@mui/icons-material";


const StyledPaper = styled(Paper)(({theme}) => ({
    padding: "8px 8px 8px 8px",
    variant: "outlined",
    display: "flex",
    flexDirection: "column"
}));


const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));


export function InputField(props) {
    const [value, setValue] = useState(props.initialValue)

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (<TextField multiline value={value} onChange={handleChange} size="small" label={props.label} sx={{"paddingBottom":"8px"}}/>)
}

function DaybookSectionOverview(props) {
    const [expanded, setExpanded] = useState(false)

    console.log(props.value)
    let rows = []

    for (const [key,value] of Object.entries(props.value)) {
        rows.push([key, value])
    }

    return (
        <Grid item xs={4} key={props.title}>
            <h5>{props.title}
                <ExpandMore
                    expand={expanded}
                    onClick={()=>setExpanded(!expanded)}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </ExpandMore>
            </h5>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper variant={"outlined"} sx={{padding: "8px 8px 8px 8px"}}>
                    <Grid container>
                    <GridHeader header={["Identifier", "Value"]}/>
                    <GridTemplate rows={rows}/>
                    </Grid>
            </Paper>
            </Collapse>
        </Grid>)
}


function DaybookOverview(props) {
    let sections = []

    for (const [key, value] of Object.entries(props.daybook)) {
        sections.push(<DaybookSectionOverview key={key} title={key} value={value}/>)
    }

    return <>
        {sections}
    </>
}


export function DayBook() {
    const backendConfig = useContext(BackEndConfig);
    const daybookUrl = backendConfig.urls.db

    const [daybook, setDaybook] = useState({})
    const [refresh, setRefresh] = useState(false)
    const [error, setErrorMessage] = useState("")
    const [openDialog, setOpenDialog] = useState(false)

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Daybook"))

    const setError = useCallback((errorMessage) => {
        setErrorMessage(errorMessage)
        setOpenDialog(true)
    }, [setErrorMessage, setOpenDialog])

    useEffect ( () => {
        const getDayBook = async () => {
            let [status, json_response] = await getJson(daybookUrl + "/daybook_json")
            setDaybook(json_response)
            if (status !== 200) {
                setError("Failed to contact daybook")
            }
        }
        getDayBook().then()
    }, [refresh, daybookUrl, setError, setDaybook])


    const onButtonClick = () => {
        fetch(daybookUrl +'/daybook').then(response => {
            response.blob().then(blob => {
                // Creating new object of PDF file
                const fileURL = window.URL.createObjectURL(blob);
                // Setting various property values
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = 'daybook.toml';
                alink.click();
            })
        })
    }


    async function handleDayBookUpload(e) {
        let filename = e.target.files[0].name;
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(daybookUrl + "/" + 'daybook', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            console.log(JSON.stringify(json_job))
            setError("Invalid toml - ignored")
        }
        setRefresh(true)
    }


    return (<div><h1> DayBook</h1>
            <Box sx={{flexGrow: 1, marginBottom: "20px"}}>
                <Grid container spacing={2}>
            <DaybookOverview daybook={daybook}/>
                </Grid>
            </Box>
            <ButtonGroup variant="outlined">
                <Button onClick={onButtonClick}>Download Daybook</Button>
                <Button component="label" onClick={(e) => {e.target.value = null;}}
                        onChange={async (e) => await handleDayBookUpload(e)}>
                    Upload Daybook
                    <input type="file" hidden/>
                </Button>
            </ButtonGroup>
            <ToastPopup text={error} open={openDialog} setOpen={setOpenDialog} severity={"error"}/>

    </div>
)
}
