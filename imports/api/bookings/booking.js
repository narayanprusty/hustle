import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
const node = new Blockcluster.Dynamo({
  locationDomain: config.BLOCKCLUSTER.host,
  instanceId: config.BLOCKCLUSTER.instanceId
});

const newBooking = async (
  userId,
  driverId,
  boardingPoint,
  droppingPoint,
  paymentMethod,
  totalFare,
  distance
) => {
  const identifier = Date.now(); //this is the Booking Id
  const data = {
    createdAt: Date.now(),
    userId: userId,
    driverId: driverId,
    paymentMethod: paymentMethod,
    paymentStatus: "pending",
    totalFare: totalFare,
    totalDistance: distance,
    distanceUnit: "KM",
    rideStatus: "pending",
    boardingPoint: boardingPoint,
    droppingPoint: droppingPoint
  };
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
  return { data: data, txId: txId };
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
  return {txId:txId};
};

const onStopRide = async(bookingId,endingPoint)=>{
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.BLOCKCLUSTER.matchAssetName,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
          rideStatus: "finished",
          actualEndingPoint: endingPoint
        }
      });
      return {txId:txId};
};

const onConfirmPayment = async(bookingId,txId=null,paymentAmount)=>{
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.BLOCKCLUSTER.matchAssetName,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            paymentStatus:'confirmed',
            paymentTxId:txId,
            paymentReceived:paymentAmount
        }
      });
      return {txId:txId};
}

export { newBooking, onStartRide, onStopRide, onConfirmPayment };
