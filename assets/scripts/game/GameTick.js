import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

const INIT_TICK = 0.80;
// const INIT_TICK = 0.25;
const MIN_TICK = 0.30;
const PROGRESSIVE = 0.05;

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    this._ticking = false;
    this._tickTime = 0;
    this._timer = 0;

    MessagePipeline.on('game:tickReset', this._tickReset, this);
    MessagePipeline.on('game:tickStart', this._tickStart, this);
    MessagePipeline.on('game:tickStop', this._tickStop, this);
    MessagePipeline.on('game:speedUp', this._speedUp, this);
  },

  _tickReset() {
    this._ticking = true;
    this._tickTime = INIT_TICK;
    this._timer = 0;
  },

  _tickStart() {
    this._ticking = true;
    this._timer = 0;
  },

  _tickStop() {
    this._ticking = false;
  },

  _speedUp() {
    this._tickTime = Math.max(this._tickTime - PROGRESSIVE, MIN_TICK);
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (!this._ticking) {
      return;
    }
    if (GameManager.isPaused) {
      return;
    }
    if (this._timer >= this._tickTime / 2 && this._timer - dt < this._tickTime / 2) {
      MessagePipeline.sendMessage('game:enemyReadyTick');
    }
    this._timer -= dt;
    if (this._timer <= 0) {
      this._timer = this._tickTime;
      GameManager.gameTick();
      MessagePipeline.sendMessage('game:tick');
    }
  },
});
