import LCDigit from './LCDigit';
import MessagePipeline from './utils/MessagePipeline';

cc.Class({
  extends: cc.Component,

  properties: {
    digits: {
      default: [],
      type: [LCDigit]
    }
  },

  // use this for initialization
  onLoad: function () {
    this._score = 0;
    MessagePipeline.on('gameStart', this._gameStart, this);
  },

  _gameStart() {
    this._score = 0;
    this._displayScore();
  },

  addScore(value) {
    this._score = Math.min(this._score + value, 999);
    if (this._score % 5 === 0) {
      MessagePipeline.sendMessage('levelUp');
    }
    this._displayScore();
  },

  _displayScore() {
    let tmpScore = this._score;
    for (let i = 0; i < this.digits.length; i++) {
      let pow = Math.pow(10, this.digits.length - (i + 1));
      if (i < this.digits.length - 1 && this._score < pow) {
        this.digits[i].display();
      } else {
        let num = Math.floor(tmpScore / pow);
        tmpScore -= pow * num;
        this.digits[i].display(num);
      }
    }
  }
  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
