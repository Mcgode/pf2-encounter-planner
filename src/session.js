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
            autoLevelUp: false,
            players: [
                {
                    name: "Player 1",
                    level: 1,
                    xp: 0,
                    id: "player-1",
                },
                {
                    name: "Player 2",
                    level: 1,
                    xp: 0,
                    id: "player-2",
                },
                {
                    name: "Player 3",
                    level: 1,
                    xp: 0,
                    id: "player-3",
                },
                {
                    name: "Player 4",
                    level: 1,
                    xp: 0,
                    id: "player-4",
                },
            ]
        }, params)

        this.encounters = []
    }


    addEncounter(name)
    {
        let newId = Encounter.getIdFriendlyName(name)
        if (this.encounters.find(e => e.name === name) != null) return null;

        if (this.encounters.find(e => e.id === newId) != null) {
            let i = 0
            while (this.encounters.find(e => e.id === `${newId}${i}`) != null)
                i++;
            newId = `${newId}${i}`
        }

        let newEncounter = new Encounter(name, newId)
        this.encounters.push(newEncounter)
        this.saveSession()
        return newEncounter
    }


    registerElement(encounterName, element)
    {
        let encounter = this.encounters.find(e => e.name === encounterName)
        if (encounter != null) {
            element.registerToSession(this)
            encounter.elements.push(element)
        }
        this.saveSession()
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


    moveEncounterIndex(oldIndex, newIndex)
    {
        let e = this.encounters[oldIndex]
        this.encounters.splice(oldIndex, 1)
        this.encounters.splice(newIndex, 0, e)
    }


    renameEncounter(oldName, newName)
    {
        let encounter = this.encounters.find(e => e.name === oldName)
        if (this.encounters.find(e => e.name === newName) != null || encounter == null) return false;

        encounter.name = newName
        this.saveSession()
        return true
    }


    removeEncounter(encounter)
    {
        this.encounters.splice(this.encounters.findIndex(e => e.id === encounter.id), 1)
        this.saveSession()
    }


    saveSession() {
        window.localStorage.setItem(`session:${this.name}`, this.exportToJSON())
    }


    exportToJSON()
    {
        let object = {
            params: this.params,
            name: this.name,
            encounters: []
        }

        for (let encounter of this.encounters) {
            object.encounters.push(encounter.exportToJSON())
        }

        return JSON.stringify(object)
    }


    addPlayer(name, level, xp)
    {
        let id, found;
        do {
            id = "player-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
            found = this.params.players.find(p => p.id === id) != null
        } while (found)

        return this.params.players[this.params.players.push({
            id: id,
            name: name,
            level: level,
            xp: xp
        })-1]
    }


    getPlayerGroupLevel() {
        return Math.min(...this.params.players.map(p => Math.floor(p.xp / 1000) + 1))
    }


    static importFromJSON(jsonData) {
        let object = JSON.parse(jsonData)

        let result = new Session(object.name, object.params)
        for (let e of object.encounters) {
            result.encounters.push(Encounter.importFromJSON(e))
        }
        return result
    }


    static makeSession(name = 'Default') {
        let data = window.localStorage.getItem(`session:${name}`)

        return data == null ? new Session(name) : Session.importFromJSON(data)
    }
}