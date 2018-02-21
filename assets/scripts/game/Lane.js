import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

const DEMO_PLAY = [
  [0],
  [1],
  [2],
  [3],
  [4],
  [0,4],
  [1,4],
  [2,4],
  [3,4],
  [0,3,4],
  [1,3,4],
  [2,3,4],
  [0,2,3,4],
  [1,2,3,4],
  [0,1,2,3,4],
  [],
  [0,1,2,3,4],
  [],
];

cc.Class({
  extends: cc.Component,

  properties: {
    laneIndex: 0
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('game:demoStart', this._demoStart, this);
    MessagePipeline.on('game:demoStop', this._demoStop, this);
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCDObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);

    this._blockIndexes = [];
    this._demoIndex = 0;

    this.maxIndex = this.objects.length - 1;
    this.displayBlock();
  },

  _demoStart() {
    this._demoIndex = 0;
  },

  _demoStop() {
    this._demoIndex = 0;
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

  demoTick() {
    this._blockIndexes = DEMO_PLAY[this._demoIndex];
    this._demoIndex = (this._demoIndex + 1) % DEMO_PLAY.length;
    this.displayBlock();
  },

  tick(spawn) {
    for (let i = 0; i < this._blockIndexes.length; i++) {
      if (this._blockIndexes[i] >= 0) {
        this._blockIndexes[i] += 1;
        if (this._blockIndexes[i] === this.maxIndex) {
          GameManager.addBottom(this.laneIndex);
          GameManager.checkHitFromBlock(this.laneIndex);
        } else if (this._blockIndexes[i] > this.maxIndex) {
          this._blockIndexes.splice(i, 1);
          i -= 1;
        }
      }
    }
    if (spawn > 0) {
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
