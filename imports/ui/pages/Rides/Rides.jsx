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
    const loader = <div className="loader" key={0}>
    <svg className="car" width="102" height="40" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2 1)" stroke="#002742" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            <path className="car__body" d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01" stroke-width="3"/>
            <ellipse className="car__wheel--left" stroke-width="3.2" fill="#FFF" cx="83.493" cy="30.25" rx="6.922" ry="6.808"/>
            <ellipse className="car__wheel--right" stroke-width="3.2" fill="#FFF" cx="46.511" cy="30.25" rx="6.922" ry="6.808"/>
            <path className="car__line car__line--top" d="M22.5 16.5H2.475" stroke-width="3"/>
            <path className="car__line car__line--middle" d="M20.5 23.5H.4755" stroke-width="3"/>
            <path className="car__line car__line--bottom" d="M25.5 9.5h-19" stroke-width="3"/>
        </g>
    </svg>
    </div>;
   
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
