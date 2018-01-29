cc.Class({
  extends: cc.Component,

  properties: {
    objectOn: cc.Sprite,
    defaultDisplay: false
  },

  // use this for initialization
  onLoad: function () {
    this.objectOn.node.active = this.defaultDisplay;
    this.objectOn.node.width = this.node.width;
    this.objectOn.node.height = this.node.height;
    this.objectOn.spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
  },

  display(value) {
    this.objectOn.node.active = value;
  },

  displayOn() {
    this.objectOn.node.active = true;
  },

  displayOff() {
    this.objectOn.node.active = false;
  }
});
