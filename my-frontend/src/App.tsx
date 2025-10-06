import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Notifications from "./pages/Notifications"
import Crop from "./pages/Crop"
import Booking from "./pages/Booking"
import Events from "./pages/Events"

import Settings from "./pages/Settings"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/crop-recommendations" element={<Crop />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/events" element={<Events />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
