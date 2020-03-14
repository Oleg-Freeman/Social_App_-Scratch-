import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
// import PropTypes from 'prop-types';

import Post from '../components/post.component';
import Profile from '../components/profile/profile.component';
// import State from '../components/state.component';
// import ScreamSkeleton from '../util/ScreamSkeleton';

// import { connect } from 'react-redux';
// import { getScreams } from '../redux/actions/dataActions';

export default class home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: ''
    };
  }

  componentDidMount() {
    axios.get('http://localhost:5000/posts')
      .then(res => {
        return this.setState({
          posts: res.data
        });
      }).catch(err => console.log(err));
  }

  render() {
    const recentPosts = this.state.posts ? (
      // eslint-disable-next-line react/jsx-key
      this.state.posts.map(post => <Post key={post._id} post={post}/>)
    ) : <p>Loading...</p>;
    return (
      <Grid container spacing={10}>
        <Grid item sm={8} xs={12}>
          {recentPosts}
          {/* <State /> */}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
          {/* <p>Profile</p> */}
        </Grid>
      </Grid>
    );
  }
}

// home.propTypes = {
//   getScreams: PropTypes.func.isRequired,
//   data: PropTypes.object.isRequired
// };

// const mapStateToProps = (state) => ({
//   data: state.data
// });

// export default connect(
// mapStateToProps,
// { getScreams }
// )(home);
