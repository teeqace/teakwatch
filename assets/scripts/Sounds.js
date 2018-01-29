import MessagePipeline from './utils/MessagePipeline';
import LCObject from './LCObject';

const KEY = 'teakwatch:soundon';
const SOUND_ON = 1;
const MAX_AUDIO = 5;
const CLIP_NAME = {
  'Tick': 0,
  'Move': 1,
  'Goal': 2,
  'Hit': 3,
  'GameOver': 4
};

cc.Class({
  extends: cc.Component,

  properties: {
    soundIcon: LCObject,
    audioClips: {
      default: [],
      type: [cc.AudioClip]
    }
  },

  // use this for initialization
  onLoad: function () {
    this.isSoundOn = true;
    this.loadSoundOn();
    this.soundIcon.display(this.isSoundOn);
    cc.audioEngine.setMaxAudioInstance(MAX_AUDIO);

    MessagePipeline.on('soundPlay', this._soundPlay, this);
  },

  loadSoundOn() {
    let soundOn = cc.sys.localStorage.getItem(KEY);
    this.isSoundOn = (soundOn === SOUND_ON) || soundOn === null;
  },

  saveSoundOn() {
    let soundOn = 0;
    if (this.isSoundOn) {
      soundOn = 1;
    }
    cc.sys.localStorage.setItem(KEY, soundOn);
  },

  $toggleSound() {
    this.isSoundOn = !this.isSoundOn;
    this.soundIcon.display(this.isSoundOn);
  },

  _soundPlay(event) {
    let name = event.getUserData();
    if (!this.isSoundOn) {
      return;
    }
    let index = CLIP_NAME[name];
    if (0 <= index && index < this.audioClips.length) {
      cc.audioEngine.play(this.audioClips[index], false, 1);
    }
  }



  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
