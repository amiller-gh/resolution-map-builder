'use strict';

const buildResolutionMap = require('..').buildResolutionMap;
const createTempDir = require('broccoli-test-helper').createTempDir;
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('buildResolutionMap', function () {
  let configPath = path.join(__dirname, 'fixtures/config/environment.json');
  let config = JSON.parse(fs.readFileSync(configPath));
  let srcFixture;

  beforeEach(function () {
    return createTempDir().then(src => {
      srcFixture = src;

      srcFixture.write({
        "src": {
          "ui": {
            "components": {
              "my-app": {
                "README.md": "## My-App Component\n",
                "component.ts": "",
                "page-banner": {
                  "-utils": {
                    "ignore-me.ts": ""
                  },
                  "component.ts": "",
                  "ignore-me.d.ts": "",
                  "template.hbs": "",
                  "titleize.ts": ""
                },
                "template.hbs": ""
              },
              "unresolvable.js": "console.log(1);",
            },
            "index.html": "<html>\n    <head></head>\n    <body></body>\n</html>\n"
          },
          "unresolvable.js": "console.log(1);",
        }
      });
    });
  });

  afterEach(function () {
    srcFixture.dispose();
  });

  it('never includes unresolvalbe types', function () {
    config.moduleConfiguration.types.unresolvable = { unresolvable: true };
    config.moduleConfiguration.collections.main.types.push('unresolvable');
    config.moduleConfiguration.collections.components.types.push('unresolvable');

    let map = buildResolutionMap({
      projectDir: srcFixture.path(),
      moduleConfig: config.moduleConfiguration,
      modulePrefix: config.modulePrefix
    });

    assert.deepEqual(map, {
      'component:/my-app/components/my-app': 'src/ui/components/my-app/component',
      'component:/my-app/components/my-app/page-banner': 'src/ui/components/my-app/page-banner/component',
      'template:/my-app/components/my-app/page-banner': 'src/ui/components/my-app/page-banner/template',
      'component:/my-app/components/my-app/page-banner/titleize': 'src/ui/components/my-app/page-banner/titleize',
      'template:/my-app/components/my-app': 'src/ui/components/my-app/template',
    })
  });
});
