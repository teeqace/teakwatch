import MessagePipeline from '../utils/MessagePipeline';

const MAX_SCORE = 999;
const INIT_LIFE = 3;
const MAX_MATERIAL_STACK = 5;
const MATERIAL_STACK_REDUCE_TICK = 25;
const PLAYER_INDEX_MAX = 5;
const SAFE_INTERVAL = 5;

class GameManager {

  constructor() {
    this._gameTickTimes = 0;
    this._isDemo = true;
  }
  
  resetGame() {
    this._isPaused = false;
    this._isPausable = false;
    this._isDemo = false;
    MessagePipeline.sendMessage('game:displayPause');

    /**
     * Player index
     */
    this._playerIndex = 0;
    this._goalRight = true;
    this._goalCount = 0;
    this._playerMovable = false;
    this._bottomLanes = [];

    /**
     * Current life
     */
    this._life = INIT_LIFE;
    MessagePipeline.sendMessage('game:displayLife');

    /**
     * Current score
     */
    this._score = 0;
    MessagePipeline.sendMessage('game:displayScore');

    /**
     * Current material stack
     */
    this._materialStack = 0;
    MessagePipeline.sendMessage('game:displayMaterialStack');
    this._materialTick = 0;

    /**
     *
     */
    this.gameStarted = false;

    /**
     *
     */
    this._gameOver = false;

    this._gameTickTimes = 0;
  }

  pause() {
    if (!this._isPausable) {
      return
    }
    this._isPaused = !this._isPaused;
    MessagePipeline.sendMessage('game:displayPause');
    MessagePipeline.sendMessage('soundPlay', 'Goal');
  }

  get isPaused() {
    return this._isPaused;
  }

  get score() {
    return this._score || 0;
  }

  // set score(v) {
  //   this._score = v || 0;
  //   MessagePipeline.sendMessage('game:displayScore');
  // }

  addScore(v) {
    this._score = Math.min(this._score + v || 0, MAX_SCORE);
    MessagePipeline.sendMessage('game:displayScore');
  }

  get life() {
    return this._life || 0;
  }

  // set life(v) {
  //   this._life = v || 0;
  // }

  playerDamage() {
    this._life -= 1;
    MessagePipeline.sendMessage('game:displayLife');
    if (this._life <= 0) {
      this._gameOver = true;
      this._isPausable = false;
      MessagePipeline.sendMessage('game:gameOver');
    }
  }

  get materialTick() {
    return this._materialTick || 0;
  }

  get materialStack() {
    return this._materialStack || 0;
  }

  set materialStack(v) {
    this._materialStack = v || 0;
    MessagePipeline.sendMessage('game:displayMaterialStack');
  }

  get materialRemaining() {
    let oneInMove = 0;
    // if (!this._goalRight && this._playerIndex < PLAYER_INDEX_MAX) {
    //   oneInMove = 1;
    // }
    if (!this._goalRight) {
      oneInMove = 1;
    }
    return MAX_MATERIAL_STACK - this._materialStack - oneInMove;
  }

  get materialReduceTickMax() {
    return MATERIAL_STACK_REDUCE_TICK;
  }

  addMaterialStack() {
    this._materialStack += 1;
    MessagePipeline.sendMessage('game:displayMaterialStack');
    MessagePipeline.sendMessage('game:catAway');
    if (this._materialStack >= MAX_MATERIAL_STACK) {
      this._playerMovable = false;
      MessagePipeline.sendMessage('game:tickStop');
      MessagePipeline.sendMessage('game:fillMaterialStack');
      this.addScore(14);
      MessagePipeline.sendMessage('soundPlay', 'Bonus');
    } else {
      this._materialTick = MATERIAL_STACK_REDUCE_TICK;
      MessagePipeline.sendMessage('soundPlay', 'Goal');
    }
  }

  materialStackTick() {
    if (this._materialStack > 0) {
      this._materialTick -= 1;
      if (this._materialTick <= 0) {
        this.reduceMaterialStack();
        this._materialTick = MATERIAL_STACK_REDUCE_TICK;
      }
    }
    MessagePipeline.sendMessage('game:materialTick');
  }

  reduceMaterialStack() {
    this._materialStack -= 1;
    MessagePipeline.sendMessage('game:displayMaterialStack');
    MessagePipeline.sendMessage('game:catStealed');
  }

  get playerIndex() {
    return this._playerIndex || 0;
  }

  get goalRight() {
    return this._goalRight;
  }

  get playerMovable() {
    return this._playerMovable;
  }

  set playerMovable(v) {
    this._playerMovable = v;
  }

  movePlayer(v) {
    if (this._goalRight && this._playerIndex <= 1 && v < 0) {
      return;
    }
    if (!this._goalRight && this._playerIndex >= PLAYER_INDEX_MAX - 1 && v > 0) {
      return;
    }
    this._playerIndex += v;
    let moveSound = 'Move';
    if (this._goalRight) {
      this._playerIndex = Math.max(this._playerIndex, 1);
      if (this._playerIndex === PLAYER_INDEX_MAX) {
        this._goalRight = false;
        moveSound = 'Material';
      }
    } else {
      this._playerIndex = Math.min(this._playerIndex, PLAYER_INDEX_MAX - 1);
      if (this._playerIndex === 0) {
        this._goalRight = true;
        moveSound = '';
        this.addMaterialStack();
        this.addScore(1);
        this._goalCount += 1;
        if (this._goalCount % 4 === 0) {
          MessagePipeline.sendMessage('game:speedUp');
        }
      }
    }
    MessagePipeline.sendMessage('soundPlay', moveSound);
    MessagePipeline.sendMessage('game:displayPlayer');
    MessagePipeline.sendMessage('game:displayMaterial');
    MessagePipeline.sendMessage('game:displayMaterialStack');
    this.checkHitFromPlayer();
  }

  turnStart() {
    this._playerIndex = 0;
    this._goalRight = true;
    this._playerMovable = true;
    this._isPausable = true;
    MessagePipeline.sendMessage('game:displayPlayer');
    MessagePipeline.sendMessage('game:displayMaterial');
    MessagePipeline.sendMessage('game:displayMaterialStack');
    MessagePipeline.sendMessage('game:tickStart');
  }

  checkHitFromBlock(laneIndex) {
    if (laneIndex === this._playerIndex) {
      this._playerHit();
    }
  }

  checkHitFromPlayer() {
    for (let i = 0; i < this._bottomLanes.length; i++) {
      if (this._bottomLanes[i] === this._playerIndex) {
        this._playerHit();
      }
    }
  }

  _playerHit() {
    this._playerMovable = false;
    MessagePipeline.sendMessage('game:tickStop');
    MessagePipeline.sendMessage('game:playerDamage');
  }

  resetBottom() {
    this._bottomLanes = [];
  }

  addBottom(v) {
    this._bottomLanes.push(v);
  }

  get gameOver() {
    return this._gameOver;
  }

  get gameTickTimes() {
    return this._gameTickTimes;
  }
  
  get isSafeTick() {
    return this._gameTickTimes % SAFE_INTERVAL === 0;
  }

  get safeInterval() {
    return SAFE_INTERVAL;
  }

  gameTick() {
    this._gameTickTimes += 1;
    this.materialStackTick();
  }

  get isDemo() {
    return this._isDemo;
  }

  demoStart() {
    this._isDemo = true;
    MessagePipeline.sendMessage('game:demoStart');
  }

  demoStop() {
    this._isDemo = false;
  }

}

let __instance = new GameManager();

export default __instance;