import { useEffect, useState } from "react";
import Item from "./Item";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";

const Post = () => {
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [reply, setReply] = useState(null);
  const [commentText, setCommentText] = useState({
    mediaLink: '',
    comment: '',
  });

  const nav = useNavigate();

  const pathName = ((window.location.href).split("/")).pop();
  let postId = pathName.split('?')[1];
  const board = pathName.split('?')[0];

  let replyId;
  if (postId && postId.includes('#')) {
    replyId = postId.split('#')[1];
    postId = postId.split('#')[0];
  }

  useEffect(() => {
    fetch(`/api/items/uid:${postId}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`Post ${postId} not found`)))
      .then(data => {
        setPost(data);
      })
      .catch((err) => {
        console.error(err);
        nav('/404', { replace: true });
      });

    fetch(`/api/replies/uid:${postId}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`Replies for ${postId} not found`)))
      .then(data => {
        setReply(data);
        checkIfReply(data);
      }).catch((error) => {
        console.error("Error:", error);
        nav('/404', { replace: true });
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
  }, [postId]);

  const checkIfReply = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (replyId === data[i].replyId) {
        data[i].highlighted = true;
      }
    }
  }

  const handleSumbit = (event) => {
    event.preventDefault();

    const commentData = {
      postId: postId,
      media: commentText.mediaLink,
      text: commentText.comment,
      board: board,
      user: user ? user : 'Anonymous',
    }

    fetch(`/api/posts/${postId}:${user ? user.id : 'ANON'}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'comment', data: commentData, board: board})
    })
      .then((response) => response.json())
      .then((data) => {
      })
      .catch((error) => {
        console.error('Error upvoting post:', error);
      });
  }

  return (
    <div>
      { !post && <p>Loading...</p>}
      { post && <Item items={post} user={user} place='post'></Item>}
      <form onSubmit={handleSumbit}>
        <p>Commenting as {user ? `@${user.displayName} (${user.username})` : 'Anonymous'}</p>
        <label htmlFor="media">Media Link (img/mp4)  </label>
        <input name="media" onChange={(e) => {setCommentText({...commentText, mediaLink: e.target.value})}} value={commentText.mediaLink}/>
        <br/>
        <textarea name="postContent" rows={4} cols={40} value={commentText.comment} onChange={(e) => {setCommentText({...commentText, comment: e.target.value})}}/>
        <br/><input type="submit"></input>
      </form>
      { reply && <Comment items={reply} postLink={`${board}?${postId}`}></Comment>}
    </div>
  )
}

export default Post