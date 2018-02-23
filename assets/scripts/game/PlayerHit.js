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

    MessagePipeline.on('game:playerDamageBlink', this._playerDamageBlink, this);
  },

  _playerDamageBlink(event) {
    let blinkOn = event.getUserData();
    this.objects[GameManager.playerIndex - 1].display(blinkOn);
  }
});