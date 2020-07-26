/**
 * @file hazard_component.js
 * @author Max Godefroy <max@godefroy.net>
 */

import {ComponentType} from "./component_types";

export class HazardComponent {
    constructor(expectedLevel = 1) {
        this.type = ComponentType.HAZARD
        this.expectedLevel = expectedLevel
        this.hazards = []
    }


    getEncounterXpPerPlayer()
    {
        let xpTotal = 0

        for (let hazard of this.hazards) {
            if (hazard.level != null && hazard.amount != null) {
                let relativeLvl = hazard.level - this.expectedLevel

                if (relativeLvl > 4) return null

                if (relativeLvl >= -4) {
                    xpTotal += hazard.amount * XpPerRelativeLevel[relativeLvl.toString()] * (hazard.isComplex ? 5 : 1)
                }
            }
        }

        return xpTotal
    }


    exportToJSON() {
        let object = {
            type: ComponentType.HAZARD,
            hazards: [],
            expectedLevel: this.expectedLevel,
        }

        for (let creature of this.hazards) {
            object.hazards.push(creature.exportToJSON())
        }

        return object
    }


    static importFromJSON(data) {
        let result = new HazardComponent(data.expectedLevel || 1)
        for (let c of data.hazards) {
            result.hazards.push(Hazard.importFromJSON(c))
        }
        return result
    }


    getNewHazardId()
    {
        let found = false
        let id;
        do {
            id = "hazard-" + Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
            for (let hazard of this.hazards) {
                if (hazard.id === id) { found = true; break }
            }
        } while (found)
        return id
    }


    copy() {
        return HazardComponent.importFromJSON(this.exportToJSON())
    }


    getTooltip()
    {
        let result = []

        for (let hazard of this.hazards) {
            let htmlText = hazard.name != null && hazard.name.length > 0 ? hazard.name : "Unnamed hazard";
            htmlText = `<strong>[Lvl ${hazard.level != null ? hazard.level : "?"}]</strong> ` + htmlText;
            htmlText += ` &times; ${hazard.amount != null ? hazard.amount : "?"}`;
            result.push(htmlText)
        }

        return result.join("<br />")
    }
}


export class Hazard
{
    constructor(name, level, isComplex, amount, link = null, id = null) {
        this.name = name
        this.level = level
        this.isComplex = isComplex
        this.amount = amount
        this.link = link
        this.id = id
    }


    exportToJSON()
    {
        return {
            name: this.name,
            level: this.level,
            isComplex: this.isComplex,
            amount: this.amount,
            link: this.link,
            id: this.id,
        }
    }


    static importFromJSON(data) {
        return new Hazard(data.name, data.level, data.isComplex, data.amount, data.link, data.id)
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