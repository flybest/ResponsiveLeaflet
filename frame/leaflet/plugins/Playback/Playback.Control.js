L.Playback = L.Playback || {};
L.Playback.Control = L.Control.extend({

    _html: '         <p class="sectionlabel">叠加控制</p>'+
           '         <div class="btn-group" data-toggle="buttons">'+
           '             <label class="btn btn-default" id="datalabel">'+
           '                 <input type="checkbox" autocomplete="off" id="layername"> '+
           '             </label>'+
           '         </div>'+
           '         <p class="sectionlabel">播放控制</p>'+
           '         <div class="transport">'+
           '             <nav class="navbar navbar-default">'+
           '                 <div class="container-fluid">'+
           '                     <div class="navbar-header">'+
           '                         <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1">'+
           '                             <span class="sr-only">Toggle navigation</span>'+
           '                             <span class="icon-bar"></span>'+
           '                             <span class="icon-bar"></span>'+
           '                             <span class="icon-bar"></span>'+
           '                         </button>'+
           '                         <a class="navbar-brand" id="play-pause" href="#"><i id="play-pause-icon" class="fa fa-play fa-lg"></i></a>'+
           '                     </div>'+
           '                     <div class="collapse navbar-collapse" id="navbar-collapse-1">'+
           '                         <ul class="nav navbar-nav">'+
           '                             <li class="">'+
           '                                 <div id="clock-btn" class="clock">'+
           '                                     <span id="cursor-date">yyyy年MM月dd日</span>'+
           '                                     <br><span id="cursor-time">HH:mm:ss</span>'+
           '                                 </div>'+
           '                             </li>'+
           '                         </ul>'+
           '                         <ul class="nav navbar-nav navbar-right">'+
           '                             <li>'+
           '                                  <div class="time-slider-container">'+
           '                                    <div id="time-slider"></div>'+
           '                                  </div>'+
           '                             </li>'+
           '                             <li class="ctrl dropdown"> <a id="speed-btn" data-toggle="dropdown" href="#"><i class="fa fa-dashboard fa-lg"></i><br><span id="speed-icon-val" class="speed">1</span>x</a>'+
           '                                 <div class="speed-menu dropdown-menu" role="menu" aria-labelledby="speed-btn">'+
           '                                     <input id="speed-input" class="span1 speed" type="text" value="1">'+
           '                                     <div id="speed-slider"></div>'+
           '                                 </div>'+
           '                             </li>'+
           '                         </ul>'+
           '                     </div>'+
           '                 </div>'+
           '             </nav>'+
           '         </div>',

    initialize: function (playback, dataDescription) {
        this._playback = playback;
        playback.addCallback(this._clockCallback);
        this._dataDescription=dataDescription;
    },

    addTo: function (container) {
        var randname=Math.round(Math.random()*100000);
        this._control=$('<div id="playbackcontrol_'+randname.toString()+'" class="lp"></div>')
        this._control.append(this._html);
        this._control.find('#datalabel').append(this._dataDescription);
        this._container=container;
        $('#'+this._container).append(this._control);

        this._control.find('.navbar-toggle').attr("data-target","#navbar-collapse-"+randname.toString());
        this._control.find('.collapse').attr("id","navbar-collapse-"+randname.toString());

        this._setup();

        // just an empty container
        // TODO: dont do this
        return L.DomUtil.create('div');
    },

    _setup: function () {
        var self = this;
        var playback = this._playback;
        var control=this._control;
        this._playback.setControl(this._control);

        this._control.find('#datalabel').click(function(){
           if(!playback.islayerVisiable()) {
               playback.showLayer();
           }else{
               if(playback.isPlaying()){
                   self._controlPlayer();
               }
               playback.hideLayer();
           }
        });

        this._control.find('#play-pause').click(function () {
            if(playback.islayerVisiable()){
                self._controlPlayer();
            }
        });

        var startTime = playback.getStartTime();
        this._control.find('#cursor-date').html(L.Playback.Util.DateStr(startTime));
        this._control.find('#cursor-time').html(L.Playback.Util.TimeStr(startTime));
        this._control.find('#time-slider').slider({
            min: playback.getStartCursor(),
            max: playback.getEndCursor(),
            step: playback.getStep(),
            value: playback.getCursor(),
            slide: function (event, ui) {
                playback.setCursor(ui.value);
                control.find('#cursor-time').html(L.Playback.Util.TimeStr(playback.getTime()));
                control.find('#cursor-date').html(L.Playback.Util.DateStr(playback.getTime()));
            }
        });

        this._control.find('#speed-slider').slider({
            min: -9,
            max: 9,
            step: .1,
            value: self._speedToSliderVal(playback.getSpeed()),
            orientation: 'vertical',
            slide: function (event, ui) {
                var speed = self._sliderValToSpeed(parseFloat(ui.value));
                playback.setSpeed(speed);
                control.find('.speed').html(speed).val(speed);
            }
        });

        this._control.find('#speed-input').on('keyup', function (e) {
            var speed = parseFloat(control.find('#speed-input').val());
            if (!speed) return;
            playback.setSpeed(speed);
            control.find('#speed-slider').slider('value', self._speedToSliderVal(speed));
            control.find('#speed-icon-val').html(speed);
            if (e.keyCode === 13) {
                control.find('.speed-menu').dropdown('toggle');
            }
        });

        this._control.find('.dropdown-menu').on('click', function (e) {
            e.stopPropagation();
        });
    },

    _clockCallback: function (playback, control, cursor) {
        control.find('#cursor-date').html(L.Playback.Util.DateStr(playback.getTime()));
        control.find('#cursor-time').html(L.Playback.Util.TimeStr(playback.getTime()));
        control.find('#time-slider').slider('value', cursor);
    },

    _speedToSliderVal: function (speed) {
        if (speed < 1) return -10 + speed * 10;
        return speed - 1;
    },

    _sliderValToSpeed: function (val) {
        if (val < 0) return parseFloat((1 + val / 10).toFixed(2));
        return val + 1;
    },

    _controlPlayer: function(){
        if (this._playback.isPlaying() === false) {
            this._playback.start();
            this._control.find('#play-pause-icon').removeClass('fa-play');
            this._control.find('#play-pause-icon').addClass('fa-pause');
        } else {
            this._playback.stop();
            this._control.find('#play-pause-icon').removeClass('fa-pause');
            this._control.find('#play-pause-icon').addClass('fa-play');
        }
    }
});
