const express = require('express')
const router = express.Router()
const {weather, geoLocation} = require('../controllers/extApiController')

router.route('/weather').get(weather)
router.route('/geo-location').get(geoLocation)

module.exports = router