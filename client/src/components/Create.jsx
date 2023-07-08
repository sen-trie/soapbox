import { useEffect, useState } from "react"

const Create = () => {
  const [user, setUser] = useState(null);
  const [post, setPost] = useState({
    title:'',
    body:'',
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
            userName: data.existingUser.userName,
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

    await fetch('/api/submit', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(post)
    })
    .then((response) => console.log(response.statusText))
  
    setPost({ title: "", body: "" });
  }

  return (
    <div>
      CREATE A NEW POST
      <form onSubmit={sumbitForm}>
        <label htmlFor="title">Title*</label>
        <input name="title" onChange={(e) => {setPost({...post, title: e.target.value})}} value={post.title}></input>
        <br/>
        <label htmlFor="body">Content</label>
        <input name="body" onChange={(e) => {setPost({...post, body: e.target.value})}} value={post.body}></input>
        <br/>
        <p>Posting as {user ? `@${user.displayName} (${user.username})` : 'Anonymous'}</p>
        <input type="submit"/>
      </form>
    </div>
  )
}

export default Create