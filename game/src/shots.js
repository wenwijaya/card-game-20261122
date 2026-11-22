/* Ember Duel — deterministic demo states for screenshots (?shot=title|table|win|loss).
   These build a fixed table from the game's own cards and render it, so every
   screenshot is a real render of the game's own code. */
(function () {
  var DEMO_HAND = ["ember-sprite", "cinder-imp", "coral-guardian", "thorn-wolf", "granite-colossus"];
  var DEMO_YOU_BOARD = [
    { id: "flame-drake", hp: 4 }, { id: "grove-elder", hp: 6 }, { id: "quarry-hound", hp: 3 }
  ];
  var DEMO_FOE_BOARD = [
    { id: "river-serpent", hp: 3 }, { id: "pebble-golem", hp: 5 }, { id: "mist-fox", hp: 2 }
  ];
  var DEMO_FOE_HAND = 5;

  function seededRng(seed) {
    var s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function cardById(id) {
    var pool = window.EmberCards.CARD_POOL;
    var i;
    for (i = 0; i < pool.length; i++) {
      if (pool[i].id === id) return pool[i];
    }
    return pool[0];
  }

  function demoCard(id, uid, hp) {
    var def = cardById(id);
    var card = window.EmberDeck.makeInstance(def);
    card.uid = uid;
    if (hp !== undefined) card.hp = hp;
    card.canAttack = true;
    card.justPlayed = false;
    return card;
  }

  function demoTable(game) {
    var uid = 100;
    var i;
    game.you.hand = [];
    for (i = 0; i < DEMO_HAND.length; i++) {
      var hc = demoCard(DEMO_HAND[i], uid++);
      hc.canAttack = false;
      game.you.hand.push(hc);
    }
    game.you.board = [];
    for (i = 0; i < DEMO_YOU_BOARD.length; i++) {
      game.you.board.push(demoCard(DEMO_YOU_BOARD[i].id, uid++, DEMO_YOU_BOARD[i].hp));
    }
    game.foe.board = [];
    for (i = 0; i < DEMO_FOE_BOARD.length; i++) {
      game.foe.board.push(demoCard(DEMO_FOE_BOARD[i].id, uid++, DEMO_FOE_BOARD[i].hp));
    }
    game.foe.hand = [];
    for (i = 0; i < DEMO_FOE_HAND; i++) {
      game.foe.hand.push(demoCard("ember-sprite", uid++));
    }
    game.you.life = 24;
    game.foe.life = 17;
    game.you.mana = 5;
    game.you.maxMana = 6;
    game.foe.mana = 4;
    game.foe.maxMana = 6;
    game.turn = 6;
    game.phase = "player";
    game.selectedHand = 1;
    game.attackerUid = game.you.board[0].uid;
    window.EmberEngine.logLine(game, "You play <b>Flame Drake</b> (6/5).");
    window.EmberEngine.logLine(game, "Warden's <b>River Serpent</b> hits Grove Elder for 3.");
    window.EmberEngine.logLine(game, "<b>Your turn 6</b> — 5 mana, drew a card.");
  }

  /* Returns a shot name when the URL asks for one, else null. */
  function shotName() {
    var q = new URLSearchParams(window.location.search);
    return q.get("shot");
  }

  function applyShot(game, shot) {
    if (shot === "title") {
      demoTable(game);
      game.phase = "title";
      window.EmberRender.renderAll(game);
      window.EmberRender.showTitle();
      return true;
    }
    if (shot === "table") {
      demoTable(game);
      window.EmberRender.hideTitle();
      window.EmberRender.renderAll(game);
      return true;
    }
    if (shot === "win" || shot === "loss") {
      demoTable(game);
      game.foe.life = shot === "win" ? 0 : 17;
      game.you.life = shot === "win" ? 24 : 0;
      game.winner = shot === "win" ? "you" : "foe";
      game.phase = "over";
      game.turnCount = 6;
      game.cardsPlayed = 9;
      game.damageDealt = shot === "win" ? 30 : 24;
      window.EmberRender.hideTitle();
      window.EmberRender.renderAll(game);
      return true;
    }
    return false;
  }

  window.EmberShots = {
    shotName: shotName, applyShot: applyShot, demoTable: demoTable, seededRng: seededRng
  };
})();
