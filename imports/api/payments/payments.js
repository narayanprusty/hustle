import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
import Payment from "payment";
import { Meteor } from "meteor/meteor";
var https = require("https");
var querystring = require("querystring");
import { sendPushNotification } from "../../modules/helpers/server";
import localizationManager from "../../ui/localization";

function request(data, callback) {}

request(function(responseData) {
    console.log(responseData);
});

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const addCard = async data => {
    console.log("Card info:", data);
    var expiryMonth =
        data.expiry && data.expiry.indexOf("/") != -1
            ? data.expiry.split("/")[0]
            : "";
    if (expiryMonth <= 0 || expiryMonth >= 13) {
        return {
            success: false,
            message: localizationManager.strings.invalidExpiry
        };
    } else if (data.number <= 0 || data.number.length <= 18) {
        return {
            success: false,
            message: localizationManager.strings.invalidCardNumber
        };
    } else if (!isNaN(parseInt(data.name.toString()))) {
        return {
            success: false,
            message: localizationManager.strings.invalidName
        };
    } else if (data.cvc <= 0) {
        return {
            success: false,
            message: localizationManager.strings.invalidCVV
        };
    }
    var currentYear = new Date().getFullYear().toString();

    var expiryYear =
        data.expiry && data.expiry.indexOf("/") != -1
            ? data.expiry.split("/")[1] > currentYear.slice(2, 4)
                ? currentYear.slice(0, 2) + data.expiry.split("/")[1]
                : (parseInt(currentYear.slice(0, 2)) + 1).toString() +
                  data.expiry.split("/")[1]
            : "";

    expiryYear = expiryYear.length == 4 ? expiryYear : "";

    data["expiryYear"] = expiryYear;
    data["expiryMonth"] = expiryMonth;
    data["number"] = data.number.toString().replace(/ /g, "");

    var cards = await node.callAPI("assets/search", {
        $query: {
            assetName: config.ASSET.Card,
            cardNumber: parseInt(data.number.toString()),
            status: "open"
        }
    });

    console.log("found:", cards.length > 0);

    if (cards.length > 0) {
        return {
            success: false,
            message: localizationManager.strings.cardExists
        };
    }

    var op = await saveCardToHyperPay(data);

    console.log("output", op);

    if (op.message && op.success == false) {
        sendPushNotification(
            localizationManager.strings.failedAddingCard,
            op.message,
            Meteor.userId()
        );
        return op;
    }

    if (op.id && op.result.description.indexOf("successfully") != -1) {
        data["hyperPayId"] = op.id;
        op = await saveCardToBlockcluster(data);
        //Push notification
        sendPushNotification(
            localizationManager.strings.cardAddedShort,
            localizationManager.strings.cardAddedPushNotification,
            Meteor.userId()
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
            Meteor.userId()
        );
        return {
            success: false,
            message: op.result.description
        };
    }
};

const saveCardToBlockcluster = async data => {
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
            userId: Meteor.userId()
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
                userId: Meteor.userId().toString()
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

const oneClickPayment = async (amount, hyperPayId) => {
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
            merchantTransactionId: "8ac7a4a168c2b4360168c33a485c0567103",
            "customer.email": "ukrocks.mehta@gmail.com",
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
                            const { status } = await checkPaymentStatus(
                                jsonRes.id
                            );
                            if (status == "ACK") {
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
                        var patt1 = new RegExp(
                            "^(000.000.|000.100.1|000.[36])"
                        );
                        var patt2 = new RegExp("/^(000.400.0|000.400.100)/");
                        if (patt1.test(code) || patt2.test(code)) {
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

export { addCard, getCards, removeCard, getCardsForPayment, oneClickPayment };
