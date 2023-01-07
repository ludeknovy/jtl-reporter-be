import * as Bree from "bree"
import * as path from "node:path"
// eslint-disable-next-line @typescript-eslint/no-var-requires
Bree.extend(require("@breejs/ts-worker"))


export const bree = new Bree({
    root: path.join(__dirname, "jobs"),
    defaultExtension: "ts",
    jobs: [{
        name: "analytics-report",
        interval: "every 24 hours",
    }],
})


