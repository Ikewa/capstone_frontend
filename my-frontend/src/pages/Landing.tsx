import PostBar from "../components/postbar";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css"

function Home() {
    return (
        <div>
            <div className="top">
                <Topbar /> 
                <div className="form">
                    <a href="/Login" className="login">Login</a>
                    <a href="/Signup" className="signup">Sign up</a>
                </div> 
            </div>
             <hr className="divider" />
             <PostBar />
             <hr className="divider2" />
            <Sidebar />
            <h1>Landing Page</h1>
        </div>
    );
}
export default Home;