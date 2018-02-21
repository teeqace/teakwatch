import LCDDigit from './LCDDigit';
import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

cc.Class({
  extends: cc.Component,

  properties: {
    digits: {
      default: [],
      type: [LCDDigit]
    }
  },

  // use this for initialization
  onLoad: function () {
    this._score = 0;
    MessagePipeline.on('game:displayScore', this._displayScore, this);
  },

  _displayScore() {
    let score = GameManager.score;
    let tmpScore = score;
    for (let i = 0; i < this.digits.length; i++) {
      let pow = Math.pow(10, this.digits.length - (i + 1));
      if (i < this.digits.length - 1 && score < pow) {
        this.digits[i].display();
      } else {
        let num = Math.floor(tmpScore / pow);
        tmpScore -= pow * num;
        this.digits[i].display(num);
      }
    }
  }
});
