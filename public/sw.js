const staticMappaCache = 'mappa-v1';


self.addEventListener('install', function(event) {
    console.log('installing....');
     event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                'index-staticmaps.html'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event){
    console.log("fetching...")
    
})
