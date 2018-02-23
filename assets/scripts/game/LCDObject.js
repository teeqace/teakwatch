const OBJECT_COLOR = '#24211E';
const OFF_OPACITY = 20;

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
    this.objectOn.node.scaleX = this.objectOff.node.scaleX;
    this.objectOn.node.scaleY = this.objectOff.node.scaleY;
    this.objectOn.node.rotation = this.objectOff.node.rotation;
    this.objectOn.node.x = 2;
    this.objectOn.node.y = -2;
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
  },

  isDisplayOn() {
    return this.objectOn.node.active;
  }
});
