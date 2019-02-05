import { DriverMeta } from "../../collections/driver-meta";

const markAvailable = driverId => {
    return DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $set: {
                available: true
            }
        },
        {
            upsert: true
        }
    );
};

const markUnavailable = driverId => {
    return DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $set: {
                available: false
            }
        },
        {
            upsert: true
        }
    );
};

const updateDriverLocation = ({ driverId, lat, lng }) => {
    return DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $set: {
                "currentLocation.lat": lat,
                "currentLocation.lng": lng
            }
        },
        {
            upsert: true
        }
    );
};

const getDriversWithin = async ({ lat, lng }) => {
    const data = await DriverMeta.rawCollection()
        .aggregate(
            [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [lat, lng]
                        },
                        distanceField: "currentLocation",
                        maxDistance: 5000, //in meter
                        distanceMultiplier: 0.000621371,
                        includeLocs: "currentLocation",
                        spherical: true,
                        num: 1000
                    }
                },
                {
                    $match: {
                        available: true,
                        onRide: false
                    }
                },
                {
                    $project: {
                        currentLocation: 1
                    }
                }
            ],
            {
                cursor: {
                    batchSize: 0
                }
            }
        )
        .toArray();
    return data;
};

const getDriver = async driverId => {
    return await DriverMeta.find({ driverId: driverId }).fetch()[0];
};
const updateReview = async (driverId, rateVal) => {
    const driverObj = await getDriver(driverId);
    let currentRating;
    let NewNoOfRating;
    if (driverObj.noOfRating) {
        NewNoOfRating = driverObj.noOfRating + 1;
        currentRating =
            (driverObj.noOfRating * driverObj.avgRating + rateVal) /
            NewNoOfRating;
    } else {
        NewNoOfRating = 1;
        currentRating = rateVal;
    }
    return DriverMeta.update(
        { driverId: driverId },
        { $set: { avgRating: currentRating, noOfRating: NewNoOfRating } }
    );
};

export {
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver,
    updateDriverLocation,
    updateReview
};
