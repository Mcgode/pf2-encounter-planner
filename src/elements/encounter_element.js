/**
 * @file encounter_element.js
 * @author Max Godefroy <max@godefroy.net>
 */


// import {FightElement} from "./fight_element";

export default class EncounterElement
{
    constructor(name) {
        this.name = name
        this.id = null
    }

    registerToSession(session)
    {
        do {
            this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        } while (session.isIdUsed(this.id))
    }

    exportToJSON() {
        return { name: this.name, id: this.id }
    }

    static importFromJSON(data) {
        let result = new EncounterElement(data.name)
        result.id = data.id
        return result
    }
}


export const ElementType = {
    FIGHT_ELEMENT: 'fight_element'
}