import React from "react";

export function Dashboard() {
    return (
        <table className="table table-striped table-hover">
            <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Connection state</th>
                <th scope="col">Error State</th>
                <th scope="col">Last request id</th>
                <th scope="col">Other</th>
            </tr>
            </thead>
        </table>);
}
