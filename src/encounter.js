/**
 * @file element.js
 * @author Max Godefroy <max@godefroy.net>
 */
import { EncounterElement } from "./elements/encounter_element";


export class Encounter
{
    constructor(name = "Default", id = null) {
        this.name = name
        this.id = id != null ? id : Encounter.getIdFriendlyName(name)
        this.elements = []
    }


    static getIdFriendlyName(name)
    {
        return "element-" + name.toLowerCase().split(/[^a-z0-9]/).filter((s) => s.length > 0).join("-")
    }


    moveElement(oldIndex, newIndex)
    {
        let e = this.elements[oldIndex]
        this.elements.splice(oldIndex, 1)
        this.elements.splice(newIndex, 0, e)
    }


    exportToJSON()
    {
        let object = {
            name: this.name,
            id: this.id,
            elements: []
        }

        for (let element of this.elements) {
            object.elements.push(element.exportToJSON())
        }

        return object
    }

    static importFromJSON(data) {
        let result = new Encounter(data.name, data.id)
        for (let e of data.elements) {
            result.elements.push(EncounterElement.importFromJSON(e))
        }
        return result
    }
}