(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.PF2EncounterPlanner = {})));
}(this, (function (exports) { 'use strict';

    /**
     * @file component_types.js
     * @author Max Godefroy <max@godefroy.net>
     */


    const ComponentType = {
        FIGHT: 'fight_component',
        ACCOMPLISHMENT: "accomplishment_component",
        HAZARD: "hazard_component",
        CUSTOM: "custom_component"
    };

    const ComponentTypeName = {
        fight_component: "Fight",
        accomplishment_component: "Accomplishment",
        hazard_component: "Hazard",
        custom_component: "Custom",
    };

    /**
     * @file fight_component.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class FightComponent
    {
        constructor(expectedPlayers = 4, expectedLevel = 1) {
            this.type = ComponentType.FIGHT;
            this.creatures = [];
            this.expectedPlayers = expectedPlayers;
            this.expectedLevel = expectedLevel;
        }


        getEncounterXpPerPlayer()
        {
            let xpTotal = 0;

            for (let creature of this.creatures) {
                if (creature.level != null && creature.amount != null) {
                    let relativeLvl = creature.level - this.expectedLevel;

                    if (relativeLvl > 4) return null

                    if (relativeLvl >= -4) {
                        xpTotal += creature.amount * XpPerRelativeLevel[relativeLvl.toString()];
                    }
                }
            }

            xpTotal *= 4 / this.expectedPlayers;

            return xpTotal
        }


        getEncounterRating()
        {
            let xpPerPlayer = this.getEncounterXpPerPlayer();
            if (xpPerPlayer == null) return EncounterRating.IMPOSSIBLE

            let minValue = 200;
            let minKey = null;
            for (let rating in XpPerRating) {
                if (minValue > XpPerRating[rating] && XpPerRating[rating] >= xpPerPlayer) {
                    minKey = rating;
                    minValue = XpPerRating[rating];
                }
            }
            return minKey == null ? EncounterRating.IMPOSSIBLE : minKey
        }


        exportToJSON() {
            let object = {
                type: ComponentType.FIGHT,
                expectedLevel: this.expectedLevel,
                expectedPlayers: this.expectedPlayers,
                creatures: []
            };

            for (let creature of this.creatures) {
                object.creatures.push(creature.exportToJSON());
            }

            return object
        }


        static importFromJSON(data) {
            let result = new FightComponent(data.expectedPlayers || 4, data.expectedLevel || 1);
            for (let c of data.creatures) {
                result.creatures.push(Creature.importFromJSON(c));
            }
            return result
        }


        getNewCreatureId()
        {
            let found = false;
            let id;
            do {
                id = "creature-" + Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
                for (let creature of this.creatures) {
                    if (creature.id === id) { found = true; break }
                }
            } while (found)
            return id
        }


        copy() {
            return FightComponent.importFromJSON(this.exportToJSON())
        }


        getTooltip()
        {
            let result = [];

            for (let creature of this.creatures) {
                let htmlText = creature.name != null && creature.name.length > 0 ? creature.name : "Unnamed creature";
                htmlText = `<strong>[Lvl ${creature.level != null ? creature.level : "?"}]</strong> ` + htmlText;
                htmlText += ` &times; ${creature.amount != null ? creature.amount : "?"}`;
                result.push(htmlText);
            }

            return result.join("<br />")
        }
    }


    class Creature
    {
        constructor(name, level, amount, link = null, id = null) {
            this.name = name;
            this.level = level;
            this.amount = amount;
            this.link = link;
            this.id = id;
        }


        exportToJSON()
        {
            return {
                name: this.name,
                level: this.level,
                amount: this.amount,
                link: this.link,
                id: this.id
            }
        }


        static importFromJSON(data) {
            return new Creature(data.name, data.level, data.amount, data.link, data.id)
        }
    }


    const EncounterRating = {
        TRIVIAL: 'trivial',
        LOW: 'low',
        MODERATE: 'moderate',
        SEVERE: 'severe',
        EXTREME: 'extreme',
        IMPOSSIBLE: 'impossible'
    };


    const XpPerRelativeLevel = {
        "-4": 10,
        "-3": 15,
        "-2": 20,
        "-1": 30,
        "0": 40,
        "1": 60,
        "2": 80,
        "3": 120,
        "4": 160
    };

    const XpPerRating = {
        trivial: 40,
        low: 60,
        moderate: 80,
        severe: 120,
        extreme: 160
    };

    /**
     * @file accomplishment_component.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class AccomplishmentComponent
    {
        constructor(level = AccomplishmentLevel.MINOR) {
            this.type = ComponentType.ACCOMPLISHMENT;
            this.level = level;
        }


        getTooltip()
        {
            return this.level
        }


        getEncounterXpPerPlayer() {
            switch (this.level) {
                case AccomplishmentLevel.MAJOR:
                    return 80
                case AccomplishmentLevel.MODERATE:
                    return 30
                default:
                    return 10
            }
        }


        exportToJSON()
        {
            return {
                type: this.type,
                level: this.level,
            }
        }


        static importFromJSON(data)
        {
            return new AccomplishmentComponent(data.level)
        }
    }


    const AccomplishmentLevel = {
        MINOR: "Minor accomplishment",
        MODERATE: "Moderate accomplishment",
        MAJOR: "Major accomplishment"
    };

    /**
     * @file hazard_component.js
     * @author Max Godefroy <max@godefroy.net>
     */

    class HazardComponent {
        constructor(expectedLevel = 1) {
            this.type = ComponentType.HAZARD;
            this.expectedLevel = expectedLevel;
            this.hazards = [];
        }


        getEncounterXpPerPlayer()
        {
            let xpTotal = 0;

            for (let hazard of this.hazards) {
                if (hazard.level != null && hazard.amount != null) {
                    let relativeLvl = hazard.level - this.expectedLevel;

                    if (relativeLvl > 4) return null

                    if (relativeLvl >= -4) {
                        xpTotal += hazard.amount * XpPerRelativeLevel$1[relativeLvl.toString()] * (hazard.isComplex ? 5 : 1);
                    }
                }
            }

            return xpTotal
        }


        exportToJSON() {
            let object = {
                type: ComponentType.HAZARD,
                hazards: [],
                expectedLevel: this.expectedLevel,
            };

            for (let creature of this.hazards) {
                object.hazards.push(creature.exportToJSON());
            }

            return object
        }


        static importFromJSON(data) {
            let result = new HazardComponent(data.expectedLevel || 1);
            for (let c of data.hazards) {
                result.hazards.push(Hazard.importFromJSON(c));
            }
            return result
        }


        getNewHazardId()
        {
            let found = false;
            let id;
            do {
                id = "hazard-" + Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
                for (let hazard of this.hazards) {
                    if (hazard.id === id) { found = true; break }
                }
            } while (found)
            return id
        }


        copy() {
            return HazardComponent.importFromJSON(this.exportToJSON())
        }


        getTooltip()
        {
            let result = [];

            for (let hazard of this.hazards) {
                let htmlText = hazard.name != null && hazard.name.length > 0 ? hazard.name : "Unnamed hazard";
                htmlText = `<strong>[Lvl ${hazard.level != null ? hazard.level : "?"}]</strong> ` + htmlText;
                htmlText += ` &times; ${hazard.amount != null ? hazard.amount : "?"}`;
                result.push(htmlText);
            }

            return result.join("<br />")
        }
    }


    class Hazard
    {
        constructor(name, level, isComplex, amount, link = null, id = null) {
            this.name = name;
            this.level = level;
            this.isComplex = isComplex;
            this.amount = amount;
            this.link = link;
            this.id = id;
        }


        exportToJSON()
        {
            return {
                name: this.name,
                level: this.level,
                isComplex: this.isComplex,
                amount: this.amount,
                link: this.link,
                id: this.id,
            }
        }


        static importFromJSON(data) {
            return new Hazard(data.name, data.level, data.isComplex, data.amount, data.link, data.id)
        }
    }


    const XpPerRelativeLevel$1 = {
        "-4": 2,
        "-3": 3,
        "-2": 4,
        "-1": 6,
        "0": 8,
        "1": 12,
        "2": 16,
        "3": 24,
        "4": 32
    };

    /**
     * @file custom_component.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class CustomComponent
    {
        constructor(xp) {
            this.type = ComponentType.CUSTOM;
            this.xp = xp;
        }

        getEncounterXpPerPlayer() {
            return parseInt(this.xp)
        }


        getTooltip()
        {
            return ""
        }


        exportToJSON() {
            return {
                type: this.type,
                xp: this.xp
            }
        }


        static importFromJSON(data) {
            return new CustomComponent(data.xp)
        }
    }

    /**
     * @file encounter_element.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class EncounterElement
    {
        constructor(name) {
            this.name = name;
            this.id = null;
            this.component = null;
        }

        registerToSession(session)
        {
            do {
                this.id = "element-"  + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            } while (session.isIdUsed(this.id))
        }


        exportToJSON() {
            return {
                name: this.name,
                id: this.id,
                component: this.component == null ? null : this.component.exportToJSON()
            }
        }


        static importFromJSON(data) {
            let result = new EncounterElement(data.name);
            result.id = data.id;

            if (data.component != null) {
                switch (data.component.type) {
                    case ComponentType.FIGHT:
                        result.component = FightComponent.importFromJSON(data.component);
                        break;
                    case ComponentType.ACCOMPLISHMENT:
                        result.component = AccomplishmentComponent.importFromJSON(data.component);
                        break;
                    case ComponentType.HAZARD:
                        result.component = HazardComponent.importFromJSON(data.component);
                        break;
                    case ComponentType.CUSTOM:
                        result.component = CustomComponent.importFromJSON(data.component);
                        break;
                }
            }

            return result
        }
    }

    /**
     * @file element.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class Encounter
    {
        constructor(name = "Default", id = null) {
            this.name = name;
            this.id = id != null ? id : Encounter.getIdFriendlyName(name);
            this.elements = [];
        }


        static getIdFriendlyName(name)
        {
            return "element-" + name.toLowerCase().split(/[^a-z0-9]/).filter((s) => s.length > 0).join("-")
        }


        moveElement(oldIndex, newIndex)
        {
            let e = this.elements[oldIndex];
            this.elements.splice(oldIndex, 1);
            this.elements.splice(newIndex, 0, e);
        }


        exportToJSON()
        {
            let object = {
                name: this.name,
                id: this.id,
                elements: []
            };

            for (let element of this.elements) {
                object.elements.push(element.exportToJSON());
            }

            return object
        }

        static importFromJSON(data) {
            let result = new Encounter(data.name, data.id);
            for (let e of data.elements) {
                result.elements.push(EncounterElement.importFromJSON(e));
            }
            return result
        }
    }

    /**
     * @file timeline_event.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class TimelineEvent
    {
        constructor(id, players, element = null, levelUp = false, additionalNPCs = 0)
        {
            this.id = id;
            this.players = players;
            this.element = element;
            this.levelUp = levelUp || false;
            this.additionalNPCs = isNaN(additionalNPCs) ? 0 : parseInt(additionalNPCs);
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

    /**
     * @file timeline.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class Timeline
    {
        constructor(session, events = [])
        {
            this.events = events == null ? [] : events;
            this.session = session;

            this.playerHistory = {};
            this.errorEvents = [];
            this.xpChange = {};

            this.computeTimeline();

            this.listener = null;
        }


        addEvent(index, elementId, levelUp = false)
        {
            let element;

            if (!levelUp) {
                element = session.findElementById(elementId);
                if (element == null) return null
            }

            let id, found;
            do {
                id = 'event-' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                found = this.events.find(e => e.id === id) != null;
            } while (found)

            let event = new TimelineEvent(id, session.params.players.map(p => p.id), element, levelUp);
            this.events.splice(index, 0, event);
            this.session.saveSession();
            this.computeTimeline();
            return event
        }


        deleteEvent(eventId)
        {
            let index = this.events.findIndex(e => e.id === eventId);
            if (index != null) {
                this.events.splice(index, 1);
                this.session.saveSession();
                this.computeTimeline();
            }
        }


        moveEvent(oldIndex, newIndex)
        {
            this.events.splice(newIndex, 0, ...this.events.splice(oldIndex, 1));
            this.session.saveSession();
            this.computeTimeline();
        }


        computeTimeline()
        {
            this.playerHistory = {};
            this.errorEvents = [];
            this.xpChange = {};

            for (let player of this.session.params.players)
                this.playerHistory[player.id] = [{
                    index: -1,
                    level: parseInt(player.level),
                    xp: parseInt(player.xp),
                }];

            let index = 0;
            for (let event of this.events)
            {
                if (event.levelUp) {
                    let leveledUp = false;
                    for (let player of event.players) {
                        let history = this.playerHistory[player];
                        if (history && history.last().xp >= 1000) {
                            history.push({
                                index: index,
                                level: history.last().level + 1,
                                xp: history.last().xp - 1000,
                            });
                            leveledUp = true;
                        }
                    }

                    if (!leveledUp)
                        this.errorEvents.push({event: event, reason: "No player could level up"});
                } else {
                    if (event.element != null && event.element.component != null) {
                        let component = event.element.component;

                        let players = [];
                        for (let player of event.players) {
                            let history = this.playerHistory[player];
                            if (history) {
                                players.push(Object.assign({id: player}, history.last()));
                            }
                        }

                        if (players.length) {
                            let xp;
                            switch (component.type) {
                                case ComponentType.FIGHT:
                                    let level = this.session.getPlayerGroupLevel(players);
                                    let eP = component.expectedPlayers, eL = component.expectedLevel;
                                    component.expectedLevel = level; component.expectedPlayers = players.length + event.additionalNPCs;
                                    let rating = component.getEncounterRating();
                                    if (rating === EncounterRating.IMPOSSIBLE) {
                                        this.errorEvents.push({event: event, reason: "Impossible encounter"});
                                        xp = null;
                                    } else {
                                        xp = component.getEncounterXpPerPlayer();
                                    }
                                    component.expectedLevel = eL; component.expectedPlayers = eP;
                                    break;
                                case ComponentType.HAZARD:
                                    let levelH = this.session.getPlayerGroupLevel(players);
                                    let expLvl = component.expectedLevel;
                                    component.expectedLevel = levelH;
                                    xp = component.getEncounterXpPerPlayer();
                                    component.expectedLevel = expLvl;
                                    break;
                                default:
                                    xp = component.getEncounterXpPerPlayer();
                            }

                            this.xpChange[event.id] = xp;
                            xp = xp || 0;

                            for (let player of players) {
                                this.playerHistory[player.id].push({
                                    index: index,
                                    xp: player.xp + xp,
                                    level: player.level
                                });
                            }
                        } else {
                            this.errorEvents.push({event: event, reason: "No player for this event"});
                        }
                    } else {
                        this.errorEvents.push({event: event, reason: "Invalid event"});
                    }
                }

                index++;
            }

            if (this.listener != null) {
                this.listener();
            }
        }
    }


    Array.prototype.last = function() {
        return this[this.length-1]
    };

    /**
     * @file session.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class Session
    {
        constructor(name = "Default", params = {}, timeline = null)
        {
            this.name = name;

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
            }, params);

            this.encounters = [];
            this.timeline = timeline;
        }


        addEncounter(name)
        {
            let newId = Encounter.getIdFriendlyName(name);
            if (this.encounters.find(e => e.name === name) != null) return null;

            if (this.encounters.find(e => e.id === newId) != null) {
                let i = 0;
                while (this.encounters.find(e => e.id === `${newId}${i}`) != null)
                    i++;
                newId = `${newId}${i}`;
            }

            let newEncounter = new Encounter(name, newId);
            this.encounters.push(newEncounter);
            this.saveSession();
            return newEncounter
        }


        registerElement(encounterName, element)
        {
            let encounter = this.encounters.find(e => e.name === encounterName);
            if (encounter != null) {
                element.registerToSession(this);
                encounter.elements.push(element);
            }
            this.saveSession();
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
            let e = this.encounters[oldIndex];
            this.encounters.splice(oldIndex, 1);
            this.encounters.splice(newIndex, 0, e);
        }


        renameEncounter(oldName, newName)
        {
            let encounter = this.encounters.find(e => e.name === oldName);
            if (this.encounters.find(e => e.name === newName) != null || encounter == null) return false;

            encounter.name = newName;
            this.saveSession();
            return true
        }


        removeEncounter(encounter)
        {
            this.encounters.splice(this.encounters.findIndex(e => e.id === encounter.id), 1);
            this.saveSession();
        }


        saveSession() {
            window.localStorage.setItem(`session:${this.name}`, this.exportToJSON());
        }


        exportToJSON()
        {
            let object = {
                params: this.params,
                name: this.name,
                encounters: [],
                timelineEvents: []
            };

            for (let encounter of this.encounters) {
                object.encounters.push(encounter.exportToJSON());
            }

            for (let event of this.timeline.events) {
                object.timelineEvents.push(event.exportToJSON());
            }

            return JSON.stringify(object)
        }


        addPlayer(name, level, xp)
        {
            let id, found;
            do {
                id = "player-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                found = this.params.players.find(p => p.id === id) != null;
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
            players = players == null ? this.params.players : players;
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
            let object = JSON.parse(jsonData);

            let result = new Session(object.name, object.params);

            for (let e of object.encounters) {
                result.encounters.push(Encounter.importFromJSON(e));
            }

            let events = [];
            if (object.timelineEvents != null) {
                for (let e of object.timelineEvents) {
                    events.push(TimelineEvent.importFromJSON(e, result));
                }
            }
            result.timeline = new Timeline(result, events);

            return result
        }


        static makeSession(name = 'Default') {
            let data = window.localStorage.getItem(`session:${name}`);

            let session = data == null ? new Session(name) : Session.importFromJSON(data);
            if (data == null)
                session.timeline = new Timeline(session);
            return session
        }
    }


    const GroupLevelFunction = {
        MIN_PLAYER_LEVEL: "Minimum player level",
        MAX_PLAYER_LEVEL: "Maximum player level",
        AVERAGE_PLAYER_LEVEL_FLOOR: "Average player level (floor)",
        AVERAGE_PLAYER_LEVEL_CEIL: "Average player level (ceil)"
    };

    /**
     * @file module.js
     * @author Max Godefroy <max@godefroy.net>
     *
     * @brief The file for handling the library interface, what classes and functions are available from the exterior
     */

    exports.Session = Session;
    exports.Encounter = Encounter;
    exports.EncounterElement = EncounterElement;
    exports.CustomComponent = CustomComponent;
    exports.FightComponent = FightComponent;
    exports.Creature = Creature;
    exports.EncounterRating = EncounterRating;
    exports.AccomplishmentComponent = AccomplishmentComponent;
    exports.AccomplishmentLevel = AccomplishmentLevel;
    exports.HazardComponent = HazardComponent;
    exports.Hazard = Hazard;
    exports.ComponentType = ComponentType;
    exports.ComponentTypeName = ComponentTypeName;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
