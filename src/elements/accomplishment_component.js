/**
 * @file accomplishment_component.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {ComponentType} from "./component_types";


export class AccomplishmentComponent
{
    constructor(level = AccomplishmentLevel.MINOR) {
        this.type = ComponentType.ACCOMPLISHMENT
        this.level = level
    }


    getEncounterXpPerPlayer() {
        switch (this.level) {
            case AccomplishmentLevel.MAJOR:
                return 80
            case AccomplishmentLevel.MODERATE:
                return 30
            default:
                return 10
        }
    }


    exportToJSON()
    {
        return {
            type: this.type,
            level: this.level,
        }
    }


    static importFromJSON(data)
    {
        return new AccomplishmentComponent(data.level)
    }
}


export const AccomplishmentLevel = {
    MINOR: "Minor accomplishment",
    MODERATE: "Moderate accomplishment",
    MAJOR: "Major accomplishment"
}