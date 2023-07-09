import { useEffect, useState } from "react";
import boards from 'boards.js';

const Create = () => {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [post, setPost] = useState({
    title:'',
    body:'',
    board:'',
    likes: 0,
    userID: null,
    displayName: null,
    userName: null,
  });

  useEffect(() => {
    fetch('/profile')
      .then((response) => response.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser(data.existingUser);
          setPost({...post, 
            userID: data.existingUser.id,
            userName: data.existingUser.username,
            displayName: data.existingUser.displayName,
          })
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });

    // setPost({...post, userID})
  }, [])

  const sumbitForm = async (event) => {
    event.preventDefault();

    if (!boards.includes(post.board)) {
      setErrorMessage("Invalid board");
      return;
    } else if (!post.title) {
      setErrorMessage("Missing title");
      return;
    }

    await fetch('/api/submit', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(post)
    })
    .then((response) => console.log(response.statusText))
  
    setPost({ title: "", body: ""});
  }

  return (
    <div>
      CREATE A NEW POST
      <form onSubmit={sumbitForm}>
        <label htmlFor="title">Title* </label>
        <input name="title" onChange={(e) => {setPost({...post, title: e.target.value})}} value={post.title}/>
        <br/>
        <label htmlFor="body">Content </label>
        <input name="body" onChange={(e) => {setPost({...post, body: e.target.value})}} value={post.body}/>
        <br/>
        <p>Posting on {post.board ? post.board : '_____'}</p>
        {boards.map((board, index) => (
          <p key={index} style={{ margin: '0' }}>
            <input type="radio" id={board} name="board" value={board} onChange={(e) => setPost({ ...post, board: e.target.value })} style={{ display: 'none' }}/>
            <label htmlFor={board}>{board}</label>
          </p>
        ))}
        <p>Posting as {user ? `@${user.displayName} (${user.username})` : 'Anonymous'}</p>
        <p>{ errorMessage && `Error: ${errorMessage}`}</p>
        <input type="submit"/>
      </form>
    </div>
  )
}

export default Create