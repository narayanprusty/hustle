import Blockcluster from "blockcluster";
import rp from "request-promise";

import { BookingRecord } from "../../collections/booking-record";
import { DriverMeta } from "../../collections/driver-meta";
import config from "../../modules/config/server";
import { sendMessage } from "../../notifications/index";
import { oneClickPayment } from "../payments/payments";

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
const newBookingReq = async ({
    // username,
    userId,
    preferredCar,
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
}) => {
    const username = Meteor.user().profile.name;
    const avgRating = Meteor.user().profile.avgRating
        ? Meteor.user().profile.avgRating
        : 5;
    console.log(end_address, start_address);
    const totalFare = (distance_in_meter * config.farePerMeter).toFixed();
    const currentDate = Date.now();
    const identifier =
        "I" +
        Date.now() +
        "" +
        Math.random()
            .toString()
            .split(".")[1]; //this is the Booking Id
    const data = {
        createdAt: currentDate,
        riderName: username,
        preferredCar: preferredCar,
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
        time_shown: reachAfter
    };

    const infoData = {
        bookingId: identifier,
        preferredCar: preferredCar,
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

    const identifier2 =
        "I" +
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

    BookingRecord.insert({
        riderRating: avgRating,
        preferredCar: preferredCar,
        username: username,
        paymentMethod: paymentMethod,
        bookingId: identifier,
        userId: userId,
        start_address: start_address,
        end_address: end_address,
        totalFare: totalFare,
        totalDistance: distance,
        totalDuration: reachAfter,
        boardingPoint: {
            type: "Point",
            coordinates: [boardingPoint.lat, boardingPoint.lng]
        },
        droppingPoint: {
            type: "Point",
            coordinates: [droppingPoint.lat, droppingPoint.lng]
        },
        status: "pending",
        active: true,
        createdAt: Date.now()
    });

    return {
        data: data,
        txId: txId
    };
};

const onCancellation = async (
    bookingId,
    cancel_reason = "DRIVER_NOT_FOUND"
) => {
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            rideStatus: "cancelled",
            cancel_reason: cancel_reason
        }
    });
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                active: false,
                status: "cancelled"
            }
        }
    );
    return {
        txId: txId
    };
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
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                driverId: driverId,
                status: "accepted"
            }
        }
    );
    await DriverMeta.update(
        { driverId: driverId },
        {
            $set: {
                onRide: true
            },
            $inc: {
                totalNumberOfRide: 1
            }
        }
    );

    return {
        txId: txId
    };
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
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                status: "started"
            }
        }
    );
    return {
        txId: txId
    };
};

const onStopRide = async (driverId, bookingId, endingPoint) => {
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            rideStatus: "finished",
            actualEndingPoint: endingPoint
        }
    });
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                status: "finished",
                active: false
            }
        }
    );
    await DriverMeta.update(
        { driverId: driverId },
        {
            $set: {
                onRide: false
            }
        }
    );

    let booking = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Bookings,
            uniqueIdentifier: bookingId.toString()
        }
    });

    booking = booking.length > 0 ? booking[0] : {};

    if (booking) {
        if (booking.paymentMethod != "cash") {
            console.log("Paying");

            var receipt = await oneClickPayment(
                booking.totalFare,
                booking.paymentMethod
            );

            console.log(receipt);
        }
    } else {
        return {
            message: "Booking not found for payment."
        };
    }

    return {
        txId: txId
    };
};

//For online payment after confirmation call this
const onConfirmPayment = async (bookingId, txId = null, paymentAmount) => {
    try {
        let bookings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                uniqueIdentifier: bookingId.toString()
            }
        });

        if (bookings.length > 0) {
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
            sendMessage(bookings[0].driverId.toString(), "Payment Received");
            return {
                txId: Id
            };
        }
        throw {
            message: "Booking not found!"
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const fetchUserBookings = async (userId, page) => {
    const data = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Bookings,
            userId: userId
        },
        $limit: page * 10,
        $skip: page * 10 - 10,
        $sort: {
            _id: -1
        }
    });
    return {
        data: data
    };
};

const fetchDriverBookings = async (driverId, page) => {
    const data = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Bookings,
            driverId: driverId
        },
        $limit: page * 10,
        $skip: page * 10 - 10,
        $sort: {
            _id: -1
        }
    });
    return {
        data: data
    };
};

const getBookingById = async bookingId => {
    if (!bookingId) {
        return false;
    }
    try {
        console.log("Searaching: ", bookingId);
        var records = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                uniqueIdentifier: bookingId.toString()
            }
        });
        if (records.length > 0) {
            return {
                data: records[0]
            };
        } else {
            return {
                message: "Booking not found!"
            };
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

//For Cash payments
const paymentReceived = async bookingId => {
    try {
        let bookings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                uniqueIdentifier: bookingId.toString()
            }
        });

        if (bookings.length > 0) {
            if (bookings[0].rideStatus == "finished") {
                const txId = await node.callAPI("assets/updateAssetInfo", {
                    assetName: config.ASSET.Bookings,
                    fromAccount: node.getWeb3().eth.accounts[0],
                    identifier: bookingId.toString(),
                    public: {
                        paymentStatus: "confirmed"
                    }
                });

                console.log("Payment received -> status updated->", txId);
                sendMessage(bookings[0].userId.toString(), "Payment Received!");
                return {
                    success: true
                };
            } else {
                return {
                    message: "Ride is not finished yet!"
                };
            }
        } else {
            return {
                message: "Booking not found!"
            };
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const rad = function(x) {
    return (x * Math.PI) / 180;
};

//you can use this function to reduce the api call, [Haversine formula]
const getDistance = (driverLoc, boardingPoint) => {
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = rad(boardingPoint.lat - driverLoc.lat);
    const dLong = rad(boardingPoint.lng - driverLoc.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(driverLoc.lat())) *
            Math.cos(rad(boardingPoint.lat())) *
            Math.sin(dLong / 2) *
            Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // d is the distance in meter
};

//for more exact u can pass mapApi obj from frontend only and do calculation
//mapApi.geometry.spherical.computeDistanceBetween (latLngA, latLngB); //return values in Meter
const fetchBookingReq = async ({ lat, lng, carType, page }) => {
    const data = await BookingRecord.rawCollection()
        .aggregate(
            [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [lat, lng]
                        },
                        distanceField: "boardingPoint",
                        maxDistance: 5000, //in meter
                        distanceMultiplier: 0.000621371,
                        includeLocs: "boardingPoint",
                        spherical: true,
                        num: 1000
                    }
                },
                {
                    $match: {
                        active: true,
                        status: "pending",
                        preferredCar: carType //may be do this match before geonear, so that it will be little fast
                    }
                },
                {
                    $limit: page * 10
                },
                {
                    $skip: page * 10 - 10
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

const currentBookingDriver = userId => {
    const data = BookingRecord.find({
        driverId: userId,
        status: {
            $ne: ["finished", "pending"]
        },
        active: true
    }).fetch()[0];
    console.log(data);
    return data;
};

const currentBookingRider = userId => {
    const data = BookingRecord.find({
        userId: userId,
        active: true
    }).fetch()[0];
    return data;
};
/**
 *
 * @param {gte:Date,lt:Date} period
 * @param {String} driverId
 */
const getDriverBookingData = async (period, driverId) => {
    try {
        let bookings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                driverId: driverId,
                $lt: {
                    createdAt: period.lte
                },
                $gte: {
                    createdAt: period.gte
                }
            }
        });
        return bookings;
    } catch (error) {
        console.log(error);
        throw Meteor.Error({
            message: "Unable to fetch bookings"
        });
    }
};

const fetchLocationwithKeyword = ({ lat, lng, keyWord }) => {
    return rp(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${keyWord}&location=${lng},${lat}&key=` +
            config.GAPIKEY,
        { json: true }
    )
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
};

export {
    newBookingReq,
    onDriverAccept,
    onStartRide,
    onStopRide,
    onConfirmPayment,
    fetchUserBookings,
    fetchDriverBookings,
    fetchBookingReq,
    onCancellation,
    currentBookingDriver,
    currentBookingRider,
    paymentReceived,
    getBookingById,
    getDriverBookingData,
    fetchLocationwithKeyword
};
