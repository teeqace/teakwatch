import FBIManager from './managers/FBIManager';

cc.Class({
  extends: cc.Component,

  properties: {
  },

  // use this for initialization
  start() {
      FBIManager.start();
  }

});
