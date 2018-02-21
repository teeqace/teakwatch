/**
 * Model class for the persistent data on Facebook, which is accessible by
 * FBInstant.player.setDataAsync() and FBInstant.player.getDataAsync().
 */
class FBPlayerData {
  constructor(jsonData) {
    this._init(jsonData || {});
  }

  /**
   * Helper function to load data from JSON.
   * @param {Object} jsonData 
   */
  _init(jsonData) {
    /**
     * Flag indicating if it is a new player. 
     * The value should be true until player finishes the first game.
     * 
     * @type {boolean}
     */
    this._isNewPlayer = jsonData['is_new_player'] !== undefined ? jsonData['is_new_player'] : true;
  }

  get isNewPlayer() {
    return this._isNewPlayer;  
  }

  set isNewPlayer(value) {
    this._isNewPlayer = value;
  }
  
  /**
   * Returns a player data in JSON format.
   */
  toJson() {
    return {
      'is_new_player': this._isNewPlayer
    };
  }
}

export default FBPlayerData;

