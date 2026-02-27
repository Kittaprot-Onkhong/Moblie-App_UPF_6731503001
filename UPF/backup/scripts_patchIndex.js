const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.error('dist/index.html not found, nothing to patch');
  process.exit(1);
}

let html = fs.readFileSync(distIndex, 'utf8');

// find the expo script tag line
const scriptMatch = html.match(/<script src="\/_expo\/static\/js\/web\/[^"]+" defer><\/script>/);
const expoScript = scriptMatch ? scriptMatch[0] : '';

const unregisterSwScript = `
    <script>
      (function(){
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations()
            .then(function(registrations) { registrations.forEach(function(r){ r.unregister(); }); })
            .catch(function(){ /* ignore */ });
        }
        if (window.caches && window.caches.keys) {
          caches.keys().then(function(keys){ keys.forEach(function(key){ caches.delete(key); }); }).catch(function(){});
        }
      })();
    </script>
`;

const newHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PoomJai App</title>
  </head>
  <body>
    <div id="root"></div>
    ${unregisterSwScript}
    ${expoScript}
  </body>
</html>
`;

fs.writeFileSync(distIndex, newHtml, 'utf8');
console.log('Patched dist/index.html with basic template');
