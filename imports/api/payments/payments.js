import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
import {
    Meteor
} from 'meteor/meteor';
var https = require('https');
var querystring = require('querystring');

function request(data, callback) {

}

request(function (responseData) {
    console.log(responseData);
});

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const addCard = async (data) => {
    console.log("Card info:", data);
    var expiryMonth = data.expiry && data.expiry.indexOf('/') != -1 ? data.expiry.split('/')[0] : "";
    var currentYear = (new Date().getFullYear()).toString();

    var expiryYear = data.expiry && data.expiry.indexOf('/') != -1 ?
        (data.expiry.split('/')[1] > currentYear.slice(2, 4) ?
            currentYear.slice(0, 2) + data.expiry.split('/')[1] :
            (parseInt(currentYear.slice(0, 2)) + 1).toString() + data.expiry.split('/')[1]) :
        "";

    expiryYear = expiryYear.length == 4 ? expiryYear : "";

    data["expiryYear"] = expiryYear;
    data["expiryMonth"] = expiryMonth;
    data["number"] = data.number.toString().replace(/ /g, '');
    console.log("saving", data);
    var op = await saveCardToHyperPay(data);
    console.log("output", op);
    if (op.id) {
        data["hyperPayId"] = op.id;
        op = await saveCardToBlockcluster(data);
        if(op.success)
        return {
            success: true,
            data: data
        };
    }
}

const saveCardToBlockcluster = async (data) => {
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
            cardNumber: data.number,
            hyperPayId: data.hyperPayId,
            owner: Meteor.userId()
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
                cardNumber: data.number,
                hyperPayId: data.hyperPayId,
                owner: Meteor.userId()
            }
        });
        console.log(txId);
        return {
            success: true,
            data: identifier,
            txn: txId,
            identifier: identifier,
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const saveCardToHyperPay = (data) => {
    var path = '/v1/registrations';

    var cardData = querystring.stringify({
        'authentication.userId': config.HYPERPAY.UserId,
        'authentication.password': config.HYPERPAY.Password,
        'authentication.entityId': config.HYPERPAY.EntityId,
        'paymentBrand': config.HYPERPAY.PaymentMethods.VISA,
        'card.number': data.number || "",
        'card.holder': data.name || "",
        'card.expiryMonth': data.expiryMonth || "",
        'card.expiryYear': data.expiryYear || "",
        'card.cvv': data.cvc || "",
    });
    console.log(cardData);
    var options = {
        port: 443,
        host: 'test.oppwa.com',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': cardData.length
        }
    };
    return new Promise(async (resolve, reject) => {
        try {
            var postRequest = https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
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
}

export {
    addCard,
}