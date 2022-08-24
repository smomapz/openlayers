import LayerSwitcher from '../src/ol/mapz/control/LayerSwitcher.js';
import Map from '../src/ol/Map.js';
import MapzStyle from '../src/ol/mapz/style/MapzStyle.js';
import Tile from '../src/ol/layer/Tile.js';
import Vector from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {GeoJSON} from '../src/ol/format.js';
import {defaults} from '../src/ol/control.js';
import {transform} from '../src/ol/proj.js';

const attribution =
  '© 2022 <a target="_blank" href="http://www.mapz.com">mapz.com </a>\
  - Map Data: <a target="_blank" href="http://openstreetmap.org" >OpenStreetMap</a>\
  (<a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">ODbL</a>)';

// Create background layer
const baseLayer = new Tile({
  source: new XYZ({
    attributions: attribution,
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_multicolor_poi_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
  title: 'Multicolor',
  name: 'mapz_multicolor_poi',
  visible: false,
});

// Create background with gray styling layer
const baseLayerGray = new Tile({
  source: new XYZ({
    attributions: attribution,
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_shades_of_gray_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
  title: 'Shades of Gray',
  name: 'mapz_shades_of_gray',
});

// Create vectorlayer and load GeoJSON file from mapz.com
const vectorLayer = new Vector({
  source: new VectorSource({
    url: 'data/geojson/hamburg_airport.geojson',
    format: new GeoJSON(),
  }),
  title: 'Features',
  // add a type to the vectorlayer to define an overlay
  type: 'overlay',
  style: function (feature) {
    const featureStyle = new MapzStyle(feature, {
      baseIconUrl: 'https://www.mapz.com/mapz/mapz_redaktion/map/marker/',
    });
    return [featureStyle];
  },
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  layers: [baseLayer, baseLayerGray, vectorLayer],
  controls: defaults().extend([new LayerSwitcher()]),
  view: new View({
    center: transform([9.98671, 53.63102], 'EPSG:4326', 'EPSG:3857'),
    zoom: 9,
  }),
});
