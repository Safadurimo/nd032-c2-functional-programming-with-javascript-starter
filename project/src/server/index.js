require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

function transformPhotos(photos) {
    return photos.latest_photos
        .map((obj) => { return { id: obj.id, img_src: obj.img_src, earth_date: obj.earth_date } })
        .slice(0, 10);
}

function transformManifest(manifest) {
    return {
        "landingDate": manifest.photo_manifest.landing_date,
        "launchDate": manifest.photo_manifest.launch_date,
        "state": manifest.photo_manifest.status

    };
}

app.get('/rover/:rover', async(req, res) => {
    try {
        let rover = req.params.rover;
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/` + rover + `?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        let photos = await fetch(` https://api.nasa.gov/mars-photos/api/v1/rovers/` + rover + `/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({
            manifest: transformManifest(manifest),
            photos: transformPhotos(photos)
        })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`App listening on port ${port}!`))