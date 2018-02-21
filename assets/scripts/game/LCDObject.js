const OBJECT_COLOR = '#24211E';
const OFF_OPACITY = 10;

cc.Class({
  extends: cc.Component,

  properties: {
    objectOn: cc.Sprite,
    objectOff: cc.Sprite,
    defaultDisplay: false
  },

  // use this for initialization
  onLoad: function () {
    this.objectOn.node.active = this.defaultDisplay;
    this.objectOn.node.width = this.objectOff.node.width;
    this.objectOn.node.height = this.objectOff.node.height;
    this.objectOn.spriteFrame = this.objectOff.node.getComponent(cc.Sprite).spriteFrame;

    this.objectOff.node.color = cc.hexToColor(OBJECT_COLOR);
    this.objectOn.node.color = cc.hexToColor(OBJECT_COLOR);
    this.objectOff.node.opacity = OFF_OPACITY;
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
