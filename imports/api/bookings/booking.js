import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
const node = new Blockcluster.Dynamo({
  locationDomain: config.BLOCKCLUSTER.host,
  instanceId: config.BLOCKCLUSTER.instanceId
});

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
  distance_in_meter}
) => {
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
    end_address: end_address
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
    assetName: config.ASSET.BookingsInfo,
    fromAccount: node.getWeb3().eth.accounts[0],
    toAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier
  });
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.BookingsInfo,
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
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    toAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier2
  });

   await node.callAPI("assets/updateAssetInfo", {
    assetName: config.ASSET.Bookings,
    fromAccount: node.getWeb3().eth.accounts[0],
    identifier: identifier2,
    public: infoData
  });
  return { data: data, txId: txId };
};

const onDriverAccept = async (bookingId, driverId) => {
  const txId = await node.callAPI("assets/updateAssetInfo", {
    assetName: config.BLOCKCLUSTER.matchAssetName,
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
    assetName: config.BLOCKCLUSTER.matchAssetName,
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
    assetName: config.BLOCKCLUSTER.matchAssetName,
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
    assetName: config.BLOCKCLUSTER.matchAssetName,
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


export {
  newBookingReq,
  onDriverAccept,
  onStartRide,
  onStopRide,
  onConfirmPayment
};
