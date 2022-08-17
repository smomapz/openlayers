import Cluster from '../src/ol/source/Cluster.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Map from '../src/ol/Map.js';
import Popup from '../src/ol/mapz/Popup.js';
import Tile from '../src/ol/layer/Tile.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {Fill, Icon, Stroke, Style, Text} from '../src/ol/style.js';
import {Vector} from '../src/ol/layer.js';
import {transformExtent} from '../src/ol/proj.js';

/**
 * Templates that make up the popup content.
 */
const detailTemplate = document.querySelector(
  '.template-container .detail-template'
);
const overviewTemplate = document.querySelector(
  '.template-container .overview-template'
);

const popupOverlay = new Popup();

/**
 * Create the map.
 */
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

// Create a vector layer with clustring source and add a styling
const clusters = new Vector({
  // Wrap vector source in cluster source
  source: new Cluster({
    distance: 40,
    source: new VectorSource({
      url: '/data/geojson/winegrowers.geojson',
      format: new GeoJSON(),
    }),
  }),
  // Define cluster style
  style: function (feature) {
    const size = feature.get('features').length;
    if (size === 1) {
      // Clustered features containing only one feature
      // are treated as normal features
      return [
        new Style({
          image: new Icon({
            src: 'https://www.mapz.com:8080/api/images/wine.svg',
            // Set imgSize to fix IE11-Bug
            imgSize: [51.625, 72.039436],
            scale: 0.5,
          }),
        }),
      ];
    }

    // Otherweise display number of clustered features
    // in the icon
    return [
      new Style({
        geometry: feature.getGeometry(),
        image: new Icon({
          src: 'https://www.mapz.com:8080/api/images/cluster_marker.svg',
          // Set imgSize to fix IE11-Bug
          imgSize: [51.613998, 72.042],
          scale: 0.5,
        }),
        text: new Text({
          text: size.toString(),
          textAlign: 'center',
          textBaseline: 'middle',
          offsetX: 0,
          offsetY: -4,
          rotation: 0,
          fill: new Fill({
            color: '#000000',
          }),
          stroke: new Stroke({
            color: '#CCCCCC',
          }),
        }),
      }),
    ];
  },
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  overlays: [popupOverlay],
  layers: [baseLayer, clusters],
  view: new View({
    center: [0, 0],
    zoom: 0,
    maxZoom: 18,
  }),
});

map
  .getView()
  .fit(
    transformExtent(
      [8.15072930290222, 49.3761328277921, 8.18735018650818, 49.611902],
      'EPSG:4326',
      'EPSG:3857'
    ),
    map.getSize()
  );

map.on('click', function (evt) {
  // When click in map, look for a feature
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  // Show the popup
  if (feature) {
    const features = feature.get('features');
    showPopUp(features);
    // Hide the popup
  } else {
    popupOverlay.hide();
  }
});

function showPopUp(features) {
  let content;
  // For 1 feature, show the detail popup
  if (features.length === 1) {
    content = createDetailPopup(features[0]);
  }
  // Otherwise show the overview popup
  else {
    content = createOverviewPopup(features);
  }
  const popupContent = popupOverlay.show(
    features[0].getGeometry().getCoordinates(),
    content.innerHTML
  );
  // add container as javascript object to get click events
  popupContent.innerHTML = '';
  popupContent.appendChild(content);
}

const imageBaseUrl = 'https://www.mapz.com:8080/api/images/winegrowers';

function createOverviewPopup(features) {
  // Create a container
  const container = document.createElement('div');
  container.className = 'overview';
  features.forEach(function (feature) {
    // Clone the template
    const overview = overviewTemplate.cloneNode(true);
    // Get feature properties
    const name = feature.get('name');
    const imageName = feature.get('imageName') + '_preview.png';
    const contact = feature.get('contact');

    // Fill the tempalte
    overview.querySelector('.image').src = imageBaseUrl + '/' + imageName;
    overview.querySelector('.name').innerHTML = name;
    overview.querySelector('.address').innerHTML = contact.address;
    overview.querySelector('.phone').innerHTML = contact.phone;
    overview.querySelector('.fax').innerHTML = contact.fax;

    container.append(overview);

    overview.querySelector('.detail-info').onclick = function () {
      map.once('moveend', function () {
        showPopUp([feature]);
      });
      map.getView().setCenter(feature.getGeometry().getCoordinates());
      map.getView().setZoom(16);
    };
  });
  const wrapper = document.createElement('div');
  wrapper.append(container);
  return wrapper;
}

function createDetailPopup(feature) {
  // Clone the template
  const details = detailTemplate.cloneNode(true);
  details.className = 'detail';
  // Get feature properties
  const name = feature.get('name');
  const imageName = feature.get('imageName') + '.png';
  const redWines = feature.get('redWines');
  const whiteWines = feature.get('whiteWines');
  const contact = feature.get('contact');

  // Fill the template
  details.querySelector('.image').src = imageBaseUrl + '/' + imageName;
  details.querySelector('.name').innerHTML = name;
  details.querySelector('.red-wines').innerHTML = redWines;
  details.querySelector('.white-wines').innerHTML = whiteWines;
  details.querySelector('.address').innerHTML = contact.address;
  details.querySelector('.phone').innerHTML = contact.phone;
  details.querySelector('.fax').innerHTML = contact.fax;
  details.querySelector('.email').href = 'mailto:' + contact.email;
  details.querySelector('.email').innerHTML = contact.email;
  details.querySelector('.homepage').href = 'http://' + contact.homepage;
  details.querySelector('.homepage').innerHTML = contact.homepage;

  const wrapper = document.createElement('div');
  wrapper.append(details);
  return wrapper;
}
