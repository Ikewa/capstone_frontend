import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  
  return (
    <>
      <ul>
        <li><NavLink to="/Home">Home</NavLink></li>
        <li><NavLink to="/notifications">Notifications</NavLink></li>
        <li><NavLink to="/crop-recommendations">Crop <br /> Recommendations</NavLink></li>
        <li><NavLink to="/booking">Booking</NavLink></li>
        <li><NavLink to="/events">Events</NavLink></li>
        <li><NavLink to="/map">Map</NavLink></li>
        <li><NavLink to="/settings">Settings</NavLink></li>
      </ul>
    </>
  )
}
export default Sidebar
