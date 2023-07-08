import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
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
        setLoggedIn(data.loggedIn);
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
        <p>{user ? `@${user.displayName}` : 'Anonymous'}</p>
        <Link to="/create">Create a New Post</Link>
        <br/>
        <button onClick={handleLogin}>Login</button>
        <br/>
        <button onClick={handleLogout}>Logout</button>
        { !loading && 
          <p>loading...</p>}
        { items && 
          items.map((key, i) => {
            return (
              <div key={i}>
                <p>{key.title}
                  <br/>by {key.displayName ? `@${key.displayName}` : 'Anonymous'} 
                  <br/>{key.body}
                </p>
              </div>
            )
          })
        }
      </div>
        
    )
}

export default Home