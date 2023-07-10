import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Item from "./Item";

const User = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [posts, setPosts] = useState(null);

  const nav = useNavigate();
  const pathName = ((window.location.href).split("/")).pop();

  useEffect(() => {
    fetch('/profile')
      .then((response) => response.json())
      .then((data) => {
        if (typeof(data) === 'object') {
          setCurrentUser(data.existingUser);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });

    fetch(`/api/user/${pathName}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setViewedUser(data.user);
          getPosts(data.user.id);
        } else {
          nav('/404', { replace: true })
        }
      })
      .catch((error) => {
        nav('/404', { replace: true })
      });
  }, [])

  const getPosts = (id) => {
    fetch(`/api/items/id:${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }

  const calculateTime = () => {
    const formattedDate = new Date(viewedUser.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('/');

    return formattedDate;
  }
  
  return (
    <div>
      <Link to={`/`}>Home</Link>
      { !viewedUser && <p>Loading...</p>}
      { viewedUser && <>
          <p>
            Viewing {viewedUser.username}/@{viewedUser.displayName}
            <br/> Created on {calculateTime()}
          </p>
          <div>
            { posts ? <Item items={posts} place='userpage' user={currentUser}/> : 'Loading Posts...'}
          </div>
        </>
      }
    </div>
    
  )
}
  
 export default User