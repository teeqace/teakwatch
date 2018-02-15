cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);
  },

  displayMaterialOn(index) {
    if (!this.objects) {
      return;
    }
    this.objects.forEach((child, i) => {
      child.display(i === index);
    }, this);
  },

  displayMaterialOff() {
    if (!this.objects) {
      return;
    }
    this.objects.forEach((child, index) => {
      child.displayOff();
    }, this);
  }
});
