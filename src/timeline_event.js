/**
 * @file timeline_event.js
 * @author Max Godefroy <max@godefroy.net>
 */


export class TimelineEvent
{
    constructor(id, players, element = null, levelUp = false, additionalNPCs = 0)
    {
        this.id = id
        this.players = players
        this.element = element
        this.levelUp = levelUp || false
        this.additionalNPCs = isNaN(additionalNPCs) ? 0 : parseInt(additionalNPCs)
    }


    exportToJSON()
    {
        return {
            id: this.id,
            players: this.players,
            element: this.element == null ? null : this.element.id,
            levelUp: this.levelUp,
            additionalNPCs: this.additionalNPCs
        }
    }


    static importFromJSON(data, session)
    {
        return new TimelineEvent(data.id, data.players, session.findElementById(data.element), data.levelUp, data.additionalNPCs)
    }
}