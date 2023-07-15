import { Link } from "react-router-dom";
import { nanoid } from 'nanoid';
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

  const checkIfCreator = (post) => {
    if (props.place === 'userpage') {
      if (props.user && post.reply.user._id) {
        return ((post.reply.user._id === props.user._id) || props.user.admin)
      }
    } else {
      if (post.user && props.user) {
        return ((post.user._id === props.user._id) || props.user.admin)
      }
    }
  }

  const deleteReply = (reply) => {
    if (props.place === 'userpage') {
      let unReplace = reply.reply.text.match(/->[A-Z]+:\d+/g)
      
    } else {
      fetch(`/api/delReply/${reply._id}`, {
        method: "PUT",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(reply)})
        .then(response => {
          if (response.ok) {
            console.log('Delete request successful');
          } else {
            console.error('Delete request failed');
          }
        })
        .catch(error => {
          console.error('Network error:', error);
        });

      
      //   .then((response) => response.json())
      //   .then((data) => {
      //     console.log(data)
      //   })
      //   .catch((error) => {
      //     console.error('Error deleting reply:', error);
      //   });

      // const repliesPromise = fetch(`/api/delReply/${}`);
      // console.log(reply.text)
      // // MOVET TO SERVER SIDE

      // const regex = /(->[A-Z]+:\d+)/g
      // const matches = reply.text.match(regex);
      // let replacedText = reply.text.split(regex).map(part => {
      //   if (matches && matches.includes(part)) {
      //     return part;
      //   } else {
      //     return '';
      //   }
      // }).join('');

      // console.log(replacedText)
    }
  }


  const replaceText = (text) => {
    return text.split('\n').map((line, index) => (
      <div key={nanoid()}>
        {reactStringReplace(line, /(->[A-Z]+:\d+)/g, (match, i) => (
          <Link
            key={nanoid()}
            style={{ color: 'red' }}
            to={`/post/${props.postLink}#${match.replace(/->/g, '')}`}
          >
          {match}
          </Link>
        ))}
      </div>
    ));
  };

  const checkCommentor = (post) => {
    console.log(post)
    if (post.deleted === true) {
      return "DELETED "
    } else {
      if (post.user === "Anonymous") {
        return "Anonymous "
      } else {
        return <Link to={`/user/${post.user.username}`}>@{`${post.user.displayName} `}</Link>
      }
    }
  }

  const renderCommentBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    // THIS IS FOR THE COMMENTS PAGE
    return items.map((key) => {
      return (<div key={key._id} style={{ backgroundColor: props.activeComment === key.replyId ? 'pink' : 'white' }}>
        <br/>
        {checkCommentor(key)}
        {timePassed(Date.parse(key.createdAt))}
        {key.replyId ? ` [${key.replyId}]` : ''}
        {key.replies.length !== 0 && <br/>}
        {replyToComment(key.replies)}
        <div style={{ display:'flex', margin: '0.5em' }}>
          {key.media && key.media !== 'DELETED' && <img style={{ width: 'auto', height: '5rem', aspectRatio:1, objectFit:'cover' }} src={key.media} alt="comment"></img>}
          <div>
            {replaceText(key.text)}
          </div>
          {checkIfCreator(key) && <button style={{ marginLeft: '1em' }} onClick={()=>{deleteReply(key)}}>X</button>}
        </div>
      </div>)
    })
  }

  const renderUserBody = (items) => {
    if (items.length === 0) {
      return <p>Nothing's posted yet...</p>
    }

    // THIS FOR THE USER PAGE
    return items.map((key) => {
      return (<div key={nanoid()}>
        <br/>
        <Link to={`/post/${key.post.board}?${key.post._id}`}>{key.post.title}</Link> by {key.post.displayName ? key.post.displayName : 'Anonymous'} in {key.post.board}
        <br/>
        {key.reply.user === "Anonymous" ? 'Anonymous ': `@${key.reply.user.displayName} `}
        {timePassed(Date.parse(key.reply.createdAt))}
        {key.reply.replyId ? ` [${key.reply.replyId}]` : ''}
        {key.reply.replies.length === 0 && <br/>}

        <div style={{ display:'flex', margin: '0.5em' }}>
          {replyToComment(key.reply.replies)}
          <p style={{ margin: 0 }}>{key.reply.text}</p>
          {checkIfCreator(key) && <button style={{ marginLeft: '1em' }} onClick={()=>{deleteReply(key)}}>X</button>}
        </div>
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