/**
 * @file session.js
 * @author Max Godefroy <max@godefroy.net>
 */

import {Encounter} from "./encounter";
import {EncounterElement} from "./elements/encounter_element"
import {Timeline} from './timeline'


type SessionPlayer = {
    name: string,
    level: number,
    xp: number,
    id: string,
}

type SessionParams = {
    autoLevelUp: boolean,
    groupLevelFunction: string,
    underLeveledPlayerMultiplier: number,
    players: [SessionPlayer]
}


/**
 * A class for handling the data structure and logic of a game session
 * Will act as the data root for the module
 */
export class Session
{
    // Constructors

    /**
     * Constructor for the Session class
     * @param name      The name for this session. Defaults to `'Default'`
     * @param params    The parameters for this specific session. Defaults to `{}`, and will set default values for non-provided parameters
     * @param timeline  The timeline for this session.
     */
    public constructor(name: string,
                       params: SessionParams,
                       timeline: Timeline | null);


    // Properties

    /** The name of the game session **/
    public name: string

    /** The parameters for this session **/
    public params: SessionParams

    /** The list of encounters for this specific session. Meant to be read-only**/
    public encounters: [Encounter]

    /** The timeline for this session. Meant to be read-only (only exception is late Timeline initialization). **/
    public timeline: Timeline


    // Methods

    /**
     * Tries to add an encounter to session
     * @param name  The name for this new encounter
     * @returns If the encounter coould be created, returns it, else returns null
     **/
    public addEncounter(name: string): Encounter | null;


    /**
     * Registers a new encounter element
     * @param encounterName The name of the encounter this element belongs to.
     * @param element       The element to register for this session.
     */
    public registerElement(encounterName: string, element: EncounterElement): boolean


    /**
     * Checks if another element of the session already has the provided id.
     * @param id  The potential id for the new element.
     * @protected
     */
    protected isElementIdUsed(id: number): boolean


    /**
     * Moves an encounter from an index to a new one
     * @param oldIndex  The original index of the encounter
     * @param newIndex  The new index to which the encounter will be moved
     */
    public moveEncounterIndex(oldIndex: number, newIndex: number): void


    /**
     * Try to rename an encounter
     * @param oldName   The current name of the encounter
     * @param newName   The new name for the encounter
     * @returns If the encounter was renamed successfully, returns `true`, else returns `false`
     */
    public renameEncounter(oldName: string, newName: string): boolean


    /**
     * Removes an encounter from the session
     * @param encounter The encounter to remove.
     */
    public removeEncounter(encounter: Encounter): void


    /**
     * Exports the session to a JSON string and saves it in the window local storage
     */
    public saveSession(): void


    /**
     * Changes the name of the game session
     * @param newName The new name for the game session
     */
    public changeName(newName: string): void


    /**
     * Serializes all the session data to a JSON string, which can be used to recreate this session data
     * @protected
     */
    protected exportToJSON(): string


    /**
     * Adds a player to game session parameters
     * @param name  The name of this new player
     * @param level The starting level of this new player
     * @param xp    The starting experience points for this new player
     * @returns The resulting new player
     */
    public addPlayer(name, level, xp): SessionPlayer


    /**
     * Computes the level of the provided group, according to the approximation function defined in
     * `Session.params.groupLevelFunction`
     * @param players   The group of player whom level will be computed. Defaults to `null`.
     *                  If set to `null`, will use the ones found in the session parameters
     */
    public getPlayerGroupLevel(players: null | [{level: number}]): number


    /**
     * Will try to find a specific encounter element in the session data
     * @param id    The id for the element you need to find
     * @returns The element, if it was found.
     */
    public findElementById(id: number): EncounterElement | null


    // Static methods

    /**
     * Will import a session based off the provided JSON data string
     * @param jsonData  A serialized session JSON string
     * @protected
     */
    protected static importFromJSON(jsonData): Session


    /**
     * Will load a session with the provided name, be it by loading it from the local storage, or by making a new one
     * @param name  The name of the session to start. Defaults to `'Default'`
     */
    public static makeSession(name: string): Session
}