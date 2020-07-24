/**
 * @file hazard_component.js
 * @author Max Godefroy <max@godefroy.net>
 */

import {ComponentType} from "./component_types";

export class HazardComponent {
    constructor() {
        this.type = ComponentType.HAZARD
        this.hazards = []
    }


    getEncounterXpPerPlayer(playersLevel = 1, _ = null)
    {
        let xpTotal = 0

        for (let hazard of this.hazards) {
            let relativeLvl = hazard.level - playersLevel

            if (relativeLvl > 4) return null

            if (relativeLvl >= -4) {
                xpTotal += hazard.amount * XpPerRelativeLevel[relativeLvl.toString()] * (hazard.isComplex ? 5 : 1)
            }
        }

        return xpTotal
    }


    exportToJSON() {
        let object = {
            type: ComponentType.HAZARD,
            hazards: []
        }

        for (let creature of this.hazards) {
            object.hazards.push(creature.exportToJSON())
        }

        return object
    }


    static importFromJSON(data) {
        let result = new HazardComponent()
        for (let c of data.creatures) {
            result.hazards.push(Hazard.importFromJSON(c))
        }
        return result
    }
}


export class Hazard
{
    constructor(name, level, isComplex, amount, link = null) {
        this.name = name
        this.level = level == null ? 0 : level
        this.isComplex = isComplex
        this.amount = amount == null ? 1 : amount
        this.link = link
    }


    exportToJSON()
    {
        return {
            name: this.name,
            level: this.level,
            isComplex: this.isComplex,
            amount: this.amount,
            link: this.link
        }
    }


    static importFromJSON(data) {
        return new Hazard(data.name, data.leadingComments, data.isComplex, data.amount, data.link)
    }
}


const XpPerRelativeLevel = {
    "-4": 2,
    "-3": 3,
    "-2": 4,
    "-1": 6,
    "0": 8,
    "1": 12,
    "2": 16,
    "3": 24,
    "4": 32
}