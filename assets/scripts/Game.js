import MessagePipeline from './utils/MessagePipeline';
import Player from './Player';
import Lanes from './Lanes';
import Life from './Life';
import LCObject from './LCObject';

const BLINK_TIME = 1;
const BLINK_TIMES = 2;

cc.Class({
  extends: cc.Component,

  properties: {
    player: Player,
    lanes: Lanes,
    life: Life,
    sound: LCObject,
    gameLabel: LCObject,
    overLabel: LCObject
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('checkHitFromBlock', this._checkHitFromBlock, this);
    MessagePipeline.on('checkHitFromPlayer', this._checkHitFromPlayer, this);
    MessagePipeline.on('gameOver', this._gameOver, this);

    this._allLCObjects = [];
    this._allLCObjects = this.node.getComponentsInChildren('LCObject');

    this._isDemo = false;
    this._start = false;
    this._gameOver = false;
    this._gameOverAnimationTimer = 0;
    this._gameOverBlinkTime = 0;
    setTimeout(() => {
      this._demoStart();
    });

    // setTimeout(() => {
    //   MessagePipeline.sendMessage('gameStart');
    //   MessagePipeline.sendMessage('turnStart', true);
    // });
    // this._gameOver = false;

    // this._gameOverAnimationTimer = 0;
    // this._gameOverBlinkTime = 0;
  },

  _demoStart() {
    this._isDemo = true;
    this.gameLabel.displayOn();
    this.overLabel.displayOn();
    MessagePipeline.sendMessage('demoStart');
  },

  $startButton() {
    if (this._start) {
      return;
    }
    this._isDemo = false;
    this._start = true;
    MessagePipeline.sendMessage('demoStop');
    this._gameStart();
    // this._start = true;
    // if (this._start) {
    //   this._allLCObjects.forEach((child, index) => {
    //     child.node.active = true;
    //     child.displayOff();
    //     this.sound.node.active = true;
    //   }, this);
    //   this._gameStart();
    // } else {
    //   this._allLCObjects.forEach((child, index) => {
    //     child.displayOff();
    //     child.node.active = false;
    //     this.sound.node.active = false;
    //   }, this);
    //   this._startOff();
    // }
  },

  _gameStart() {
    MessagePipeline.sendMessage('soundPlay', 'GameStart');
    MessagePipeline.sendMessage('scoreReset');
    this.gameLabel.displayOn();
    this.overLabel.displayOff();
    setTimeout(() => {
      MessagePipeline.sendMessage('gameStart');
      MessagePipeline.sendMessage('turnStart', true);
    }, 2500);
    this._gameOver = false;
    this._gameOverAnimationTimer = 0;
    this._gameOverBlinkTime = 0;
  },

  _checkHitFromBlock(event) {
    let laneIndex = event.getUserData();
    let playerIndex = this.player.index;
    if (laneIndex === playerIndex) {
      this.life.damage();
      MessagePipeline.sendMessage('tickStop');
      MessagePipeline.sendMessage('playerHit', playerIndex);
    }
  },

  _checkHitFromPlayer(event) {
    let playerIndex = event.getUserData();
    let bottomLanes = this.lanes.getBottomLanes();
    for (let i = 0; i < bottomLanes.length; i++) {
      if (bottomLanes[i] === playerIndex) {
        this.life.damage();
        MessagePipeline.sendMessage('tickStop');
        MessagePipeline.sendMessage('playerHit', playerIndex);
      }
    }
  },

  _gameOver() {
    MessagePipeline.sendMessage('soundPlay', 'GameOver');
    this.overLabel.displayOn();
    this._gameOver = true;
  },
  // _checkHit() {
  //   let playerIndex = this.player.index;
  //   let bottomLanes = this.lanes.getBottomLanes();
  //   for (let i = 0; i < bottomLanes.length; i++) {
  //     if (bottomLanes[i] === playerIndex) {
  //       this.life.damage();
  //     }
  //   }
  // }

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (!this._gameOver) {
      return;
    }

    this._gameOverAnimationTimer += dt;
    if (this._gameOverAnimationTimer < BLINK_TIME / 2) {
      this._allLCObjects.forEach((child, index) => {
        child.displayOn();
      }, this);
    } else {
      this._allLCObjects.forEach((child, index) => {
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
        this._demoStart();
      }
    }

  },
});
