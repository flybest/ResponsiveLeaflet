// UMD initialization to work with CommonJS, AMD and basic browser script include
(function (factory) {
    var L;
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module === 'object' && typeof module.exports === "object") {
        // Node/CommonJS
        L = require('leaflet');
        module.exports = factory(L);
    } else {
        // Browser globals
        if (typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
}(function (L) {

    L.Playback = L.Playback || {};
    L.Playback.Util = L.Class.extend({
        statics: {
            toDate: function (time) {
                if (time.length >= 12) {
                    var yy = time.substring(0, 4);
                    var mm = time.substring(4, 6);
                    var dd = time.substring(6, 8);
                    var hh = time.substring(8, 10);
                    var ff = time.substring(10, 12);
                    return new Date(yy, parseInt(mm)-1, dd, hh, ff, "00");
                }
            },

            DateStr:function(time){
                return time.toLocaleDateString();
            },

            TimeStr: function (time) {
//                var d = new Date(time);
//                var h = d.getHours();
//                var m = d.getMinutes();
//                var s = d.getSeconds();
//                var tms = time / 1000;
//                var dec = (tms - Math.floor(tms)).toFixed(2).slice(1);
//                var mer = 'AM';
//                if (h > 11) {
//                    h %= 12;
//                    mer = 'PM';
//                }
//                if (h === 0) h = 12;
//                if (m < 10) m = '0' + m;
//                if (s < 10) s = '0' + s;
//                return h + ':' + m + ':' + s + dec + ' ' + mer;
                return time.toLocaleTimeString();
            },
        }

    });


    L.Playback = L.Playback || {};
    L.Playback.Clock = L.Class.extend({

        initialize: function (tracksLayer, layerdata, callback, options) {
            this._callbacksArry = [];
            if (callback) this.addCallback(callback);
            L.setOptions(this, options);
            this._speed = this.options.speed;
            this._tickLen = this.options.tickLen;
            this._cursor = 0;
            this._transitionTime = this._tickLen / this._speed;
            this._tracksLayer = tracksLayer;
            this._layerdata = layerdata;
            this._maxIndex = layerdata.dataList.length - 1;
            this._control=null;
        },

        _tick: function (self) {
            if (++self._cursor > self._maxIndex) {
                //clearInterval(self._intervalID);
                //return;
                self._cursor = self.getStartCursor();
            }
            self._tracksLayer.setUrl(self._layerdata.dataList[self._cursor].picPath);
            self._callbacks(self._cursor);
        },

        _callbacks: function (cursor) {
            var arry = this._callbacksArry;
            for (var i = 0, len = arry.length; i < len; i++) {
                arry[i](this, this._control, cursor);
            }
        },

        addCallback: function (fn) {
            this._callbacksArry.push(fn);
        },

        start: function () {
            if (this._intervalID) return;
            this._intervalID = window.setInterval(
                this._tick,
                this._transitionTime,
                this);
        },

        stop: function () {
            if (!this._intervalID) return;
            clearInterval(this._intervalID);
            this._intervalID = null;
        },

        isPlaying: function () {
            return this._intervalID ? true : false;
        },

        getSpeed: function () {
            return this._speed;
        },

        setSpeed: function (speed) {
            this._speed = speed;
            this._transitionTime = this._tickLen / speed;
            if (this._intervalID) {
                this.stop();
                this.start();
            }
        },

        setCursor: function (index) {
            this._cursor = index > this._maxIndex ? this._maxIndex : index;
            this._tracksLayer.setUrl(this._layerdata.dataList[this._cursor].picPath);
            this._callbacks(this._cursor);
        },

        getCursor:function(){
            return this._cursor;
        },

        setControl:function(control){
            this._control=control;
        },

        getTime: function () {
            return L.Playback.Util.toDate(this._layerdata.dataList[this._cursor].picDt);
        },

        getStartTime: function () {
            return L.Playback.Util.toDate(this._layerdata.dataList[0].picDt);
        },

        getEndTime: function () {
            return L.Playback.Util.toDate(this._layerdata.dataList[this._maxIndex].picDt);
        },

        getStartCursor: function () {
            return 0;
        },

        getEndCursor: function () {
            return this._maxIndex;
        },

        getStep: function () {
            return 1;
        }

    });

    // Simply shows all of the track points as circles.
    // TODO: Associate circle color with the marker color.

    L.Playback = L.Playback || {};
    L.Playback = L.Playback.Clock.extend({
        statics: {
            Track: L.Playback.Track,
            Clock: L.Playback.Clock,
            Util: L.Playback.Util,
            TracksLayer: L.ImageOverlay,
        },

        options: {
            tickLen: 250,
            speed: 1,
            opacity: 0.5,
            tracksLayer: true
        },

        initialize: function (map, layerdata, callback, options) {
            L.setOptions(this, options);

            this._map = map;
            if (this.options.tracksLayer) {
                this._tracksLayer = new L.ImageOverlay(layerdata.dataList[0].picPath, layerdata.bound, this.options);
            }
            L.Playback.Clock.prototype.initialize.call(this, this._tracksLayer, layerdata, callback, this.options);

            this._map.addLayer(this._tracksLayer);
            this.hideLayer();
            var _islayerVisiable = false;
        },

        showLayer: function () {
            this._tracksLayer.setOpacity(this.options.opacity);
            this._islayerVisiable = true;
        },

        hideLayer: function () {
            this._tracksLayer.setOpacity(0);
            this._islayerVisiable = false;
        },

        islayerVisiable: function () {
            return this._islayerVisiable;
        }
    });

    L.Map.addInitHook(function () {
        if (this.options.playback) {
            this.playback = new L.Playback(this);
        }
    });

    L.playback = function (map, layerdata, callback, options) {
        return new L.Playback(map, layerdata, callback, options);
    };
    return L.Playback;

}));
