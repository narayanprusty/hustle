import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
const node = new Blockcluster.Dynamo({
  locationDomain: config.BLOCKCLUSTER.host,
  instanceId: config.BLOCKCLUSTER.instanceId
});

/**
 * rideStatus is 
 *  pending //when no driver accepted
 *  accepted //driver is allotted   
 *  started //when driver starts the ride
 *  finished //when driver ends the ride
 *  cancelled // when user cancel the ride      
 * 
 */
const newBookingReq = async (
  {
   userId,
  boardingPoint,
  droppingPoint,
  paymentMethod,
  distance,
  reachAfter,
  currentLocation,
  reachAfterIfTraffic,
  timeTakenTraffic_in_secoend,
  timeTaken_in_secoend,
  end_address,
  start_address,
  distance_in_meter
}
) => {
  console.log(end_address,start_address);
  const totalFare = (distance_in_meter*config.farePerMeter);
  const currentDate = Date.now();
  const identifier ='I'+
    Date.now() +
    "" +
    Math.random()
      .toString()
      .split(".")[1]; //this is the Booking Id
  const data = {
    createdAt: currentDate,
    userId: userId,
    paymentMethod: paymentMethod,
    paymentStatus: "pending",
    totalFare: totalFare,
    fareUnit: config.fareUnit,
    totalDistance: distance_in_meter,
    distanceUnit: "M",
    rideStatus: "pending",
    boardingPoint: JSON.stringify(boardingPoint),
    droppingPoint: JSON.stringify(droppingPoint),
    start_address: start_address,
    end_address: end_address,
    time_shown: reachAfter,
  };

  const infoData = {
    bookingId: identifier,
    time_shown: reachAfter,
    distance_shown: distance,
    usersLatLng_bookingTime: JSON.stringify(currentLocation),
    time_shown_reachAfterIfTraffic: reachAfterIfTraffic,
    total_time_in_sec: timeTaken_in_secoend,
    timeTakenTraffic_in_secoend: timeTakenTraffic_in_secoend,
    userId: userId,
    createdAt: currentDate //make similar
  };

  //create booking general assets
  await node.callAPI("assets/issueSoloAsset", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    toAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier
  });
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier,
    public: data
  });

  const identifier2 ='I'+
    Date.now() +
    "" +
    Math.random()
      .toString()
      .split(".")[1];

  //create booking info assets
  await node.callAPI("assets/issueSoloAsset", {
    assetName: config.ASSET.BookingsInfo,
    fromAccount: node.getWeb3().eth.accounts[0],
    toAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier2
  });

   await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.BookingsInfo,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier2,
    public: infoData
  });
  return { data: data, txId: txId };
};

const onDriverAccept = async (bookingId, driverId) => {
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: bookingId,
    public: {
      rideStatus: "accepted",
      driverId: driverId
    }
  });
  return { txId: txId };
};

const onStartRide = async (bookingId, startingPoint) => {
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: bookingId,
    public: {
      rideStatus: "started",
      actualStartingPoint: startingPoint
    }
  });
  return { txId: txId };
};

const onStopRide = async (bookingId, endingPoint) => {
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: bookingId,
    public: {
      rideStatus: "finished",
      actualEndingPoint: endingPoint
    }
  });
  return { txId: txId };
};

const onConfirmPayment = async (bookingId, txId = null, paymentAmount) => {
  const Id = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: bookingId,
    public: {
      paymentStatus: "confirmed",
      paymentTxId: txId,
      paymentReceived: paymentAmount
    }
  });
  return { txId: Id };
};

const fetchUserBookings = async(userId,page)=>{
  const data =  await node.callAPI("assets/search", {
    $query: {
        "assetName": config.ASSET.Bookings,
        "userId":userId
      },
      $limit:page*10,
      $skip: page*10-10,
      $sort: {
        _id: -1
      }
  });
  return  {data:data}
}

var rad = function(x) {
  return x * Math.PI / 180;
};
//you can use this function to reduce the api call, [Haversine formula]
var getDistance = (driverLoc, boardingPoint) =>{
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(boardingPoint.lat - driverLoc.lat);
  var dLong = rad(boardingPoint.lng - driverLoc.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(driverLoc.lat())) * Math.cos(rad(boardingPoint.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d/1000; // d is the distance in meter
};

//for more exact u can pass mapApi obj from frontend only and do calculation
//mapApi.geometry.spherical.computeDistanceBetween (latLngA, latLngB); //return values in Meter

const getRideReqs = async ({within=config.driversWithin,driversLatlng,minTotalFare=null,distance,mapApi})=>{
  let sortObj ={
    _id: 1
  };
  let matchObj ={ 
    "rideStatus":'pending'
    };
  if(minTotalFare){
    matchObj['totalFare']={$gte:minTotalFare}
  }
  let dist={};
  if(distance && distance.min){
   dist["$gte"] = distance.min
  }
  if(distance && distance.max){
    dist["$lte"] = distance.max
  }
  if(dist.length){
    matchObj['totalDistance']=dist
  }
  
  
  const data =  await node.callAPI("assets/search", {
    $query: {
        "assetName": config.ASSET.Bookings,
        ...matchObj
      },
      $limit:page*10,
      $skip: page*10-10,
      $sort: sortObj
  });
  let withingDistanceData =[];
  for(let i of data){
    const distanceOfBoardingsKm = getDistance(driversLatlng,i.boardingPoint);
    distanceOfBoardingsKm <= within ? withingDistanceData.push(i) : console.log("Skipping just because distance is "+distanceOfBoardingsKm);
  }
  return {data:withingDistanceData};
};

export {
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment,
  fetchUserBookings,
  getRideReqs
};
