import { DriverMeta } from "../../collections/driver-meta";
import { getDriverBookingData } from "../bookings/booking";
import { sendEmail } from "../emails/email-sender";
import moment from "moment";
import { getEJSTemplate } from "../../modules/helpers/server";
const axios = require('axios');
import config from "../../modules/config/server";
import { helpers } from "../../modules/helpers/server"

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

const updateDriverLocation = ({ driverId, lat, lng, heading }) => {
    return DriverMeta.update(
        {
            driverId: driverId
        },
        {
            $set: {
                lastUpdated: moment()
                    .utc()
                    .valueOf(),
                type: "Point",
                currentLocation: [lng, lat],
                heading: heading
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
                            coordinates: [lng, lat]
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
                        lastUpdated: {
                            $gte: moment()
                                .subtract(1, "minutes")
                                .utc()
                                .valueOf()
                        },
                        onRide: false
                    }
                },
                {
                    $project: {
                        currentLocation: 1,
                        heading: 1
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

/**  Driver monthly report functions are below  */
/**
 *  Get summery of a driver of a month
 * @param {*} driverId
 * @returns {*} earningsInCash,
 *              earningsOnline,
 *              totalEarnings,
 *              totalTimeOnRide,
 *              totalDistanceOnRide,
 *              totalRides
 */
const getDriverSummery = async driverId => {
    const gte = moment().subtract(1, "month");
    const lt = new Date();
    const bookings = await getDriverBookingData(
        { gte: gte, lte: lt },
        driverId
    );
    const totalEarnings = 0;
    const earningsInCash = 0;
    const earningsOnline = 0;
    const totalDistanceOnRide = 0; //in Meter
    const totalTimeOnRide = 0; //in secoend
    const totalRides = bookings.length ? bookings.length : 0;
    if (!totalRides) {
        totalEarnings = earningsInCash + earningsOnline;
        return {
            earningsInCash,
            earningsOnline,
            totalEarnings,
            totalTimeOnRide,
            totalDistanceOnRide,
            totalRides
        };
    } else {
        bookings.forEach(v => {
            //may be check for confirmed txns too here key: paymentStatus
            if (v.paymentMethod == "cash") {
                earningsInCash = earningsInCash + v.totalFare;
            } else {
                earningsOnline = earningsOnline + v.totalFare;
            }
            totalTimeOnRide = v.total_time_in_sec + totalTimeOnRide;
            totalDistanceOnRide = v.totalDistance + totalDistanceOnRide;
        });
        totalEarnings = earningsInCash + earningsOnline;
        return {
            earningsInCash,
            earningsOnline,
            totalEarnings,
            totalTimeOnRide,
            totalDistanceOnRide,
            totalRides
        };
    }
};

const iterateOverDrivers = () => {
    const allDriverDocCursor = DriverMeta.find(
        {},
        { fields: { driverId: 1, driverEmail: 1 } }
    );
    allDriverDocCursor.forEach(async driverDoc => {
        const {
            earningsInCash,
            earningsOnline,
            totalEarnings,
            totalTimeOnRide,
            totalDistanceOnRide,
            totalRides
        } = await getDriverSummery(driverDoc.driverId);
        const { profile } = Meteor.users
            .find({ _id: driverDoc.driverId })
            .fetch()[0];
        //send mail function to be called here with above data and send mail to
        //driverDoc.driverEmail
        let emailSub;
        const LangPref = profile.langPref || "en";
        if (LangPref == "ar") {
            emailSub = "[HUSTLE] Your monthly report is here";
        } else {
            emailSub = "[HUSTLE] Your monthly report is here";
        }
        const ejsTemplate = await getEJSTemplate({
            fileName: "email-driver-monthly-report-" + LangPref + ".ejs"
        });
        const finalHTML = ejsTemplate({
            username: profile.name,
            earningsInCash: earningsInCash,
            earningsOnline: earningsOnline,
            totalEarnings: totalEarnings,
            totalTimeOnRide: totalTimeOnRide / 60, //minute
            totalDistanceOnRide: totalDistanceOnRide / 1000, //KM
            totalRides: totalRides
        });

        const emailOptions = {
            from: {
                email: "no-reply@hustle.io",
                name: "Hustle"
            },
            to: driverDoc.driverEmail,
            subject: emailSub,
            html: finalHTML
        };
        await sendEmail(emailOptions);
    });
    return true;
};

export {
    markAvailable,
    markUnavailable,
    getDriversWithin,
    getDriver,
    updateDriverLocation,
    updateReview,
    iterateOverDrivers
};

let updateDriverLocationToWASL = async () => {
    const drivers = DriverMeta.find({
        lastUpdated: { 
            $gt: (new Date((new Date()).getTime() - 1000 * 10)).getTime() //updated last 10 seconds
        }
    }).fetch()


    let locations = [];

    try {
        for(let count = 0; count < drivers.length; count++) {

            let driver = drivers[count]

            if(driver.governmentRegistration) {
                locations.push({
                    driverIdentityNumber: driver.identityNumber,
                    vehicleSequenceNumber: driver.sequenceNumber,
                    latitude: driver.currentLocation[1],
                    longitude: driver.currentLocation[0],
                    hasCustomer: driver.onRide,
                    updatedWhen: helpers.timestampToSaudiISO(driver.lastUpdated)
                })
            }
        }

        console.log(locations)
    
        const instance = axios.create({
            baseURL: config.WASL.url,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'client-id': config.WASL.clientId,
                'app-id': config.WASL.appId,
                'app-key': config.WASL.appKey
            }
        });

    
        await instance.post('/locations', {
            locations
        })
    } catch(e) {
        console.log(e)
    }

    Meteor.setTimeout(updateDriverLocationToWASL, 30000)
}

Meteor.setTimeout(updateDriverLocationToWASL, 1000)
