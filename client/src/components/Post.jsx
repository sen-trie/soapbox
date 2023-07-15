import { useEffect, useState } from "react";
import Item from "./Item";
import Comment from "./Comment";
import { useLocation, Link, useNavigate } from "react-router-dom";

const Post = () => {
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [reply, setReply] = useState(null);
  const [activeComment, setActiveComment] = useState(null);
  const [commentText, setCommentText] = useState({
    mediaLink: '',
    comment: '',
  });

  const nav = useNavigate();
  const location = useLocation();

  const board = location.pathname.split('/')[2];
  let replyId = location.hash.split('#')[1];
  let postId = location.search.split('?')[1];

  useEffect(() => {
    // console.log(replyId)
    setActiveComment(replyId)
  },[replyId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postPromise = fetch(`/api/items/uid:${postId}`);
        const repliesPromise = fetch(`/api/replies/uid:${postId}`);
        const userPromise = fetch('/profile');
  
        const [postData, repliesData, userData] = await Promise.all([postPromise, repliesPromise, userPromise]);
        const [postResponse, repliesResponse, userResponse] = await Promise.all([
          postData.ok ? postData.json() : Promise.reject(new Error(`Post ${postId} not found`)),
          repliesData.ok ? repliesData.json() : Promise.reject(new Error(`Replies for ${postId} not found`)),
          userData.json()
        ]);
  
        setPost(postResponse);
        setReply(repliesResponse);
        setUser(userResponse.existingUser);
      } catch (error) {
        console.error(error);
        //nav('/404', { replace: true });
      }
    };
  
    fetchData();
  }, [postId]);

  const handleSumbit = (event) => {
    event.preventDefault();

    const commentData = {
      postId: postId,
      postUid: post[0].postID,
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
      <Link to='/'>HOME</Link>
      { !post && <p>Loading...</p>}
      { post && <Item items={post} user={user} place='post'></Item>}
      <form onSubmit={handleSumbit}>
        <p>Commenting as {user ? `@${user.displayName} (${user.username})` : 'Anonymous'}</p>
        <label htmlFor="media">Media Link (img/mp4) </label>
        <input type='text' name="media" onChange={(e) => {setCommentText((commentText) => ({...commentText, mediaLink: e.target.value}))}} value={commentText.mediaLink}/>
        <br/>
        <textarea name="postContent" rows={4} cols={40} value={commentText.comment} onChange={(e) => {setCommentText((commentText) => ({...commentText, comment: e.target.value}))}}/>
        <br/><input type="submit"></input>
      </form>
      { reply && <Comment items={reply} postLink={`${board}?${postId}`} activeComment={activeComment}></Comment>}
    </div>
  )
}

export default Post