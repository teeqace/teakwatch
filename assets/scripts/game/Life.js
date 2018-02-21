import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad: function () {
    this.lives = [];
    this.node.children.forEach((child) => {
      let object = child.getComponent('LCDObject');
      if (object) {
        this.lives.push(object);
      }
    }, this);
    MessagePipeline.on('game:displayLife', this._displayLife, this);
  },

  _displayLife() {
    let life = GameManager.life;
    this.lives.forEach((child, index) => {
      child.display(index < life);
    }, this);
  }

});
