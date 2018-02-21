import FBPlayerData from '../models/FBPlayerData';
import { FBSessionDataKeys } from '../models/FBConstants';

export const FBIContextType = {
  'POST': 'POST',
  'THREAD': 'THREAD',
  'GROUP': 'GROUP',
  'SOLO': 'SOLO'
};

export const FBIUpdateState = {
  'NEW': 0,
  'PENDING': 1,
  'SEND': 2
};
export const FBIUpdateStrategy = {
  'LAST': 'LAST',
  'IMMEDIATE': 'IMMEDIATE',
  'IMMEDIATE_CLEAR': 'IMMEDIATE_CLEAR'
};

const FB_PLAYER_DATA_KEY = 'player_data';

class FBIManager {
  constructor() {
    this._updateStates = {};
    this._fbPlayerData = null;
    this._fbSessionData = {};
  }

  get currentContextID() {
    return this._currentContextID;
  }

  get entryPointData() {
    return this._entryPointData || {};
  }

  get contextType() {
    return window.FBInstant.context.getType();
  }

  start() {
    if (window.FBInstant) {
      window.FBInstant.onPause(this._onPauseCallback.bind(this));
      return window.FBInstant.startGameAsync().then(() => {
        this._currentContextID = window.FBInstant.context.getID();
        this._entryPointData = window.FBInstant.getEntryPointData();
        // console.log('entryPointData', this._entryPointData);
        //Load player data from FB
        window.FBInstant.player.getDataAsync([FB_PLAYER_DATA_KEY])
          .then((data) => {
            this._fbPlayerData = new FBPlayerData(data[FB_PLAYER_DATA_KEY]);
          });
      });
    } else {
      cc.warn('FACEBOOK INSTANT SDK MISSING');
      return Promise.resolve();
    }
  }

  choose(force) {
    return window.FBInstant.context.chooseAsync()
      .then(() => {
        if (this.updateState === FBIUpdateState.PENDING) {
          this.updateState = FBIUpdateState.SEND;
        }
        this._currentContextID = window.FBInstant.context.getID();
        // this.listPlayer();
      })
      .catch(() => {
        if (force && !this.currentContextID) {
          this.choose(true);
        }
      });
  }

  get updateState() {
    let state = this._updateStates[this._currentContextID];
    if (!state) {
      this._updateStates[this._currentContextID] = FBIUpdateState.NEW;
    }
    return state;
  }

  set updateState(value) {
    this._updateStates[this._currentContextID] = value;
  }

  get fbPlayerData() {
    return this._fbPlayerData;
  }

  /**
   * Performs necessary Facebook updates after a game.
   */
  postGameUpdate() {
    if (this.fbPlayerData.isNewPlayer) {
      this.fbPlayerData.isNewPlayer = false;
      this.saveFBPlayerData()
        .then(() => {
          this.setSessionData(FBSessionDataKeys.PLAYED_FIRST_GAME, true);
        });
    }
  }

  /**
   * Save player data.
   * 
   * Note that when the returned promise resolves, the player data is guaranteed to
   * be valid and accessible via FBInstant.player.getDataAsync() but 
   * not guaranteed to persist in Facebook storage.
   * 
   * @return {Promise}
   */
  saveFBPlayerData() {
    return window.FBInstant.player.setDataAsync({
      'player_data': this.fbPlayerData.toJson()
    });
  }

  /**
   * Set Instant Games session data.
   * 
   * @param {string} key 
   * @param {*} value 
   */
  setSessionData(key, value) {
    this._fbSessionData[key] = value;
    window.FBInstant.setSessionData(this._fbSessionData);
  }

  // listPlayer() {
  //   let contextPlayers = [];
  //   window.FBInstant.context.getPlayersAsync()
  //     .then((players) => {
  //       contextPlayers = players.map(function(player) {
  //         return {
  //           id: player.getID(),
  //           name: player.getName(),
  //         };
  //       });
  //       console.log(contextPlayers);
  //     });
  // }

  share(options) {
    let { intent = 'CHALLENGE',
      image = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      text = 'X is CHALLENGE you!',
      data = {} } = options;
    return window.FBInstant.shareAsync({
      intent: intent,
      text: text,
      image: image,
      data: data
    });
  }

  update(options, quit) {
    let { image = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      template = 'ooxx',
      text = 'test',
      cta,
      data = {},
      strategy = 'LAST',
      notification = 'NO_PUSH' } = options;
    let promise;
    if (!this._currentContextID) {
      promise = Promise.reject('not context exist');
    }
    if (this.updateState !== FBIUpdateState.SEND) {
      if (strategy === 'LAST') {
        this.updateState = FBIUpdateState.PENDING;
      } else {
        this.updateState = FBIUpdateState.SEND;
      }

      promise = window.FBInstant.updateAsync({
        action: 'CUSTOM',
        template: 'pass_score',
        cta: 'Play',
        image: image,
        text: text,
        data: data,
        strategy: strategy,
        notification: notification,
      });

    } else {
      promise = Promise.reject('once pre session');
    }
    if (quit) {
      promise = promise.then(() => {
        window.FBInstant.quit();
      });
    }
    return promise;
  }
  
  get playerId() {
    return window.FBInstant ? window.FBInstant.player.getID() : null;
  }

  get playerName() {
    return window.FBInstant ? window.FBInstant.player.getName() : null;
  }

  get playerPhoto() {
    return window.FBInstant ? window.FBInstant.player.getPhoto() : null;
  }

  setOnPauseHandler(fn) {
    this._pauseCallback = fn;
  }

  _onPauseCallback() {
    if (this._pauseCallback) {
      this._pauseCallback();
    }
  }
}

const _instance = new FBIManager;

export default _instance;