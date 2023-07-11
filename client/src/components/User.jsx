import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Item from "./Item";
import Comment from "./Comment";

const User = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [replies, setReplies] = useState(null);

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(part => part !== '');
  let subDirectory = pathParts.length > 1 ? pathParts.pop() : null;

  const nav = useNavigate();
  let pathName = ((window.location.href).split("/")).pop();

  useEffect(() => {
    setReplies(null);
    setPosts(null);

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

    fetch(`/api/user/${subDirectory.split(':')[0]}`)
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
  }, [subDirectory])

  // useEffect(()=>{
  //   // console.log(replies)
  // },[replies])

  const getPosts = (id) => {
    if (pathName.split(':')[1] === 'replies') {
      fetch(`/api/replies/user:${id}`)
      .then((response) => response.json())
      .then((data) => {
        setReplies(data.combinedData);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    } else {
      fetch(`/api/items/id:${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
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
      <Link to={`/`}>HOME</Link>
      { !viewedUser && <p>Loading...</p>}
      { viewedUser && <>
          <p>
            Viewing {viewedUser.username}/@{viewedUser.displayName}
            <br/> Created on {calculateTime()}
          </p>
          <Link to={`/user/${viewedUser.username}`}>Posts | </Link>
          <Link to={`/user/${viewedUser.username}:replies`}>Replies</Link>
          <div>
            {( posts === null && replies === null && 'Loading Posts...')}
            {( posts !== null && currentUser !== null) && <Item items={posts} place='userpage' user={currentUser}/> }
            {( replies !== null && currentUser !== null) && <Comment items={replies} place='userpage'></Comment>}
          </div>
        </>
      }
    </div>
    
  )
}
  
 export default User