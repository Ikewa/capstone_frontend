import Profile from "../components/Profile";
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css";

function Booking() {
    return (
        <div>
            <div className="top">
               <Topbar />
               <Profile />
            </div>
            <hr className="divider" />
            <Sidebar />
            <h1>Booking Page</h1>
        </div>
    );
}
export default Booking;