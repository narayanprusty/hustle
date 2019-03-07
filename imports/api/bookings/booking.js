import Blockcluster from "blockcluster";
import rp from "request-promise";

import { BookingRecord } from "../../collections/booking-record";
import { DriverMeta } from "../../collections/driver-meta";
import config from "../../modules/config/server";
import { sendMessage } from "../../notifications/index";
import { oneClickPayment } from "../payments/payments";
import { getUserSubscriptions } from "../subscriptions/subscriptions";
import localization from "../../ui/localization";
import moment from "moment";
import { parse } from "querystring";
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
    distance_in_meter,
    totalFare
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
    const subPlan = await getUserSubscriptions(Meteor.userId());
    if (subPlan.success && subPlan.data && subPlan.data.length) {
        const BookingData = BookingRecord.find({
            bookingId: bookingId,
            status: "pending"
        }).fetch()[0];
        if (!BookingData) {
            throw new Meteor.Error(localization.strings.acceptedBySomeone);
        }
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

        return {
            txId: txId
        };
    } else {
        throw new Meteor.Error("Please subscribe to accept.");
    }
};

const onStartRide = async (bookingId, startingPoint) => {
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            rideStatus: "started",
            startedAt: moment().valueOf(),
            actualStartingPoint: startingPoint
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
const onStopRide = async (driverId, bookingId, endingPoint, p1, p2) => {
    const bookingData = await BookingRecord.find({
        bookingId: bookingId
    }).fetch()[0];
    const distanceObject = await getShortestDistance(p1, p2);
    const distance = JSON.parse(distanceObject).rows[0].elements[0].distance
        .value;
    const rideDuration = moment().diff(moment(bookingData.startedAt)) / 1000; //in secoends
    console.log("Duration Total:" + rideDuration);
    const { price } = await calculateFinalBookingPrice(
        bookingData.start_address,
        bookingData.end_address,
        distance,
        bookingData.preferredCar,
        rideDuration
    );
    console.log("Final Price: " + price);
    const txId = await node.callAPI("assets/updateAssetInfo", {
        assetName: config.ASSET.Bookings,
        fromAccount: node.getWeb3().eth.accounts[0],
        identifier: bookingId,
        public: {
            rideStatus: "finished",
            actualEndingPoint: endingPoint,
            rideDuration: rideDuration,
            totalFare: price
        }
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

    if (booking) {
        if (booking.paymentMethod != "cash") {
            console.log("Paying");

            var receipt = await oneClickPayment(
                booking.totalFare,
                booking.paymentMethod
            );

            console.log(receipt);
        } else {
            return { totalFare: price };
        }
    } else {
        return {
            message: localization.strings.bnp
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
            message: localization.strings.bnf
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
                retVal = Math.round(retVal);
                console.log("5. retVal = Round", retVal);
                return {
                    success: true,
                    price: retVal
                };
            } else {
                console.log("Dynamic config not found!");
            }
        } else {
            console.log("Unable to get dynamic config from blockcluster");
        }
        if (usePerMeterRate) {
            return {
                success: true,
                price: distance * config.farePerMeter
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
        console.log(
            "Final Pricing",
            fromAddress,
            toAddress,
            distance,
            carType,
            duration
        );
        if (!fromAddress || !toAddress || !distance || !carType || !duration) {
            return {
                success: false,
                message: "Parameter missing"
            };
        }
        duration = parseFloat(duration) / 60;
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
                console.log("4. retValKM = >minimumFare", retValKM);
                let retValMin = basePrice;
                retValMin =
                    parseFloat(retValMin) + parseFloat(duration * perMin);
                retValMin = retValMin * (1 + surge / 100);
                retValMin = retValMin < minimumFare ? minimumFare : retValMin;
                console.log("5. retVal Min = >minimumFare", retValMin);
                let retVal = retValKM > retValMin ? retValKM : retValMin;
                console.log("Final retVal", retVal);
                return {
                    success: true,
                    price: retVal
                };
            } else {
                console.log("Dynamic config not found!");
            }
        } else {
            console.log("Unable to get dynamic config from blockcluster");
        }
        if (usePerMeterRate) {
            return {
                success: true,
                price: distance * config.farePerMeter
            };
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
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
    fetchLocationwithKeyword,
    getBookingFromDb,
    getDriverLocation,
    calculateApproxBookingPrice,
    calculateFinalBookingPrice
};
