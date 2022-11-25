import {grey} from "@mui/material/colors";
import {Grid} from "@mui/material";
import React from "react";

export function GridTemplate(props)
{
    let even = false;
    let grid_rows = []

    let key = 0
    for (let row of props.rows) {
        let backgroundColor = even ? grey[200] : 'background.paper'

        let grid_elements = row.length;
        let row_width = 12/grid_elements;

        for (let element of row) {
            grid_rows.push(<Grid p={0.5} item container alignItems={"center"} direction={"row"} key={key} bgcolor={backgroundColor} xs={row_width}>{element}</Grid>)
            key++;
        }

        even = !even
    }
    return <>{grid_rows}</>
}

export function GridHeader(props) {
    let width = 12 / props.header.length

    let title = []
    for (let item of props.header) {
        title.push(<Grid item={true} xs={width} key={item} sx={{fontWeight: 'bold', borderTop:1, borderBottom: 1}}>{item}</Grid>)
    }

    return <>{title}</>
}