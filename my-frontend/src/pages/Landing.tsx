import PostBar from "../components/postbar";
import Sidebar from "../components/Sidebar";

function Home() {
    return (
        <div>
            <div>
                <a href="/Login">Login</a><a href="/Signup">Sign up</a>
            </div>
            <Sidebar />
            <PostBar />
            <h1>Landing Page</h1>
        </div>
    );
}
export default Home;