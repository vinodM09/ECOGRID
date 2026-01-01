const axios = require('axios')
require('dotenv').config()
const GEO_LOCATION_API_KEY = process.env.GEO_LOCATION_API_KEY;

exports.weather = async (req, res) => {
  try {
    const { lat, lon, part } = req.query

    const location = `${lat},${lon}`

    // Determine endpoint based on 'part' parameter
    let apiUrl
    if (part === 'current') {
      apiUrl = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
    } else if (part === 'forecast') {
      apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${location}&days=3`
    } else {
      return res.status(400).json({ message: 'Invalid "part" parameter. Use "current" or "forecast"' })
    }

    const response = await axios.get(apiUrl)
    res.status(200).json(response.data)
  } catch (err) {
    console.error('Weather API error:', err.response?.data || err.message)
    res.status(500).json({ message: 'Server error fetching weather.' })
  }
}

exports.geoLocation  = async (req, res) => {
  try{
    const {cityname, statecode, countrycode, limit} = req.query
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityname},${statecode},${countrycode}&limit=${limit}&appid=${GEO_LOCATION_API_KEY}`)
    res.status(400).json(response.data)
  } catch (err) {
    console.error('Weather API error 2:', err.response?.data || err.message)
    res.status(500).json({message: 'Server error fetching geoLocation'})
  }
}