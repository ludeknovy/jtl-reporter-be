import { db } from "../../../db/db"
import { scenarioNotifications } from "../../queries/scenario"
import axios from "axios"
import { msTeamsTemplate } from "./templates/ms-teams-template"
import { logger } from "../../../logger"
import { linkUrl } from "./link-url"
import { Overview } from "../../data-stats/prepare-data"
import { gchatTemplate } from "./templates/gchat-template"
import { slackTemplate } from "./templates/slack-template"

export const sendNotifications = async (projectName, scenarioName, id, overview: Overview) => {
    try {
        const notifications: Notification[] = await db.manyOrNone(scenarioNotifications(projectName, scenarioName))
        const url = linkUrl(projectName, scenarioName, id)
        notifications.map(async (notif) => {
            const messageTemplate = NotificationTemplate.get(notif.type)
            try {
                logger.info(`sending notification to: ${notif.type}`)
                const payload = messageTemplate(scenarioName, url, overview)
                await axios.post(notif.url, payload, {
                    headers: {
                        "content-type": "application/json",
                    },
                })
            } catch(error) {
                logger.error(`error while sending notification: ${error}`)
            }
        })
    } catch(error) {
        logger.error(`Error notification processing: ${error}`)
    }
}


interface Notification {
    id: string
    url: string
    type: string
}

const NotificationTemplate = new Map<string, any>([
    ["ms-teams", msTeamsTemplate],
    ["gchat", gchatTemplate],
    ["slack", slackTemplate],
])

