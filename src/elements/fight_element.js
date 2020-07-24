/**
 * @file fight_element.js
 * @author Max Godefroy <max@godefroy.net>
 */


import EncounterElement from "./encounter_element";


export class FightElement extends EncounterElement
{
    constructor(name) {
        super(name);

        this.creatures = []
    }


    getEncounterXpPerPlayer(playersLevel = 1, numberOfPlayers = 4)
    {
        let xpTotal = 0

        for (let creature of this.creatures) {
            let relativeLvl = creature.level - playersLevel

            if (relativeLvl > 4) return EncounterRating.IMPOSSIBLE

            if (relativeLvl >= -4) {
                xpTotal += creature.amount * XpPerRelativeLevel[relativeLvl.toString()]
            }
        }

        xpTotal *= numberOfPlayers / 4

        return xpTotal
    }


    getEncounterRating(playersLevel = 1, numberOfPlayers = 4)
    {
        let xpPerPlayer = this.getEncounterXpPerPlayer(playersLevel, numberOfPlayers)

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
}


export class Creature
{
    constructor(name, level, amount, link = null) {
        this.name = name
        this.level = level == null ? 0 : level
        this.amount = amount == null ? 1 : amount
        this.link = link
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
