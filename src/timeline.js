/**
 * @file timeline.js
 * @author Max Godefroy <max@godefroy.net>
 */
import {ComponentType} from "./elements/component_types";
import {EncounterRating} from "./elements/fight_component";
import {TimelineEvent} from "./timeline_event";


export class Timeline
{
    constructor(session, events = [])
    {
        this.events = events == null ? [] : events
        this.session = session

        if (events.length > 0)
            this.computeTimeline()

        this.listener = null
    }


    addEvent(index, elementId, levelUp = false)
    {
        let element = session.findElementById(elementId)
        if (element == null) return null

        let id, found;
        do {
            id = 'event-' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
            found = this.events.find(e => e.id === id) != null
        } while (found)

        let event = new TimelineEvent(id, session.params.players.map(p => p.id), element, levelUp)
        this.events.splice(index, 0, event)
        this.session.saveSession()
        this.computeTimeline()
        return event
    }


    deleteEvent(eventId)
    {
        let index = this.events.findIndex(e => e.id === eventId)
        if (index != null) {
            this.events.splice(index, 1)
            this.session.saveSession()
            this.computeTimeline()
        }
    }


    moveEvent(oldIndex, newIndex)
    {
        this.events.splice(newIndex, 0, ...this.events.splice(oldIndex, 1))
        this.session.saveSession()
        this.computeTimeline()
    }


    computeTimeline()
    {
        this.playerHistory = {}
        this.errorEvents = []
        this.xpChange = {}

        for (let player of this.session.params.players)
            this.playerHistory[player.id] = [{
                index: -1,
                level: parseInt(player.level),
                xp: parseInt(player.xp),
            }]

        let index = 0
        for (let event of this.events)
        {
            if (event.levelUp) {
                let leveledUp = false
                for (let player of event.players) {
                    let history = this.playerHistory[player.id]
                    if (history && history.last().xp >= 1000) {
                        history.push({
                            index: index,
                            level: history.last().level + 1,
                            xp: history.last().xp - 1000,
                        })
                        leveledUp = true
                    }
                }

                if (!leveledUp)
                    this.errorEvents.push(event)
            } else {
                if (event.element != null && event.element.component != null) {
                    let component = event.element.component

                    let players = []
                    for (let player of event.players) {
                        let history = this.playerHistory[player]
                        if (history) {
                            players.push(Object.assign({id: player}, history.last()))
                        }
                    }

                    if (players.length) {
                        let xp;
                        switch (component.type) {
                            case ComponentType.FIGHT:
                                let level = this.session.getPlayerGroupLevel(players)
                                let eP = component.expectedPlayers, eL = component.expectedLevel
                                component.expectedLevel = level; component.expectedPlayers = players.length
                                let rating = component.getEncounterRating()
                                if (rating === EncounterRating.IMPOSSIBLE) {
                                    this.errorEvents.push(event)
                                    xp = null
                                } else {
                                    xp = component.getEncounterXpPerPlayer()
                                }
                                component.expectedLevel = eL; component.expectedPlayers = eP
                                break;
                            case ComponentType.HAZARD:
                                let levelH = this.session.getPlayerGroupLevel(players)
                                let expLvl = component.expectedLevel
                                component.expectedLevel = levelH
                                xp = component.getEncounterXpPerPlayer()
                                component.expectedLevel = expLvl
                                break;
                            default:
                                xp = component.getEncounterXpPerPlayer()
                        }

                        this.xpChange[event.id] = xp
                        xp = xp || 0

                        for (let player of players) {
                            this.playerHistory[player.id].push({
                                index: index,
                                xp: player.xp + xp,
                                level: player.level
                            })
                        }
                    } else {
                        console.log("No players for event " + event.element.name)
                        this.errorEvents.push(event)
                    }
                } else {
                    this.errorEvents.push(event)
                }
            }

            index++
        }

        if (this.listener != null) {
            this.listener()
        }
    }
}


Array.prototype.last = function() {
    return this[this.length-1]
}