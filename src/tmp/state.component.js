import React, { Component } from 'react';

import store from '../redux/store';

export default class State extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: []
    };
    store.subscribe(() => {
      // When state will be updated(in our case, when items will be fetched),
      // we will update local component state and force component to rerender
      // with new data.

      this.setState({
        items: store.getState().items
      });
    });
  }

  render() {
    return (
      <div>
        {console.log('Current state')}
        {console.log(this.state.items)}
      </div>
    );
  }
}
