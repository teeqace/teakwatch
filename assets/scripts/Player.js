import MessagePipeline from './utils/MessagePipeline';
import LCObject from './LCObject';
import Materials from './Materials';

cc.Class({
  extends: cc.Component,

  properties: {
    index: {
      get: function () {
        return this._index;
      },
      visible: false
    },
    materials: Materials

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
    this._goalCount = 0;
    this._demoTickCount = 0;
    MessagePipeline.on('turnStart', this._turnStart, this);
    MessagePipeline.on('tickStop', this._moveStop, this);
    MessagePipeline.on('moveLeft', this._moveLeft, this);
    MessagePipeline.on('moveRight', this._moveRight, this);
    MessagePipeline.on('demoStart', this._demoStart, this);
    MessagePipeline.on('demoStop', this._demoStop, this);
    MessagePipeline.on('demoTick', this._demoTick, this);
    
    // cc.eventManager.addListener({
    //   event: cc.EventListener.KEYBOARD,
    //   onKeyPressed: (keyCode, event) => {
    //     switch(keyCode) {
    //       case cc.KEY.left:
    //         this._moveLeft();
    //         break;
    //       case cc.KEY.right:
    //         this._moveRight();
    //         break;
    //     }
    //   }
    // }, this);
  },

  _demoStart() {
    this._demoPlay = true;
    this._demoTickCount = -1;
  },

  _demoStop() {
    this._demoPlay = false;
    this.objects.forEach((child, index) => {
      child.displayOff();
    }, this);
  },

  _demoTick() {
    this._demoTickCount = (this._demoTickCount + 1) % (this.indexMax * 2);
    this.objects.forEach((child, index) => {
      child.display(index === this.indexMax - Math.abs(this._demoTickCount - this.indexMax));
    }, this);
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
      this.goalCountUp();
      MessagePipeline.sendMessage('addStack');
      MessagePipeline.sendMessage('addScore', 1);
    } else {
      MessagePipeline.sendMessage('soundPlay', 'Move');
    }
    this.displayPlayer();
    MessagePipeline.sendMessage('checkHitFromPlayer', this._index);
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
      MessagePipeline.sendMessage('soundPlay', 'Material');
    } else {
      MessagePipeline.sendMessage('soundPlay', 'Move');
    }
    this.displayPlayer();
    MessagePipeline.sendMessage('checkHitFromPlayer', this._index);
  },

  goalCountUp() {
    this._goalCount += 1;
    if (this._goalCount % 4 === 0) {
      MessagePipeline.sendMessage('levelUp');
    }
  },

  displayPlayer() {
    this.objects.forEach((child, index) => {
      child.display(index === this._index);
    }, this);
    if (this._goalRight) {
      this.materials.displayMaterialOff();
      this.materials.displayMaterialOn(this.indexMax);
    } else {
      this.materials.displayMaterialOn(this._index);
    }
  },

  _turnStart() {
    this._movable = true;
    this._index = 0;
    this._goalRight = true;
    this.displayPlayer();
  },

  _moveStop() {
    this._movable = false;
  }
});
