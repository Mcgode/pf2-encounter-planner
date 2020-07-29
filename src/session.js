/**
 * @file session.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {Encounter} from "./encounter";
import {TimelineEvent} from "./timeline_event";
import {Timeline} from "./timeline";


export class Session
{
    constructor(name = "Default", params = {}, timeline = null)
    {
        this.name = name

        this.params = Object.assign({
            autoLevelUp: false,
            groupLevelFunction: GroupLevelFunction.MAX_PLAYER_LEVEL,
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
        this.timeline = timeline
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
            encounters: [],
            timelineEvents: []
        }

        for (let encounter of this.encounters) {
            object.encounters.push(encounter.exportToJSON())
        }

        for (let event of this.timeline.events) {
            object.timelineEvents.push(event.exportToJSON())
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


    getPlayerGroupLevel(players = null)
    {
        players = players == null ? this.params.players : players
        switch (this.params.groupLevelFunction) {
            case GroupLevelFunction.MIN_PLAYER_LEVEL:
                return Math.min(...players.map(p => p.level))
            case GroupLevelFunction.AVERAGE_PLAYER_LEVEL_FLOOR:
                return Math.floor(players.map(p => p.level).reduce((a, b) => a+b, 0) / players.length)
            case GroupLevelFunction.AVERAGE_PLAYER_LEVEL_CEIL:
                return Math.ceil(players.map(p => p.level).reduce((a, b) => a+b, 0) / players.length)
            default:
                return Math.max(...players.map(p => p.level))
        }
    }


    findElementById(id) {
        return this.encounters.flatMap(e => e.elements).find(e => e.id === id)
    }


    static importFromJSON(jsonData) {
        let object = JSON.parse(jsonData)

        let result = new Session(object.name, object.params)

        for (let e of object.encounters) {
            result.encounters.push(Encounter.importFromJSON(e))
        }

        let events = []
        if (object.timelineEvents != null) {
            for (let e of object.timelineEvents) {
                events.push(TimelineEvent.importFromJSON(e, result))
            }
        }
        result.timeline = new Timeline(result, events)

        return result
    }


    static makeSession(name = 'Default') {
        let data = window.localStorage.getItem(`session:${name}`)

        let session = data == null ? new Session(name) : Session.importFromJSON(data)
        if (data == null)
            session.timeline = new Timeline(session)
        return session
    }
}


export const GroupLevelFunction = {
    MIN_PLAYER_LEVEL: "Minimum player level",
    MAX_PLAYER_LEVEL: "Maximum player level",
    AVERAGE_PLAYER_LEVEL_FLOOR: "Average player level (floor)",
    AVERAGE_PLAYER_LEVEL_CEIL: "Average player level (ceil)"
}