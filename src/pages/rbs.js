import React from "react";
import {AmlCard} from "../components/card_aml";
import MotronaCard from "../components/card_motrona";
import {CaenCard} from "../components/card_caen";
import RbsCard from "../components/card_rbs";

export function Rbs() {
    return (
        <div className="row">
            <div className="col-sm">
                <AmlCard names={["X","Y"]} url="http://localhost:8000/api/aml_x_y" />
                <AmlCard names={["Phi","Zeta"]} url="http://localhost:8000/api/aml_phi_zeta" />
                <AmlCard names={["Det","Theta"]} url="http://localhost:8000/api/aml_det_theta" />
                <MotronaCard url="http://localhost:8000/api/motrona_rbs"/>
                <CaenCard url="http://localhost:8000/api/caen_rbs"/>
            </div>
            <div className="col-sm">
                <RbsCard url="http://localhost:8000/api/rbs/state"/>
            </div>
        </div>
    );
}
