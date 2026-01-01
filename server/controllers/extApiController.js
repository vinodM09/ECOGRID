const axios = require('axios')
require('dotenv').config()


exports.geoLocation = (req, res) => {
  try {
    const { cityname, statecode, countrycode, limit } = req.query
    const response = axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityname},${statecode},${countrycode}&limit=${limit}&appid=${GEO_LOCATION_API_KEY}`)
    console.log(response.data)
    res.status(400).json(response.data)
  } catch (err) {
    console.error('Weather API error 2:', err.response?.data || err.message)
    res.status(500).json({ message: 'Server error fetching geoLocation' })
  }
}