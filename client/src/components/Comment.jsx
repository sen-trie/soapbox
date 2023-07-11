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

    return text;
  }

  const renderCommentBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    return items.map((key, index) => {
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
  }

  const renderUserBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    return items.map((key, index) => {
      return (<div key={index}>
        <br/>
        <Link to={`/post/${key.post.board}:${key.post._id}`}>{key.post.title}</Link> by {key.post.displayName ? key.post.displayName : 'Anonymous'} in {key.post.board}
        <br/>
        {key.reply.user === "Anonymous" ? 'Anonymous ': `@${key.reply.user.displayName} `}
        {timePassed(Date.parse(key.reply.createdAt))}
        {key.reply.replyId ? ` [${key.reply.replyId}]` : ''}
        {key.reply.replies.length === 0 && <br/>}
        <span style={{ color:'green' }}>{replyToComment(key.reply.replies)}</span>
        <p dangerouslySetInnerHTML={{ __html: repliedToComments(key.reply.text) }} style={{ margin: 0 }}></p>
      </div>)
    })
  }

  return (
    <>
      {props.place !== 'userpage' && renderCommentBody(props.items)}
      {props.place === 'userpage' && renderUserBody(props.items)}
    </>
  )
}

export default Comment