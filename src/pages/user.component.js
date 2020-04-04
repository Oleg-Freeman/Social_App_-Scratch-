import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Post from '../components/post/post.component';
import StaticProfile from '../components/profile/StaticProfile';
import Grid from '@material-ui/core/Grid';

// import PostSkeleton from '../util/PostSkeleton';
// import ProfileSkeleton from '../util/ProfileSkeleton';

import { connect } from 'react-redux';
import { getUserData } from '../redux/actions/dataActions';

class User extends Component {
  constructor() {
    super();

    this.state = {
      profile: null,
      postIdParam: null
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    const postId = this.props.match.params.postId;

    if (postId) this.setState({ postIdParam: postId });
    // console.log(userId);
    this.props.getUserData(userId);
    axios
      .get(`http://localhost:5000/users/${userId.replace(/['"]+/g, '')}`)
      .then((res) => {
        this.setState({
          profile: res.data
        });
        // console.log('profile', this.state.profile);
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { posts, loading } = this.props.data;
    // const { postIdParam } = this.state;

    // const postsMarkup = loading ? (
    //   <PostSkeleton />
    // ) : posts === null ? (
    //   <p>No posts from this user</p>
    // ) : !postIdParam ? (
    //   posts.map((post) => <post key={post.postId} post={post} />)
    // ) : (
    //   posts.map((post) => {
    //     if (post.postId !== postIdParam) {
    //       return <Post key={post.postId} post={post} />; // <Post key={post.postId} post={post} />;
    //     }
    //     else return <Post key={post.postId} post={post} openDialog />; // <Post key={post.postId} post={post} openDialog />;
    //   })
    // );

    const postsMarkup = loading ? (
      <p>Loading data...</p>
    ) : posts === null ? (
      <p>No posts from this user</p>
    ) : (
      posts.map((post, index) => <Post key={index} post={post} />)
    );

    // return (
    //   <Grid container spacing={10}>
    //     <Grid item sm={8} xs={12}>
    //       {postsMarkup}
    //     </Grid>
    //     <Grid item sm={4} xs={12}>
    //       {this.state.profile === null ? (
    //         <ProfileSkeleton />
    //       ) : (
    //         <StaticProfile profile={this.state.profile} />
    //       )}
    //     </Grid>
    //   </Grid>
    // );

    return (
      <Grid container spacing={10}>
        <Grid item sm={8} xs={12}>
          {postsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          {this.state.profile === null ? (
            <p>Loading profile...</p>
          ) : (
            <StaticProfile profile={this.state.profile} />
          )}
        </Grid>
      </Grid>
    );
  }
}

User.propTypes = {
  getUserData: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getUserData }
)(User);
