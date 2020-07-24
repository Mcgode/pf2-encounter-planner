/**
 * @file encounter.js
 * @author Max Godefroy <max@godefroy.net>
 */


export class Encounter
{
    constructor(name = "Default", id = null) {
        this.name = name
        this.id = id != null ? id : Encounter.getIdFriendlyName(name)
        this.elements = []
    }


    static getIdFriendlyName(name)
    {
        return "encounter-" + name.toLowerCase().split(/[^a-z0-9]/).filter((s) => s.length > 0).join("-")
    }
}