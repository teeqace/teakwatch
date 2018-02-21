import MessagePipeline from '../utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    setTimeout(() => {
      MessagePipeline.sendMessage('game:gameBoot');
    });
  }
});
