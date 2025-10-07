import Profile from "../components/Profile";
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css";
import "./pages_style/Notyet.css";

function Booking() {
    return (
        <div>
            <div className="top">
               <Topbar />
               <Profile />
            </div>
            <hr className="divider" />
            <div className="information">
                <Sidebar />
                <h1 className="message">You Don't Have Any Bookings Yet</h1>
            </div>
        </div>
    );
}
export default Booking;