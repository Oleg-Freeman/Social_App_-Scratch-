import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
// import axios from 'axios';
import PropTypes from 'prop-types';

import Post from '../components/post/post.component';
import Profile from '../components/profile/profile.component';
// import State from '../components/state.component';
// import ScreamSkeleton from '../util/ScreamSkeleton';

import { connect } from 'react-redux';
import { getPosts } from '../redux/actions/dataActions';

class Home extends Component {
  // componentDidMount() {
  //   axios.get('http://localhost:5000/posts')
  //     .then(res => {
  //       return this.setState({
  //         posts: res.data
  //       });
  //     }).catch(err => console.log(err));
  // }

  componentDidMount() {
    this.props.getPosts();
    // console.log('posts');
    // console.log(this.props.getPosts());
  }

  render() {
    const { posts, loading } = this.props.data;
    const recentScreamsMarkup = !loading ? (
      posts.map(post => <Post key={post._id} post={post}/>)
    ) : <p>Loading...</p>;
    return (
      <Grid container spacing={10}>
        <Grid item sm={8} xs={12}>
          {recentScreamsMarkup}
          {/* <State /> */}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile history={this.props.history}/>
          {/* <p>Profile</p> */}
        </Grid>
      </Grid>
    );
  }
}

Home.propTypes = {
  getPosts: PropTypes.func.isRequired,
  history: PropTypes.object,
  data: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getPosts }
)(Home);
