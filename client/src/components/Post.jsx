import { useEffect, useState } from "react";
import Item from "./Item";
import Comment from "./Comment";

const Post = () => {
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [reply, setReply] = useState(null);
  const [commentText, setCommentText] = useState('')

  const pathName = ((window.location.href).split("/")).pop();
  const postId = pathName.split(':')[1];
  const board = pathName.split(':')[0];

  useEffect(() => {
    fetch(`/api/items/uid:${postId}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
    });

    fetch(`/api/replies/${postId}`)
      .then(res => res.json())
      .then(data => {
        setReply(data);
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

  const handleSumbit = (event) => {
    event.preventDefault();

    const commentData = {
      postId: postId,
      text: commentText,
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
        console.log(data)
      })
      .catch((error) => {
        console.error('Error upvoting post:', error);
      });
  }

  return (
    <div>
      { !post && <p>Loading...</p>}
      { post && <Item items={post} user={user} type='post'></Item>}
      <form onSubmit={handleSumbit}>
        <p>Commenting as {user ? `@${user.displayName} (${user.username})` : 'Anonymous'}</p>
        <textarea name="postContent" rows={4} cols={40} value={commentText} onChange={(e) => {setCommentText(e.target.value)}}/>
        <br/><input type="submit"></input>
      </form>
      { reply && <Comment items={reply}></Comment>}
    </div>
  )
}

export default Post