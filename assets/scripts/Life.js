import MessagePipeline from './utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    life: {
      get: function () {
        return this._life;
      },
      visible: false
    }
  },

  // use this for initialization
  onLoad: function () {
    this.lives = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCObject');
      if (object) {
        this.lives.push(object);
      }
    }, this);

    this._life = this.lives.length;
    MessagePipeline.on('gameStart', this._gameStart, this);
  },

  displayLives() {
    this.lives.forEach((child, index) => {
      child.display(index < this._life);
    }, this);
  },

  damage() {
    this._life -= 1;
    this.displayLives();
  },

  _gameStart() {
    this._life = this.lives.length;
    this.displayLives();
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
