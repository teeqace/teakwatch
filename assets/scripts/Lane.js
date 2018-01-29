import MessagePipeline from './utils/MessagePipeline';

const SPAWN_CHANCE = 0.25;

cc.Class({
  extends: cc.Component,

  properties: {
    laneIndex: 0
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

    this._blockIndexes = [-1, -1];

    this.maxIndex = this.objects.length;
    this.index = -1;
    this.displayBlock();
  },

  // _moveDown(i) {
  //   this._blockIndexes[i] = Math.min(this._blockIndexes[i] + 1, this.maxIndex);
  //   if (this._blockIndexes[i] === this.maxIndex) {
  //     this._blockIndexes[i] = -1;
  //     MessagePipeline.sendMessage('checkHit', this.laneIndex);
  //   }
  // },

  tick() {
    let spawned = false;
    for (let i = 0; i < this._blockIndexes.length; i++) {
      if (!spawned && this._blockIndexes[i] < 0) {
        let spawn = Math.random();
        if (spawn < SPAWN_CHANCE) {
          this._blockIndexes[i] = 0;
          spawned = true;
        }
      } else if (this._blockIndexes[i] >= 0) {
        this._blockIndexes[i] += 1;
        if (this._blockIndexes[i] >= this.maxIndex) {
          this._blockIndexes[i] = -1;
          MessagePipeline.sendMessage('checkHit', this.laneIndex);
        }
      }
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
    this.index = -1;
    this._blockIndexes = [-1, -1];
    this.displayBlock();
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
