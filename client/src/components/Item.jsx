import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import timePassed from "../functions/time";

const Item = (props) => {
  const [process, setProcess] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [items, setItems] = useState(props.items);

  // ONLY TAKES ARRAYS AS PROPS
  useEffect(() => {
    fetchReplyCounts(items);
  },[])

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

  const fetchReplyCounts = async (items) => {
    if (items.length === 0) {
      setLoadingReply(true);
      return;
    }

    const fetchPromises = items.map(async (item) => {
      const postId = item._id;
      return fetch(`/api/items/countReply:${postId}`)
        .then((response) => response.json())
        .then((data) => {
          item.replies = data.number;
        })
        .catch((error) => {
          console.error(`Error getting number of replies for post ${postId}`);
        });
    });
  
    Promise.all(fetchPromises)
      .then(() => {
        setLoadingReply(true);
      })
      .catch((error) => {
        console.error('Error fetching reply counts:', error);
      });
  };

  const renderItems = (items) => {
    return Object.keys(items).map((key, i) => {
      let post = items[key];

      return (
        <div key={i}>
          <div style={{display:'flex', alignItems:'center'}}>
            <div style={{ margin:'1em' }}>
              <p style={{ 
                margin:0, 
                color: didUserLike(post._id) ? 'red' : 'black'     
              }}>{post.likes}</p>
              { props.user && <button style={{height:'fit-content'}} onClick={() =>{likePost(post)}}> ^ </button>}
            </div>
            <p>{props.place !== 'post' ? <Link to={`/post/${post.board}:${post._id}`}>{post.title}</Link> : post.title}
              {post.postID ? ` [${post.postID}]` : ''}
              <br/>{'by '}
                {post.displayName 
                  ? ( props.place !== 'userpage' 
                      ? <Link to={`/user/${post.userName}`}>@{post.displayName}</Link> : `@${post.displayName}`)
                  : 'Anonymous'} 
                {post.board ? `, on ${post.board}` : ', '}
                {` ${timePassed(Date.parse(post.createdAt))}`}
              <br/>
                {` ${post.replies} ${post.replies === 1 ? 'reply' : 'replies'}`}
            </p>
          </div>
          {props.place === 'post' ? renderBody(post.body) : ''}
        </div>
      );
    });
  }

  const renderBody = (body) => {
    return (
      <img key='body' style={{ width: '20rem', height: '25rem', objectFit:'cover' }} src={body} alt='post body'></img>
    )
  }

  const didUserLike = (postId) => {
    if (!props.user) {return false}
    return (props.user.liked.includes(postId))
  }

  // if (Object.keys(items).length === 0) {
  //   return (
  //     <p>Nothing is posted yet...</p>
  //   )

  return (
    <div>
      {loadingReply === true && renderItems(items)}
    </div>
  )
}

export default Item;