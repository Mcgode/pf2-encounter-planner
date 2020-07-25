/**
 * @file timeline_event.js
 * @author Max Godefroy <max@godefroy.net>
 */


export class TimelineEvent
{
    constructor(id, players, element = null, levelUp = false)
    {
        this.id = id
        this.players = players
        this.element = element
        this.levelUp = levelUp || false
    }


    exportToJSON()
    {
        return {
            id: this.id,
            players: this.players,
            element: this.element == null ? null : this.element.id,
            levelUp: this.levelUp
        }
    }


    static importFromJSON(data, session)
    {
        return new TimelineEvent(data.id, data.players, session.findElementById(data.element), data.levelUp)
    }
}