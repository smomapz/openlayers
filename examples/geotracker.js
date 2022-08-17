import Geotracker from '../src/ol/mapz/control/Geotracker.js';
import Map from '../src/ol/Map.js';
import Tile from '../src/ol/layer/Tile.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {Stroke, Style} from '../src/ol/style.js';
import {transform} from '../src/ol/proj.js';

const baseLayer = new Tile({
  source: new XYZ({
    attributions: [
      '© 2022 <a target="_blank" href="http://www.mapz.com">mapz.com </a>\
                      - Map Data: <a target="_blank" href="http://openstreetmap.org" >OpenStreetMap</a>\
                      (<a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">ODbL</a>)',
    ],
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_multicolor_base_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  layers: [baseLayer],
  view: new View({
    center: transform([6.955445, 50.919104], 'EPSG:4326', 'EPSG:3857'),
    zoom: 17,
  }),
});

const geoTracker = new Geotracker({
  // define position symbol
  marker: {
    src: 'https://www.mapz.com/api/images/position.svg',
    height: 60,
  },
  // set style for recorded track
  trackStyle: new Style({
    stroke: new Stroke({
      width: 5,
      color: 'rgba(239, 130, 20, 0.5)',
    }),
  }),
  //start tracking automatically
  autostart: false,
  // rotate view when updating position
  rotate: true,
  // enable high accuracy
  enableHighAccuracy: true,
});

map.addControl(geoTracker);

/*
 * All of the following code is used for simulating device movement
 */

// simulate device move
let simulationData;
fetch('/data/json/geolocation-orientation.json')
  .then((response) => response.json())
  .then((data) => (simulationData = data.data));

// convert degrees to radians
function degToRad(deg) {
  return (deg * Math.PI * 2) / 360;
}

const startSimulateBtn = document.getElementById('start-simulate');
const stopSimulateBtn = document.getElementById('stop-simulate');
const geoTrackerBtn = document.getElementsByClassName(
  'mapz-control-geotracker-button'
)[0];
let cancelSimulation = false;

startSimulateBtn.onclick = function () {
  if (!simulationData) {
    return;
  }
  cancelSimulation = false;
  startSimulateBtn.style.display = 'none';
  stopSimulateBtn.style.display = '';
  geoTracker.getGeolocation().setTracking(false);
  const coordinates = simulationData;

  const first = coordinates.shift();
  simulatePositionChange(first);

  let prevDate = first.timestamp;
  function geolocate() {
    if (cancelSimulation) {
      return;
    }
    const position = coordinates.shift();
    if (!position) {
      return;
    }
    const newDate = position.timestamp;
    simulatePositionChange(position);
    window.setTimeout(function () {
      prevDate = newDate;
      geolocate();
    }, (newDate - prevDate) / 0.5);
  }
  geolocate();
  map.on('postcompose', function () {
    map.render();
  });
  map.render();
};

function stopSimulation() {
  startSimulateBtn.style.display = '';
  stopSimulateBtn.style.display = 'none';
  cancelSimulation = true;
}

stopSimulateBtn.onclick = function () {
  stopSimulation();
};
geoTrackerBtn.onclick = function () {
  stopSimulation();
};

function simulatePositionChange(position) {
  const coords = position.coords;
  const geolocation = geoTracker.getGeolocation();
  geolocation.set('accuracy', coords.accuracy);
  geolocation.set('heading', degToRad(coords.heading));
  const position_ = [coords.longitude, coords.latitude];
  const projectedPosition = transform(position_, 'EPSG:4326', 'EPSG:3857');
  geolocation.set('position', projectedPosition);
  geolocation.set('speed', coords.speed);
  geolocation.changed();
}
