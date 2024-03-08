
export const gchatDegradationTemplate = (scenarioName: string, url) => {
    const cardPayload = {
        cards: [{
            header: {
                title: "JTL Reporter",
                subtitle: `Performance Degradation Detected for scenario: ${scenarioName}`,
                imageUrl: "",
            },
            sections: [],
        }],
    }

    if (url) {
        (cardPayload.cards[0].sections as any).push({
            widgets: [
                {
                    buttons: [
                        {
                            textButton: {
                                text: "OPEN RESULTS",
                                onClick: {
                                    openLink: {
                                        url,
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        })
    }
    return cardPayload
}
