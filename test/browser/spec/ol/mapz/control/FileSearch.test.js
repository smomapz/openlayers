import FileSearch from '../../../../../../src/ol/mapz/control/FileSearch.js';
import Map from '../../../../../../src/ol/Map.js';
import Vector from '../../../../../../src/ol/layer/Vector.js';
import VectorSource from '../../../../../../src/ol/source/Vector.js';
import View from '../../../../../../src/ol/View.js';

describe('ol/mapz/control/FileSearch', function () {
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

  it('loads FileSearch control', function () {
    map.renderSync();
    const control = new FileSearch({
      resultSource: resultSource,
    });
    map.getControls().clear();
    map.addControl(control);
    expect(map.getControls().getLength()).to.be(1);
  });
});
