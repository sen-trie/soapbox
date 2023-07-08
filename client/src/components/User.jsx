import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "./Post";

const User = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);

  const nav = useNavigate();

  const pathName = ((window.location.href).split("/")).pop();

  useEffect(() => {
    fetch(`/api/user/${pathName}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          getPosts(data.user.id);
        } else {
          nav('/404', { replace: true })
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, [])

  useEffect(() => {
    //  console.log(posts)
  }, [posts]);

  const getPosts = (id) => {
    fetch(`/api/items/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts)
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }

  const calculateTime = () => {
    const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('/');

    return formattedDate
  }
  
  return (
    <div>
      { !user && <p>Loading...</p>}
      { user && <>
          <p>
            {user.username}/@{user.displayName}
            <br/> Created on {calculateTime()}
          </p>
          <div>
            { posts ? <Post items={posts}/> : 'Loading Posts...'}
          </div>
        </>
      }
    </div>
    
  )
}
  
 export default User