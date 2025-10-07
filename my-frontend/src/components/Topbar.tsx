import "./components_style/Topbar.css";

function Topbar() {
  return (
    <div className="topbar">
      <h1>AGRIFUTURE</h1>
      <form action="/search" className="search">
        <input type="text" placeholder="Search..." />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}
export default Topbar;