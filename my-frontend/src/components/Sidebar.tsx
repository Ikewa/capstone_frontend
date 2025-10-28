import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  
  return (
    <>
    <div className='sidebar'>
       <ul>
        <li><NavLink to="/Home" className="NavLink">Home</NavLink></li>
        <li><NavLink to="/notifications" className="NavLink">Notifications</NavLink></li>
        <li><NavLink to="/crop-recommendations" className="NavLink">Crop <br /> Recommendations</NavLink></li>
        <li><NavLink to="/booking" className="NavLink">Booking</NavLink></li>
        <li><NavLink to="/events" className="NavLink">Events</NavLink></li>
        <li><NavLink to="/map" className="NavLink">Map</NavLink></li>
        <li><NavLink to="/settings" className="NavLink">Settings</NavLink></li>
      </ul>
    </div>
     
    </>
  )
}
export default Sidebar
