/* Ember Duel — game engine: state, turns, combat, traits, win/loss. */
(function () {
  var START_LIFE = 30;
  var MAX_MANA = 10;
  var MAX_BOARD = 5;

  function newSide(name, portrait, sub) {
    return {
      name: name, portrait: portrait, sub: sub,
      life: START_LIFE, mana: 0, maxMana: 0,
      deck: [], hand: [], board: []
    };
  }

  function createGame(rng) {
    var game = {
      rng: rng || Math.random,
      you: newSide("You", "🧑‍🚀", "Ember Knight"),
      foe: newSide("Cinder Warden", "🦊", "Warden of the Ashes"),
      turn: 1, phase: "title", winner: null,
      selectedHand: -1, attackerUid: 0,
      log: [], turnCount: 0, cardsPlayed: 0, damageDealt: 0
    };
    game.you.deck = window.EmberDeck.buildDeck(game.rng);
    game.foe.deck = window.EmberDeck.buildDeck(game.rng);
    window.EmberDeck.drawOpeningHand(game.you);
    window.EmberDeck.drawOpeningHand(game.foe);
    game.you.maxMana = 1; game.you.mana = 1;
    game.foe.maxMana = 1; game.foe.mana = 1;
    return game;
  }

  function logLine(game, text) {
    game.log.unshift(text);
    if (game.log.length > 3) game.log.length = 3;
  }

  function beginTurn(game, side) {
    if (side.maxMana < MAX_MANA) side.maxMana += 1;
    side.mana = side.maxMana;
    var i;
    for (i = 0; i < side.board.length; i++) {
      side.board[i].canAttack = true;
      side.board[i].attacked = false;
      side.board[i].justPlayed = false;
    }
    var drawn = window.EmberDeck.drawCard(side);
    if (drawn === null && side.deck.length === 0) {
      side.life -= 1;
      logLine(game, "<b>" + side.name + "</b> takes 1 fatigue damage (empty deck).");
    }
    game.turnCount += 1;
    checkWinner(game);
  }

  function startPlayerTurn(game) {
    game.phase = "player";
    game.selectedHand = -1;
    game.attackerUid = 0;
    beginTurn(game, game.you);
    logLine(game, "<b>Your turn " + game.turn + "</b> — " + game.you.mana + " mana, drew a card.");
  }

  function startFoeTurn(game) {
    game.phase = "foe";
    game.selectedHand = -1;
    game.attackerUid = 0;
    beginTurn(game, game.foe);
    logLine(game, "<b>Cinder Warden's turn</b> — " + game.foe.mana + " mana.");
  }

  function endPlayerTurn(game) {
    if (game.phase !== "player") return;
    game.turn += 1;
    startFoeTurn(game);
    window.EmberAI.takeTurn(game);
    if (game.phase === "foe") startPlayerTurn(game);
  }

  function playableCards(game) {
    var out = [];
    var i;
    for (i = 0; i < game.you.hand.length; i++) {
      if (game.you.hand[i].cost <= game.you.mana) out.push(i);
    }
    return out;
  }

  function playCard(game, handIndex) {
    if (game.phase !== "player") return false;
    var side = game.you;
    if (handIndex < 0 || handIndex >= side.hand.length) return false;
    var card = side.hand[handIndex];
    if (card.cost > side.mana) return false;
    if (side.board.length >= MAX_BOARD) return false;
    side.hand.splice(handIndex, 1);
    side.mana -= card.cost;
    card.canAttack = card.trait === "swift";
    card.justPlayed = true;
    card.attacked = false;
    side.board.push(card);
    game.cardsPlayed += 1;
    logLine(game, "You play <b>" + card.name + "</b> (" + card.atk + "/" + card.hp + ").");
    applyPlayTrait(game, side, game.foe, card);
    checkWinner(game);
    return true;
  }

  function applyPlayTrait(game, owner, enemy, card) {
    if (card.trait === "ember") {
      enemy.life -= 1;
      game.damageDealt += (owner === game.you ? 1 : 0);
      logLine(game, "<b>" + card.name + "</b> ember burns " + enemy.name + " for 1.");
    } else if (card.trait === "heal2") {
      owner.life = Math.min(START_LIFE, owner.life + 2);
      logLine(game, "<b>" + card.name + "</b> heals " + owner.name + " for 2.");
    }
  }

  function legalTargets(game, attacker) {
    var foeBoard = game.foe.board;
    var guards = [];
    var i;
    for (i = 0; i < foeBoard.length; i++) {
      if (foeBoard[i].trait === "guard") guards.push(foeBoard[i].uid);
    }
    if (guards.length > 0) return { minions: guards, hero: false };
    var all = [];
    for (i = 0; i < foeBoard.length; i++) all.push(foeBoard[i].uid);
    return { minions: all, hero: true };
  }

  function attackDamage(attacker, defender) {
    var dmg = attacker.atk;
    if (window.EmberCards.hasAdvantage(attacker, defender)) dmg += 2;
    return dmg;
  }

  function fighterAttack(game, attackerUid, targetUid) {
    if (game.phase !== "player") return false;
    var attacker = null;
    var i;
    for (i = 0; i < game.you.board.length; i++) {
      if (game.you.board[i].uid === attackerUid) attacker = game.you.board[i];
    }
    if (!attacker || !attacker.canAttack || attacker.attacked) return false;
    var targets = legalTargets(game, attacker);
    if (targetUid === 0) {
      if (!targets.hero) return false;
      var dmg = attacker.atk;
      game.foe.life -= dmg;
      game.damageDealt += dmg;
      attacker.attacked = true;
      attacker.canAttack = false;
      logLine(game, "<b>" + attacker.name + "</b> hits the Warden for " + dmg + ".");
    } else {
      if (targets.minions.indexOf(targetUid) < 0) return false;
      var defender = null;
      for (i = 0; i < game.foe.board.length; i++) {
        if (game.foe.board[i].uid === targetUid) defender = game.foe.board[i];
      }
      if (!defender) return false;
      var dealt = attackDamage(attacker, defender);
      var back = attackDamage(defender, attacker);
      defender.hp -= dealt;
      attacker.hp -= back;
      game.damageDealt += dealt;
      attacker.attacked = true;
      attacker.canAttack = false;
      var adv = window.EmberCards.hasAdvantage(attacker, defender) ? " (element advantage +2)" : "";
      logLine(game, "<b>" + attacker.name + "</b> hits " + defender.name + " for " + dealt + adv + "; takes " + back + " back.");
      removeDead(game.you);
      removeDead(game.foe);
    }
    game.attackerUid = 0;
    checkWinner(game);
    return true;
  }

  function removeDead(side) {
    var i;
    for (i = side.board.length - 1; i >= 0; i--) {
      if (side.board[i].hp <= 0) side.board.splice(i, 1);
    }
  }

  function checkWinner(game) {
    if (game.winner) return game.winner;
    if (game.foe.life <= 0) { game.winner = "you"; game.phase = "over"; }
    else if (game.you.life <= 0) { game.winner = "foe"; game.phase = "over"; }
    return game.winner;
  }

  window.EmberEngine = {
    START_LIFE: START_LIFE, MAX_MANA: MAX_MANA, MAX_BOARD: MAX_BOARD,
    createGame: createGame, logLine: logLine,
    startPlayerTurn: startPlayerTurn, startFoeTurn: startFoeTurn,
    endPlayerTurn: endPlayerTurn, playCard: playCard, playableCards: playableCards,
    fighterAttack: fighterAttack, legalTargets: legalTargets,
    attackDamage: attackDamage, checkWinner: checkWinner, applyPlayTrait: applyPlayTrait
  };
})();
