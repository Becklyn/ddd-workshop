const util = require("util");

export const deepConsoleLog = (data: any) =>
    console.log(util.inspect(data, false, null, true /* enable colors */));
