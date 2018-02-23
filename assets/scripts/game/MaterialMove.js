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
    this._objLength = this.objects.length;
    MessagePipeline.on('game:displayMaterial', this._displayMaterial, this);
    MessagePipeline.on('game:playerDamageBlink', this._playerDamageBlink, this);
  },

  _displayMaterial() {
    if (!GameManager.goalRight) {
      this._displayMaterialOn(GameManager.playerIndex - 1);
    } else {
      this._displayMaterialOn(-1);
    }
  },

  _displayMaterialOn(index) {
    this.objects.forEach((child, i) => {
      child.display(i === index);
    }, this);
  },

  _playerDamageBlink(event) {
    if (GameManager.goalRight) {
      return;
    }
    if (GameManager.playerIndex === 0 && GameManager.playerIndex > this._objLength) {
      return;
    }
    let blinkOn = event.getUserData();
    this.objects[GameManager.playerIndex - 1].display(blinkOn);
  }
});
