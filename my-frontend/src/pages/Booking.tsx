import Sidebar from "../components/Sidebar"


function Booking() {
    return (
        <div>
            
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <h1 style={{ margin: '500px' }}>You Don't Have Any Bookings Yet</h1>
            </div>
        </div>
    );
}
export default Booking;