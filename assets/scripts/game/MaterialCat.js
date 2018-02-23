import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';
import LCDObject from './LCDObject';

const CAT_APPEAR = 8;
const CAT_READY = 4;
const CAT_STEAL = 4;

cc.Class({
  extends: cc.Component,

  properties: {
    catAppear: LCDObject,
    catReady: LCDObject,
    catSteal: LCDObject,
    material: LCDObject
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('game:materialTick', this._materialTick, this);
    MessagePipeline.on('game:catStealed', this._catStealed, this);
    MessagePipeline.on('game:catAway', this._catAway, this);
    this._catDisplayCount = 0;
    this._materialDisplayCount = 0;
    this._catReady = false;
    this._catAppear = false;
  },

  _materialTick() {
    let materialTick = GameManager.materialTick;
    if (GameManager.materialStack > 0) {
      if (materialTick <= CAT_READY) {
        this._catAppear = false;
        this._catReady = true;
      } else if (materialTick <= CAT_APPEAR) {
        this._catAppear = true;
        this._catReady = false;
      }
    }

    this._catDisplayCount = Math.max(0, this._catDisplayCount - 1);
    this._materialDisplayCount = Math.max(0, this._materialDisplayCount - 1);

    this.catAppear.display(this._catAppear);
    this.catReady.display(this._catReady);
    this.catSteal.display(this._catDisplayCount > 0);
    this.material.display(this._materialDisplayCount > 0);
  },

  _catStealed() {
    if (this._catAppear || this._catReady) {
      this._catDisplayCount = CAT_STEAL;
      this._materialDisplayCount = CAT_STEAL;
      this._catAppear = false;
      this._catReady = false;
      this.catAppear.displayOff();
      this.catReady.displayOff();
      this.catSteal.displayOn();
      this.material.displayOn();
    }
  },

  _catAway() {
    if (this._catAppear || this._catReady) {
      this._catDisplayCount = CAT_STEAL;
      this._materialDisplayCount = 0;
      this._catAppear = false;
      this._catReady = false;
      this.catAppear.displayOff();
      this.catReady.displayOff();
      this.catSteal.displayOn();
      this.material.displayOff();
    }
  }
});
