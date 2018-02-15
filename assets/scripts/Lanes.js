import MessagePipeline from './utils/MessagePipeline';

const DEMO_TICK = 0.5;
const INIT_TICK = 0.72;
const MIN_TICK = 0.2;
const TICK_LEVEL = 0.04;
const SAFE_PATTERN = [0,0,0,0,0];
const BLOCK_PATTERN = [
  [
    [1,0,0,0,0],
    [0,1,0,0,0],
    [0,0,1,0,0],
    [0,0,0,1,0],
    [0,0,0,0,1],
  ],
  [
    [1,1,0,0,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
    [0,1,1,0,0],
    [0,1,0,1,0],
    [0,1,0,0,1],
    [0,0,1,1,0],
    [0,0,1,0,1],
    [0,0,0,1,1],
  ]
];
const SAFE_INTERVAL = 6;

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

    this._tickStart = false;
    this._tickTimer = INIT_TICK;
    this._timer = 0
    this._tickTimes = 0;
    this._demo = false;
    MessagePipeline.on('gameStart', this._gameStart, this);
    MessagePipeline.on('turnStart', this._turnStart, this);
    MessagePipeline.on('tickStop', this._tickStop, this);
    MessagePipeline.on('levelUp', this._levelUp, this);
    MessagePipeline.on('demoStart', this._demoStart, this);
    MessagePipeline.on('demoStop', this._demoStop, this);
  },

  _demoStart() {
    this._tickStart = true;
    this._tickTimer = DEMO_TICK;
    this._demo = true;
  },

  _demoStop() {
    this._tickStart = false;
    this._demo = false;
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (!this._tickStart) {
      return;
    }
    this._timer += dt;
    if (this._timer >= this._tickTimer) {
      this._timer -= this._tickTimer;
      if (this._demo) {
        this._demoTick();
      } else {
        this._gameTick();
      }
    }
  },

  _demoTick() {
    this._lanes.forEach((lane, index) => {
      lane.demoTick();
    }, this);
    MessagePipeline.sendMessage('demoTick');
  },

  _gameTick() {
    let pattern = this.getPattern();
    this._lanes.forEach((lane, index) => {
      lane.tick(pattern[index]);
    }, this);
    MessagePipeline.sendMessage('soundPlay', 'Tick');
    MessagePipeline.sendMessage('tickStack');
  },

  getPattern() {
    this._tickTimes = (this._tickTimes + 1) % SAFE_INTERVAL;
    let pattern;
    if ( this._tickTimes === 0) {
      pattern = SAFE_PATTERN;
    } else {
      let patterns;
      if (Math.random() < 0.75) {
        patterns = BLOCK_PATTERN[0];
      } else {
        patterns = BLOCK_PATTERN[1];
      }
      pattern = patterns[Math.floor(Math.random() * patterns.length)];
    }
    return pattern;
  },
  
  _gameStart() {
    this._demo = false;
    this._tickTimer = INIT_TICK;
  },

  _turnStart(event) {
    let reset = event.getUserData();
    this._tickStart = true;
    this._timer = this._tickTimer;
    if (reset) {
      this._lanes.forEach((lane, index) => {
        lane.reset();
      }, this);
    }
  },

  _tickStop() {
    this._tickStart = false;
  },

  _levelUp() {
    this._tickTimer = Math.max(this._tickTimer - TICK_LEVEL, MIN_TICK);
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
