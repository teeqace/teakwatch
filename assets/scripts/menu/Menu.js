import MessagePipeline from '../utils/MessagePipeline';

const CLICK_DISTANCE_MIN = 10;

cc.Class({
  extends: cc.Component,

  properties: {
    menuItems: {
      default: [],
      type: [cc.Node]
    },
    menuPrefabs: {
      default: [],
      type: [cc.Prefab]
    },
    menuAnimation: cc.Animation,
    menuOpenNode: cc.Node
  },

  // use this for initialization
  onLoad: function () {
    this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    MessagePipeline.on('menu:close', this._menuClose, this);
    
    this._touchStart = false;
    this._openMenu = null;
    
    this.menuAnimation.on('finished', this._animFinished, this);
    this._prefabMap = {};
    for (let i = 0; i < this.menuPrefabs.length; i++) {
      this._prefabMap[this.menuPrefabs[i].name] = this.menuPrefabs[i];
    }
  },

  _onTouchBegan(event) {
    this._touchStart = true;
    this._startPos = event.getLocation();
  },

  _finishTouch(event, isCancel) {
    if (!this._touchStart) {
      return;
    }
    let touchEndPos = event.getLocation();
    let distance = cc.pDistance(this._startPos, touchEndPos);
    if (distance <= CLICK_DISTANCE_MIN) {
      let touchPoint = this.node.convertToNodeSpaceAR(touchEndPos);
      let clickMenuIndex = this._checkClickMenu(touchPoint);
      if (clickMenuIndex >= 0) {
        cc.log(this.menuItems[clickMenuIndex].name);
        this._openMenu = this.menuItems[clickMenuIndex];
        MessagePipeline.sendMessage('menu:open');
        this.menuAnimation.play(`${this.menuItems[clickMenuIndex].name}Open`);
      }
    }
    this._touchStart = false;
  },

  _onTouchEnded(event) {
    this._finishTouch(event, false)
  },

  _onTouchCancel(event) {
    this._finishTouch(event, true)
  },

  _checkClickMenu(touchPoint) {
    for (let i = 0; i < this.menuItems.length; i++) {
      let node = this.menuItems[i];
      let p = node.position;
      let w = node.width;
      let h = node.height;
      let r = node.rotation;

      let d = cc.pDistance(p, touchPoint);
      let radAngle = cc.pToAngle(cc.pSub(touchPoint, p));
      let degAngle = 90 + cc.radiansToDegrees(radAngle) + r;
      let toRad = degAngle * Math.PI / 180;
      let checkPoint = cc.p(Math.sin(toRad) * d, Math.cos(toRad) * d);
      if (Math.abs(checkPoint.x) <= w / 2 && Math.abs(checkPoint.y) <= h / 2) {
        return i;
      }
    }
    return -1;
  },

  _animFinished(event) {
    if (!this._openMenu) {
      return;
    }
    if (event.detail.name === `${this._openMenu.name}Open`) {
      let instance = cc.instantiate(this._prefabMap[this._openMenu.name]);
      instance.parent = this.menuOpenNode;
    }
  },

  _menuClose() {
    if (this._openMenu) {
      this.menuAnimation.play(`${this._openMenu.name}Close`);
      this._openMenu = null;
    }
  }
});
