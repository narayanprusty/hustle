import { DriverMeta } from "../../collections/driver-meta";
import { getDriverBookingData } from "../bookings/booking";
import { sendEmail } from "../emails/email-sender";
import moment from "moment";

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
                lastUpdated: Date.now(),
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
        let finalHTML;
        let emailSub;
        const LangPref = Meteor.user().profile.langPref || "en";
        if (LangPref == "ar") {
            //add arabic transtaltion here
            emailSub = `[HUSTLE] Monthly report`;
            finalHTML = `
        <div>
        Cash Earnins: ${earningsInCash}<br />
        Earnings Non-Cash: ${earningsOnline}<br/>
       Total: ${totalEarnings}<br/>
       total time spent on ride:  ${totalTimeOnRide / 60} minutes<br/>
        total disatbnce covered in ride: ${totalDistanceOnRide / 1000} KM,
        total no of ride: ${totalRides}
        </div>
        `;
        } else {
            emailSub = `[HUSTLE] Monthly report`;
            finalHTML = `
        <div>
        Cash Earnins: ${earningsInCash}<br />
        Earnings Non-Cash: ${earningsOnline}<br/>
       Total: ${totalEarnings}<br/>
       total time spent on ride:  ${totalTimeOnRide / 60} minutes<br/>
        total disatbnce covered in ride: ${totalDistanceOnRide / 1000} KM,
        total no of ride: ${totalRides}
        </div>
        `;
        }
        const emailOptions = {
            from: {
                email: "saikat.chakrabortty@blockcluster.io",
                name: "Saikat from Blockcluster"
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
