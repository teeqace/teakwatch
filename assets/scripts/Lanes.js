import MessagePipeline from './utils/MessagePipeline';

const INIT_TICK = 1.0;
const MIN_TICK = 0.2;
const TICK_LEVEL = 0.04;

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  onLoad() {
    this.lanes = [];
    this.node.children.forEach((child) => {
      let lane = child.getComponent('Lane');
      if (lane) {
        this.lanes.push(lane);
      }
    }, this);

    this._tickStart = false;
    this._tickTimer = INIT_TICK;
    this._timer = 0
    MessagePipeline.on('gameStart', this._gameStart, this);
    MessagePipeline.on('turnStart', this._turnStart, this);
    MessagePipeline.on('playerHit', this._playerHit, this);
    MessagePipeline.on('levelUp', this._levelUp, this);
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (!this._tickStart) {
      return;
    }
    this._timer += dt;
    if (this._timer >= this._tickTimer) {
      this._timer -= this._tickTimer;
      this.lanes.forEach((lane, index) => {
        lane.tick();
      }, this);
      MessagePipeline.sendMessage('soundPlay', 'Tick');
    }
  },
  
  _gameStart() {
    this._tickTimer = INIT_TICK;
  },
  
  _turnStart() {
    this._tickStart = true;
    this._timer = 0;
    this.lanes.forEach((lane, index) => {
      lane.reset();
    }, this);
  },

  _playerHit() {
    this._tickStart = false;
  },

  _levelUp() {
    this._tickTimer = Math.max(this._tickTimer - TICK_LEVEL, MIN_TICK);
  }

  // getBottomLanes() {
  //   let bottomLanes = [];
  //   this.lanes.forEach((lane, index) => {
  //     if (lane.isBotton) {
  //       bottomLanes.push(lane.laneIndex);
  //     }
  //   }, this);
  //   return bottomLanes;
  // }
});
