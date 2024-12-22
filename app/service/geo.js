const axios = require('axios');

async function reverse({ latitude, longitude }) {
    const POSITION_STACK_API_KEY = process.env.POSITION_STACK_API_KEY;

    const url = `http://api.positionstack.com/v1/reverse?access_key=${POSITION_STACK_API_KEY}&query=${latitude},${longitude}`;
    const response = await axios.get(url);
    return {
        latitude,
        longitude,
        location: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
        address: response.data.data[0].label,
        zipCode: response.data.data[0].postal_code,
        city: response.data.data[0].locality || response.data.data[0].county,
        road: response.data.data[0].street || response.data.data[0].name,
        state: response.data.data[0].region,
        country: response.data.data[0].country,
    };
}

module.exports = {
    reverse,
};