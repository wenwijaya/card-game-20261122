/* Ember Duel — the Cinder Warden AI: plays cards, trades up, goes face when it wins. */
(function () {
  function takeTurn(game) {
    var foe = game.foe;
    var you = game.you;
    var i, j;

    /* Play cards: most expensive affordable first, but keep one cheap card in
       hand when mana is tight, and never flood past the board limit. */
    var played = true;
    var guard = 0;
    while (played && foe.board.length < 5 && guard < 12) {
      guard += 1;
      played = false;
      var best = -1;
      var bestCost = -1;
      for (i = 0; i < foe.hand.length; i++) {
        var c = foe.hand[i];
        if (c.cost <= foe.mana && c.cost > bestCost) { best = i; bestCost = c.cost; }
      }
      if (best >= 0) {
        var card = foe.hand.splice(best, 1)[0];
        foe.mana -= card.cost;
        card.canAttack = card.trait === "swift";
        card.justPlayed = true;
        card.attacked = false;
        foe.board.push(card);
        window.EmberEngine.logLine(game, "Warden plays <b>" + card.name + "</b> (" + card.atk + "/" + card.hp + ").");
        window.EmberEngine.applyPlayTrait(game, foe, you, card);
        if (window.EmberEngine.checkWinner(game)) return;
        played = true;
      }
    }

    /* Attack with every ready fighter. */
    for (i = 0; i < foe.board.length; i++) {
      var attacker = foe.board[i];
      if (!attacker.canAttack || attacker.attacked) continue;
      if (window.EmberEngine.checkWinner(game)) return;
      aiAttackOne(game, attacker);
    }
  }

  function aiAttackOne(game, attacker) {
    var you = game.you;
    /* Legal targets against the player's board: guards first. */
    var guards = [];
    var i;
    for (i = 0; i < you.board.length; i++) {
      if (you.board[i].trait === "guard") guards.push(you.board[i]);
    }
    var pool = guards.length > 0 ? guards : you.board.slice();

    /* Lethal: go face when the hero can be hit and the damage ends it. */
    if (guards.length === 0 && attacker.atk >= you.life) {
      hitHero(game, attacker);
      return;
    }

    /* Best trade: a target we kill (with advantage if possible) while surviving,
       or a target worth more than us. Score each candidate. */
    var bestTarget = null;
    var bestScore = -999;
    for (i = 0; i < pool.length; i++) {
      var def = pool[i];
      var dealt = window.EmberEngine.attackDamage(attacker, def);
      var back = window.EmberEngine.attackDamage(def, attacker);
      var kills = dealt >= def.hp ? 1 : 0;
      var dies = back >= attacker.hp ? 1 : 0;
      var score = kills * 10 + def.cost * 2 - dies * (attacker.cost + 2) + dealt;
      if (window.EmberCards.hasAdvantage(attacker, def)) score += 3;
      if (score > bestScore) { bestScore = score; bestTarget = def; }
    }

    if (bestTarget && bestScore >= 4) {
      hitMinion(game, attacker, bestTarget);
    } else if (guards.length === 0) {
      /* No good trade and no guard in the way: go face. */
      hitHero(game, attacker);
    } else if (bestTarget) {
      hitMinion(game, attacker, bestTarget);
    }
  }

  function hitHero(game, attacker) {
    game.you.life -= attacker.atk;
    attacker.attacked = true;
    attacker.canAttack = false;
    window.EmberEngine.logLine(game, "Warden's <b>" + attacker.name + "</b> hits you for " + attacker.atk + ".");
    window.EmberEngine.checkWinner(game);
  }

  function hitMinion(game, attacker, defender) {
    var dealt = window.EmberEngine.attackDamage(attacker, defender);
    var back = window.EmberEngine.attackDamage(defender, attacker);
    defender.hp -= dealt;
    attacker.hp -= back;
    attacker.attacked = true;
    attacker.canAttack = false;
    var adv = window.EmberCards.hasAdvantage(attacker, defender) ? " (advantage +2)" : "";
    window.EmberEngine.logLine(game, "Warden's <b>" + attacker.name + "</b> hits " + defender.name + " for " + dealt + adv + "; takes " + back + " back.");
    var i;
    for (i = game.you.board.length - 1; i >= 0; i--) {
      if (game.you.board[i].hp <= 0) game.you.board.splice(i, 1);
    }
    for (i = game.foe.board.length - 1; i >= 0; i--) {
      if (game.foe.board[i].hp <= 0) game.foe.board.splice(i, 1);
    }
    window.EmberEngine.checkWinner(game);
  }

  window.EmberAI = { takeTurn: takeTurn, aiAttackOne: aiAttackOne };
})();
