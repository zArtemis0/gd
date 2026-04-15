let levelID = null;

self.addEventListener('message', event => {
  if (event.data && Object.prototype.hasOwnProperty.call(event.data, 'levelId')) {
    levelID = event.data.levelId;
  }
});

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);  
  if (levelID < 0) {
    if (url.pathname.includes("1.txt")) {
      event.respondWith(
        fetch(`/geometrydashdotcom/game/assets/levels/${levelID}.txt`)
      );
      return;
    }

    if (url.pathname.includes("StereoMadness.mp3")) {
      event.respondWith(
        fetch(`/geometrydashdotcom/game/assets/music/${levelID}.mp3`)
      );
      return;
    }
  }
  
  if (levelID >= 0) {
    if (url.pathname.includes("1.txt")) {
      event.respondWith(handleLevelRequest());
      return;
    }

    if (url.pathname.includes("StereoMadness.mp3")) {
      event.respondWith(
        fetch(`https://getlevelsong.lasokar.workers.dev?id=${levelID}`)
      );
      return;
    }
  }
});

async function handleLevelRequest() {
  const res = await fetch(
    `https://getleveldata.lasokar.workers.dev?id=${levelID}`
  );
  
  const data = await res.json();

  if (data.error) {
    self.clients.matchAll().then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: data.error === "rate-limit" ? "rate-limit" : "invalid-id" });
      }
    });
    return new Response("-1");
  }

  self.clients.matchAll().then((clients) => {
    for (const client of clients) {
      client.postMessage({ 
        type: "set-level-name", 
        name: data["name"] 
      });
    }
  });

  return new Response(data["data"]);
}
