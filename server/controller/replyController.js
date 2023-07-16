const Reply = require('../models/reply');
const Post = require('../models/posts');

const findReply =  (req, res) => {
  const param = req.params.param;
  const [key, value] = param.split(':');
  let find;
  
  if (key === 'uid') {
    find = { postId: value };
  } else if (key === 'user') {
    find = { 'user.id': value };
  } else {
    res.sendStatus(400);
    return;
  }
  
  Reply.find(find)
    .then((replies) => {
      if (key === 'user') {
        const postIDs = replies.map((reply) => reply.postId);
  
        Post.find({ _id: { $in: postIDs } })
          .then((posts) => {
            const combinedData = [];

            for (let i = 0; i < replies.length; i++) {
              let findPostId = replies[i].postId
              for (let j = 0; j < posts.length; j++) {
                if (findPostId === posts[j]._id.toString()) {
                  combinedData.push({post:posts[j], reply:replies[i]});
                  break;
                }
              }
            }

            res.send({ combinedData });
          })
          .catch((error) => {
            console.error('Error retrieving posts:', error);
            res.sendStatus(500);
          });
      } else {
        res.send(replies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500)
    });
}

const deleteReply = (req, res) => {
  const reply = req.body;

  if (req.isAuthenticated()) {
    if (reply.user === 'Anonymous') {
      if (!req.user.admin) {
        res.status(401).send('Unauthorized');
        return;
      }
    } else if (reply.user._id !== req.user._id) {
      res.status(401).send('Unauthorized');
      return;
    }

    Reply.findByIdAndUpdate(reply._id, {}, { new: true })
      .then(reply =>{
        const regex = /(->[A-Z]+:\d+)/g
        const matches = reply.text.match(regex);
        let replacedText = reply.text.split(regex).map(part => {
          if (matches && matches.includes(part)) {
            return part;
          } else {
            return '';
          }
        }).join('');

        if (reply.media) {reply.media = 'DELETED'}
        reply.text = replacedText;
        reply.deleted = true;
        reply.user = 'DELETED'

        reply.save()
          .then((updatedReply) => {
            console.log('Reply updated');
          })
          .catch((err) => {
            console.error('Error saving updated reply:', err);
          })
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500)
      })
  } else {
    res.status(401).send('Unauthorized');
  }
}

module.exports = {
  findReply, deleteReply
}