var map,layerControl,tdtBase,tdtMark, popup, baseMaps = {}, overlayMaps = {};

$(document).ready(function () {
    popup = L.popup();
    initMap();
    initMaker();
    initImageOverlay();
    initLayerControl();
    initDrawControl();

    map.on('click', onMapClick);
    map.on('baselayerchange', onBaseLayerChange);
});

var initMap = function () {
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
        maxZoom: 18,
    });

    //天地图地图 行政区和标记分为两层
    tdtBase = L.tileLayer('http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}', {
        maxZoom: 18,
    });

    tdtMark = L.tileLayer('http://t5.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}', {
        maxZoom: 18,
    });

    //Mapbox地图
    var mapboxBase = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-i875mjb7'
    });

    map = L.map('map', {
        layers: [tdtBase],
        attributionControl:false
    }).setView([39.91579, 116.39088], 12);

    baseMaps = {
        "高德地图": gdBase,
        "Esri地图": esriBase,
        "MapBox地图": mapboxBase,
        "天地图地图": tdtBase,
    };
};

var initMaker = function () {
    L.marker([39.91579, 116.39088]).addTo(map)
        .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
    //
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

var initImageOverlay=function(){
    var imageUrl = 'data/QR/201304191600.png',
        imageBounds = [[12.2, 73.0], [54.2, 135]];
    var imageUrlCloud = 'data/FY2E/20130419030000.PNG',
        imageBoundsCloud = [[6, 61.5], [60, 145]];
    var radar = L.imageOverlay(imageUrl, imageBounds,{opacity:0.5});
    var cloud = L.imageOverlay(imageUrlCloud, imageBoundsCloud);

    overlayMaps = {
        //"天地图标记": tdtMark
        雷达图:radar,
        卫星云图:cloud
    };
    //overlayMaps.雷达图 = radar;
    //overlayMaps.卫星云图 = cloud;

    //换一种写法，但是无法通过设置url切换图片
    //layerControl.addOverlay(radar,"雷达图");
}

var initLayerControl = function () {
    layerControl = L.control.layers(baseMaps, overlayMaps);
    layerControl.addTo(map);

    dealTdtMarkLayer(map.hasLayer(tdtBase));
}
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
}

function onMapClick(e) {
//    popup
//        .setLatLng(e.latlng)
//        .setContent("You clicked the map at " + e.latlng.toString())
//        .openOn(map);
    overlayMaps.雷达图.setUrl('data/QR/201304191400.png');
}

function onBaseLayerChange(e){
    dealTdtMarkLayer(e.layer===tdtBase);
}

//true为添加  false为删除
function dealTdtMarkLayer(statue){
    if(statue){
        map.addLayer(tdtMark);
        tdtMark.bringToFront();
    }
    else if(map.hasLayer(tdtMark)){
        map.removeLayer(tdtMark);
    }
}
