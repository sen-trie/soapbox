import { Link } from "react-router-dom"

const Post = (props) => {
  const items = props.items;

  return Object.keys(items).map((key, i) => {
    let post = items[key];

    return (
      <div key={i}>
        <p>{post.title}
          <br/>by {post.displayName ? <Link to={`/user/${post.userName}`}>@{post.displayName}</Link> : 'Anonymous'} 
          <br/>{post.body}
        </p>
      </div>
    );
  });
}

export default Post