import { Link } from "react-router-dom"
import timePassed from "../functions/time"

const Comment = (props) => {

  // let postArray = text.match(/->[A-Z]+-P:\d+\b/g);
  // if (postArray) {
  //   postArray = postArray.map((str) => str.replace(/->/g, ''));
  // }

  const replyToComment = (reply) => {
    return (
      Object.keys(reply).map((key) => {
        return <p key={key} style={{ margin: 0 }}>{`-${reply[key]} `}</p>
      })
    )
  }

  const repliedToComments = (text) => {
    const regex = /->[A-Z]+:\d+\b/g;
    text = text.replace(regex, (matchText) => {
      return `<span style="color:maroon"}>${matchText}</span>`
    });

    return text
  }

  return (
    props.items.map((key, index) => {
      return (<div key={index}>
        <br/>
        {key.user === "Anonymous" ? 'Anonymous ': <Link to={`/user/${key.user.username}`}>@{`${key.user.displayName} `}</Link>} 
        {timePassed(Date.parse(key.createdAt))}
        {key.replyId ? ` [${key.replyId}]` : ''}
        {key.replies.length === 0 && <br/>}
        <span style={{ color:'green' }}>{replyToComment(key.replies)}</span>
        <p dangerouslySetInnerHTML={{ __html: repliedToComments(key.text) }} style={{ margin: 0 }}></p>
      </div>)
    })
  )
}

export default Comment