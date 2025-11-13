import Sidebar from "../components/Sidebar"


function Notifications() {
    return (
        <div>
        
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <h1 style={{ margin: '500px' }}>You Don't Have Any Notifications Yet</h1>
            </div>
        </div>
    );
}
export default Notifications;
