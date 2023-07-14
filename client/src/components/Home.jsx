import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"
import Item from "./Item";
import boards from 'boards.js';

const Home = (props) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const nav = useNavigate();

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(part => part !== '');
  let subDirectory = pathParts.length > 1 ? pathParts.pop() : null;

  useEffect(() => {
    fetch(`/api/items${subDirectory ? `/board:${subDirectory}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        nav('/404', { replace: true })
      })

    fetch('/profile')
      .then((response) => response.json())
      .then((data) => {
        if (typeof(data) === 'object') {
          setUser(data.existingUser);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, [subDirectory]);

  const handleLogout = () => {
    fetch('/logout')
      .then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        }
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/google';
  };

  return (
    <div className="App-header">
      <div>SOAPBOX</div>
      <p> {user 
        ? (<><Link to={`/user/${user.username}`}>@{user.displayName} ({user.username}) </Link>{user.admin ? '[ADMIN]':''}</>) 
        : 'Anonymous'
      }</p>
      <Link to="/create">Create a New Post</Link>
      <br/>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
      <br/>
      <br/>
      <div>
        <Link to={`/`} onClick={() => {setLoading(false)}}>HOME </Link>
        {Object.keys(boards).map((key) => (
          <Link key={key} to={`/box/${key}`} onClick={() => {setLoading(false)}}>
            | {`${key.toUpperCase()} `}
          </Link>
        ))}
      </div>
      { loading === true && 
        <p>loading...</p>}
      { items.length !== 0 && user !== null &&
        <Item
          items={items} user={user} key={items}
        />}
      {
        items.length === 0 && user !== null &&
        <p>There's nothing posted yet...</p>
      }
    </div>
    )
}

export default Home