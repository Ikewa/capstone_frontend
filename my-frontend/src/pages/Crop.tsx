import Sidebar from "../components/Sidebar"


function Crop() {
    return (
        <div>
            
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <h1 style={{ margin: '500px' }}>You Don't Have Any Crop Recommendations Yet</h1>
            </div>
        </div>
    );
}
export default Crop;