/* Ember Duel — bootstrap, mouse + keyboard input, tiny WebAudio bleeps. */
(function () {
  var game = null;
  var soundOn = true;
  var audioCtx = null;

  function beep(freq, ms) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) { /* sound is optional; never break the game */ }
  }

  function refresh() {
    window.EmberRender.renderAll(game);
  }

  function playSelectedHand() {
    if (game.selectedHand < 0) return;
    var idx = game.selectedHand;
    game.selectedHand = -1;
    if (window.EmberEngine.playCard(game, idx)) beep(520, 90);
    refresh();
  }

  function onHandClick(ev) {
    var node = ev.target.closest(".card");
    if (!node || game.phase !== "player") return;
    var idx = parseInt(node.dataset.handIndex, 10);
    if (game.selectedHand === idx) { playSelectedHand(); return; }
    game.selectedHand = idx;
    game.attackerUid = 0;
    beep(440, 50);
    refresh();
  }

  function onBoardClick(ev, isFoe) {
    if (game.phase !== "player") return;
    if (isFoe) {
      var node = ev.target.closest(".card");
      if (!node) return;
      var targetUid = parseInt(node.dataset.uid, 10);
      if (game.attackerUid) {
        if (window.EmberEngine.fighterAttack(game, game.attackerUid, targetUid)) beep(300, 120);
        refresh();
      }
      return;
    }
    var mine = ev.target.closest(".card");
    if (!mine) return;
    var uid = parseInt(mine.dataset.uid, 10);
    var card = null;
    var i;
    for (i = 0; i < game.you.board.length; i++) {
      if (game.you.board[i].uid === uid) card = game.you.board[i];
    }
    if (!card) return;
    if (game.attackerUid === uid) { game.attackerUid = 0; refresh(); return; }
    if (card.canAttack && !card.attacked) {
      game.attackerUid = uid;
      game.selectedHand = -1;
      beep(660, 50);
      refresh();
    }
  }

  function onHeroClick(isFoe) {
    if (!isFoe || game.phase !== "player" || !game.attackerUid) return;
    var attacker = null;
    var i;
    for (i = 0; i < game.you.board.length; i++) {
      if (game.you.board[i].uid === game.attackerUid) attacker = game.you.board[i];
    }
    if (!attacker) return;
    var targets = window.EmberEngine.legalTargets(game, attacker);
    if (!targets.hero) return;
    if (window.EmberEngine.fighterAttack(game, game.attackerUid, 0)) beep(300, 120);
    refresh();
  }

  function endTurn() {
    if (game.phase !== "player") return;
    game.selectedHand = -1;
    game.attackerUid = 0;
    window.EmberEngine.endPlayerTurn(game);
    beep(360, 80);
    refresh();
  }

  function startGame() {
    game = window.EmberEngine.createGame(Math.random);
    window.EmberRender.hideTitle();
    window.EmberEngine.startPlayerTurn(game);
    beep(520, 90);
    refresh();
  }

  function cycleAttacker() {
    var ready = [];
    var i;
    for (i = 0; i < game.you.board.length; i++) {
      var c = game.you.board[i];
      if (c.canAttack && !c.attacked) ready.push(c.uid);
    }
    if (ready.length === 0) return;
    var pos = ready.indexOf(game.attackerUid);
    game.attackerUid = ready[(pos + 1) % ready.length];
    game.selectedHand = -1;
    refresh();
  }

  function onKey(ev) {
    if (game.phase === "title") {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); startGame(); }
      return;
    }
    if (game.phase === "over") {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); startGame(); }
      return;
    }
    if (ev.key === "Escape") {
      game.selectedHand = -1;
      game.attackerUid = 0;
      refresh();
      return;
    }
    if (ev.key === "m" || ev.key === "M") {
      soundOn = !soundOn;
      document.getElementById("sound-btn").textContent = soundOn ? "♪ Sound: On" : "♪ Sound: Off";
      return;
    }
    if (ev.key === "h" || ev.key === "H") {
      document.getElementById("help-screen").classList.toggle("hidden");
      return;
    }
    if (game.phase !== "player") return;
    if (ev.key === "n" || ev.key === "N") { endTurn(); return; }
    if (ev.key === "Enter") { playSelectedHand(); return; }
    if (ev.key === "a" || ev.key === "A") { cycleAttacker(); return; }
    if (ev.key === "Tab") {
      ev.preventDefault();
      cycleAttacker();
      return;
    }
    var num = parseInt(ev.key, 10);
    if (num >= 1 && num <= 9) {
      var idx = num - 1;
      if (idx < game.you.hand.length) {
        if (game.selectedHand === idx) playSelectedHand();
        else { game.selectedHand = idx; game.attackerUid = 0; beep(440, 50); refresh(); }
      }
    }
  }

  function boot() {
    game = window.EmberEngine.createGame(Math.random);
    var shot = window.EmberShots.shotName();
    if (shot && window.EmberShots.applyShot(game, shot)) {
      bindStatic();
      return;
    }
    window.EmberRender.renderAll(game);
    window.EmberRender.showTitle();
    bindStatic();
  }

  function bindStatic() {
    document.getElementById("you-hand").addEventListener("click", onHandClick);
    document.getElementById("you-board").addEventListener("click", function (ev) { onBoardClick(ev, false); });
    document.getElementById("foe-board").addEventListener("click", function (ev) { onBoardClick(ev, true); });
    document.getElementById("foe-hero").addEventListener("click", function () { onHeroClick(true); });
    document.getElementById("end-turn-btn").addEventListener("click", endTurn);
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("again-btn").addEventListener("click", startGame);
    document.getElementById("help-btn").addEventListener("click", function () {
      document.getElementById("help-screen").classList.remove("hidden");
    });
    document.getElementById("help-close-btn").addEventListener("click", function () {
      document.getElementById("help-screen").classList.add("hidden");
    });
    document.getElementById("sound-btn").addEventListener("click", function () {
      soundOn = !soundOn;
      this.textContent = soundOn ? "♪ Sound: On" : "♪ Sound: Off";
    });
    document.addEventListener("keydown", onKey);
  }

  document.addEventListener("DOMContentLoaded", boot);
  window.EmberMain = { startGame: startGame, endTurn: endTurn, getGame: function () { return game; } };
})();
