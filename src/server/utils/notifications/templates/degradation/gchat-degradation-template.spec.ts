import { gchatDegradationTemplate } from "./gchat-degradation-template"

describe("GChat Degradation template", () => {
    it("should return correct card payload when url provided", () => {
        const template = gchatDegradationTemplate("scenarioName", "http://localhost")
        expect(template).toEqual( {
                cards:  [
                    {
                        header:  {
                            imageUrl: "",
                            subtitle: "Performance Report for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [
                            {
                                widgets:  [
                                    {
                                        keyValue:  {
                                            content: "0 %",
                                            topLabel: "Error Rate",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 ms",
                                            topLabel: "90% percentile",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 reqs/s",
                                            topLabel: "Throughput",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "1 min",
                                            topLabel: "Duration",
                                        },
                                    },
                                ],
                            },
                            {
                                widgets:  [
                                    {
                                        buttons:  [
                                            {
                                                textButton:  {
                                                    onClick:  {
                                                        openLink:  {
                                                            url: "http://localhost",
                                                        },
                                                    },
                                                    text: "OPEN RESULTS",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        )
    })
    it("should return card payload when no url provided", () => {
        const template = gchatDegradationTemplate("scenarioName", undefined)
        expect(template).toEqual({
                cards:  [
                    {
                        header:  {
                            imageUrl: "",
                            subtitle: "Performance Report for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [
                            {
                                widgets:  [
                                    {
                                        keyValue:  {
                                            content: "0 %",
                                            topLabel: "Error Rate",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 ms",
                                            topLabel: "90% percentile",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 reqs/s",
                                            topLabel: "Throughput",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "1 min",
                                            topLabel: "Duration",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        )
    })
})
