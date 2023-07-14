import { Link } from "react-router-dom";
import timePassed from "../functions/time";
import { withRouter } from 'react-router-dom';

const Comment = (props) => {
  // let postArray = text.match(/->[A-Z]+-P:\d+\b/g);
  // if (postArray) {
  //   postArray = postArray.map((str) => str.replace(/->/g, ''));
  // }

  const handleClick = (key) => {
    props.history.push(key);
  }

  const replyToComment = (reply) => {
    return (
      Object.keys(reply).map((key) => {
        return <Link key={key} to={`/post/${props.postLink}#${reply[key]}`} onClick={() => handleClick(`/post/${props.postLink}#${props.replyId}`)}>{`-${reply[key]} `}</Link>
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
      return (<div key={index} style={{ backgroundColor: key.highlighted ? 'pink' : 'white' }}>
        <br/>
        {key.user === "Anonymous" ? 'Anonymous ': <Link to={`/user/${key.user.username}`}>@{`${key.user.displayName} `}</Link>} 
        {timePassed(Date.parse(key.createdAt))}
        {key.replyId ? ` [${key.replyId}]` : ''}
        {key.replies.length !== 0 && <br/>}
        <span style={{ color:'green' }}>{replyToComment(key.replies)}</span>
        <div style={{ display:'flex', margin: '0.5em' }}>
          {key.media && <img style={{ width: 'auto', height: '5rem', aspectRatio:1, objectFit:'cover' }} src={key.media} alt="comment"></img>}
          <p dangerouslySetInnerHTML={{ __html: repliedToComments(key.text) }}></p>
        </div>
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
        <Link to={`/post/${key.post.board}?${key.post._id}`}>{key.post.title}</Link> by {key.post.displayName ? key.post.displayName : 'Anonymous'} in {key.post.board}
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