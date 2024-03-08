import { db } from "../../../db/db"
import { scenarioNotificationsByType } from "../../queries/scenario"
import axios from "axios"
import { msTeamsTemplate } from "./templates/report/ms-teams-template"
import { logger } from "../../../logger"
import { linkUrl } from "./link-url"
import { Overview } from "../../data-stats/prepare-data"
import { gchatTemplate } from "./templates/report/gchat-template"
import { slackTemplate } from "./templates/report/slack-template"
import { msTeamsDegradationTemplate } from "./templates/degradation/ms-teams-degradation-template"
import { gchatDegradationTemplate } from "./templates/degradation/gchat-degradation-template"
import { slackDegradationTemplate } from "./templates/degradation/slack-degradation-template"

export const sendReportNotifications = async (projectName, scenarioName, id, overview: Overview) => {
    try {
        const notifications: Notification[] = await db.manyOrNone(
            scenarioNotificationsByType(projectName, scenarioName, NotificationType.ReportDetail))
        const url = linkUrl(projectName, scenarioName, id)
        notifications.map(async (notif) => {
            const messageTemplate = NotificationReportTemplate.get(notif.channel)
            try {
                logger.info(`sending notification to: ${notif.channel}`)
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

export const sendDegradationNotifications = async (projectName, scenarioName, id) => {
    try {
        const notifications: Notification[] = await db.manyOrNone(
            scenarioNotificationsByType(projectName, scenarioName, NotificationType.Degradation))
        const url = linkUrl(projectName, scenarioName, id)
        notifications.map(async (notif) => {
            const messageTemplate = NotificationDegradationTemplate.get(notif.channel)
            try {
                logger.info(`sending degradation notification to: ${notif.channel}`)
                const payload = messageTemplate(scenarioName, url)
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

enum NotificationType {
    ReportDetail = "report_detail",
    Degradation = "degradation",
}


interface Notification {
    id: string
    url: string
    channel: string
}

const NotificationReportTemplate = new Map<string, any>([
    ["ms-teams", msTeamsTemplate],
    ["gchat", gchatTemplate],
    ["slack", slackTemplate],
])

const NotificationDegradationTemplate =
    new Map<string, any>([
        ["ms-teams", msTeamsDegradationTemplate],
        ["gchat", gchatDegradationTemplate],
        ["slack", slackDegradationTemplate],
    ])

