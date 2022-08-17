import GeoJSON from '../../../../../../src/ol/format/GeoJSON.js';
import Map from '../../../../../../src/ol/Map.js';
import MapzStyle from '../../../../../../src/ol/mapz/style/MapzStyle.js';
import Vector from '../../../../../../src/ol/layer/Vector.js';
import VectorSource from '../../../../../../src/ol/source/Vector.js';
import View from '../../../../../../src/ol/View.js';

describe('ol/mapz/style/MapzStyle', function () {
  let map;

  beforeEach(function () {
    const target = document.createElement('div');
    target.style.width = '100px';
    target.style.height = '100px';
    document.body.appendChild(target);

    map = new Map({
      target: target,
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
  });

  afterEach(function () {
    disposeMap(map);
    map = null;
  });

  it('loads mapz.com GeoJSON source', function () {
    map.renderSync();
    const vectorLayer = new Vector({
      source: new VectorSource({
        url: 'spec/ol/source/vectorsource/mapz-example.geojson',
        format: new GeoJSON(),
      }),
      style: function (feature) {
        const featureStyle = new MapzStyle(feature, {
          baseIconUrl: 'https://www.mapz.com:8080/map/marker/svg/',
        });
        return [featureStyle];
      },
    });
    map.addLayer(vectorLayer);
    expect(map.getLayers().getLength()).to.be(1);
    vectorLayer.getSource().forEachFeature(function (feature) {
      expect(feature.getStyle()).to.be.a(MapzStyle);
    });
  });
});
