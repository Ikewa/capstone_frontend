import PostBar from "../components/postbar";
import Profile from "../components/Profile";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css";

function Home() {
    return (
        <div>
            <div className="top">
               <Topbar/>
               <div >
                   <Profile />
               </div>
            </div>
            <hr className="divider" />
            <PostBar />
            <hr className="divider2" />
            <Sidebar />
            <h1>Home Page</h1>
        </div>
    );
}
export default Home;