import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';
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
      let object = child.getComponent('LCDObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);
    this._stackMax = this.objects.length;

    this._stackAnimation = false;
    this._blinkTimer = 0;
    this._blinkTime = 0;

    MessagePipeline.on('game:displayMaterialStack', this._displayMaterialStack, this);
    MessagePipeline.on('game:fillMaterialStack', this._fillMaterialStack, this);
  },

  _fillMaterialStack() {
    this._stackAnimation = true;
  },

  _displayMaterialStack() {
    let stack = GameManager.materialStack;
    for (let i = 0; i < this._stackMax; i++) {
      this.objects[i].display(i < stack);
    }
  },

  update(dt) {
    if (!this._stackAnimation) {
      return;
    }
    if (GameManager.isPaused) {
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
        GameManager.materialStack = 0;
        this._stackAnimation = false;
        this._blinkTimer = 0;
        this._blinkTime = 0;
        GameManager.turnStart();
      }
    }
  },
});
