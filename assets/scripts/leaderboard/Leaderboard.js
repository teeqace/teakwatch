import MessagePipeline from '../utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    animation: cc.Animation
  },

  // use this for initialization
  onLoad: function () {
    this.animation.on('finished', this._animFinished, this);
  },

  $closeButton() {
    this.animation.play('LeaderboardClose');
  },

  _animFinished(event) {
    if (event.detail.name === 'LeaderboardClose') {
      MessagePipeline.sendMessage('menu:close');
      this.node.destroy();
    }
  }
});
