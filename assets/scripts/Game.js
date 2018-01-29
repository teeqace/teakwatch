import MessagePipeline from './utils/MessagePipeline';
import Player from './Player';
import Lanes from './Lanes';
import Life from './Life';

const BLINK_TIME = 1;
const BLINK_TIMES = 2;

cc.Class({
  extends: cc.Component,

  properties: {
    player: Player,
    lanes: Lanes,
    life: Life
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('checkHit', this._checkHit, this);
    MessagePipeline.on('gameOver', this._gameOver, this);

    setTimeout(() => {
      MessagePipeline.sendMessage('gameStart');
      MessagePipeline.sendMessage('turnStart');
    });
    this._gameOver = false;

    this._allLCObjects = [];
    this._allLCObjects = this.node.getComponentsInChildren('LCObject');
    this._gameOverAnimationTimer = 0;
    this._gameOverBlinkTime = 0;
  },

  _checkHit(event) {
    let laneIndex = event.getUserData();
    let playerIndex = this.player.index;
    if (laneIndex === playerIndex) {
      this.life.damage();
      MessagePipeline.sendMessage('playerHit', playerIndex);
    }
    // let bottomLanes = this.lanes.getBottomLanes();
    // for (let i = 0; i < bottomLanes.length; i++) {
    //   if (bottomLanes[i] === playerIndex) {
    //     this.life.damage();
    //   }
    // }
  },

  _gameOver() {
    MessagePipeline.sendMessage('soundPlay', 'GameOver');
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
  update: function (dt) {
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
        this._gameOver = false;
        this._gameOverBlinkTime = 0;
        MessagePipeline.sendMessage('gameStart');
        MessagePipeline.sendMessage('turnStart');
      }
    }

  },
});
