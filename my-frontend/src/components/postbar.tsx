function PostBar() {
    return (
        <div>
            <form>
                <textarea name="post" placeholder="What's new"></textarea>
                  <input type="file" name="photo" accept="image/*" />
                <button type="submit">Post</button>
            </form>
        </div>
    );
}
export default PostBar;