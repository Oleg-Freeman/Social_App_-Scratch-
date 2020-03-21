import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// MUI Stuff
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    position: 'relative',
    display: 'flex',
    marginBottom: 20
  },
  image: {
    minWidth: 100
  },
  content: {
    padding: 25,
    objectFit: 'cover'
  }
};

class Post extends Component {
  render() {
    dayjs.extend(relativeTime);
    const {
      classes,
      post: {
        body,
        userHandle,
        imageURL,
        createdAt,
        _id,
        likeCount,
        commentCount,
        userId
      }
    } = this.props;
    return (
      <Card className={classes.card}>
        <CardMedia
          image={imageURL}
          title="Profile image"
          className={classes.image}
        />
        <CardContent className={classes.content}>
          <Typography
            variant="h5"
            component={Link}
            to={`/users/${userId}`}
            color="primary"
          >
            {userHandle}
          </Typography>
          {/* {deleteButton} */}
          <Typography variant="body2" color="textSecondary">
            {dayjs(createdAt).fromNow()}
          </Typography>
          <Typography variant="body1">{body}</Typography>
          {/* <LikeButton screamId={screamId} />
          <span>{likeCount} Likes</span>
          <MyButton tip="comments">
            <ChatIcon color="primary" />
          </MyButton>
          <span>{commentCount} comments</span>
          <ScreamDialog
            screamId={screamId}
            userHandle={userHandle}
            openDialog={this.props.openDialog}
          /> */}
        </CardContent>
      </Card>
    );
  }
}
Post.propTypes = {
  card: PropTypes.string,
  image: PropTypes.string,
  content: PropTypes.string,
  classes: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired
};

export default withStyles(styles)(Post);
