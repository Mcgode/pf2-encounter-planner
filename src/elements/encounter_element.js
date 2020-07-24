/**
 * @file encounter_element.js
 * @author Max Godefroy <max@godefroy.net>
 */


export class EncounterElement
{
    registerToSession(session)
    {
        do {
            this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        } while (session.isIdUsed(this.id))
    }
}