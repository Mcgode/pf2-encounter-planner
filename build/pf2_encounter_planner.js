(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.PF2EncounterPlanner = {})));
}(this, (function (exports) { 'use strict';

    /**
     * @file encounter.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class Encounter
    {
        constructor(name = "Default") {
            this.name = name;
            this.elements = [];
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
            let newEncounter = new Encounter(name);
            this.encounters.push(newEncounter);
            return newEncounter
        }


        registerElement(encounterName, element)
        {
            let encounter = this.encounters.find(e => e.name === encounterName);
            if (encounter != null) {
                encounter.elements.push(element);
                element.registerToSession(this);
            }
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
    }

    /**
     * @file encounter_element.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class EncounterElement
    {
        registerToSession(session)
        {
            do {
                this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            } while (session.isIdUsed(this.id))
        }
    }

    /**
     * @file fight_element.js
     * @author Max Godefroy <max@godefroy.net>
     */


    class FightElement extends EncounterElement
    {
        constructor() {
            super();

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
    }


    class Creature
    {
        constructor(name, level, amount, link = null) {
            this.name = name;
            this.level = level == null ? 0 : level;
            this.amount = amount == null ? 1 : amount;
            this.link = link;
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
     * @file module.js
     * @author Max Godefroy <max@godefroy.net>
     *
     * @brief The file for handling the library interface, what classes and functions are available from the exterior
     */

    exports.Session = Session;
    exports.Encounter = Encounter;
    exports.EncounterElement = EncounterElement;
    exports.FightElement = FightElement;
    exports.Creature = Creature;
    exports.EncounterRating = EncounterRating;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
