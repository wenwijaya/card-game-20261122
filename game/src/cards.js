/* Ember Duel — card pool. Four elements, each told apart by colour AND icon:
   Flame (red, fire), Tide (blue, wave), Leaf (green, leaf), Stone (grey, rock).
   Advantage cycle: Flame > Leaf > Stone > Tide > Flame. Advantage adds +2 attack. */
(function () {
  var ELEMENTS = {
    flame: { name: "Flame", icon: "🔥", beats: "leaf", color: "#c0392b" },
    tide: { name: "Tide", icon: "💧", beats: "flame", color: "#2471a3" },
    leaf: { name: "Leaf", icon: "🍃", beats: "stone", color: "#229954" },
    stone: { name: "Stone", icon: "🪨", beats: "tide", color: "#6e6259" }
  };

  /* id, name, element, mana cost, attack, health, trait, flavour text.
     Traits: swift (attacks the turn it arrives), guard (must be attacked first),
     ember (deals 1 damage on play), heal (restores N life on play). */
  var CARD_POOL = [
    { id: "ember-sprite", name: "Ember Sprite", el: "flame", cost: 1, atk: 2, hp: 1, trait: "swift", text: "Swift: strikes at once." },
    { id: "cinder-imp", name: "Cinder Imp", el: "flame", cost: 2, atk: 3, hp: 2, trait: "ember", text: "Ember: 1 damage." },
    { id: "flame-drake", name: "Flame Drake", el: "flame", cost: 5, atk: 6, hp: 5, trait: "ember", text: "Ember: 1 damage." },
    { id: "ash-phoenix", name: "Ash Phoenix", el: "flame", cost: 6, atk: 5, hp: 6, trait: "swift", text: "Swift: strikes at once." },
    { id: "tide-wisp", name: "Tide Wisp", el: "tide", cost: 1, atk: 1, hp: 2, trait: "heal2", text: "Heal: restore 2 life." },
    { id: "coral-guardian", name: "Coral Guardian", el: "tide", cost: 2, atk: 2, hp: 4, trait: "guard", text: "Guard: hit me first." },
    { id: "river-serpent", name: "River Serpent", el: "tide", cost: 3, atk: 3, hp: 4, trait: "", text: "Slips between stones." },
    { id: "mist-fox", name: "Mist Fox", el: "tide", cost: 4, atk: 4, hp: 3, trait: "swift", text: "Swift: strikes at once." },
    { id: "storm-leviathan", name: "Storm Leviathan", el: "tide", cost: 6, atk: 6, hp: 7, trait: "", text: "The tide, armed." },
    { id: "sproutling", name: "Sproutling", el: "leaf", cost: 1, atk: 1, hp: 3, trait: "heal2", text: "Heal: restore 2 life." },
    { id: "thorn-wolf", name: "Thorn Wolf", el: "leaf", cost: 2, atk: 3, hp: 2, trait: "swift", text: "Swift: strikes at once." },
    { id: "grove-elder", name: "Grove Elder", el: "leaf", cost: 4, atk: 3, hp: 6, trait: "guard", text: "Guard: hit me first." },
    { id: "bloom-titan", name: "Bloom Titan", el: "leaf", cost: 6, atk: 7, hp: 7, trait: "", text: "A garden that fights." },
    { id: "pebble-golem", name: "Pebble Golem", el: "stone", cost: 2, atk: 2, hp: 5, trait: "guard", text: "Guard: hit me first." },
    { id: "quarry-hound", name: "Quarry Hound", el: "stone", cost: 3, atk: 4, hp: 3, trait: "swift", text: "Swift: strikes at once." },
    { id: "granite-colossus", name: "Granite Giant", el: "stone", cost: 5, atk: 5, hp: 7, trait: "guard", text: "Guard: hit me first." }
  ];

  function elementOf(card) { return ELEMENTS[card.el]; }
  function hasAdvantage(attacker, defender) {
    return ELEMENTS[attacker.el].beats === defender.el;
  }
  function traitLabel(trait) {
    if (trait === "swift") return "SWIFT";
    if (trait === "guard") return "GUARD";
    if (trait === "ember") return "EMBER";
    if (trait === "heal2") return "HEAL 2";
    return "";
  }

  window.EmberCards = { ELEMENTS: ELEMENTS, CARD_POOL: CARD_POOL, elementOf: elementOf, hasAdvantage: hasAdvantage, traitLabel: traitLabel };
})();
