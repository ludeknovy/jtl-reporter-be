exports.up = async pgm => {
    try {

        await pgm.db.query({
            text: `INSERT INTO jtl.global_settings (project_auto_provisioning)
                           values ($1)`,
            values: [false],
        })
    } catch(error) {
        console.log(error)
    }
}

