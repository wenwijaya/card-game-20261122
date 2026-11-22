/* Ember Duel — deck building, shuffling and drawing. */
(function () {
  var DECK_SIZE = 32;
  var OPENING_HAND = 4;
  var MAX_HAND = 10;

  function makeInstance(def) {
    return {
      uid: 0, id: def.id, name: def.name, el: def.el,
      cost: def.cost, atk: def.atk, hp: def.hp, maxHp: def.hp,
      trait: def.trait, text: def.text,
      canAttack: false, justPlayed: false, attacked: false
    };
  }

  function buildDeck(rng) {
    var pool = window.EmberCards.CARD_POOL;
    var deck = [];
    var uid = 1;
    var i, j;
    for (i = 0; i < pool.length; i++) {
      for (j = 0; j < 2; j++) {
        var card = makeInstance(pool[i]);
        card.uid = uid++;
        deck.push(card);
      }
    }
    return shuffleDeck(deck, rng);
  }

  function shuffleDeck(deck, rng) {
    var i, j, tmp;
    for (i = deck.length - 1; i > 0; i--) {
      j = Math.floor(rng() * (i + 1));
      tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    return deck;
  }

  /* Draw one card for a side. Returns the card, or null when the deck is empty
     (the caller then applies 1 fatigue damage). */
  function drawCard(side) {
    if (side.deck.length === 0) return null;
    if (side.hand.length >= MAX_HAND) { side.deck.shift(); return null; }
    var card = side.deck.shift();
    side.hand.push(card);
    return card;
  }

  function drawOpeningHand(side) {
    var i;
    for (i = 0; i < OPENING_HAND; i++) drawCard(side);
  }

  window.EmberDeck = {
    DECK_SIZE: DECK_SIZE, OPENING_HAND: OPENING_HAND, MAX_HAND: MAX_HAND,
    buildDeck: buildDeck, shuffleDeck: shuffleDeck,
    drawCard: drawCard, drawOpeningHand: drawOpeningHand, makeInstance: makeInstance
  };
})();
