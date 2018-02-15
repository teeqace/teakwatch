import MessagePipeline from './utils/MessagePipeline';
import Life from './Life';

const BLINK_TIME = 0.4;
const BLINK_TIMES = 4;

cc.Class({
  extends: cc.Component,

  properties: {
    life: Life
  },

  // use this for initialization
  onLoad: function () {
    this.hits = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCObject');
      if (object) {
        this.hits.push(object);
      }
    }, this);

    this._hitAnimation = false;
    this._hitAnimationTimer = 0;
    this._hitBlinkTime = 0;
    this._hitIndex = 0;
    MessagePipeline.on('playerHit', this._playerHit, this);
  },

  _playerHit(event) {
    this._hitIndex = event.getUserData();
    this._hitAnimation = true;
    this._hitAnimationTimer = 0;
    this._hitBlinkTime = 0;
    MessagePipeline.sendMessage('soundPlay', 'Damage');
  },

  // called every frame, uncomment this function to activate update callback
  update: function (dt) {
    if (!this._hitAnimation) {
      return;
    }
    this._hitAnimationTimer += dt;
    if (this._hitAnimationTimer < BLINK_TIME / 2) {
      this.hits.forEach((child, index) => {
        child.display(index === this._hitIndex - 1);
      }, this);
    } else {
      this.hits.forEach((child, index) => {
        child.displayOff();
      }, this);
    }
    if (this._hitAnimationTimer >= BLINK_TIME) {
      this._hitAnimationTimer = 0;
      this._hitBlinkTime += 1;
      if (this._hitBlinkTime >= BLINK_TIMES) {
        this._hitAnimation = false;
        if (this.life.life < 0) {
          MessagePipeline.sendMessage('gameOver');
        } else {
          MessagePipeline.sendMessage('turnStart', false);
        }
      }
    }

  },
});
