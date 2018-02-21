const PAGE_WIDTH = 640;
const DECAY_RATE = 0.8;
const INERTIA_MIN = 3;
const AUTOSCROLL_TIME = 0.3;

cc.Class({
  extends: cc.Component,

  properties: {
    arrowL: cc.Node,
    arrowR: cc.Node
  },

  // use this for initialization
  onLoad: function () {
    this._pageCount = this.node.childrenCount;
    this._minX = 0;
    this._maxX = -PAGE_WIDTH * (this._pageCount - 1);
    this._speedX = 0;

    this._touchStart = false;
  },

  start() {
    this._registerEvent()
  },

  onDestroy() {
    this._unregisterEvent()
  },

  _registerEvent() {
    this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
  },

  _unregisterEvent() {
    this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
    this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
  },

  _onTouchBegan(event) {
    this._speedX = 0;
    this._touchStart = true;
    this.node.stopAllActions();
  },

  _onTouchMove(event) {
    if (!this._touchStart) {
      return;
    }
    let delta = event.getDelta();
    this._manualScroll(delta.x);
    this._speedX = delta.x;
  },

  _finishTouch(event, isCancel) {
    this._touchStart = false;
    if (this._speedX === 0) {
      this._autoScroll();
    }
  },

  _onTouchEnded(event) {
    this._finishTouch(event, false)
  },

  _onTouchCancel(event) {
    this._finishTouch(event, true)
  },

  _manualScroll(x) {
    let position = this.node.position;
    let newX = Math.min(Math.max(position.x + x, this._maxX), this._minX);
    this.node.position = new cc.p(newX, position.y);
  },

  update(dt) {
    this.arrowL.active = this.node.x < this._minX;
    this.arrowR.active = this.node.x > this._maxX;
    if (this._touchStart) {
      return;
    }
    if (this._speedX !== 0) {
      this._manualScroll(this._speedX);
      this._speedX *= DECAY_RATE;
      if (Math.abs(this._speedX) < INERTIA_MIN) {
        this._speedX = 0;
        this._autoScroll();
      }
    }
  },

  _autoScroll() {
    let page = Math.max(0, Math.floor(-this.node.x / PAGE_WIDTH));
    let diff = Math.abs(this.node.x % PAGE_WIDTH);
    if (diff === 0) {
      return;
    }
    let action;
    if (diff < PAGE_WIDTH / 2) {
      action = cc.moveTo(AUTOSCROLL_TIME, -PAGE_WIDTH * page, 0);
    } else {
      action = cc.moveTo(AUTOSCROLL_TIME, -PAGE_WIDTH * (page + 1), 0);
    }
    this.node.runAction(action.easing(cc.easeIn(2)));
  }
});
