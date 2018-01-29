import MessagePipeline from './utils/MessagePipeline';
import LCObject from './LCObject';
import Score from './Score';

cc.Class({
  extends: cc.Component,

  properties: {
    index: {
      get: function () {
        return this._index;
      },
      visible: false
    },
    scoreGetLeft: LCObject,
    scoreGetRight: LCObject,
    score: Score
  },

  // use this for initialization
  onLoad: function () {
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);

    this.indexMax = this.objects.length - 1;
    this._index = 0;
    this.displayPlayer();

    this._goalRight = true;
    this._movable = false;
    MessagePipeline.on('gameStart', this._turnStart, this);
    MessagePipeline.on('turnStart', this._turnStart, this);
    MessagePipeline.on('playerHit', this._playerHit, this);
    MessagePipeline.on('moveLeft', this._moveLeft, this);
    MessagePipeline.on('moveRight', this._moveRight, this);
  },

  _moveLeft() {
    if (!this._movable) {
      return;
    }
    if (this._goalRight && this._index === 1) {
      return;
    }
    let beforeIndex = this._index;
    this._index = Math.max(0, this._index - 1);
    if (!this._goalRight && beforeIndex > 0 && this._index === 0) {
      this._goalRight = true;
      this.scoreGetLeft.displayOn();
      this.score.addScore(1);
      setTimeout(() => {
        this.scoreGetLeft.displayOff();
      }, 1000);
      MessagePipeline.sendMessage('soundPlay', 'Goal');
    } else {
      MessagePipeline.sendMessage('soundPlay', 'Move');
    }
    this.displayPlayer();
  },

  _moveRight() {
    if (!this._movable) {
      return;
    }
    if (!this._goalRight && this._index === this.indexMax - 1) {
      return;
    }
    let beforeIndex = this._index;
    this._index = Math.min(this._index + 1, this.indexMax);
    if (this._goalRight && beforeIndex < this.indexMax && this._index === this.indexMax) {
      this._goalRight = false;
      this.scoreGetRight.displayOn();
      this.score.addScore(1);
      setTimeout(() => {
        this.scoreGetRight.displayOff();
      }, 1000);
      MessagePipeline.sendMessage('soundPlay', 'Goal');
    } else {
      MessagePipeline.sendMessage('soundPlay', 'Move');
    }
    // MessagePipeline.sendMessage('checkHit');
    this.displayPlayer();
  },

  displayPlayer() {
    this.objects.forEach((child, index) => {
      child.display(index === this._index);
    }, this);
  },

  _turnStart() {
    this._movable = true;
    this._index = 0;
    this._goalRight = true;
    this.displayPlayer();
  },

  _playerHit() {
    this._movable = false;
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
