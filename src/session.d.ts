/**
 * @file session.js
 * @author Max Godefroy <max@godefroy.net>
 */

import {Encounter} from "./encounter";
import {EncounterElement} from "./elements/encounter_element"


export class Session
{
    public constructor(name: String, params: {});

    public encounters: [Encounter]

    public addEncounter(name: String): Encounter;

    public registerElement(encounterName: string, element: EncounterElement): boolean

    private isIdUsed(id: number): boolean
}