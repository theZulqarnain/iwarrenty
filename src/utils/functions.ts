export const capitalizeWords = (inputString) => {
    return inputString.replace(/\b\w/g, function(match) {
      return match.toUpperCase();
    });
}

export const fromatValue = (value) => {
    if(typeof value === "string"){
        return value.trim()
    }
    return value
}

export const parse_spl_content_to_arr = (value, spl_char) => {
    return value.split(spl_char).map((category) => category.trim());
}

export const parse_spl_content_to_obj = (value, splChar) => {
    const keyValuePairs = value.split(';').map((pair) => pair.split(splChar));
    const parsedValue = {};
    keyValuePairs.forEach(([key, val]) => {
        const renamed_key = rename_key(key.trim());
        parsedValue[renamed_key] = isNaN(val) ? val.trim() : Number(val.trim());
    });
    return parsedValue;
}

    // Helper function to rename keys based on a mapping or regex pattern
export const rename_key = (key) => {
        const keyMapping = {
            directory_listing_review: 'review',
            directory_listing_lead: 'lead',
            directory_social__facebook: "fb_link",
            directory_social__googleplus: "g_link",
            directory_social__twitter: "x_link",
            directory_location__street: "street",
            directory_location__city: "city",
            directory_location__state: "state",
            directory_location__country: "country",
            directory_location__address: "address",
            directory_location__lat: "lat",
            directory_location__lng: "lng",
            directory_location__zip: "zip",
            directory_contact__email: "email",
            directory_contact__fax: "fax",
            directory_contact__mobile: "mobile",
            directory_contact__phone: "phone",
            directory_contact__website: "website",
        };
        return keyMapping[key] || key;
}