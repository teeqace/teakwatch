require=function e(t,i,s){function n(a,c){if(!i[a]){if(!t[a]){var h="function"==typeof require&&require;if(!c&&h)return h(a,!0);if(o)return o(a,!0);var r=new Error("Cannot find module '"+a+"'");throw r.code="MODULE_NOT_FOUND",r}var l=i[a]={exports:{}};t[a][0].call(l.exports,function(e){var i=t[a][1][e];return n(i||e)},l,l.exports,e,t,i,s)}return i[a].exports}for(var o="function"==typeof require&&require,a=0;a<s.length;a++)n(s[a]);return n}({Game:[function(e,t,i){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}cc._RF.push(t,"3ff6ez0uR9Fi5R3VTWIoNIl","Game");var n=s(e("./utils/MessagePipeline")),o=s(e("./Player")),a=s(e("./Lanes")),c=s(e("./Life"));cc.Class({extends:cc.Component,properties:{player:o.default,lanes:a.default,life:c.default},onLoad:function(){n.default.on("checkHit",this._checkHit,this),n.default.on("gameOver",this._gameOver,this),setTimeout(function(){n.default.sendMessage("gameStart"),n.default.sendMessage("turnStart")}),this._gameOver=!1,this._allLCObjects=[],this._allLCObjects=this.node.getComponentsInChildren("LCObject"),this._gameOverAnimationTimer=0,this._gameOverBlinkTime=0},_checkHit:function(e){var t=e.getUserData(),i=this.player.index;t===i&&(this.life.damage(),n.default.sendMessage("playerHit",i))},_gameOver:function(){n.default.sendMessage("soundPlay","GameOver"),this._gameOver=!0},update:function(e){this._gameOver&&(this._gameOverAnimationTimer+=e,this._gameOverAnimationTimer<.5?this._allLCObjects.forEach(function(e,t){e.displayOn()},this):this._allLCObjects.forEach(function(e,t){e.displayOff()},this),this._gameOverAnimationTimer>=1&&(this._gameOverAnimationTimer=0,this._gameOverBlinkTime+=1,this._gameOverBlinkTime>=2&&(this._gameOver=!1,this._gameOverBlinkTime=0,n.default.sendMessage("gameStart"),n.default.sendMessage("turnStart"))))}}),cc._RF.pop()},{"./Lanes":"Lanes","./Life":"Life","./Player":"Player","./utils/MessagePipeline":"MessagePipeline"}],LCDigit:[function(e,t,i){"use strict";cc._RF.push(t,"b653dDvGj9HpoYlzzgkCjqe","LCDigit");var s=[[!0,!0,!0,!1,!0,!0,!0],[!1,!1,!0,!1,!1,!0,!1],[!0,!1,!0,!0,!0,!1,!0],[!0,!1,!0,!0,!1,!0,!0],[!1,!0,!0,!0,!1,!0,!1],[!0,!0,!1,!0,!1,!0,!0],[!0,!0,!1,!0,!0,!0,!0],[!0,!1,!0,!1,!1,!0,!1],[!0,!0,!0,!0,!0,!0,!0],[!0,!0,!0,!0,!1,!0,!0]];cc.Class({extends:cc.Component,properties:{},onLoad:function(){var e=this;this.objects=[],this.node.children.forEach(function(t){var i=t.getComponent("LCObject");i&&e.objects.push(i)},this)},display:function(e){var t=s[e];t?this.objects.forEach(function(e,i){e.display(t[i])},this):this.objects.forEach(function(e,t){e.displayOff()},this)}}),cc._RF.pop()},{}],LCObject:[function(e,t,i){"use strict";cc._RF.push(t,"d00bbU09jhGsrlM9uQX6IbO","LCObject"),cc.Class({extends:cc.Component,properties:{objectOn:cc.Sprite,defaultDisplay:!1},onLoad:function(){this.objectOn.node.active=this.defaultDisplay,this.objectOn.node.width=this.node.width,this.objectOn.node.height=this.node.height,this.objectOn.spriteFrame=this.node.getComponent(cc.Sprite).spriteFrame},display:function(e){this.objectOn.node.active=e},displayOn:function(){this.objectOn.node.active=!0},displayOff:function(){this.objectOn.node.active=!1}}),cc._RF.pop()},{}],Lanes:[function(e,t,i){"use strict";cc._RF.push(t,"0e1c3XTFMJKPZXVxEwGKhfA","Lanes");var s=function(e){return e&&e.__esModule?e:{default:e}}(e("./utils/MessagePipeline"));cc.Class({extends:cc.Component,properties:{},onLoad:function(){var e=this;this.lanes=[],this.node.children.forEach(function(t){var i=t.getComponent("Lane");i&&e.lanes.push(i)},this),this._tickStart=!1,this._tickTimer=1,this._timer=0,s.default.on("gameStart",this._gameStart,this),s.default.on("turnStart",this._turnStart,this),s.default.on("playerHit",this._playerHit,this),s.default.on("levelUp",this._levelUp,this)},update:function(e){this._tickStart&&(this._timer+=e,this._timer>=this._tickTimer&&(this._timer-=this._tickTimer,this.lanes.forEach(function(e,t){e.tick()},this),s.default.sendMessage("soundPlay","Tick")))},_gameStart:function(){this._tickTimer=1},_turnStart:function(){this._tickStart=!0,this._timer=0,this.lanes.forEach(function(e,t){e.reset()},this)},_playerHit:function(){this._tickStart=!1},_levelUp:function(){this._tickTimer=Math.max(this._tickTimer-.04,.2)}}),cc._RF.pop()},{"./utils/MessagePipeline":"MessagePipeline"}],Lane:[function(e,t,i){"use strict";cc._RF.push(t,"8a993q9VWtKYqmZpsQL9ylb","Lane");var s=function(e){return e&&e.__esModule?e:{default:e}}(e("./utils/MessagePipeline"));cc.Class({extends:cc.Component,properties:{laneIndex:0},onLoad:function(){var e=this;this.objects=[],this.node.children.forEach(function(t){var i=t.getComponent("LCObject");i&&e.objects.push(i)},this),this._blockIndexes=[-1,-1],this.maxIndex=this.objects.length,this.index=-1,this.displayBlock()},tick:function(){for(var e=!1,t=0;t<this._blockIndexes.length;t++)!e&&this._blockIndexes[t]<0?Math.random()<.25&&(this._blockIndexes[t]=0,e=!0):this._blockIndexes[t]>=0&&(this._blockIndexes[t]+=1,this._blockIndexes[t]>=this.maxIndex&&(this._blockIndexes[t]=-1,s.default.sendMessage("checkHit",this.laneIndex)));this.displayBlock()},displayBlock:function(){var e=this;this.objects.forEach(function(t,i){for(var s=!1,n=0;n<e._blockIndexes.length;n++)e._blockIndexes[n]===i&&(s=!0);t.display(s)},this)},reset:function(){this.index=-1,this._blockIndexes=[-1,-1],this.displayBlock()}}),cc._RF.pop()},{"./utils/MessagePipeline":"MessagePipeline"}],Life:[function(e,t,i){"use strict";cc._RF.push(t,"bab6822JplCDqbXba4G9NYH","Life");var s=function(e){return e&&e.__esModule?e:{default:e}}(e("./utils/MessagePipeline"));cc.Class({extends:cc.Component,properties:{life:{get:function(){return this._life},visible:!1}},onLoad:function(){var e=this;this.lives=[],this.node.children.forEach(function(t){var i=t.getComponent("LCObject");i&&e.lives.push(i)},this),this._life=this.lives.length,s.default.on("gameStart",this._gameStart,this)},displayLives:function(){var e=this;this.lives.forEach(function(t,i){t.display(i<e._life)},this)},damage:function(){this._life-=1,this.displayLives()},_gameStart:function(){this._life=this.lives.length,this.displayLives()}}),cc._RF.pop()},{"./utils/MessagePipeline":"MessagePipeline"}],MessagePipeline:[function(e,t,i){"use strict";function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}cc._RF.push(t,"625d7RuJc5DOqpw5NUnH5Ml","MessagePipeline"),Object.defineProperty(i,"__esModule",{value:!0});var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var s=t[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,i,s){return i&&e(t.prototype,i),s&&e(t,s),t}}(),c=new(function(e){function t(){return s(this,t),n(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return o(t,cc.EventTarget),a(t,[{key:"sendMessage",value:function(e,t){cc.log("[System Message] "+e),this.emit(e,t)}}]),t}());i.default=c,t.exports=i.default,cc._RF.pop()},{}],MoveButton:[function(e,t,i){"use strict";cc._RF.push(t,"be74f49ZixMoKXJao06xcgj","MoveButton");var s=function(e){return e&&e.__esModule?e:{default:e}}(e("./utils/MessagePipeline"));cc.Class({extends:cc.Component,properties:{isRight:!1},onLoad:function(){this.node.on(cc.Node.EventType.TOUCH_START,this._onTouchBegan,this)},_onTouchBegan:function(e){this.isRight?s.default.sendMessage("moveRight"):s.default.sendMessage("moveLeft")}}),cc._RF.pop()},{"./utils/MessagePipeline":"MessagePipeline"}],PlayerHit:[function(e,t,i){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}cc._RF.push(t,"0f003pkY6xARb80sGIdxgH4","PlayerHit");var n=s(e("./utils/MessagePipeline")),o=s(e("./Life"));cc.Class({extends:cc.Component,properties:{life:o.default},onLoad:function(){var e=this;this.hits=[],this.node.children.forEach(function(t){var i=t.getComponent("LCObject");i&&e.hits.push(i)},this),this._hitAnimation=!1,this._hitAnimationTimer=0,this._hitBlinkTime=0,this._hitIndex=0,n.default.on("playerHit",this._playerHit,this)},_playerHit:function(e){this._hitIndex=e.getUserData(),this._hitAnimation=!0,this._hitAnimationTimer=0,this._hitBlinkTime=0,n.default.sendMessage("soundPlay","Hit")},update:function(e){var t=this;this._hitAnimation&&(this._hitAnimationTimer+=e,this._hitAnimationTimer<.2?this.hits.forEach(function(e,i){e.display(i===t._hitIndex-1)},this):this.hits.forEach(function(e,t){e.displayOff()},this),this._hitAnimationTimer>=.4&&(this._hitAnimationTimer=0,this._hitBlinkTime+=1,this._hitBlinkTime>=4&&(this._hitAnimation=!1,this.life.life<0?n.default.sendMessage("gameOver"):n.default.sendMessage("turnStart"))))}}),cc._RF.pop()},{"./Life":"Life","./utils/MessagePipeline":"MessagePipeline"}],Player:[function(e,t,i){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}cc._RF.push(t,"23ab3LxjTdDfZo8kyGzIxCh","Player");var n=s(e("./utils/MessagePipeline")),o=s(e("./LCObject")),a=s(e("./Score"));cc.Class({extends:cc.Component,properties:{index:{get:function(){return this._index},visible:!1},scoreGetLeft:o.default,scoreGetRight:o.default,score:a.default},onLoad:function(){var e=this;this.objects=[],this.node.children.forEach(function(t){var i=t.getComponent("LCObject");i&&e.objects.push(i)},this),this.indexMax=this.objects.length-1,this._index=0,this.displayPlayer(),this._goalRight=!0,this._movable=!1,n.default.on("gameStart",this._turnStart,this),n.default.on("turnStart",this._turnStart,this),n.default.on("playerHit",this._playerHit,this),n.default.on("moveLeft",this._moveLeft,this),n.default.on("moveRight",this._moveRight,this)},_moveLeft:function(){var e=this;if(this._movable&&(!this._goalRight||1!==this._index)){var t=this._index;this._index=Math.max(0,this._index-1),!this._goalRight&&t>0&&0===this._index?(this._goalRight=!0,this.scoreGetLeft.displayOn(),this.score.addScore(1),setTimeout(function(){e.scoreGetLeft.displayOff()},1e3),n.default.sendMessage("soundPlay","Goal")):n.default.sendMessage("soundPlay","Move"),this.displayPlayer()}},_moveRight:function(){var e=this;if(this._movable&&(this._goalRight||this._index!==this.indexMax-1)){var t=this._index;this._index=Math.min(this._index+1,this.indexMax),this._goalRight&&t<this.indexMax&&this._index===this.indexMax?(this._goalRight=!1,this.scoreGetRight.displayOn(),this.score.addScore(1),setTimeout(function(){e.scoreGetRight.displayOff()},1e3),n.default.sendMessage("soundPlay","Goal")):n.default.sendMessage("soundPlay","Move"),this.displayPlayer()}},displayPlayer:function(){var e=this;this.objects.forEach(function(t,i){t.display(i===e._index)},this)},_turnStart:function(){this._movable=!0,this._index=0,this._goalRight=!0,this.displayPlayer()},_playerHit:function(){this._movable=!1}}),cc._RF.pop()},{"./LCObject":"LCObject","./Score":"Score","./utils/MessagePipeline":"MessagePipeline"}],Score:[function(e,t,i){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}cc._RF.push(t,"e5665Hv2oNCmrqkKkjmEyI6","Score");var n=s(e("./LCDigit")),o=s(e("./utils/MessagePipeline"));cc.Class({extends:cc.Component,properties:{digits:{default:[],type:[n.default]}},onLoad:function(){this._score=0,o.default.on("gameStart",this._gameStart,this)},_gameStart:function(){this._score=0,this._displayScore()},addScore:function(e){this._score=Math.min(this._score+e,999),this._score%5==0&&o.default.sendMessage("levelUp"),this._displayScore()},_displayScore:function(){for(var e=this._score,t=0;t<this.digits.length;t++){var i=Math.pow(10,this.digits.length-(t+1));if(t<this.digits.length-1&&this._score<i)this.digits[t].display();else{var s=Math.floor(e/i);e-=i*s,this.digits[t].display(s)}}}}),cc._RF.pop()},{"./LCDigit":"LCDigit","./utils/MessagePipeline":"MessagePipeline"}],Sounds:[function(e,t,i){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}cc._RF.push(t,"0d665KFLOhLoq2Vqz/OrXxF","Sounds");var n=s(e("./utils/MessagePipeline")),o=s(e("./LCObject")),a="teakwatch:soundon",c={Tick:0,Move:1,Goal:2,Hit:3,GameOver:4};cc.Class({extends:cc.Component,properties:{soundIcon:o.default,audioClips:{default:[],type:[cc.AudioClip]}},onLoad:function(){this.isSoundOn=!0,this.loadSoundOn(),this.soundIcon.display(this.isSoundOn),cc.audioEngine.setMaxAudioInstance(5),n.default.on("soundPlay",this._soundPlay,this)},loadSoundOn:function(){var e=cc.sys.localStorage.getItem(a);this.isSoundOn=1===e||null===e},saveSoundOn:function(){var e=0;this.isSoundOn&&(e=1),cc.sys.localStorage.setItem(a,e)},$toggleSound:function(){this.isSoundOn=!this.isSoundOn,this.soundIcon.display(this.isSoundOn)},_soundPlay:function(e){var t=e.getUserData();if(this.isSoundOn){var i=c[t];0<=i&&i<this.audioClips.length&&cc.audioEngine.play(this.audioClips[i],!1,1)}}}),cc._RF.pop()},{"./LCObject":"LCObject","./utils/MessagePipeline":"MessagePipeline"}]},{},["Game","LCDigit","LCObject","Lane","Lanes","Life","MoveButton","Player","PlayerHit","Score","Sounds","MessagePipeline"]);