import { DriverMeta } from "../../collections/driver-meta";

const markAvailable = async driverId => {
    return await DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $setOnInsert: {
                driverId: driverId,
                available: true,
                onRide: false
            },
            $set: {
                available: true
            }
        },
        {
            upsert: true
        }
    ).toArray();
};

const markUnavailable = async driverId => {
    return await DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $setOnInsert: {
                driverId: driverId,
                available: false,
                onRide: false
            },
            $set: {
                available: false
            }
        },
        {
            upsert: true
        }
    ).toArray();
};

const updateDriverLocation = async ({ driverId, lat, lng }) => {
    return await DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $setOnInsert: {
                driverId: driverId,
                available: true,
                onRide: false,
                currentLocation: {
                    lat: lat,
                    lng: lng
                }
            },
            $set: {
                currentLocation: {
                    lat: lat,
                    lng: lng
                }
            }
        },
        {
            upsert: true
        }
    ).toArray();
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

const getDriver = async () => {
    return await DriverMeta.find({ driverId: driverId }).fetch()[0];
};
export {
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver,
    updateDriverLocation
};
