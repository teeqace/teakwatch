import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';
import LCDObject from './LCDObject';

const BLINK_TIME = 1;
const BLINK_TIMES = 2;

cc.Class({
  extends: cc.Component,

  properties: {
    sound: LCDObject,
    gameLabel: LCDObject,
    overLabel: LCDObject,
    pauseLabel: LCDObject
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('game:gameOver', this._gameOver, this);
    MessagePipeline.on('pressStartButton', this._pressStartButton, this);
    MessagePipeline.on('game:gameBoot', this._gameBoot, this);

    MessagePipeline.on('game:demoStart', this._demoStart, this);
    MessagePipeline.on('game:demoStop', this._demoStop, this);
    MessagePipeline.on('game:tick', this._tick, this);
    MessagePipeline.on('game:displayPause', this._displayPause, this);
    this._demo = false;
    this._demoTickOn = false;

    this._allLCDObjects = [];
    this._allLCDObjects = this.node.getComponentsInChildren('LCDObject');

    this._start = false;
    this._gameOver = false;
    this._gameOverAnimationTimer = 0;
    this._gameOverBlinkTime = 0;
  },

  _gameBoot() {
    this.gameLabel.displayOn();
    this.overLabel.displayOn();
    MessagePipeline.sendMessage('game:tickReset');
    MessagePipeline.sendMessage('game:demoStart');
  },

  _pressStartButton() {
    if (this._start) {
      GameManager.pause();
      return;
    }
    this._start = true;
    this.gameLabel.displayOn();
    this.overLabel.displayOff();
    this._gameOver = false;
    this._gameOverAnimationTimer = 0;
    this._gameOverBlinkTime = 0;
    GameManager.resetGame();
    MessagePipeline.sendMessage('game:tickStop');
    MessagePipeline.sendMessage('game:demoStop');
    MessagePipeline.sendMessage('soundPlay', 'GameStart');
    setTimeout(() => {
      GameManager.turnStart();
    }, 2500);
  },

  _gameOver() {
    MessagePipeline.sendMessage('soundPlay', 'GameOver');
    this.gameLabel.displayOn();
    this.overLabel.displayOn();
    this._gameOver = true;
  },

  _demoStart() {
    this._demo = true;
    this._demoTickOn = false;
  },

  _demoStop() {
    this._demo = false;
    this._demoTickOn = false;
  },

  _tick() {
    if (!this._demo) {
      return;
    }
    this._demoTickOn = !this._demoTickOn;
    this.gameLabel.display(this._demoTickOn);
    this.overLabel.display(this._demoTickOn);
  },

  _displayPause() {
    this.pauseLabel.display(GameManager.isPaused);
  },

  update(dt) {
    if (!this._gameOver) {
      return;
    }
    if (GameManager.isPaused) {
      return;
    }
    this._gameOverAnimationTimer += dt;
    if (this._gameOverAnimationTimer < BLINK_TIME / 2) {
      this._allLCDObjects.forEach((child, index) => {
        child.displayOn();
      }, this);
    } else {
      this._allLCDObjects.forEach((child, index) => {
        child.displayOff();
      }, this);
    }
    if (this._gameOverAnimationTimer >= BLINK_TIME) {
      this._gameOverAnimationTimer = 0;
      this._gameOverBlinkTime += 1;
      if (this._gameOverBlinkTime >= BLINK_TIMES) {

        this._start = false;
        this._gameOver = false;
        this._gameOverBlinkTime = 0;
        this._gameBoot();
      }
    }

  },
});
