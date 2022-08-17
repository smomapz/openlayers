import GeoJSON from '../src/ol/format/GeoJSON.js';
import Map from '../src/ol/Map.js';
import MapzStyle from '../src/ol/mapz/style/MapzStyle.js';
import Tile from '../src/ol/layer/Tile.js';
import Vector from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {transform} from '../src/ol/proj.js';

// Create background layer
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

// Create vectorlayer and load GeoJSON file from mapz.com
const vectorLayer = new Vector({
  source: new VectorSource({
    url: '/data/geojson/mapz-example.geojson',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    const featureStyle = new MapzStyle(feature, {
      baseIconUrl: 'https://www.mapz.com:8080/map/marker/svg/',
    });
    return [featureStyle];
  },
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  layers: [
    baseLayer,
    vectorLayer, // add the geojson layer to the map
  ],
  view: new View({
    center: transform([13.35320296, 52.51372], 'EPSG:4326', 'EPSG:3857'),
    zoom: 9,
  }),
});
