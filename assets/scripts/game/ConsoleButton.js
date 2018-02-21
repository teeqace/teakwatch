import MessagePipeline from '../utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    triggerPressed: true,
    buttonOn: cc.Node,
    eventName: ''
  },

  // use this for initialization
  onLoad: function () {
    this.node.on(cc.Node.EventType.TOUCH_START, this._onPress, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this._onRelease, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onRelease, this);
    this.buttonOn.active = true;
  },

  _onPress() {
    this.buttonOn.active = false;
    if (this.triggerPressed) {
      MessagePipeline.sendMessage(this.eventName);
    }
  },

  _onRelease() {
    this.buttonOn.active = true;
    if (!this.triggerPressed) {
      MessagePipeline.sendMessage(this.eventName);
    }
  }
    
});
