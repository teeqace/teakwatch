import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';
import LCDObject from './LCDObject';

const BLINK_TIME = 0.4;
const BLINK_TIMES = 4;

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCDObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);

    this.indexMax = this.objects.length - 1;
    this._displayPlayer();

    this._demoTickCount = 0;

    this._damageAnimation = false;
    this._damageAnimationTimer = 0;
    this._damageBlinkTime = 0;
    this._blinkOn = false;

    MessagePipeline.on('moveLeft', this._moveLeft, this);
    MessagePipeline.on('moveRight', this._moveRight, this);
    MessagePipeline.on('game:playerDamage', this._playerDamage, this);
    MessagePipeline.on('game:displayPlayer', this._displayPlayer, this);
    MessagePipeline.on('game:demoStart', this._demoStart, this);
    MessagePipeline.on('game:demoStop', this._demoStop, this);
    MessagePipeline.on('game:tick', this._tick, this);
  },

  onDestroy () {
    MessagePipeline.off('moveLeft', this._moveLeft, this);
    MessagePipeline.off('moveRight', this._moveRight, this);
    MessagePipeline.off('game:playerDamage', this._playerDamage, this);
    MessagePipeline.off('game:displayPlayer', this._displayPlayer, this);
    MessagePipeline.off('game:demoStart', this._demoStart, this);
    MessagePipeline.off('game:demoStop', this._demoStop, this);
    MessagePipeline.off('game:tick', this._tick, this);
  },

  _demoStart() {
    this._demoTickCount = -1;
  },

  _demoStop() {
    this.objects.forEach((child, index) => {
      child.display(index === 0);
    }, this);
  },

  _tick() {
    if (!GameManager.isDemo) {
      return;
    }
    this._demoTickCount = (this._demoTickCount + 1) % (this.indexMax * 2);
    this.objects.forEach((child, index) => {
      child.display(index === this.indexMax - Math.abs(this._demoTickCount - this.indexMax));
    }, this);
  },

  _moveLeft() {
    if (!GameManager.playerMovable) {
      return;
    }
    if (GameManager.isPaused) {
      return;
    }
    GameManager.movePlayer(-1);
  },

  _moveRight() {
    if (!GameManager.playerMovable) {
      return;
    }
    if (GameManager.isPaused) {
      return;
    }
    GameManager.movePlayer(1);
  },

  _displayPlayer() {
    let playerIndex = GameManager.playerIndex;
    this.objects.forEach((child, index) => {
      child.display(index === playerIndex);
    }, this);
  },

  _playerDamage(event) {
    this._damageAnimation = true;
    this._damageAnimationTimer = 0;
    this._blinkOn = false;
    this._damageBlinkTime = 0;
    MessagePipeline.sendMessage('soundPlay', 'Damage');
  },

  update(dt) {
    if (!this._damageAnimation) {
      return;
    }
    if (GameManager.isPaused) {
      return;
    }
    this._damageAnimationTimer += dt;
    let blinkChange = !this._blinkOn && this._damageAnimationTimer < BLINK_TIME / 2 || this._blinkOn && this._damageAnimationTimer >= BLINK_TIME / 2;
    if (blinkChange) {
      this._blinkOn = this._damageAnimationTimer < BLINK_TIME / 2;
      this.objects[GameManager.playerIndex].display(this._blinkOn);
      MessagePipeline.sendMessage('game:playerDamageBlink', this._blinkOn);
    }
    if (this._damageAnimationTimer >= BLINK_TIME) {
      this._damageAnimationTimer = 0;
      this._damageBlinkTime += 1;
      if (this._damageBlinkTime >= BLINK_TIMES) {
        this._damageAnimation = false;
        GameManager.playerDamage();
        if (!GameManager.gameOver) {
          GameManager.turnStart();
        }
      }
    }

  }
});
