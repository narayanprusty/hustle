import Blockcluster from "blockcluster";
import rp from "request-promise";
import moment from "moment";

import { BookingRecord } from "../../collections/booking-record";
import { DriverMeta } from "../../collections/driver-meta";
import config from "../../modules/config/server";
import { sendMessage } from "../../Messaging/send_text";
import { oneClickPayment } from "../payments/payments";
import { payUsingWallet } from "../wallet/walletFunctions";
import { getUserSubscriptions } from "../subscriptions/subscriptions";
import localization from "../../ui/localization";
import { sendPushNotification } from "../../modules/helpers/server";
import { sendReceiptEmail } from "../userFunctions/userFunction";
const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});
const axios = require("axios");
const CRONjob = require("josk");
const request = require('request');

const db = Meteor.users.rawDatabase();

const cron = new CRONjob({
    db: db,
    autoClear: true,
    resetOnInit: true //don't re-run pending tasks when restarted
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

function printTime(msg) {
    var currentdate = new Date();
    var datetime =
        `${msg} ` +
        currentdate.getDate() +
        "/" +
        (currentdate.getMonth() + 1) +
        "/" +
        currentdate.getFullYear() +
        " @ " +
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();

    console.log(datetime);
}

let sendRequest_BC = (config, data) => {
    const options = {
        uri: `https://${config.locationDomain}/api/node/${config.instanceId}/${
            config.apiName
        }`,
        method: config.requestType,
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${config.instanceId}:${config.password}`
            ).toString("base64")}`
        }
    };

    if (config.requestType === "POST") {
        options.json = data;
    } else if (config.requestType === "GET") {
        options.qs = data;
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                if(body.error) {
                    reject(error);
                } else {
                    console.log(body)
                    resolve(body)
                }
            } else reject(error);
        });
    });
};

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
    distance_in_meter,
    totalFare,
    governmentFee
}) => {
    const username = Meteor.user().profile.name;
    const avgRating = Meteor.user().profile.avgRating
        ? Meteor.user().profile.avgRating
        : 5;
    console.log(end_address, start_address);
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
        time_shown: reachAfter,
        usersLatLng_bookingTime: JSON.stringify(currentLocation),
        time_shown_reachAfterIfTraffic: reachAfterIfTraffic,
        total_time_in_sec: timeTaken_in_secoend,
        timeTakenTraffic_in_secoend: timeTakenTraffic_in_secoend,
        governmentFee: governmentFee
    };

    //create booking general assets

    await sendRequest_BC({
        locationDomain: config.BLOCKCLUSTER.host,
        instanceId: config.BLOCKCLUSTER.instanceId,
        requestType: 'POST',
        apiName: 'assets/issueSoloAsset'
    }, {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        toAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier
    })

    await sendRequest_BC({
        locationDomain: config.BLOCKCLUSTER.host,
        instanceId: config.BLOCKCLUSTER.instanceId,
        requestType: 'POST',
        apiName: 'assets/updateAssetInfo'
    }, {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier,
        public: data
    })

    /*await node.callAPI("assets/issueSoloAsset", {
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
    });*/

    BookingRecord.insert({
        riderPic:
            Meteor.user().profile && Meteor.user().profile.avatar
                ? Meteor.user().profile.avatar
                : null,
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
            coordinates: [boardingPoint.lng, boardingPoint.lat]
        },
        droppingPoint: {
            type: "Point",
            coordinates: [droppingPoint.lng, droppingPoint.lat]
        },
        status: "pending",
        active: true,
        createdAt: Date.now()
    });

    //Push notification
    sendPushNotification(
        "Booking successfull",
        "Your booking request raised successfully,waiting for drivers",
        Meteor.userId()
    );

    return {
        data: data,
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
    //Push notification
    sendPushNotification(
        "Booking cancelled",
        "Your booking cancelled by yourself",
        Meteor.userId()
    );
    return {
        txId: txId
    };
};

const onDriverAccept = async (bookingId, driverId, userId) => {
    const subPlan = await getUserSubscriptions(Meteor.userId());
    if (subPlan.success && subPlan.data && subPlan.data.length) {
        const BookingData = BookingRecord.find({
            bookingId: bookingId,
            status: "pending"
        }).fetch()[0];
        if (!BookingData) {
            throw new Meteor.Error(localization.strings.acceptedBySomeone);
        }
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
            {
                driverId: driverId
            },
            {
                $set: {
                    onRide: true
                },
                $inc: {
                    totalNumberOfRide: 1
                }
            }
        );
        
        const txId = await node.callAPI("assets/updateAssetInfo", {
            assetName: config.ASSET.Bookings,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: bookingId,
            public: {
                rideStatus: "accepted",
                driverId: driverId
            }
        });
        
        //Push notification
        sendPushNotification(
            "Booking accepted by a driver",
            "Driver is on the way",
            userId
        );
        return {
            txId: txId
        };
    } else {
        throw new Meteor.Error("Please subscribe to accept.");
    }
};

const onStartRide = async (bookingId, startingPoint, userId) => {
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            rideStatus: "started",
            startedAt: moment().valueOf(),
            actualStartingPoint: JSON.stringify(startingPoint)
        }
    });
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                startedAt: moment().valueOf(),
                status: "started"
            }
        }
    );
    //Push notification
    sendPushNotification(
        "Ride has been started",
        "you will reach your destination soon.",
        userId
    );

    return {
        txId: txId
    };
};

const getShortestDistance = (p1, p2) => {
    return rp(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${p1.lat +
            "," +
            p1.lng}&destinations=${p2.lat + "," + p2.lng}&key=` + config.GAPIKEY
    );
};

const getCityName = (lat, lng) => {
    return rp(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=` +
            config.GAPIKEY
    );
};

const onStopRide = async (driverId, bookingId, endingPoint, p1, p2, userId) => {
    const bookingData = await BookingRecord.find({
        bookingId: bookingId
    }).fetch()[0];
    const distanceObject = await getShortestDistance(p1, p2);
    const distance = JSON.parse(distanceObject).rows[0].elements[0].distance;
    const rideDuration = moment().diff(
        moment(bookingData.startedAt),
        "seconds"
    ); //in secoends
    console.log("Duration Total:" + rideDuration);
    const priceOp = await calculateFinalBookingPrice(
        bookingData.start_address,
        bookingData.end_address,
        distance.value,
        bookingData.preferredCar,
        rideDuration
    );
    let price = 0;
    if (!priceOp.success) {
        throw new Meteor.Error(priceOp.message);
    }
    price = priceOp.price;
    console.log("Final Price: " + price);
    // const txId = await node.callAPI("assets/updateAssetInfo", {
    //     assetName: config.ASSET.Bookings,
    //     fromAccount: node.getWeb3().eth.accounts[0],
    //     identifier: bookingId,
    //     public: {
    //         rideStatus: "finished",
    //         actualEndingPoint: endingPoint,
    //         rideDuration: rideDuration,
    //         totalFare: price
    //     }
    // });

    await DriverMeta.update(
        {
            driverId: driverId
        },
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

    //Push notification
    sendPushNotification("Ride completed", "Ride has been finished.", userId);

    if (booking) {
        if (booking.paymentMethod != "cash") {
            console.log("Paying using wallet");

            var walletTxn = await payUsingWallet(
                booking.userId,
                price,
                bookingId.toString()
            );

            console.log("done payment with wallet");

            if (
                (walletTxn.success && walletTxn.remainingAmount) ||
                !walletTxn ||
                !walletTxn.success
            ) {
                console.log(
                    "Paying using card",
                    walletTxn && walletTxn.success
                        ? walletTxn.remainingAmount
                        : price
                );
                try {
                    var receipt = await oneClickPayment(
                        walletTxn && walletTxn.success
                            ? walletTxn.remainingAmount
                            : price,
                        booking.paymentMethod,
                        bookingId.toString()
                    );
                } catch (ex) {
                    console.log(ex);
                    // if (ex.error && ex.reason) {
                    //     throw new Meteor.Error(ex.error, ex.reason);
                    // } else {
                    //     console.log(ex);
                    //     throw new Meteor.Error(
                    //         "Internal Error",
                    //         "Payment failed!"
                    //     );
                    // }
                    sendPushNotification(
                        "Payment failed",
                        "we are unable to charge you card.\nPlease pay using cash.",
                        userId
                    );

                    return await payUsingCash(
                        booking,
                        price,
                        bookingId,
                        walletTxn,
                        endingPoint,
                        rideDuration,
                        distance.value,
                        userId,
                        true
                    );
                }
            }

            console.log(receipt);

            onConfirmPayment(
                bookingId.toString(),
                JSON.stringify(receipt),
                price
            )
                .then(res => {
                    console.log(res);
                })
                .catch(err => {
                    console.log(err);
                });

            const meta = DriverMeta.find({
                driverId: booking.driverId
            }).fetch()[0];

            await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Bookings,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: bookingId,
                public: {
                    rideStatus: "finished",
                    actualEndingPoint: JSON.stringify(endingPoint),
                    rideDuration: rideDuration,
                    totalFare: price,
                    totalDistance: distance.value,
                    notifyWASL: meta.governmentRegistration ? "pending" : "no"
                }
            });
            await BookingRecord.update(
                {
                    bookingId: bookingId
                },
                {
                    $set: {
                        totalDistance: distance.text,
                        status: "finished",
                        totalFare: price,
                        active: false
                    }
                }
            );
            //send receipt email
            sendReceiptEmail(
                booking,
                userId,
                distance.value,
                rideDuration,
                price
            );

            return {
                success: true,
                amountDeductedFromWallet: walletTxn.amountDeducted
            };
        } else {
            return await payUsingCash(
                booking,
                price,
                bookingId,
                walletTxn,
                endingPoint,
                rideDuration,
                distance.value,
                userId
            );
        }
    } else {
        return {
            message: localization.strings.unableToGetBooking
        };
    }
};

const payUsingCash = async (
    booking,
    price,
    bookingId,
    walletTxn,
    endingPoint,
    rideDuration,
    distance,
    userId,
    cameByError = false
) => {
    var walletTxn = await payUsingWallet(
        booking.userId,
        price,
        bookingId.toString()
    );

    console.log("done payment with wallet");

    let finalFare = walletTxn
        ? walletTxn.remainingAmount
            ? walletTxn.remainingAmount
            : 0
        : price;

    console.log("remainingAmount:", finalFare);
    const BookingSetQuery = {
        totalFare: finalFare,
        paymentMethod: "cash"
    };

    const meta = DriverMeta.find({
        driverId: booking.driverId
    }).fetch()[0];

    const assetPublic = {
        cashToBeCollected: finalFare,
        amountDeductedFromWallet: walletTxn.amountDeducted,
        rideStatus: "finished",
        paymentMethod: "cash",
        actualEndingPoint: JSON.stringify(endingPoint),
        rideDuration: rideDuration,
        totalFare: price,
        totalDistance: distance,
        notifyWASL: meta.governmentRegistration ? "pending" : "no"
    };
    // if (cameByError) {
    //     BookingSetQuery["paymentMethod"] = "cash";
    //     assetPublic["paymentMethod"] = "cash";
    // }
    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: BookingSetQuery
        }
    );

    await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: assetPublic
    });

    console.log({
        totalFare: price,
        finalFare: finalFare,
        payUsingCash: finalFare > 0 ? true : false
    });

    await BookingRecord.update(
        {
            bookingId: bookingId
        },
        {
            $set: {
                status: "finished",
                totalFare: price,
                active: false
            }
        }
    );

    //send receipt email
    sendReceiptEmail(booking, userId, distance, rideDuration, price);

    //send user a message
    if (cameByError) {
        const userDetails = Meteor.users.find({ _id: userId }).fetch()[0];
        if (userDetails && userDetails.profile && userDetails.profile.phone) {
            console.log("<<<<<Here you go sendig", userDetails);
            sendMessage(
                [userDetails.profile.phone],
                `[HUSTLE]\nHi ${
                    userDetails.profile.name
                },\nwe are unable to charge your card,\n please pay ${finalFare} SAR by cash.\n `
            );
        }
    }
    return {
        totalFare: price,
        finalFare: finalFare,
        payUsingCash: finalFare > 0 ? true : false,
        paymentMethod: "cash"
    };
};

//For online payment after confirmation call this
const onConfirmPayment = async (
    bookingId,
    txId = null,
    paymentAmount,
    userId
) => {
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
                    paymentStatus: "completed",
                    paymentTxId: txId,
                    paymentReceived: paymentAmount
                }
            });
            // sendMessage(bookings[0].driverId.toString(), "Payment Received");
            //Push notification
            sendPushNotification(
                "Payment Successfull",
                "payment of " +
                    paymentAmount +
                    " against booking #" +
                    bookingId,
                userId
            );
            sendPushNotification(
                "Payment received",
                "payment received of " +
                    paymentAmount +
                    " against booking #" +
                    bookingId,
                Meteor.userId()
            );
            return {
                txId: Id
            };
        }
        throw {
            message: localization.strings.unableToGetBooking
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

// //For Cash payments
// const paymentReceived = async bookingId => {
//     try {
//         let bookings = await node.callAPI("assets/search", {
//             $query: {
//                 assetName: config.ASSET.Bookings,
//                 uniqueIdentifier: bookingId.toString()
//             }
//         });

//         if (bookings.length > 0) {
//             if (bookings[0].rideStatus == "finished") {
//                 const txId = await node.callAPI("assets/updateAssetInfo", {
//                     assetName: config.ASSET.Bookings,
//                     fromAccount: node.getWeb3().eth.accounts[0],
//                     identifier: bookingId.toString(),
//                     public: {
//                         paymentStatus: "confirmed"
//                     }
//                 });

//                 console.log("Payment received -> status updated->", txId);
//                 sendMessage(bookings[0].userId.toString(), "Payment Received!");
//                 return {
//                     success: true
//                 };
//             } else {
//                 return {
//                     message: "Ride is not finished yet!"
//                 };
//             }
//         } else {
//             return {
//                 message: localization.strings.unableToGetBooking
//             };
//         }
//     } catch (ex) {
//         console.log(ex);
//         return ex;
//     }
// };

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
                message: localization.strings.bnf
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
                        paymentStatus: "completed"
                    }
                });

                console.log("Payment received -> status updated->", txId);
                // sendMessage(bookings[0].userId.toString(), "Payment Received!");
                sendPushNotification(
                    "Payment Marked",
                    "payment marked against booking #" + bookingId,
                    Meteor.userId()
                );
                return {
                    success: true
                };
            } else {
                return {
                    message: localization.strings.unableToGetBooking
                };
            }
        } else {
            return {
                message: localization.strings.bnf
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
                            coordinates: [lng, lat]
                        },
                        distanceField: "boardingPoint",
                        maxDistance: config.MAX_DISTANCE_FOR_AVAIL * 1000, //in meter we have to pass
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
                        preferredCar: carType, //may be do this match before geonear, so that it will be little fast
                        userId: {
                            $ne: Meteor.userId()
                        }
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

                createdAt: {
                    $lt: period.lte,
                    $gte: period.gte
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
        {
            json: true
        }
    )
        .then(data => {
            return data;
        })
        .catch(error => {
            console.log(error);
        });
};

const getBookingFromDb = bookingId => {
    console.log(bookingId, ">>>>>>>>>>>");
    const bookingData = BookingRecord.find({
        bookingId: bookingId,
        status: "started"
    }).fetch()[0];
    if (bookingData) {
        const driverMeta = DriverMeta.find({
            driverId: bookingData.driverId
        }).fetch()[0];
        return {
            ...bookingData,
            driverLoc: driverMeta.currentLocation
        };
    } else {
        throw new Meteor.Error("No data found");
    }
};

const getDriverLocation = driverId => {
    const driverMeta = DriverMeta.find({
        driverId: driverId
    }).fetch()[0];
    if (driverMeta && driverMeta.currentLocation) {
        return driverMeta.currentLocation;
    } else {
        return false;
    }
};

/*
    distance in meters
*/
const calculateApproxBookingPrice = async (
    fromAddress,
    toAddress,
    distance,
    carType
) => {
    try {
        console.log(fromAddress, toAddress, distance, carType);
        if (!fromAddress || !toAddress || !distance || !carType) {
            return {
                success: false,
                message: "Parameter missing"
            };
        }
        let pricingConfig = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.dynamicPricing,
                status: "open"
            }
        });
        console.log("pricingConfig", !!pricingConfig);
        let usePerMeterRate = true;
        if (pricingConfig) {
            if (pricingConfig.length > 0) {
                usePerMeterRate = false;
                let config = pricingConfig[0];
                let basePrice = 0;
                let minimumFare = 0;
                let perKM = 0;
                let surge = 0;
                if (config.basePrice) {
                    if (config.basePrice[carType]) {
                        basePrice = config.basePrice[carType].basePrice
                            ? config.basePrice[carType].basePrice
                            : 0;
                        minimumFare = config.basePrice[carType].minimumFare
                            ? config.basePrice[carType].minimumFare
                            : 0;
                        minimumFare = parseFloat(minimumFare.toString());
                        perKM = config.basePrice[carType].perKM
                            ? config.basePrice[carType].perKM
                            : 0;
                    }
                }
                if (config.dateTime) {
                    if (config.dateTime.length > 0) {
                        let month = new Date().getMonth();
                        let day = new Date().getDay();
                        let hour = new Date().getHours();
                        let min = new Date().getMinutes();
                        let monthRuleMatched = false,
                            dayRuleMatched = false,
                            hourRuleMatched = false;
                        for (var i = 0; i < config.dateTime.length; i++) {
                            if (
                                config.dateTime[i].type == "month" &&
                                !monthRuleMatched
                            ) {
                                if (config.dateTime[i].month == month) {
                                    monthRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            } else if (
                                config.dateTime[i].type == "hour" &&
                                !hourRuleMatched
                            ) {
                                if (
                                    (config.dateTime[i].fromHour < hour &&
                                        config.dateTime[i].toHour > hour) ||
                                    config.dateTime[i].fromHour == hour ||
                                    (config.dateTime[i].toHour == hour &&
                                        min == 0)
                                ) {
                                    hourRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            } else if (
                                config.dateTime[i].type == "day" &&
                                !dayRuleMatched
                            ) {
                                if (config.dateTime[i].day == day) {
                                    dayRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            }
                            if (
                                monthRuleMatched &&
                                dayRuleMatched &&
                                hourRuleMatched
                            ) {
                                break;
                            }
                        }
                    }
                }
                fromAddress = fromAddress.toString().toLowerCase();
                toAddress = toAddress.toString().toLowerCase();
                if (config.locations) {
                    if (config.locations.length > 0) {
                        let fromAddressFound = false,
                            toAddressFound = false;
                        for (var i = 0; i < config.locations.length; i++) {
                            let location = config.locations[i].location
                                .toString()
                                .toLowerCase();
                            if (
                                fromAddress.indexOf(location) != -1 &&
                                !fromAddressFound
                            ) {
                                fromAddressFound = true;
                                surge += parseFloat(config.locations[i].change);
                            }
                            if (
                                toAddress.indexOf(location) != -1 &&
                                !toAddressFound
                            ) {
                                toAddressFound = true;
                                surge += parseFloat(config.locations[i].change);
                            }
                            if (fromAddressFound && toAddressFound) {
                                break;
                            }
                        }
                    }
                }
                console.log("basePrice", basePrice, "surge", surge);
                let retVal = basePrice;
                console.log(
                    "1. retVal",
                    retVal,
                    "distance",
                    distance,
                    "perKM",
                    perKM
                );
                retVal =
                    parseFloat(retVal) +
                    parseFloat(
                        (distance / 1000) *
                            (perKM != 0 ? perKM : config.farePerMeter * 1000)
                    );
                console.log("2. retVal = distance in KM * perKM", retVal);
                retVal = retVal * (1 + surge / 100);
                console.log("3. retVal += surge", retVal);
                retVal = retVal < minimumFare ? minimumFare : retVal;
                console.log("4. retVal = >minimum?", retVal);
                retVal += parseFloat(
                    config.governmentFee ? config.governmentFee.toString() : 0
                );
                retVal = Math.round(retVal);
                console.log("5. retVal = Round", retVal);
                return {
                    success: true,
                    price: retVal,
                    governmentFee: config.governmentFee
                };
            } else {
                console.log("Dynamic config not found!");
            }
        } else {
            console.log("Unable to get dynamic config from blockcluster");
        }
        if (usePerMeterRate) {
            let perMeterPrice = distance * config.farePerMeter;
            return {
                success: true,
                price: Math.round(isNaN(perMeterPrice) ? 0 : perMeterPrice)
            };
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

/*
    distance in meters
    duration in seconds
*/
const calculateFinalBookingPrice = async (
    fromAddress,
    toAddress,
    distance,
    carType,
    duration
) => {
    try {
        console.log("Final Pricing", {
            fromAddress: fromAddress,
            toAddress: toAddress,
            distance: distance,
            carType: carType,
            duration: duration
        });
        if (
            !fromAddress ||
            !toAddress ||
            distance == undefined ||
            !carType ||
            !duration
        ) {
            console.log("Parameter missing");
            return {
                success: false,
                message: "Parameter missing"
            };
        }
        duration = parseFloat(duration) / 60;
        console.log("Duration", duration);
        let pricingConfig = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.dynamicPricing,
                status: "open"
            }
        });
        console.log("pricingConfig", !!pricingConfig);
        let usePerMeterRate = true;
        if (pricingConfig) {
            if (pricingConfig.length > 0) {
                usePerMeterRate = false;
                let config = pricingConfig[0];
                let basePrice = 0;
                let minimumFare = 0;
                let perKM = 0;
                let perMin = 0;
                let surge = 0;
                if (config.basePrice) {
                    if (config.basePrice[carType]) {
                        basePrice = config.basePrice[carType].basePrice
                            ? config.basePrice[carType].basePrice
                            : 0;
                        minimumFare = config.basePrice[carType].minimumFare
                            ? config.basePrice[carType].minimumFare
                            : 0;
                        minimumFare = parseFloat(minimumFare.toString());
                        perKM = config.basePrice[carType].perKM
                            ? config.basePrice[carType].perKM
                            : 0;
                        perMin = config.basePrice[carType].perMin
                            ? config.basePrice[carType].perMin
                            : 0;
                    }
                }
                if (config.dateTime) {
                    if (config.dateTime.length > 0) {
                        let month = new Date().getMonth();
                        let day = new Date().getDay();
                        let hour = new Date().getHours();
                        let min = new Date().getMinutes();
                        let monthRuleMatched = false,
                            dayRuleMatched = false,
                            hourRuleMatched = false;
                        for (var i = 0; i < config.dateTime.length; i++) {
                            if (
                                config.dateTime[i].type == "month" &&
                                !monthRuleMatched
                            ) {
                                if (config.dateTime[i].month == month) {
                                    monthRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            } else if (
                                config.dateTime[i].type == "hour" &&
                                !hourRuleMatched
                            ) {
                                if (
                                    (config.dateTime[i].fromHour < hour &&
                                        config.dateTime[i].toHour > hour) ||
                                    config.dateTime[i].fromHour == hour ||
                                    (config.dateTime[i].toHour == hour &&
                                        min == 0)
                                ) {
                                    hourRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            } else if (
                                config.dateTime[i].type == "day" &&
                                !dayRuleMatched
                            ) {
                                if (config.dateTime[i].day == day) {
                                    dayRuleMatched = true;
                                    surge += parseFloat(
                                        config.dateTime[i].change.toString()
                                    );
                                }
                            }
                            if (
                                monthRuleMatched &&
                                dayRuleMatched &&
                                hourRuleMatched
                            ) {
                                break;
                            }
                        }
                    }
                }
                fromAddress = fromAddress.toString().toLowerCase();
                toAddress = toAddress.toString().toLowerCase();
                if (config.locations) {
                    if (config.locations.length > 0) {
                        let fromAddressFound = false,
                            toAddressFound = false;
                        for (var i = 0; i < config.locations.length; i++) {
                            let location = config.locations[i].location
                                .toString()
                                .toLowerCase();
                            if (
                                fromAddress.indexOf(location) != -1 &&
                                !fromAddressFound
                            ) {
                                fromAddressFound = true;
                                surge += parseFloat(config.locations[i].change);
                            }
                            if (
                                toAddress.indexOf(location) != -1 &&
                                !toAddressFound
                            ) {
                                toAddressFound = true;
                                surge += parseFloat(config.locations[i].change);
                            }
                            if (fromAddressFound && toAddressFound) {
                                break;
                            }
                        }
                    }
                }
                console.log("basePrice", basePrice, "surge", surge);
                let retValKM = basePrice;
                console.log(
                    "1. retValKM",
                    retValKM,
                    "distance",
                    distance,
                    "perKM",
                    perKM
                );
                retValKM =
                    parseFloat(retValKM) +
                    parseFloat(
                        (distance / 1000) *
                            (perKM != 0 ? perKM : config.farePerMeter * 1000)
                    );
                console.log("2. retValKM = distance * perKM", retValKM);
                retValKM = retValKM * (1 + surge / 100);
                console.log("3. retValKM =+ surge", retValKM);
                retValKM = retValKM < minimumFare ? minimumFare : retValKM;

                retValKM += parseFloat(
                    config.governmentFee ? config.governmentFee.toString() : 0
                );

                console.log("4. retValKM = >minimumFare", retValKM);
                let retValMin = basePrice;
                retValMin =
                    parseFloat(retValMin) + parseFloat(duration * perMin);
                retValMin = retValMin * (1 + surge / 100);
                retValMin = retValMin < minimumFare ? minimumFare : retValMin;

                retValMin += parseFloat(
                    config.governmentFee ? config.governmentFee.toString() : 0
                );

                console.log("5. retVal Min = >minimumFare", retValMin);
                let retVal = retValKM > retValMin ? retValKM : retValMin;
                retVal = Math.round(retVal);
                console.log("Final retVal", retVal);
                return {
                    success: true,
                    price: retVal,
                    governmentFee: config.governmentFee
                };
            } else {
                console.log("Dynamic config not found!");
            }
        } else {
            console.log("Unable to get dynamic config from blockcluster");
        }
        if (usePerMeterRate) {
            let perMeterPrice = distance * config.farePerMeter;
            return {
                success: true,
                price: Math.round(isNaN(perMeterPrice) ? 0 : perMeterPrice)
            };
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const getPricingConfig = async () => {
    try {
        let pricingConfig = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.dynamicPricing,
                status: "open"
            }
        });

        return {
            success: true,
            config: pricingConfig.length > 0 ? pricingConfig[0] : ""
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const registerWaslRide = async ready => {
    try {
        let bookings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                notifyWASL: "pending"
            }
        });

        for (let count = 0; count < bookings.length; count++) {
            let booking = bookings[count];
            const meta = DriverMeta.find({
                driverId: booking.driverId
            }).fetch()[0];

            let rating = (await node.callAPI("assets/search", {
                $query: {
                    assetName: config.ASSET.Reviews,
                    driverId: booking.driverId,
                    riderId: booking.userId,
                    ratedBy: "rider"
                }
            }))[0];

            const instance = axios.create({
                baseURL: config.WASL.url,
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                    "client-id": config.WASL.clientId,
                    "app-id": config.WASL.appId,
                    "app-key": config.WASL.appKey
                }
            });

            let data = await getCityName(
                booking.boardingPoint.lat,
                booking.boardingPoint.lng
            );
            data = JSON.parse(data);

            let city_name = "";

            for (
                var i = 0;
                i < data.results[4].address_components.length;
                i++
            ) {
                for (
                    var j = 0;
                    j < data.results[4].address_components[i].types.length;
                    j++
                ) {
                    if (
                        data.results[4].address_components[i].types[j] ==
                        "locality"
                    ) {
                        city_name =
                            data.results[4].address_components[i].long_name;
                        break;
                    }
                }
            }

            let cities = {
                jeddah: "جدة"
            };

            let random = Math.floor(Math.random() * 1000000000);

            let convertTimestampToLocalISO = timestamp => {
                return new Date(
                    new Date(timestamp).toLocaleString("en-US", {
                        timeZone: "Asia/Aden"
                    })
                ).toISOString();
            };

            await instance.post("/trips", {
                sequenceNumber: meta.sequenceNumber,
                driverId: meta.identityNumber,
                tripId: random,
                distanceInMeters: booking.totalDistance,
                durationInSeconds: booking.rideDuration,
                customerRating: meta.avgRating ? meta.avgRating : 0.0,
                customerWaitingTimeInSeconds: parseInt(
                    (booking.startedAt - booking.createdAt) / 1000
                ),
                originCityNameInArabic: cities[city_name.toLowerCase()],
                destinationCityNameInArabic: cities[city_name.toLowerCase()],
                originLatitude: booking.boardingPoint.lat,
                originLongitude: booking.boardingPoint.lng,
                destinationLatitude: booking.droppingPoint.lat,
                destinationLongitude: booking.droppingPoint.lng,
                pickupTimestamp: convertTimestampToLocalISO(booking.startedAt),
                dropoffTimestamp: convertTimestampToLocalISO(
                    booking.startedAt + booking.rideDuration * 1000
                ),
                startedWhen: convertTimestampToLocalISO(booking.createdAt)
            });

            await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Bookings,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: booking.uniqueIdentifier,
                public: {
                    tripId: random,
                    notifyWASL: "success"
                }
            });
        }

        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(registerWaslRide),
            1000,
            "register wasl ride complete"
        );
    } catch (e) {
        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(registerWaslRide),
            1000,
            "register wasl ride complete"
        );
    }
};

const updateDriverLocationToWASL = async ready => {
    try {
        const drivers = DriverMeta.find({
            lastUpdated: {
                $gt: new Date(new Date().getTime() - 1000 * 10).getTime() //updated last 10 seconds
            }
        }).fetch();

        let locations = [];

        for (let count = 0; count < drivers.length; count++) {
            let driver = drivers[count];

            if (driver.governmentRegistration) {
                locations.push({
                    driverIdentityNumber: driver.identityNumber,
                    vehicleSequenceNumber: driver.sequenceNumber,
                    latitude: driver.currentLocation[1],
                    longitude: driver.currentLocation[0],
                    hasCustomer: driver.onRide,
                    updatedWhen: new Date(
                        new Date(driver.lastUpdated).toLocaleString("en-US", {
                            timeZone: "Asia/Aden"
                        })
                    ).toISOString()
                });
            }
        }

        const instance = axios.create({
            baseURL: config.WASL.url,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                "client-id": config.WASL.clientId,
                "app-id": config.WASL.appId,
                "app-key": config.WASL.appKey
            }
        });

        let response =  await instance.post("/locations", {
            locations
        });

        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(updateDriverLocationToWASL),
            2000,
            "update driver location to wasl"
        );
    } catch (e) {
        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(updateDriverLocationToWASL),
            2000,
            "update driver location to wasl"
        );
    }
};

const cancelOldBookings = async ready => {
    try {

        let bookings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Bookings,
                rideStatus: "pending",
                createdAt: {
                    $lt: new Date( Date.now() - 1000 * 60 * 10 ).getTime()
                }
            }
        });
        console.log(new Date( Date.now() - 1000 * 60 * 10 ).getTime())
        console.log("Bookings to be cancelled", bookings)


        for (let count = 0; count < bookings.length; count++) {

            console.log(bookings[count])

            await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Bookings,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: bookings[count].uniqueIdentifier,
                public: {
                    rideStatus: "cancelled",
                    cancel_reason: "TOO_OLD"
                }
            });
            await BookingRecord.update(
                {
                    bookingId: bookings[count].uniqueIdentifier
                },
                {
                    $set: {
                        active: false,
                        status: "cancelled"
                    }
                }
            );
        }

        
        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(cancelOldBookings),
            10000,
            "cancel old bookings"
        );
    } catch (e) {
        console.log(e)
        ready();
        cron.setTimeout(
            Meteor.bindEnvironment(cancelOldBookings),
            10000,
            "cancel old bookings"
        );
    }
};

cron.setTimeout(
    Meteor.bindEnvironment(registerWaslRide),
    1000,
    "register wasl ride complete"
);
cron.setTimeout(
    Meteor.bindEnvironment(updateDriverLocationToWASL),
    1000,
    "update driver location to wasl"
);
cron.setTimeout(
    Meteor.bindEnvironment(cancelOldBookings),
    1000,
    "cancel old bookings"
);

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
    fetchLocationwithKeyword,
    getBookingFromDb,
    getDriverLocation,
    calculateApproxBookingPrice,
    calculateFinalBookingPrice,
    getPricingConfig
};
