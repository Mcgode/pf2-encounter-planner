/**
 * @file custom_component.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {ComponentType} from "./component_types";


export class CustomComponent
{
    constructor(xp) {
        this.type = ComponentType.CUSTOM
        this.xp = xp
    }

    getEncounterXpPerPlayer() {
        return parseInt(this.xp)
    }


    getTooltip()
    {
        return ""
    }


    exportToJSON() {
        return {
            type: this.type,
            xp: this.xp
        }
    }


    static importFromJSON(data) {
        return new CustomComponent(data.xp)
    }
}