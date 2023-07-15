import { Link } from "react-router-dom";
import timePassed from "../functions/time";
import reactStringReplace from 'react-string-replace';

const Comment = (props) => {
  const replyToComment = (reply) => {
    return (
      Object.keys(reply).map((key) => {
        return <Link key={key} to={`/post/${props.postLink}#${reply[key]}`} style={{ color:'green' }}>{`-${reply[key]} `}</Link>
      })
    )
  }

  const replaceText = (text) => {
    return text.split('\n').map((line, index) => (
      <div key={index}>
        {reactStringReplace(line, /(->[A-Z]+:\d+)/g, (match, i) => (
          <Link
            key={index}
            style={{ color: 'red' }}
            to={`/post/${props.postLink}#${match.replace(/->/g, '')}`}
          >
          {match}
          </Link>
        ))}
      </div>
    ));
  };

  const renderCommentBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    // THIS IS FOR THE COMMENTS PAGE
    return items.map((key, index) => {
      return (<div key={index} style={{ backgroundColor: props.activeComment === key.replyId ? 'pink' : 'white' }}>
        <br/>
        {key.user === "Anonymous" ? 'Anonymous ': <Link to={`/user/${key.user.username}`}>@{`${key.user.displayName} `}</Link>} 
        {timePassed(Date.parse(key.createdAt))}
        {key.replyId ? ` [${key.replyId}]` : ''}
        {key.replies.length !== 0 && <br/>}
        {replyToComment(key.replies)}
        <div style={{ display:'flex', margin: '0.5em' }}>
          {key.media && <img style={{ width: 'auto', height: '5rem', aspectRatio:1, objectFit:'cover' }} src={key.media} alt="comment"></img>}
          <div>
            {replaceText(key.text)}
          </div>
        </div>
      </div>)
    })
  }

  const renderUserBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    // THIS FOR THE USER PAGE
    return items.map((key, index) => {
      return (<div key={index}>
        <br/>
        <Link to={`/post/${key.post.board}?${key.post._id}`}>{key.post.title}</Link> by {key.post.displayName ? key.post.displayName : 'Anonymous'} in {key.post.board}
        <br/>
        {key.reply.user === "Anonymous" ? 'Anonymous ': `@${key.reply.user.displayName} `}
        {timePassed(Date.parse(key.reply.createdAt))}
        {key.reply.replyId ? ` [${key.reply.replyId}]` : ''}
        {key.reply.replies.length === 0 && <br/>}
        {replyToComment(key.reply.replies)}
        <p style={{ margin: 0 }}>{key.reply.text}</p>
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

export default Comment;