var map, layerControl, popup;
var airLineArray;
var markerGroup, isolineFeature;

$(document).ready(function () {
    popup = L.popup();
    initMap();
    initLayerControl();
    initDrawControl();
    initAirLine();
    addBaseMap();
//    addMaker();
    addSideBar();

//    map.on('click', onMapClick);
//    map.on('baselayerchange', onBaseLayerChange);
    
    $('#testBtn').click(function(){
        
        if(!$('#resolution').val()){
            alert('error');
            return;
        }
        
        
        $.getJSON("data/bayannaoer.geojson",function(data){
            console.log(data);
            
            var markers=[];
            $.each(data.features, function(i,value){     
                var myIcon = L.divIcon({className: 'my-div-icon',html:this.properties.VALUE});
                // you can set .my-div-icon styles in CSS
                markers.push(L.marker([this.geometry.coordinates[1],this.geometry.coordinates[0]], {icon: myIcon}));    
            })
            
            if(markerGroup){
                map.removeLayer(markerGroup);
            }
            markerGroup=L.featureGroup(markers);
            map.addLayer(markerGroup);
            
            var breaks = [7, 14, 21, 28, 35];
            var isolined = turf.isolines(data, 'VALUE', $("#resolution").val(), breaks);
            
            console.log(isolined);
            if(isolineFeature){
                map.removeLayer(isolineFeature);
            }
            
            isolineFeature=L.geoJson(isolined);
            map.addLayer(isolineFeature);

        });
        
         
    });
});



var initMap = function () {
    map = L.map('map', {
        attributionControl:false
    }).setView([39.91579, 116.39088], 5);
};

var initLayerControl = function () {
    layerControl = L.control.layers();
    layerControl.addTo(map);
};

var initDrawControl = function () {
    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                }
            }
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    //Register the draw:created event
    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;

        if (type === 'marker') {
            layer.bindPopup('A popup!');
        }

        drawnItems.addLayer(layer);
    });

    //描述文字本地化
    L.drawLocal.draw.toolbar.undo.text = "删除最后的标记点";
    L.drawLocal.draw.toolbar.actions.text = "取消";
    L.drawLocal.draw.toolbar.buttons.polyline = "绘制折线";
};

var initAirLine = function(){
    airLineArray = new Dictionary();
    $.each(airLineJson.airLineList, function(){     
        airLineArray.put(this.id,L.airLine(this.line));     
    });  
}

var addBaseMap=function(){
    //多层地图，但实际只是在不同级别显示不同地图，并不能同时显示
    //    L.TileLayer.multi({
    //        18: {
    //            url: 'http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}'
    //        },
    //        18: {
    //            url: 'http://t5.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}'
    //        }
    //    }, {
    //        minZoom: 0,
    //        maxZoom: 18
    //    }).addTo(map);

    //高德地图
    var gdBase = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        subdomains: '1234'
    });

    //Esri 地图
    var esriBase = L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
    });

    //天地图地图 行政区和标记分为两层
    var tdtBase = L.tileLayer('http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}', {
        maxZoom: 18
    });

    var tdtMark = L.tileLayer('http://t5.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}', {
        maxZoom: 18
    });

    //Mapbox地图
    var mapboxBase = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-i875mjb7'
    });

    var tdtGroup=L.layerGroup([tdtBase,tdtMark]);
    tdtGroup.addTo(map);
    
    layerControl.addBaseLayer(tdtGroup,"天地图地图");
    layerControl.addBaseLayer(gdBase,"高德地图");
    layerControl.addBaseLayer(esriBase,"Esri地图");
    layerControl.addBaseLayer(mapboxBase,"MapBox地图");
};

var addMaker = function () {
    L.marker([39.91579, 116.39088]).addTo(map)
        .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

    //L.circle([51.508, -0.11], 500, {
    //    color: 'red',
    //    fillColor: '#f03',
    //    fillOpacity: 0.5
    //}).addTo(map).bindPopup("I am a circle.");
    //
    //L.polygon([
    //   [51.509, -0.08],
    //   [51.503, -0.06],
    //   [51.51, -0.047]
    //  ]).addTo(map).bindPopup("I am a polygon.");
};

var addSideBar = function () {
    var sidebar = L.control.sidebar('sidebar').addTo(map);
    
    var radarplayback = new L.Playback(map, QRJson, null, null);
    var radarplaybackcontrol = new L.Playback.Control(radarplayback, "全国雷达");
    radarplaybackcontrol.addTo('radar');

    var cloudplayback = new L.Playback(map, fy2Json, null, null);
    var cloudplaybackcontrol = new L.Playback.Control(cloudplayback, "卫星云图");
    cloudplaybackcontrol.addTo('cloud');
};

var setAirLineVisiable = function(airLineID, activeButton){
    var selAirLine = airLineArray.get(airLineID);
    if(selAirLine.isVisiable()){
        selAirLine.removeFrom(map);
        $(activeButton).text("地图标记");
        $(activeButton).removeClass("btn-danger");
    }else{
        selAirLine.addTo(map);
        $(activeButton).text("取消显示");
        $(activeButton).addClass("btn-danger");
    };
}

function onMapClick(e) {
//    popup
//        .setLatLng(e.latlng)
//        .setContent("You clicked the map at " + e.latlng.toString())
//        .openOn(map);
}

function onBaseLayerChange(e){

}

