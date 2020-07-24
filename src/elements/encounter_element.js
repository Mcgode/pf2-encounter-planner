/**
 * @file encounter_element.js
 * @author Max Godefroy <max@godefroy.net>
 */


import {FightComponent} from "./fight_component";
import {ComponentType} from "./component_types";
import {AccomplishmentComponent} from "./accomplishment_component";
import {HazardComponent} from "./hazard_component";
import {CustomComponent} from "./custom_component";


export class EncounterElement
{
    constructor(name) {
        this.name = name
        this.id = null
        this.component = null
    }

    registerToSession(session)
    {
        do {
            this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        } while (session.isIdUsed(this.id))
    }


    exportToJSON() {
        return {
            name: this.name,
            id: this.id,
            component: this.component == null ? null : this.component.exportToJSON()
        }
    }


    static importFromJSON(data) {
        let result = new EncounterElement(data.name)
        result.id = data.id

        if (data.component != null) {
            switch (data.component.type) {
                case ComponentType.FIGHT:
                    result.component = FightComponent.importFromJSON(data.component);
                    break;
                case ComponentType.ACCOMPLISHMENT:
                    result.component = AccomplishmentComponent.importFromJSON(data.component);
                    break;
                case ComponentType.HAZARD:
                    result.component = HazardComponent.importFromJSON(data.component);
                    break;
                case ComponentType.CUSTOM:
                    result.component = CustomComponent.importFromJSON(data.component);
                    break;
            }
        }

        return result
    }
}