/**
 * @file encounter.js
 * @author Max Godefroy <max@godefroy.net>
 */


export class Encounter
{
    constructor(name = "Default") {
        this.name = name
        this.id = Encounter.getIdFriendlyName(name)
        this.elements = []
    }


    static getIdFriendlyName(name)
    {
        return name.toLowerCase().split(/\s/).filter((s) => s.length > 0).join("-")
    }
}