import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import timePassed from "../functions/time";

const Item = (props) => {
  const [process, setProcess] = useState(false);

  // ONLY TAKES ARRAYS AS PROPS
  useEffect(() => {
    // fetchReplyCounts(props.items);
  },[props])

  const likePost = (post) => {
    if (process) {return}
    setProcess(true)

    const postId = post._id;
    fetch(`/api/posts/${postId}:${props.user._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: didUserLike(postId) ? 'downvote' : 'upvote' })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message === 'OK') {
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
        }
      })
      .catch((error) => {
        // TODO: ERROR POP UP HERE
        console.error('Error upvoting post:', error);
      })
      .finally(() => {
        setProcess(false);
      })
  }

  const deletePost = (post) => {
    fetch(`/api/items/${post._id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          console.log('Post deleted successfully');
        } else {
          console.log('Error deleting post');
        }
      })
      .catch((error) => {
        console.error('Error deleting post:', error);
      });
  }

  const checkIfCreator = (post) => {
    if (props.user) {
      return (post.userID === props.user.id || props.user.admin)
    }
  }

  const renderItems = (items) => {
    return Object.keys(items).map((key, i) => {
      let post = items[key];

      return (
        <div key={i} className="post___container">
          <div style={{display:'flex', alignItems:'center'}}>
            <div style={{ margin:'1em' }}>
              <p style={{ 
                margin:0, 
                color: didUserLike(post._id) ? 'red' : 'black'     
              }}>{post.likes}</p>
              { props.user && <button style={{height:'fit-content'}} onClick={() =>{likePost(post)}}> ^ </button>}
            </div>
            <p>{props.place !== 'post' ? <Link to={`/post/${post.board}?${post._id}`}>{post.title}</Link> : post.title}
              {post.postID ? ` [${post.postID}]` : ''}
              <br/>{'by '}
                {post.displayName 
                  ? ( props.place !== 'userpage' 
                      ? <Link to={`/user/${post.userName}`}>@{post.displayName}</Link> 
                      : `@${post.displayName}`)
                  : 'Anonymous'} 
                {post.board ? `, on ${post.board}` : ', '}
                {` ${timePassed(Date.parse(post.createdAt))}`}
              <br/>
                {` ${post.replies.length} ${post.replies.length === 1 ? 'reply' : 'replies'}`}
            </p>
            {/* props.user &&  */}
            {checkIfCreator(post) && <button style={{ marginLeft: '1em' }} onClick={() => deletePost(post)}>X</button>}
          </div>
          {props.place === 'post' ? renderBody(post.media, post.body) : ''}
        </div>
      );
    });
  }

  const renderBody = (media, body) => {
    return (
      <div style={{ display:'flex', gap:'1em' }}>
        <img key='body' style={{ width: '20rem', height: '25rem', objectFit:'cover' }} src={media} alt='post body'></img>
        <p>{body}</p>
      </div>
      
    )
  }

  const didUserLike = (postId) => {
    if (!props.user) {return false}
    return (props.user.liked.includes(postId))
  }

  return (
    <div>
      {renderItems(props.items)}
    </div>
  )
}

export default Item;