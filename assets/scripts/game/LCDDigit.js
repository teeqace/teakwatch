const DIGIT_PATTERN = [
  [true, true, true, false, true, true, true],
  [false, false, true, false, false, true, false],
  [true, false, true, true, true, false, true],
  [true, false, true, true, false, true, true],
  [false, true, true, true, false, true, false],
  [true, true, false, true, false, true ,true],
  [true, true, false, true, true, true, true],
  [true, false, true, false, false, true, false],
  [true, true, true, true, true, true, true],
  [true, true, true, true, false, true, true]
]

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    this.objects = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCDObject');
      if (object) {
        this.objects.push(object);
      }
    }, this);
  },

  display(num) {
    let pattern = DIGIT_PATTERN[num];
    if (pattern) {
      this.objects.forEach((child, index) => {
        child.display(pattern[index]);
      }, this);
    } else {
      this.objects.forEach((child, index) => {
        child.displayOff();
      }, this);
    }
  }
});
