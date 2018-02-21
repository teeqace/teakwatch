import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

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
    this._stackMax = this.objects.length;
    MessagePipeline.on('game:displayMaterialStack', this._displayMaterialRemaining, this);
  },

  _displayMaterialRemaining() {
    let materialRemaining = GameManager.materialRemaining;
    for (let i = 0; i < this._stackMax; i++) {
      this.objects[i].display(i < materialRemaining);
    }
  }
});
