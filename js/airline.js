L.AirLine = L.Class.extend({
    initialize : function (airlinelatlngs){
        this._planeIcon = L.icon({
            iconUrl: 'img\\plane2-marker-icon.png',
            iconRetinaUrl: 'img\\plane2-marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41]
        });
        this._airPlaneLine = L.polyline(airlinelatlngs);
        this._airMaker = L.Marker.movingMarker(airlinelatlngs, [100000],{
            icon:this._planeIcon,
            autostart: true,
            loop: true,
        });
    },
    
//    onAdd: function (map) {
//        this._map = map;
//    },
    
    addTo: function (map) {
//        if(!this._airMaker.isRunning())
//            this._airMaker.start();
		map.addLayer(this._airPlaneLine);
        map.addLayer(this._airMaker);
		return this;
	},
    
//    onRemove: function(map) {
//        this._map = null;
//    },
    
    removeFrom: function(map){
//        if(this._airMaker.isRunning())
//            this._airMaker.pause();
        map.removeLayer(this._airPlaneLine);
        map.removeLayer(this._airMaker);
        return this;
    },
    
    isVisiable: function(){
        return map.hasLayer(this._airPlaneLine);
    }
});

L.airLine = function (airlinelatlngs) {
    return new L.AirLine(airlinelatlngs);
};