import Map from '../../../../../src/ol/Map.js';
import Popup from '../../../../../src/ol/mapz/Popup.js';
import Vector from '../../../../../src/ol/layer/Vector.js';
import VectorSource from '../../../../../src/ol/source/Vector.js';
import View from '../../../../../src/ol/View.js';

describe('ol/mapz/Popup', function () {
  let map;
  const resultSource = new VectorSource();

  beforeEach(function () {
    const target = document.createElement('div');
    target.style.width = '100px';
    target.style.height = '100px';
    document.body.appendChild(target);
    map = new Map({
      target: target,
      layers: [
        new Vector({
          source: resultSource,
        }),
      ],
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

  it('loads Popup overlay', function () {
    map.renderSync();
    const popup = new Popup();
    map.getOverlays().clear();
    map.addOverlay(popup);
    expect(map.getOverlays().getLength()).to.be(1);
  });
});
