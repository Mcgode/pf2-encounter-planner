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
            return this.xp
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
                this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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
     * @file encounter.js
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
            return "encounter-" + name.toLowerCase().split(/[^a-z0-9]/).filter((s) => s.length > 0).join("-")
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
     * @file session.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class Session
    {
        constructor(name = "Default", params = {})
        {
            this.name = name;

            this.params = Object.assign({
                autoLevelUp: false,
                players: [
                    {
                        name: "Player 1",
                        xp: 0
                    },
                    {
                        name: "Player 2",
                        xp: 0
                    },
                    {
                        name: "Player 3",
                        xp: 0
                    },
                    {
                        name: "Player 4",
                        xp: 0
                    },
                ]
            }, params);

            this.encounters = [];
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
                encounters: []
            };

            for (let encounter of this.encounters) {
                object.encounters.push(encounter.exportToJSON());
            }

            return JSON.stringify(object)
        }


        getPlayerGroupLevel() {
            return Math.min(...this.params.players.map(p => Math.floor(p.xp / 1000) + 1))
        }


        static importFromJSON(jsonData) {
            let object = JSON.parse(jsonData);

            let result = new Session(object.name, object.params);
            for (let e of object.encounters) {
                result.encounters.push(Encounter.importFromJSON(e));
            }
            return result
        }


        static makeSession(name = 'Default') {
            let data = window.localStorage.getItem(`session:${name}`);

            return data == null ? new Session(name) : Session.importFromJSON(data)
        }
    }

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
