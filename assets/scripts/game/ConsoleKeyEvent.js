import ConsoleButton from './ConsoleButton';

cc.Class({
  extends: cc.Component,

  properties: {
    leftButton: ConsoleButton,
    rightButton: ConsoleButton
  },

  // use this for initialization
  onLoad: function () {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
    this._leftKeyPress = false;
    this._rightKeyPress = false;
  },

  onDestroy () {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
  },

  _onKeyDown (event) {
    switch(event.keyCode) {
      // case cc.KEY.a:
      case cc.KEY.left:
        if (this._leftKeyPress) {
          return;
        }
        this._leftKeyPress = true;
        this.leftButton._onPress();
        break;
      // case cc.KEY.d:
      case cc.KEY.right:
        if (this._rightKeyPress) {
          return;
        }
        this._rightKeyPress = true;
        this.rightButton._onPress();
        break;
    }
  },

  _onKeyUp() {
    switch(event.keyCode) {
      // case cc.KEY.a:
      case cc.KEY.left:
        this._leftKeyPress = false;
        this.leftButton._onRelease();
        break;
      // case cc.KEY.d:
      case cc.KEY.right:
        this._rightKeyPress = false;
        this.rightButton._onRelease();
        break;
    }
  },

});
