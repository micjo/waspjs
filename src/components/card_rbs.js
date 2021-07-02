import RootCard from "./minimal_card";
import React from "react";


export default function RbsCard(props) {
    let data = {}
    return (
        <RootCard title="RBS" prefix="rbs" brief_status="brief_status" HwResponse={data} active={false}
                  sanity_status="brief" url={props.url}>
        </RootCard>);

}