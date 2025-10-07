import "./components_style/postbar.css";

function PostBar() {
    return (
        <div>
            <div className="post-bar">
                <form>
                    <textarea name="post" placeholder="What's new"></textarea>
                    <input type="file" name="photo" accept="image/*" />
                    <button type="submit">Post</button>
                </form>
            </div>
        </div>
    );
}
export default PostBar;