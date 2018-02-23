import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';
import LCDObject from './LCDObject';

cc.Class({
  extends: cc.Component,

  properties: {
    enemyBody: LCDObject,
    enemyArmReady: LCDObject,
    enemyArmThrow: LCDObject,
    block: LCDObject
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('game:enemyReadyTick', this._enemyReadyTick, this);
    MessagePipeline.on('game:tick', this._tick, this);
    MessagePipeline.on('game:demoStart', this._demoStart, this);
    MessagePipeline.on('game:demoStop', this._demoStop, this);
  },

  _demoStart() {
    this.enemyBody.displayOn();
    this.enemyArmReady.displayOn();
    this.enemyArmThrow.displayOff();
    this.block.displayOn();
  },

  _demoStop() {
    this.enemyArmReady.displayOn();
    this.enemyArmThrow.displayOff();
    this.block.displayOn();
  },

  _enemyReadyTick() {
    if (GameManager.gameTickTimes % GameManager.safeInterval === GameManager.safeInterval - 1) {
      this.enemyArmReady.displayOff();
      this.enemyArmThrow.displayOn();
      this.block.displayOff();
    } else {
      this.enemyArmReady.displayOn();
      this.enemyArmThrow.displayOff();
      this.block.displayOn();
    }
  },

  _tick() {
    this.enemyArmReady.displayOff();
    this.enemyArmThrow.displayOn();
    this.block.displayOff();
  }
  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
