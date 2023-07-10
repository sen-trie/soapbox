import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"
import Item from "./Item";
import boards from 'boards.js';

const Home = (props) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(part => part !== '');
  const subDirectory = pathParts.length > 1 ? pathParts.pop() : null;

  useEffect(() => {
    fetch(`/api/items${subDirectory ? `/board:${subDirectory}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(true);
    });

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

  // const authUser = async (data) => {
  //   await fetch('/api/authenticate', {
  //     method: "POST",
  //     headers: {
  //       'Content-type': 'application/json'
  //     },
  //     body: JSON.stringify(data)
  //   })
  //   .then((response) => console.log(response.statusText))
  // }

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
          ? (<Link to={`/user/${user.username}`}>@{user.displayName} ({user.username})</Link>) 
          : 'Anonymous'
        }</p>
        <Link to="/create">Create a New Post</Link>
        <br/>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <br/>
        <br/>
        <div>
          <Link to={`/`}>HOME </Link>
          {Object.keys(boards).map((key) => (
            <Link key={key} to={`/box/${key}`}>
              | {`${key.toUpperCase()} `}
            </Link>
          ))}
        </div>
        { !loading && 
          <p>loading...</p>}
        { items && 
          <Item
            items={items} user={user}
          />
        }
      </div>
        
    )
}

export default Home