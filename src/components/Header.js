import React, { Component } from 'react';
import db from '../db'
import {getCity} from '../services/geolocation.js';
import {getWeather} from '../services/weather.js';
import {GoogleApiWrapper} from 'google-maps-react';

class HeaderContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      }
    }


  componentDidMount() {
    this.getMyLocation();

    const that = this;
    if (!navigator.online) {
      db.weather.get(1, function(obj) {
        that.setState({currentWeather: obj.temp})
        }).catch(function(error){
        console.log(error)
      })

      db.city.get(4, function(obj) {
        that.setState({currentCity: obj.city})
        console.log("state: " + that.state.currentCity)
      }).catch(function(error){
        console.log(error)
      })
    }
    console.log(this.state.currentCity)
  }

  componentWillUpdate(prevProps, prevState) {
    console.log("prev" + prevState.currentCity)
    console.log("current"+ this.state.currentCity)
    if (prevState.currentCity !== this.state.currentCity) {
      this.props.setCurrentCity(this.state.currentCity);
    }
  }

  getCityWeather(latitude, longitude) {
    const {setCurrentCity} = this.props;

    getCity(latitude, longitude).then((city) => {
      db.table('city').add({city: city}).then(() => {
        this.setState({currentCity: city});
        setCurrentCity(city);
      })

    }).catch(function(err) {
      console.log('Error retrieving the current city: ', err);
    });

    getWeather(latitude, longitude).then((weather) => {
      db.table('weather').add({temp: weather}).then(() => {
        this.setState({currentWeather: weather})
      })
    }).catch(function(err){
      console.log('Error retrieving the current weather: ', err);
    })
  }

  getMyLocation = () => {
    const {
      handleLocationChange,
      setUserPosition
    } = this.props;
    const pos = {
        lat: parseFloat(localStorage.getItem('lat')),
        lng: parseFloat(localStorage.getItem('lng'))
      }

    handleLocationChange(pos);
    setUserPosition(pos);
    // ***Get Location from Cache
    if (pos.lat && pos.lng) {
       this.getCityWeather(pos.lat, pos.lng);
    }


    const errorLocation = (err) => {
      console.log("error retrieving current position, " + err);
    }

    // ***Get Location from getCurrentPosition
    const currentLocation = (position) => {
      const {
        handleLocationChange,
        setUserPosition
      } = this.props

      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      setUserPosition(pos)
      handleLocationChange(pos)

      localStorage.setItem('lat', pos.lat);
      localStorage.setItem('lng', pos.lng);
      this.getCityWeather(pos.lat, pos.lng);
    }

    // Ask user for permission to use location services
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(currentLocation, errorLocation);
    } else {
      alert('Sorry your browser doesn\'t support the Geolocation API');
    }
  }
  
  render () {
    
    const {currentCity, currentWeather} = this.state;
    console.log(currentCity)
    const message = (this.state.currentCity && this.state.currentWeather)
    ? `Welcome to Mappa. You're in ${currentCity}. It is currently ${currentWeather}°F`
    : 
    `Welcome to Mappa. It is currently ${currentWeather}°F. You're in ${currentCity}.`;
  
    return(
      <h1>
        {message}
      </h1>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: (process.env.REACT_APP_GKEY),
  libraries: ['places'],
  version: '3'
})(HeaderContainer)