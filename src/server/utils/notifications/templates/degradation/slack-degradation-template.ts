export const slackDegradationTemplate = (scenarioName: string, url) => {
    const card = {
        blocks: [
            { type: "header", text: { type: "plain_text", text: "JTL Reporter" } },
            { type: "header", text: { type: "plain_text",
                    text: `Performance Degradation Detected for scenario: ${scenarioName}` } },
        ],
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
