import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import Post from "./Post";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(true);
    });

    fetch('/profile')
      .then((response) => response.json())
      .then((data) => {
        setUser(data.existingUser);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, []);

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
        <div>LUNCHBOX</div>
        <p> {user 
          ? (<Link to={`/user/${user.username}`}>@{user.displayName} ({user.username})</Link>) 
          : 'Anonymous'
        }</p>
        <Link to="/create">Create a New Post</Link>
        <br/>
        <button onClick={handleLogin}>Login</button>
        <br/>
        <button onClick={handleLogout}>Logout</button>
        { !loading && 
          <p>loading...</p>}
        { items && 
          <Post
            items={items}
          />
        }
      </div>
        
    )
}

export default Home