export const getGlobalSettings = () => {
    return {
        text: `SELECT * FROM jtl.global_settings`,
    }
}

export const updateGlobalSettings = (projectAutoprovisioning: boolean) => {
    return {
        text: "UPDATE jtl.global_settings SET project_auto_provisioning = $1",
        values: [projectAutoprovisioning],
    }
}
