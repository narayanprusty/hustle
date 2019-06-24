import shortid from "shortid";
import Blockcluster from "blockcluster";
import { updateReview, getDriver } from "../driverMeta/driverMeta";
import config from "../../modules/config/server";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

/**
 *  User reviews Driver
 * @param {String} driverId
 * @param {String} message
 * @param {Number} rateVal
 */
const rateDriver = async ({ driverId, message, rateVal, bookingId }) => {
    const userId = Meteor.userId();
    const identifier = Date.now() + shortid.generate();
    const data = {
        driverId: driverId,
        riderId: userId,
        message: message,
        rating: rateVal,
        ratedBy: "rider",
        bookingId
    };
    await node.callAPI("assets/issueSoloAsset", {
        assetName: config.ASSET.Reviews,
        fromAccount: node.getWeb3().eth.accounts[0],
        toAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier
    });
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Reviews,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier,
        public: data
    });
    await updateReview(driverId, rateVal);
    return { txId: txId };
};

const updateReviewRider = async (riderId, rateVal) => {
    const { profile } = Meteor.users.find({ _id: riderId }).fetch()[0];
    let currentRating;
    let NewNoOfRating;
    if (profile.noOfRating) {
        NewNoOfRating = profile.noOfRating + 1;
        currentRating =
            (profile.noOfRating * profile.avgRating + rateVal) / NewNoOfRating;
    } else {
        NewNoOfRating = 1;
        currentRating = rateVal;
    }

    return Meteor.users.update(
        { _id: riderId },
        {
            $set: {
                "profile.avgRating": currentRating,
                "profile.noOfRating": NewNoOfRating
            }
        }
    );
};

/**
 *  User reviews Rider
 * @param {String} driverId
 * @param {String} message
 * @param {Number} rateVal
 */
const rateRider = async ({ riderId, message, rateVal, bookingId }) => {
    const userId = Meteor.userId();
    const identifier = Date.now() + shortid.generate();
    const data = {
        driverId: userId,
        riderId: riderId,
        message: message,
        rating: rateVal,
        ratedBy: "driver", 
        bookingId
    };
    await node.callAPI("assets/issueSoloAsset", {
        assetName: config.ASSET.Reviews,
        fromAccount: node.getWeb3().eth.accounts[0],
        toAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier
    });
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Reviews,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier,
        public: data
    });
    await updateReviewRider(riderId, rateVal);

    return { txId: txId };
};

const fetchAvgRatingDriver = async driverId => {
    const driverData = getDriver(driverId);
    return {
        rating: driverData.avgRating ? driverData.avgRating : 5,
        totalRating: driverData.noOfRating ? driverData.noOfRating : 0,
        totalRides: driverData.totalNumberOfRide
            ? driverData.totalNumberOfRide
            : 0
    };
};

const fetchAvgRatingRider = async riderId => {
    const { profile } = Meteor.users.find(
        { _id: riderId },
        { fields: { profile: true } }
    );
    return {
        rating: profile.avgRating ? profile.avgRating : 5,
        totalRating: profile.noOfRating ? profile.noOfRating : 0,
        totalRides: profile.totalNumberOfRide ? profile.totalNumberOfRide : 0
    };
};

const fetchRatingsDriver = async ({ page, driverId }) => {
    const data = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Reviews,
            driverId: driverId
        },
        $limit: page * 10,
        $skip: page * 10 - 10,
        $sort: {
            _id: -1
        }
    });
    return data;
};

const fetchRatingsRider = async ({ page, userId }) => {
    const data = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Reviews,
            riderId: userId
        },
        $limit: page * 10,
        $skip: page * 10 - 10,
        $sort: {
            _id: -1
        }
    });
    return data;
};

export {
    rateDriver,
    rateRider,
    fetchAvgRatingDriver,
    fetchAvgRatingRider,
    fetchRatingsDriver,
    fetchRatingsRider
};
