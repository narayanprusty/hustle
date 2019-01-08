import React, { Component, Fragment } from "react";
import { notify } from "react-notify-toast";
import InfiniteScroll from "react-infinite-scroller";

import "./Rides_client.scss";
import { Meteor } from "meteor/meteor";

export default class Rides extends Component {
    state = {
        datas: [],
        hasMoreItems: true,
       
    };

    loadItems=(page)=>{
            Meteor.call('fetchUserBookings',Meteor.userId(),page,(error,response)=>{
                if(error){
                    notify.show(error.reason ? error.reason :'Unable to fetch!','error');
                }
                
                if(response && response.data && response.data.length){
                    let datas = this.state.datas;
                    datas = datas.concat(response.data);
                    console.log(datas);
                    this.setState({
                        datas:datas
                    });
                }else{
                    this.setState({
                        hasMoreItems:false
                    })
                }

            })
    }
  render() {
    const loader = <div className="loader" key={0}>Loading ...</div>;
   
    let items = [];
        this.state.datas.map((data, i) => {
            items.push(
                <div className="item item-divider" key={i}>
                    {JSON.stringify(data)}
                </div>
            );
        });

    return (
            <InfiniteScroll
                pageStart={0}
                loadMore={this.loadItems.bind(this)}
                hasMore={this.state.hasMoreItems}
                loader={loader}
                useWindow={false}
                >
                <div className="list">
                    {items}
                </div>
            </InfiniteScroll>
    );
  }
}
