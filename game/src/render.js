/* Ember Duel — rendering: heroes, hands, boards, log, title and end screens. */
(function () {
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function elementIcon(card) {
    return window.EmberCards.elementOf(card).icon;
  }

  function buildCard(card, opts) {
    opts = opts || {};
    var node = el("div", "card el-" + card.el);
    node.dataset.uid = String(card.uid);
    var cost = el("div", "cost", String(card.cost));
    node.appendChild(cost);
    var badge = el("div", "el-badge", elementIcon(card) + " " + window.EmberCards.elementOf(card).name.toUpperCase());
    node.appendChild(badge);
    node.appendChild(el("div", "art", elementIcon(card)));
    node.appendChild(el("div", "cname", card.name));
    var label = window.EmberCards.traitLabel(card.trait);
    if (label) node.appendChild(el("div", "trait-tag", label));
    node.appendChild(el("div", "ctext", card.text));
    var stats = el("div", "stats");
    stats.appendChild(el("span", "atk", "⚔️ " + card.atk));
    stats.appendChild(el("span", "hp", "🛡️ " + card.hp));
    node.appendChild(stats);
    if (card.trait !== "swift" && card.justPlayed && opts.onBoard) {
      node.appendChild(el("div", "sleep", "💤"));
    }
    if (opts.onBoard) {
      if (card.canAttack && !card.attacked) node.classList.add("can-attack");
      else node.classList.add("exhausted");
      if (card.justPlayed) node.classList.add("just-played");
    }
    if (opts.selected) node.classList.add("selected");
    if (opts.attacking) node.classList.add("attacking");
    if (opts.targetable) node.classList.add("targetable");
    if (opts.unaffordable) node.classList.add("unaffordable");
    return node;
  }

  function buildCardBack() {
    var node = el("div", "card-back", "🔥");
    return node;
  }

  function renderHero(side, isFoe) {
    var box = document.getElementById(isFoe ? "foe-hero" : "you-hero");
    box.innerHTML = "";
    box.appendChild(el("span", "portrait", side.portrait));
    var nameBox = el("div");
    nameBox.appendChild(el("div", "hero-name", side.name));
    nameBox.appendChild(el("div", "hero-sub", side.sub + " · Deck " + side.deck.length + " · Hand " + side.hand.length));
    box.appendChild(nameBox);
    var life = el("span", "life" + (side.life <= 10 ? " low" : ""), "❤️ " + Math.max(0, side.life));
    life.id = isFoe ? "foe-life" : "you-life";
    box.appendChild(life);
    var mana = el("span", "mana-pill", "🔷 " + side.mana + "/" + side.maxMana);
    box.appendChild(mana);
    return box;
  }

  function renderHand(game, isFoe) {
    var box = document.getElementById(isFoe ? "foe-hand" : "you-hand");
    box.innerHTML = "";
    var side = isFoe ? game.foe : game.you;
    var i;
    if (isFoe) {
      for (i = 0; i < side.hand.length; i++) box.appendChild(buildCardBack());
      return;
    }
    for (i = 0; i < side.hand.length; i++) {
      var card = side.hand[i];
      var node = buildCard(card, {
        selected: game.selectedHand === i,
        unaffordable: game.phase === "player" && card.cost > side.mana
      });
      node.dataset.handIndex = String(i);
      box.appendChild(node);
    }
  }

  function renderBoard(game, isFoe) {
    var box = document.getElementById(isFoe ? "foe-board" : "you-board");
    box.innerHTML = "";
    var side = isFoe ? game.foe : game.you;
    if (side.board.length === 0) {
      box.appendChild(el("div", "board-empty", isFoe ? "The Warden's table is empty." : "Your table is empty — play a card."));
      return;
    }
    var targets = null;
    if (!isFoe && game.attackerUid) {
      var attacker = null;
      var k;
      for (k = 0; k < game.you.board.length; k++) {
        if (game.you.board[k].uid === game.attackerUid) attacker = game.you.board[k];
      }
      if (attacker) targets = window.EmberEngine.legalTargets(game, attacker);
    }
    var i;
    for (i = 0; i < side.board.length; i++) {
      var card = side.board[i];
      var opts = { onBoard: true };
      if (!isFoe) {
        opts.attacking = game.attackerUid === card.uid;
      } else if (targets) {
        opts.targetable = targets.minions.indexOf(card.uid) >= 0;
      }
      box.appendChild(buildCard(card, opts));
    }
  }

  function renderLog(game) {
    var box = document.getElementById("log");
    box.innerHTML = "";
    var i;
    for (i = 0; i < game.log.length; i++) {
      var line = el("div");
      line.innerHTML = game.log[i];
      box.appendChild(line);
    }
  }

  function renderMid(game) {
    var banner = document.getElementById("turn-banner");
    if (game.phase === "player") banner.textContent = "Your turn — Turn " + game.turn;
    else if (game.phase === "foe") banner.textContent = "Warden's turn…";
    else if (game.phase === "over") banner.textContent = game.winner === "you" ? "Victory!" : "Defeat";
    else banner.textContent = "Ember Duel";
    var manaStone = document.getElementById("mana-stone");
    manaStone.textContent = "🔷 Mana " + game.you.mana + " / " + game.you.maxMana + "  ·  Turn " + game.turn;
    var deckPile = document.getElementById("deck-pile");
    deckPile.textContent = "DECK " + game.you.deck.length;
    var endBtn = document.getElementById("end-turn-btn");
    endBtn.disabled = game.phase !== "player";
    var hint = document.getElementById("hint");
    if (game.phase === "player") {
      if (game.attackerUid) hint.innerHTML = "<b>Attacking!</b> Click an enemy fighter — or the Warden's life — to strike. Esc cancels.";
      else if (game.selectedHand >= 0) hint.innerHTML = "<b>Card selected.</b> Click it again (or press Enter) to play it. Esc cancels.";
      else hint.innerHTML = "Click a card to play it · Click one of your fighters, then an enemy, to attack · Keys 1–5 play cards · A attacks · N ends turn";
    } else if (game.phase === "foe") {
      hint.innerHTML = "The Cinder Warden is thinking…";
    }
  }

  function renderAll(game) {
    renderHero(game.foe, true);
    renderHero(game.you, false);
    renderHand(game, true);
    renderHand(game, false);
    renderBoard(game, true);
    renderBoard(game, false);
    renderLog(game);
    renderMid(game);
    if (game.phase === "over") showEnd(game);
    else hideEnd();
  }

  function showEnd(game) {
    var screen = document.getElementById("end-screen");
    var panel = screen.querySelector(".end-panel");
    var win = game.winner === "you";
    panel.classList.toggle("win", win);
    panel.classList.toggle("loss", !win);
    document.getElementById("end-ico").textContent = win ? "🏆" : "💀";
    document.getElementById("end-title").textContent = win ? "VICTORY!" : "DEFEAT";
    document.getElementById("end-sub").textContent = win
      ? "The Cinder Warden falls. The embers are yours."
      : "The Warden's embers consume you. The duel is lost — try again.";
    document.getElementById("end-stats").textContent =
      "Turns: " + game.turnCount + " · Cards played: " + game.cardsPlayed +
      " · Damage dealt: " + game.damageDealt + " · Your life: " + Math.max(0, game.you.life) +
      " · Warden life: " + Math.max(0, game.foe.life);
    screen.classList.remove("hidden");
  }

  function hideEnd() {
    document.getElementById("end-screen").classList.add("hidden");
  }

  function showTitle() {
    document.getElementById("title-screen").classList.remove("hidden");
  }

  function hideTitle() {
    document.getElementById("title-screen").classList.add("hidden");
  }

  window.EmberRender = {
    renderAll: renderAll, renderHero: renderHero, renderHand: renderHand,
    renderBoard: renderBoard, renderLog: renderLog, renderMid: renderMid,
    showEnd: showEnd, hideEnd: hideEnd, showTitle: showTitle, hideTitle: hideTitle,
    buildCard: buildCard, buildCardBack: buildCardBack
  };
})();
