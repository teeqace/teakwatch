import MessagePipeline from '../utils/MessagePipeline';
import GameManager from '../managers/GameManager';

// const SAFE_PATTERN = [0,0,0,0,0];
// const BLOCK_PATTERN = [
//   [
//     [1,0,0,0,0],
//     [0,1,0,0,0],
//     [0,0,1,0,0],
//     [0,0,0,1,0],
//     [0,0,0,0,1],
//   ],
//   [
//     [1,1,0,0,0],
//     [1,0,1,0,0],
//     [1,0,0,1,0],
//     [1,0,0,0,1],
//     [0,1,1,0,0],
//     [0,1,0,1,0],
//     [0,1,0,0,1],
//     [0,0,1,1,0],
//     [0,0,1,0,1],
//     [0,0,0,1,1],
//   ]
// ];
const SAFE_INTERVAL = 6;
const BLOCK_TWO_RATE = 0.3333;

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
    this._demoPlay = false;
    this._tickTimes = 0;
    this._beforePattern = [0,0,0,0,0];

    MessagePipeline.on('game:demoStart', this._demoStart, this);
    MessagePipeline.on('game:demoStop', this._demoStop, this);

    MessagePipeline.on('game:tick', this._tick, this);
  },

  _demoStart() {
    this._demoPlay = true;
    this._tickTimes = 0;
  },

  _demoStop() {
    this._demoPlay = false;
  },

  _tick() {
    if (this._demoPlay) {
      this._demoTick();
    } else {
      this._gameTick();
    }
  },

  _demoTick() {
    this._lanes.forEach((lane, index) => {
      lane.demoTick();
    }, this);
  },

  _gameTick() {
    GameManager.resetBottom();
    let pattern = this._getPattern();
    this._lanes.forEach((lane, index) => {
      lane.tick(pattern[index]);
    }, this);
    MessagePipeline.sendMessage('soundPlay', 'Tick');
    GameManager.materialStackTick();
  },

  // _getPattern() {
  //   this._tickTimes = (this._tickTimes + 1) % SAFE_INTERVAL;
  //   let pattern;
  //   if (this._tickTimes === 0) {
  //     pattern = SAFE_PATTERN;
  //   } else {
  //     let patterns;
  //     if (Math.random() < 0.75) {
  //       patterns = BLOCK_PATTERN[0];
  //     } else {
  //       patterns = BLOCK_PATTERN[1];
  //     }
  //     pattern = patterns[Math.floor(Math.random() * patterns.length)];
  //   }
  //   return this._adjustPatternWidth(pattern);
  // },

  _getPattern() {
    let pattern = [0,0,0,0,0];
    this._tickTimes = (this._tickTimes + 1) % SAFE_INTERVAL;
    if (this._tickTimes === 0) {
      return pattern;
    }

    let candidateIndex = [0,1,2,3,4];
    let ngIndex = [0,0,0,0,0];

    let beforeBlockCount = 0;
    let betweenBlock = false;
    let betweenIndex = [];
    for (let i = 0; i < this._beforePattern.length; i++) {
      if (this._beforePattern[i] > 0) {
        beforeBlockCount += 1;
        betweenBlock = !betweenBlock;
      } else if (betweenBlock) {
        betweenIndex.push(i);
      }
    }
    if (beforeBlockCount < 2) {
      betweenIndex = [];
    }

    // if last pattern contains 2 blocks, next pattern cannot have 2 blocks
    let blockCount = 1;
    if (beforeBlockCount <= 1 && Math.random() < BLOCK_TWO_RATE) {
      blockCount += 1;
    }

    // NG patterns
    // [1,0,0,0,0] [0,0,0,0,1]
    // [0,1,0,0,0] [0,0,0,1,0]
    if (GameManager.goalRight && this._beforePattern[1] > 0) {
      ngIndex[0] = 1;
    }
    if (!GameManager.goalRight && this._beforePattern[3] > 0) {
      ngIndex[4] = 1;
    }
    // [0,1,0,0,0] [0,0,1,0,0] [0,0,0,1,0]
    // [1,0,1,0,0] [0,1,0,1,0] [0,0,1,0,1]
    if (betweenIndex.length === 1) {
      ngIndex[betweenIndex[0]] = 1;
    }
    // [1,1,0,0,0] [0,0,0,1,1]
    // [0,0,1,0,0] [0,0,1,0,0]
    if (GameManager.goalRight && blockCount === 2 && this._beforePattern[2] > 0) {
      ngIndex[0] = 1;
    }
    if (!GameManager.goalRight && blockCount === 2 && this._beforePattern[2] > 0) {
      ngIndex[4] = 1;
    }

    for (let i = 0; i < ngIndex.length; i++) {
      if (ngIndex[i] > 0) {
        ngIndex.splice(i, 1);
        candidateIndex.splice(i, 1);
        i -= 1;
      }
    }

    for (let i = 0; i < blockCount; i++) {
      let index = Math.floor(Math.random() * candidateIndex.length);
      pattern[candidateIndex[index]] = 1;
      candidateIndex.splice(index, 1)
    }
    this._beforePattern = pattern;
    return pattern;
  },

  /* not allow block pattern like below
  when goal is right
  [1,0,0,0,0] [1,1,0,0,0]
  [0,1,0,0,0] [0,0,1,0,0]
  when goal is left
  [0,0,0,0,1] [0,0,0,1,1]
  [0,0,0,1,0] [0,0,1,0,0]
  both
  [0,0,1,0,0] [0,0,1,1,0]
  [0,1,0,1,0] [0,1,0,0,1]
  */
  // _adjustPatternWidth(pattern) {
  //   let ngList = [];
  //   if (GameManager.goalRight) {

  //   }
  //   if (GameManager.goalRight && pattern[0] > 0) {
  //     if (this._beforePattern[1] > 0) {
  //       ngList.push(0);
  //     }
  //     if (pattern[1] > 0 && this._beforePattern[2] > 0) {
  //       ngList.push(1);
  //     }
  //     // if (this._beforePattern[1] > 0) {
  //     //   ngList.push(0);
  //     //   pattern[0] = 0;
  //     //   pattern[1 + Math.floor(Math.random() * 4)] += 1;
  //     // } else if (pattern[1] > 0 && this._beforePattern[2] > 0) {
  //     //   ngList.push(1);
  //     //   pattern[1] = 0;
  //     //   pattern[2 + Math.floor(Math.random() * 3)] += 1;
  //     // }
  //   }
  //   if (!GameManager.goalRight && pattern[4] > 0) {
  //     if (this._beforePattern[3] > 0) {
  //       ngList.push(4);
  //     }
  //     if (pattern[3] > 0 && this._beforePattern[2] > 0) {
  //       ngList.push(3);
  //     }
  //     // if (this._beforePattern[3] > 0) {
  //     //   ngList.push(4);
  //     //   pattern[4] = 0;
  //     //   pattern[Math.floor(Math.random() * 4)] += 1;
  //     // } else if (pattern[3] > 0 && this._beforePattern[2] > 0) {
  //     //   ngList.push(3);
  //     //   pattern[3] = 0;
  //     //   pattern[Math.floor(Math.random() * 3)] += 1;
  //     // }
  //   }
  //   if (this._beforePattern[0] > 0 && this._beforePattern[2] > 0 && pattern[1] === 0) {
  //     ngList.push(1);
  //     pattern[1] = 0;
  //     let index = (2 + Math.floor(Math.random() * 4)) % 5;
  //     pattern[index] += 1;
  //   } else if (this._beforePattern[1] > 0 && this._beforePattern[3] > 0 && pattern[2] === 0) {
  //     ngList.push(2);
  //     pattern[2] = 0;
  //     let index = 0;
  //     if (GameManager.goalRight) {
  //       index = 1 + Math.floor(Math.random() * 4);
  //     } else {
  //       index = Math.floor(Math.random() * 4);
  //     }
  //     pattern[index] += 1;
  //   } else if (this._beforePattern[2] > 0 && this._beforePattern[4] > 0 && pattern[3] === 0) {
  //     ngList.push(3);
  //     pattern[1] = 0;
  //     let index = (4 + Math.floor(Math.random() * 4)) % 5;
  //     pattern[index] += 1;
  //   }
  //   if (this._beforePattern[0] > 0 && this._beforePattern[3] > 0 && pattern[1] === 0 && pattern[2] === 0) {

  //   } else if (this._beforePattern[1] > 0 && this._beforePattern[4] > 0 && pattern[2] === 0 && pattern[3] === 0) {

  //   }

  //   this._beforePattern = pattern;
  //   return pattern;
  // },
  
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
