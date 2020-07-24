/**
 * @file session.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {Encounter} from "./encounter";


export class Session
{
    constructor(name = "Default", params = {})
    {
        this.name = name

        this.params = Object.assign({
            autoLevelUp: false
        }, params)

        this.encounters = []
    }


    addEncounter(name)
    {
        let newId = Encounter.getIdFriendlyName(name)
        if (this.encounters.find(e => e.id === newId) != null) return null;

        let newEncounter = new Encounter(name)
        this.encounters.push(newEncounter)
        return newEncounter
    }


    registerElement(encounterName, element)
    {
        let encounter = this.encounters.find(e => e.name === encounterName)
        if (encounter != null) {
            encounter.elements.push(element)
            element.registerToSession(this)
        }
        return encounter != null
    }


    isIdUsed(id)
    {
        for (let encounter of this.encounters) {
            for (let element of encounter.elements) {
                if (element.id === id)
                    return true
            }
        }
        return false
    }
}