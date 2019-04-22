import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
import Payment from "payment";
import { Meteor } from "meteor/meteor";
var https = require("https");
var querystring = require("querystring");
import { sendPushNotification } from "../../modules/helpers/server";
import localizationManager from "../../ui/localization";
import { rejects } from "assert";

function request(data, callback) { }

request(function (responseData) {
    console.log(responseData);
});

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

function resultRequest(resourcePath, callback) {
    return new Promise((resolve, reject) => {
        try {
    var path = resourcePath;
    path += "?authentication.userId=" + config.HYPERPAY.UserId;
    path += "&authentication.password=" + config.HYPERPAY.Password;
    path += "&authentication.entityId=" + config.HYPERPAY.EntityId;
    var options = {
        port: 443,
        host: config.HYPERPAY.host,
        path: path,
        method: "GET"
    };
            var postRequest = https.request(options, function (res) {
        res.setEncoding("utf8");
                res.on("data", function (chunk) {
            jsonRes = JSON.parse(chunk);
                    resolve(jsonRes);
        });
    });
    postRequest.end();
        } catch (ex){
            reject(ex);
}
    });
}

const revarsalReq = paymentId => {
    var path = "/v1/payments/" + paymentId;
    var data = querystring.stringify({
        "authentication.userId":
            config.HYPERPAY.UserId || "8a8294174d0595bb014d05d829e701d1",
        "authentication.password": config.HYPERPAY.Password || "9TnJPc2n9h",
        "authentication.entityId":
            config.HYPERPAY.EntityId || "8a8294174d0595bb014d05d82e5b01d2",
        paymentType: "RV"
    });
    var options = {
        port: 443,
        host: config.HYPERPAY.host,
        path: path,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": data.length
        }
    };

    return new Promise((resolve, reject) => {
        try {
            var postRequest = https.request(options, function (res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    jsonRes = JSON.parse(chunk);
                    resolve(jsonRes);
                });
            });
            postRequest.write(data);
            postRequest.end();
        } catch (ex) {
            reject(ex);
        }
    });
};

const addCard = async (op, userId, resourcePath) => {
    let data = {};
    console.log("lets try to revarse the deducted thing ");
    try {
        let responseData = await resultRequest(resourcePath);
            console.log(responseData);
            if (!responseData.card) {
                return Promise.reject("not able to process");
            } else {
                const revarsalDetail = await revarsalReq(responseData.id);
                if (
                    revarsalDetail &&
                    revarsalDetail.resultDetails &&
                    revarsalDetail.resultDetails.ExtendedDescription !=
                        "Approved"
                ) {
                    //log this to somewhere
                    console.log(
                        responseData.id,
                        responseData.registrationId,
                        revarsalDetail
                    );
                }
            }
            // var expiryMonth =
            //     data.expiry && data.expiry.indexOf("/") != -1
            //         ? data.expiry.split("/")[0]
            //         : "";
            // if (expiryMonth <= 0 || expiryMonth >= 13) {
            //     return {
            //         success: false,
            //         message: localizationManager.strings.invalidExpiry
            //     };
            // } else if (data.number <= 0 || data.number.length <= 18) {
            //     return {
            //         success: false,
            //         message: localizationManager.strings.invalidCardNumber
            //     };
            // } else if (!isNaN(parseInt(data.name.toString()))) {
            //     return {
            //         success: false,
            //         message: localizationManager.strings.invalidName
            //     };
            // } else if (data.cvc <= 0) {
            //     return {
            //         success: false,
            //         message: localizationManager.strings.invalidCVV
            //     };
            // }
            // var currentYear = new Date().getFullYear().toString();

            // var expiryYear =
            //     data.expiry && data.expiry.indexOf("/") != -1
            //         ? data.expiry.split("/")[1] > currentYear.slice(2, 4)
            //             ? currentYear.slice(0, 2) + data.expiry.split("/")[1]
            //             : (parseInt(currentYear.slice(0, 2)) + 1).toString() +
            //               data.expiry.split("/")[1]
            //         : "";

            // expiryYear = expiryYear.length == 4 ? expiryYear : "";

            data["expiryYear"] = responseData.card.expiryYear;
            data["expiryMonth"] = responseData.card.expiryMonth;
            data["number"] =
                responseData.card.bin +
                "X".repeat(12 - responseData.card.bin.length) +
                responseData.card.last4Digits;
            data["name"] = responseData.card.holder;
            data["paymentBrand"] = responseData.paymentBrand;
            var cards = await node.callAPI("assets/search", {
                $query: {
                    assetName: config.ASSET.Card,
                    cardNumber: parseInt(data.number.toString()),
                    status: "open"
                }
            });

            // console.log("found:", cards.length > 0);

            if (cards.length > 0) {
                return {
                    success: false,
                    message: localizationManager.strings.cardExists
                };
            }

            // var op = await saveCardToHyperPay(data);

            console.log("output", op);

            if (op.message && op.success == false) {
                sendPushNotification(
                    localizationManager.strings.failedAddingCard,
                    op.message,
                    userId()
                );
                return op;
            }

            if (op.id && op.result.description.indexOf("successfully") != -1) {
                data["hyperPayId"] = responseData.registrationId;
                op = await saveCardToBlockcluster(data, userId);
                //Push notification
                sendPushNotification(
                    localizationManager.strings.cardAddedShort,
                    localizationManager.strings.cardAddedPushNotification,
                    userId
                );

                if (op.success)
                    return {
                        success: true,
                        data: data
                    };
            } else {
                //Push notification
                sendPushNotification(
                    localizationManager.strings.failedAddingCard,
                    "",
                    userId
                );
                return {
                    success: false,
                    message: op.result.description
                };
            }
    } catch (ex) {
        console.log(ex);
        return Promise.reject("Unknown error");
    }
}

const saveCardToBlockcluster = async (data, userId) => {
    try {
        let identifier =
            "C" +
            Date.now() +
            "" +
            Math.random()
                .toString()
                .split(".")[1];
        console.log("identifier", identifier, {
            nameOnCard: data.name,
            expiry: data.expiry,
            cvv: data.cvc,
            cardNumber: data.number.toString(),
            hyperPayId: data.hyperPayId,
            userId: userId
        });
        await node.callAPI("assets/issueSoloAsset", {
            assetName: config.ASSET.Card,
            fromAccount: node.getWeb3().eth.accounts[0],
            toAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier
        });
        const txId = await node.callAPI("assets/updateAssetInfo", {
            assetName: config.ASSET.Card,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier,
            public: {
                nameOnCard: data.name,
                expiry: data.expiry,
                cvv: data.cvc,
                cardNumber: "" + data.number.toString(),
                hyperPayId: data.hyperPayId,
                userId: userId.toString()
            }
        });
        console.log(txId);
        return {
            success: true,
            data: identifier,
            txn: txId,
            identifier: identifier
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const saveCardToHyperPay = data => {
    var path = "/v1/registrations";
    let cardBrand = Payment.fns.cardType(data.number);
    if (cardBrand == "visa" || cardBrand == "master" || cardBrand == "mada") {
        var cardData = querystring.stringify({
            "authentication.userId": config.HYPERPAY.UserId,
            "authentication.password": config.HYPERPAY.Password,
            "authentication.entityId": config.HYPERPAY.EntityId,
            paymentBrand: cardBrand.toUpperCase(),
            "card.number": data.number || "",
            "card.holder": data.name || "",
            "card.expiryMonth": data.expiryMonth || "",
            "card.expiryYear": data.expiryYear || "",
            "card.cvv": data.cvc || "",
            recurringType: "INITIAL"
        });
        var options = {
            port: 443,
            host: config.HYPERPAY.host,
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": cardData.length
            }
        };
        return new Promise((resolve, reject) => {
            try {
                var postRequest = https.request(options, res => {
                    res.setEncoding("utf8");
                    res.on("data", chunk => {
                        jsonRes = JSON.parse(chunk);
                        resolve(jsonRes);
                    });
                });
                postRequest.write(cardData);
                postRequest.end();
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    } else {
        return {
            success: false,
            message: localizationManager.strings.cardNotSupported
        };
    }
};

const getCards = async () => {
    try {
        let cards = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Card,
                userId: Meteor.userId().toString(),
                status: "open"
            }
        });
        return {
            success: true,
            cards: cards.length > 0 ? cards : []
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const getCardsForPayment = async () => {
    try {
        let cards = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Card,
                userId: Meteor.userId().toString(),
                status: "open"
            }
        });
        let cardslist = [];
        for (let i = 0; i < cards.length; i++) {
            let cardNumber =
                cards[i].cardNumber.toString().slice(0, 4) +
                " XXXX XXXX " +
                cards[i].cardNumber
                    .toString()
                    .slice(cards[i].cardNumber.toString().length - 4);
            console.log(cardNumber);
            cardslist.push({
                nameOnCard: cards[i].nameOnCard,
                expiry: cards[i].expiry,
                cvv: cards[i].cvv,
                cardNumber: cardNumber,
                hyperPayId: cards[i].hyperPayId
            });
        }
        return {
            success: true,
            cards: cardslist
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const removeCard = async data => {
    try {
        const txId = await node.callAPI("assets/updateAssetInfo", {
            assetName: config.ASSET.Card,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: data,
            public: {
                status: "closed"
            }
        });
        console.log(txId);
        return {
            success: true
        };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const oneClickPayment = async (amount, hyperPayId, merchantTransactionId) => {
    try {
        console.log(amount, hyperPayId);
        if (!hyperPayId || !amount || isNaN(parseFloat(amount))) {
            return {
                message: localizationManager.strings.invalidArguments
            };
        }

        var path = "/v1/registrations/" + hyperPayId.toString() + "/payments";
        var cardData = querystring.stringify({
            "authentication.userId": config.HYPERPAY.UserId,
            "authentication.password": config.HYPERPAY.Password,
            "authentication.entityId": config.HYPERPAY.EntityId,
            recurringType: "REPEATED",
            amount: amount,
            currency: config.HYPERPAY.Currency,
            paymentType: config.HYPERPAY.PaymentType,
            merchantTransactionId: merchantTransactionId,
            //"customer.email": "ukrocks.mehta@gmail.com",
            shopperResultUrl: `${
                config.apiHost.includes(":3000") ? "http" : "https"
            }://${config.apiHost}/app/home`
        });
        console.log(cardData);
        var options = {
            port: 443,
            host: config.HYPERPAY.host,
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": cardData.length
            }
        };
        return new Promise((resolve, reject) => {
            try {
                var postRequest = https.request(options, res => {
                    res.setEncoding("utf8");
                    res.on("data", async chunk => {
                        jsonRes = JSON.parse(chunk);
                        if (jsonRes.id) {
                            let code = jsonRes.result.code;
                            console.log(jsonRes);
                            var patt1 = /(000.000.|000.100.1|000.[36])/;

                            var patt2 = /(000.400.0[^3]|000.400.100)/;

                            if (patt1.test(code) || patt2.test(code)) {
                                jsonRes["status"] = "ACK";
                            } else {
                                jsonRes["status"] = "NAK";
                            }
                            // const { status } = await checkPaymentStatus(
                            //     jsonRes.id
                            // );
                            if (jsonRes.status == "ACK") {
                                resolve(jsonRes);
                            } else {
                                reject({
                                    error: "Payment failed",
                                    reason: "Payment declined by the server"
                                });
                            }
                        } else {
                            console.log("JsonRes>>", jsonRes);
                            reject({
                                error: "Payment failed",
                                reason: "Internal Error"
                            });
                        }
                    });
                });
                postRequest.write(cardData);
                postRequest.end();
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    } catch (ex) {
        return ex;
    }
};

const checkout = () => {
    var path = "/v1/checkouts";
    var data = querystring.stringify({
        "authentication.userId":
            config.HYPERPAY.UserId || "8a8294174d0595bb014d05d829e701d1",
        "authentication.password": config.HYPERPAY.Password || "9TnJPc2n9h",
        "authentication.entityId":
            config.HYPERPAY.EntityId || "8a8294174d0595bb014d05d82e5b01d2",
        amount: "1.00",
        currency: config.HYPERPAY.Currency,
        paymentType: config.HYPERPAY.PaymentType,
        createRegistration: true,
        recurringType: "INITIAL"
    });
    var options = {
        port: 443,
        host: config.HYPERPAY.host,
        path: path,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": data.length
        }
    };

    return new Promise((resolve, reject) => {
        try {
            var postRequest = https.request(options, function (res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    jsonRes = JSON.parse(chunk);
                    resolve(jsonRes);
                });
            });
            postRequest.write(data);
            postRequest.end();
        } catch (ex) {
            reject(ex);
        }
    });
};

const getCheckoutId = async () => {
    try {
        let op = await checkout();
        return { success: true, op: op };
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const checkPaymentStatus = id => {
    try {
        if (!id) {
            return {
                message: localizationManager.strings.invalidArguments
            };
        }

        var path = "/v1/checkouts/" + id.toString() + "/payment";
        path += "?authentication.userId=" + config.HYPERPAY.UserId;
        path += "&authentication.password=" + config.HYPERPAY.Password;
        path += "&authentication.entityId=" + config.HYPERPAY.EntityId;

        var options = {
            port: 443,
            host: config.HYPERPAY.host,
            path: path,
            method: "GET"
        };
        return new Promise((resolve, reject) => {
            try {
                var postRequest = https.request(options, res => {
                    res.setEncoding("utf8");
                    res.on("data", chunk => {
                        jsonRes = JSON.parse(chunk);
                        let code = jsonRes.result.code;
                        console.log(jsonRes);
                        const successPattern = /^(000\.000\.|000\.100\.1|000\.[36])/;
                        const manuallPattern = /^(000\.400\.0[^3]|000\.400\.100)/;
                        if (
                            successPattern.test(code) ||
                            manuallPattern.test(code)
                        ) {
                            jsonRes["status"] = "ACK";
                        } else {
                            jsonRes["status"] = "NAK";
                        }
                        resolve(jsonRes);
                    });
                });
                postRequest.end();
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    } catch (ex) {
        return ex;
    }
};

export {
    addCard,
    getCards,
    removeCard,
    getCardsForPayment,
    oneClickPayment,
    getCheckoutId
};
