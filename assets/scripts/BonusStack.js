import MessagePipeline from './utils/MessagePipeline';
const REDUCE_COUNT = 25;
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
      let object = child.getComponent('LCObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);
    this._stackCount = 0;
    this._stackMax = this.objects.length;
    this._stackReduceTimer = REDUCE_COUNT;

    this._stackFilled = false;
    this._blinkTimer = 0;
    this._blinkTime = 0;

    MessagePipeline.on('gameStart', this._gameStart, this);
    MessagePipeline.on('addStack', this._addStack, this);
    MessagePipeline.on('tickStack', this._tick, this);
  },

  _gameStart() {
    this._stackCount = 0;
    this._stackFilled = false;
    this.stackDisplay();
  },

  _addStack() {
    this._stackCount = Math.min(this._stackCount + 1, this._stackMax);
    this.stackDisplay();
    if (this._stackCount === this._stackMax) {
      MessagePipeline.sendMessage('tickStop');
      MessagePipeline.sendMessage('addScore', 14);
      this._stackFilled = true;
      MessagePipeline.sendMessage('soundPlay', 'Bonus');
    } else {
      MessagePipeline.sendMessage('soundPlay', 'Goal');
    }
  },

  reduceStack() {
    this._stackCount = Math.max(this._stackCount - 1, 0);
    this.stackDisplay();
  },

  stackDisplay() {
    for (let i = 0; i < this._stackMax; i++) {
      this.objects[i].display(i < this._stackCount);
    }
    this._stackReduceTimer = REDUCE_COUNT;
  },

  _tick() {
    if (this._stackCount === 0) {
      return;
    }
    this._stackReduceTimer -= 1;
    // if (this._stackReduceTimer <= 7) {
    //   this.objects[this._stackCount - 1].display(this._stackReduceTimer % 2 === 1);
    // }
    if (this._stackReduceTimer <= 0) {
      this.reduceStack();
    }
  },

  // called every frame, uncomment this function to activate update callback
  update: function (dt) {
    if (!this._stackFilled) {
      return;
    }
    this._blinkTimer += dt;
    this.objects.forEach((child, index) => {
      child.display(this._blinkTimer < BLINK_TIME / 2);
    }, this);
    if (this._blinkTimer >= BLINK_TIME) {
      this._blinkTimer = 0;
      this._blinkTime += 1;
      if (this._blinkTime >= BLINK_TIMES) {
        this._stackFilled = false;
        this._stackCount = 0;
        this._blinkTimer = 0;
        this._blinkTime = 0;
        this.stackDisplay();
        MessagePipeline.sendMessage('turnStart', false);
      }
    }
  },
});
