import Blockcluster from "blockcluster";
import config from "../../modules/config/server";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const rateDriver = async () => {};

const rateRider = async () => {};
const fetchAvgRatingDriver = async () => {};

const fetchAvgRatingRider = async () => {};
const fetchRatingsDriver = async () => {};
const fetchRatingsRider = async () => {};
export {
    rateDriver,
    rateRider,
    fetchAvgRatingDriver,
    fetchAvgRatingRider,
    fetchRatingsDriver,
    fetchRatingsRider
};
