import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad() {
    this._lanes = [];
    this.node.children.forEach((child) => {
      let lane = child.getComponent('Lane');
      if (lane) {
        this._lanes.push(lane);
      }
    }, this);
    this._beforePattern = [0,0,0,0,0];

    MessagePipeline.on('game:tick', this._tick, this);
  },

  _tick() {
    GameManager.resetBottom();
    let blockIndex = this._getPattern();
    this._lanes.forEach((lane, index) => {
      lane.tick(index === blockIndex);
    }, this);
    if (!GameManager.isDemo) {
      MessagePipeline.sendMessage('soundPlay', 'Tick');
    }
  },

  _getPattern() {
    if (GameManager.isSafeTick) {
      return -1;
    }

    let randomIndexStart = 0;
    let randomIndexCount = 4;
    /*
    when block pattern is like below, lane[0] cannot spawn new block
    [ ,0, , ]
    [0,1,0, ]
    [0,0,0,0]
    [0,0,0,0]
    [0,0,0,0]
    */
    if (this._lanes[1].blockIndexes.indexOf(1) >= 0) {
      randomIndexStart = 1;
      randomIndexCount -= 1;
    }
    /*
    when block pattern is like below, lane[3] cannot spawn new block
    [ ,0, , ] [ ,0, , ]
    [0,0,0, ] [0,0,1, ]
    [0,0,1,0] [0,1,0,0]
    [0,0,0,0] [0,0,0,0]
    [0,0,0,0] [0,0,0,0]
    */
    if (this._lanes[2].blockIndexes.indexOf(1) >= 0 ||
        (this._lanes[1].blockIndexes.indexOf(2) >= 0 && this._lanes[2].blockIndexes.indexOf(0) >= 0)) {
      randomIndexCount -= 1;
    }
    let index = randomIndexStart + Math.floor(Math.random() * randomIndexCount);
    return index;
  },
  
  getBottomLanes() {
    let bottomLanes = [];
    this._lanes.forEach((lane, index) => {
      if (lane.isBotton()) {
        bottomLanes.push(lane.laneIndex);
      }
    }, this);
    return bottomLanes;
  }
});
