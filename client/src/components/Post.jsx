import { useState } from "react";
import { Link } from "react-router-dom"

const Post = (props) => {
  const [process, setProcess] = useState(false);

  // ONLY TAKES ARRAYS AS PROPS
  const items = props.items;

  
  const likePost = (post) => {
    if (process) {return}
    setProcess(true)

    const postId = post._id;
    fetch(`/api/posts/${postId}:${props.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: didUserLike(postId) ? 'downvote' : 'upvote' })
    })
      .then((response) => response.json())
      .then((data) => {
        if (didUserLike(postId)) {
          props.user.liked.splice(props.user.liked.indexOf(postId), 1);
          for (let obj in props.items) {
            if (props.items[obj]._id === postId) {
              props.items[obj].likes--;
              break;
            }
          }
        } else {
          props.user.liked.push(postId);
          for (let obj in props.items) {
            if (props.items[obj]._id === postId) {
              props.items[obj].likes++;
              break;
            }
          }
        }
        setProcess(false);
      })
      .catch((error) => {
        setProcess(false);
        console.error('Error upvoting post:', error);
      });
  }

  const didUserLike = (postId) => {
    if (!props.user) {return false}
    return (props.user.liked.includes(postId))
  }
  
  if (Object.keys(items).length === 0) {
    return (
      <p>Nothing is posted yet...</p>
    )
  } else {
    return Object.keys(items).map((key, i) => {
      let post = items[key];

      return (
        <div key={i} style={{display:'flex', alignItems:'center'}}>
          <div style={{ margin:'1em' }}>
            <p style={{ 
              margin:0, 
              color: didUserLike(post._id) ? 'red' : 'black'     
            }}>{post.likes}</p>
            { props.user && <button style={{height:'fit-content'}} onClick={() =>{likePost(post)}}> ^ </button>}
          </div>
          <p>{post.title}
            <br/>{post.board ? `on ${post.board}, ` : ''} 
              by {post.displayName ? <Link to={`/user/${post.userName}`}>@{post.displayName}</Link> : 'Anonymous'} 
            <br/>{post.body}
          </p>
        </div>
      );
    });
  }
}

export default Post