import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"
import Item from "./Item";
import boards from '../shared/boards.js';

const Home = (props) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // const [subDirectory, setSubDirectory] = useState('');

  const nav = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(part => part !== '');
  let subDirectory = (pathParts.length > 1 ? pathParts.pop() : null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/items${subDirectory ? `/board:${subDirectory}` : ''}`),
      fetch('/profile')
    ])
      .then(([itemsResponse, profileResponse]) => {
        if (!itemsResponse.ok) {
          throw new Error('Error fetching items data');
        }
        if (!profileResponse.ok) {
          throw new Error('Error fetching profile data');
        }
    
        return Promise.all([itemsResponse.json(), profileResponse.json()]);
      })
      .then(([itemsData, profileData]) => {
        setItems(itemsData);
        setLoading(false);
    
        if (typeof profileData === 'object') {
          setUser(profileData.existingUser);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        nav('/404', { replace: true });
      });
  },[location])

  // useEffect(() => {
  //   const pathParts = location.pathname.split('/').filter(part => part !== '');
  //   setSubDirectory(pathParts.length > 1 ? pathParts.pop() : null);
  // }, [location]);

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
        <Link to={`/`} onClick={() => {setItems([]); setLoading(true)}}>HOME </Link>
        {Object.keys(boards).map((key) => (
          <Link key={key} to={`/box/${key}`} onClick={() => {setItems([]); setLoading(true)}}>
            | {`${key.toUpperCase()} `}
          </Link>
        ))}
      </div>
      { loading === true && 
        <p>loading...</p>}
      { items.length !== 0 && user !== null &&
        <Item
          items={items} user={user}
        />}
      {
        items.length === 0 && user !== null && loading === false &&
        <p>There's nothing posted yet...</p>
      }
    </div>
    )
}

export default Home