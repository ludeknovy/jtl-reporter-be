import { Overview } from "../../../data-stats/prepare-data"

export const slackTemplate = (scenarioName: string, url, overview: Overview) => {
    const card = {
        blocks: [{ type: "header", text: { type: "plain_text", text: "JTL Reporter" } }, {
            type: "header",
            text: { type: "plain_text", text: `Performance Report for scenario: ${scenarioName}` },
        }, { type: "divider" }, {
            type: "section",
            fields: [{ type: "mrkdwn", text: `*Error Rate*\n${overview.errorRate}%` }],
        }, { type: "section", fields: [{ type: "mrkdwn", text: `*90% percentile*\n${overview.percentil} ms` }] }, {
            type: "section",
            fields: [{ type: "mrkdwn", text: `*Throughput*\n${overview.throughput} reqs/s` }],
        }, { type: "section", fields: [{ type: "mrkdwn", text: `*Duration*\n${overview.duration} min` }] }],
    }

    if (url) {
        (card.blocks as any).push({
            type: "section",
            fields: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "View",
                    emoji: true,
                },
                value: "click_me_123",
                url,
                action_id: "button-action",
            },
        })
    }
    return card
}
