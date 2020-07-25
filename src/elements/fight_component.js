/**
 * @file fight_component.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {ComponentType} from "./component_types";


export class FightComponent
{
    constructor(expectedPlayers = 4, expectedLevel = 1) {
        this.type = ComponentType.FIGHT
        this.creatures = []
        this.expectedPlayers = expectedPlayers
        this.expectedLevel = expectedLevel
    }


    getEncounterXpPerPlayer()
    {
        let xpTotal = 0

        for (let creature of this.creatures) {
            if (creature.level != null && creature.amount != null) {
                let relativeLvl = creature.level - this.expectedLevel

                if (relativeLvl > 4) return null

                if (relativeLvl >= -4) {
                    xpTotal += creature.amount * XpPerRelativeLevel[relativeLvl.toString()]
                }
            }
        }

        xpTotal *= 4 / this.expectedPlayers

        return xpTotal
    }


    getEncounterRating()
    {
        let xpPerPlayer = this.getEncounterXpPerPlayer()
        if (xpPerPlayer == null) return EncounterRating.IMPOSSIBLE

        let minValue = 200
        let minKey = null
        for (let rating in XpPerRating) {
            if (minValue > XpPerRating[rating] && XpPerRating[rating] >= xpPerPlayer) {
                minKey = rating
                minValue = XpPerRating[rating]
            }
        }
        return minKey == null ? EncounterRating.IMPOSSIBLE : minKey
    }


    exportToJSON() {
        let object = {
            type: ComponentType.FIGHT,
            expectedLevel: this.expectedLevel,
            expectedPlayers: this.expectedPlayers,
            creatures: []
        }

        for (let creature of this.creatures) {
            object.creatures.push(creature.exportToJSON())
        }

        return object
    }


    static importFromJSON(data) {
        let result = new FightComponent(data.expectedPlayers || 4, data.expectedLevel || 1)
        for (let c of data.creatures) {
            result.creatures.push(Creature.importFromJSON(c))
        }
        return result
    }


    getNewCreatureId()
    {
        let found = false
        let id;
        do {
            id = "creature-" + Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
            for (let creature of this.creatures) {
                if (creature.id === id) { found = true; break }
            }
        } while (found)
        return id
    }


    copy() {
        return FightComponent.importFromJSON(this.exportToJSON())
    }
}


export class Creature
{
    constructor(name, level, amount, link = null, id = null) {
        this.name = name
        this.level = level
        this.amount = amount
        this.link = link
        this.id = id
    }


    exportToJSON()
    {
        return {
            name: this.name,
            level: this.level,
            amount: this.amount,
            link: this.link,
            id: this.id
        }
    }


    static importFromJSON(data) {
        return new Creature(data.name, data.level, data.amount, data.link, data.id)
    }
}


export const EncounterRating = {
    TRIVIAL: 'trivial',
    LOW: 'low',
    MODERATE: 'moderate',
    SEVERE: 'severe',
    EXTREME: 'extreme',
    IMPOSSIBLE: 'impossible'
}


const XpPerRelativeLevel = {
    "-4": 10,
    "-3": 15,
    "-2": 20,
    "-1": 30,
    "0": 40,
    "1": 60,
    "2": 80,
    "3": 120,
    "4": 160
}

const XpPerRating = {
    trivial: 40,
    low: 60,
    moderate: 80,
    severe: 120,
    extreme: 160
}
