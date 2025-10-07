import farmImage from "../assets/Farm.jpg";
import "./components_style/Mock.css";

function MockComponent() {
  return (
    <div>
      <div className="area">
        <p className="profile2">Profile</p>
        <div className="content">
           <p className="coment">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                <br />Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                <br />Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                <br />Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div className="icons">
                <p className="like">LIKE</p>
                <p className="dislike">DISLIKE</p>
                <p className="comments">COMMENTS</p>
                <p className="share">SHARE</p>
            </div> 
        </div>
        <p className="date">1-10-2025</p>
      </div>
      <div className="area">
        <p className="profile2">Profile</p>
        <div className="content">
            <img className="image" src={farmImage} alt="" />
            <div className="icons">
                <p className="like">LIKE</p>
                <p className="dislike">DISLIKE</p>
                <p className="comments">COMMENTS</p>
                <p className="share">SHARE</p>
            </div>
        </div>
        <p className="date2">1-10-2025</p>
      </div>
    </div>
  );
}
export default MockComponent;