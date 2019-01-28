import { DriverMeta } from "../../collections/driver-meta";

const markAvailable = driverId => {
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

const markUnavailable = driverId => {
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

const getDriversWithin = ({ lat, lng }) => {
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

const getDriver = () => {
    return await DriverMeta.find({ driverId: driverId }).fetch()[0];
};
export { markAvailable, markUnavailable, getDriversWithin, getDriver };
