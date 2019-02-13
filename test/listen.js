var http = require("http");
var server = http.createServer();
server.on("request", (request, response) => {
    var body = [];
    request.on("data", chunk => {
        body.push(chunk);
    console.log(body);
    })
    request
        .on("end", () => {
            body = body.concat.toString();
        })
        .on("error", () => {
            response.statusCode = 400;
            response.end();
        });

    response.on("error", err => {
        console.log(err);
    })

    response.write("Hello world!");
    response.end();
});
server.listen(8008, () => {
    console.log("Server listening at 8088");
})
