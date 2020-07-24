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
        FIGHT: 'fight_component'
    };

    const ComponentTypeName = {
        fight_component: "Fight"
    };

    /**
     * @file fight_component.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class FightComponent
    {
        constructor() {
            this.type = ComponentType.FIGHT;
            this.creatures = [];
        }


        getEncounterXpPerPlayer(playersLevel = 1, numberOfPlayers = 4)
        {
            let xpTotal = 0;

            for (let creature of this.creatures) {
                let relativeLvl = creature.level - playersLevel;

                if (relativeLvl > 4) return EncounterRating.IMPOSSIBLE

                if (relativeLvl >= -4) {
                    xpTotal += creature.amount * XpPerRelativeLevel[relativeLvl.toString()];
                }
            }

            xpTotal *= numberOfPlayers / 4;

            return xpTotal
        }


        getEncounterRating(playersLevel = 1, numberOfPlayers = 4)
        {
            let xpPerPlayer = this.getEncounterXpPerPlayer(playersLevel, numberOfPlayers);

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
                creatures: []
            };

            for (let creature of this.creatures) {
                object.creatures.push(creature.exportToJSON());
            }

            return object
        }


        static importFromJSON(data) {
            let result = new FightComponent();
            for (let c of data.creatures) {
                result.creatures.push(Creature.importFromJSON(c));
            }
            return result
        }
    }


    class Creature
    {
        constructor(name, level, amount, link = null) {
            this.name = name;
            this.level = level == null ? 0 : level;
            this.amount = amount == null ? 1 : amount;
            this.link = link;
        }


        exportToJSON()
        {
            return {
                name: this.name,
                level: this.level,
                amount: this.amount,
                link: this.link
            }
        }


        static importFromJSON(data) {
            return new Creature(data.name, data.leadingComments, data.amount, data.link)
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
                autoLevelUp: false
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
                encounter.elements.push(element);
                element.registerToSession(this);
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
    exports.FightComponent = FightComponent;
    exports.Creature = Creature;
    exports.EncounterRating = EncounterRating;
    exports.ComponentType = ComponentType;
    exports.ComponentTypeName = ComponentTypeName;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
