import React from "react";

export function TableHeader(props) {
    const header = []
    for (const item of props.items) {
        header.push(<th key={item}>{item}</th>)
    }
    return <thead><tr>{header}</tr></thead>
}

export function TableRow(props) {
    let row = []
    for (let index in props.items){
        row.push(<td key={index}>{props.items[index]}</td>)
    }
    return <tr>{row}</tr>
}
