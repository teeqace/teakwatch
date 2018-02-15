import MessagePipeline from './utils/MessagePipeline';

const DEMO_PLAY = [
  [0],
  [1],
  [2],
  [3],
  [4],
  [5],
  [0,5],
  [1,5],
  [2,5],
  [3,5],
  [4,5],
  [0,4,5],
  [1,4,5],
  [2,4,5],
  [3,4,5],
  [0,3,4,5],
  [1,3,4,5],
  [2,3,4,5],
  [0,2,3,4,5],
  [1,2,3,4,5],
  [0,1,2,3,4,5],
  [],
  [0,1,2,3,4,5],
  [],
];
// const SPAWN_CHANCE = 0.2;

cc.Class({
  extends: cc.Component,

  properties: {
    laneIndex: 0
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('demoStart', this._demoStart, this);
    MessagePipeline.on('demoStop', this._demoStop, this);
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCObject');
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

  // _moveDown(i) {
  //   this._blockIndexes[i] = Math.min(this._blockIndexes[i] + 1, this.maxIndex);
  //   if (this._blockIndexes[i] === this.maxIndex) {
  //     this._blockIndexes[i] = -1;
  //     MessagePipeline.sendMessage('checkHitFromBlock', this.laneIndex);
  //   }
  // },

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
          MessagePipeline.sendMessage('checkHitFromBlock', this.laneIndex);
        } else if (this._blockIndexes[i] > this.maxIndex) {
          // this._blockIndexes[i] = -1;
          this._blockIndexes.splice(i, 1);
          i -= 1;
        }
      }
    }
    if (spawn === 1) {
      this._blockIndexes.push(0);
    }
    // let spawned = false;
    // for (let i = 0; i < this._blockIndexes.length; i++) {
    //   if (!spawned && this._blockIndexes[i] < 0) {
    //     let spawn = Math.random();
    //     if (spawn < SPAWN_CHANCE) {
    //       this._blockIndexes[i] = 0;
    //       spawned = true;
    //     }
    //   } else if (this._blockIndexes[i] >= 0) {
    //     this._blockIndexes[i] += 1;
    //     if (this._blockIndexes[i] === this.maxIndex) {
    //       MessagePipeline.sendMessage('checkHitFromBlock', this.laneIndex);
    //     } else if (this._blockIndexes[i] > this.maxIndex) {
    //       this._blockIndexes[i] = -1;
    //     }
    //   }
    // }
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
