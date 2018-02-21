import MessagePipeline from '../utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    animation: cc.Animation
  },

  // use this for initialization
  onLoad: function () {
    MessagePipeline.on('menu:open', this._open, this);
    MessagePipeline.on('menu:close', this._close, this);
  },

  _open() {
    this.animation.play('BlockInputOpen');
  },

  _close() {
    this.animation.play('BlockInputClose');
  }
});
