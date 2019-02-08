module.exports = agenda => {
    console.log("Loading agenda workers");
    require("./generate-monthly-report-driver")(agenda);
};
