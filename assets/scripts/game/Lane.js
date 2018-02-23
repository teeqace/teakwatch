import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

cc.Class({
  extends: cc.Component,

  properties: {
    laneIndex: 0,
    blockIndexes: {
      visible: false,
      get: function() {
        return this._blockIndexes;
      }
    }
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('game:demoStart', this._displayClear, this);
    MessagePipeline.on('game:demoStop', this._displayClear, this);
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCDObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);

    this._blockIndexes = [];

    this.maxIndex = this.objects.length - 1;
    this.displayBlock();
  },

  _displayClear() {
    this._blockIndexes = [];
    this.displayBlock();
  },

  isBotton() {
    for (let i = 0; i < this._blockIndexes.length; i++) {
      if (this._blockIndexes[i] >= 0) {
        if (this._blockIndexes[i] === this.maxIndex) {
          return true;
        }
      }
    }
    return false;
  },

  tick(spawn) {
    for (let i = 0; i < this._blockIndexes.length; i++) {
      if (this._blockIndexes[i] >= 0) {
        this._blockIndexes[i] += 1;
        if (this._blockIndexes[i] === this.maxIndex && !GameManager.isDemo) {
          GameManager.addBottom(this.laneIndex);
          GameManager.checkHitFromBlock(this.laneIndex);
        } else if (this._blockIndexes[i] > this.maxIndex) {
          this._blockIndexes.splice(i, 1);
          i -= 1;
        }
      }
    }
    if (spawn) {
      this._blockIndexes.push(0);
    }
    this.displayBlock();
  },

  displayBlock() {
    this.objects.forEach((child, index) => {
      let display = false;
      for (let i = 0; i < this._blockIndexes.length; i++) {
        if (this._blockIndexes[i] === index) {
          display = true;
        }
      }
      child.display(display);
    }, this);
  },

  reset() {
    this._blockIndexes = [];
    this.displayBlock();
  }
});
