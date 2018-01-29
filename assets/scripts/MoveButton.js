import MessagePipeline from './utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    isRight: false
  },

  // use this for initialization
  onLoad: function () {
    this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
  },

  _onTouchBegan(event) {
    if (this.isRight) {
      MessagePipeline.sendMessage('moveRight');
    } else {
      MessagePipeline.sendMessage('moveLeft');
    }
  },
  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
