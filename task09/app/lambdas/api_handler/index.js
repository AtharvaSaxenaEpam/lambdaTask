const https = require("https");

exports.handler = async (event) => {
    const path = event.rawPath || event.path;  // Fix for undefined path issue
    const method = event.requestContext?.http?.method || event.httpMethod;  // Fix for undefined method issue

    if (path !== "/weather" || method !== "GET") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                statusCode: 400,
                message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
            })
        };
    }

    const lat = event.queryStringParameters?.lat || "50.4375";
    const lon = event.queryStringParameters?.lon || "30.5";
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&current_weather=true`;

    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (!parsedData.hourly) {
                        return resolve({
                            statusCode: 500,
                            body: JSON.stringify({ message: "Invalid API response: missing hourly data" })
                        });
                    }
                    resolve({ statusCode: 200, body: JSON.stringify(parsedData) });
                } catch (error) {
                    resolve({ statusCode: 500, body: JSON.stringify({ message: "Failed to parse API response" }) });
                }
            });
        }).on("error", () => resolve({
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch weather data" })
        }));
    });
};
