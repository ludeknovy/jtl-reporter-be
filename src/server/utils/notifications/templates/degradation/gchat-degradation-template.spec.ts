import { gchatDegradationTemplate } from "./gchat-degradation-template"

describe("GChat Degradation template", () => {
    it("should return correct card payload when url provided", () => {
        const template = gchatDegradationTemplate("scenarioName", "http://localhost")
        expect(template).toEqual( {
                cards:  [
                    {
                        header:  {
                            imageUrl: "",
                            subtitle: "Performance Degradation Detected for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [
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
                            subtitle: "Performance Degradation Detected for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [],
                    },
                ],
            }
        )
    })
})
