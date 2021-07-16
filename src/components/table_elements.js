import React from "react";

export function TableHeader(props) {
    const header = []
    let columnWidth = 100 / props.items.length;
    for (const item of props.items) {
        header.push(<th style={{width: columnWidth+"%"}} key={item}>{item}</th>)
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

export function SuccessTableRow(props) {
    let row = []
    for (let index in props.items){
        row.push(<td key={index}>{props.items[index]}</td>)
    }
    return <tr className="table-success">{row}</tr>
}

export function WarningTableRow(props) {
    let row = []
    for (let index in props.items){
        row.push(<td key={index}>{props.items[index]}</td>)
    }
    return <tr className="table-warning">{row}</tr>
}
