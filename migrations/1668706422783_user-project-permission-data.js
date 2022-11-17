exports.up = async pgm => {
    try {

        const userIds = await pgm.db.select({
            text: `SELECT id
                   FROM jtl.users`,
        })
        const projectIds = await pgm.db.select({
            text: `SELECT id
                   FROM jtl.projects`,
        })
        for (const userId of userIds) {
            for (const projectId of projectIds) {
                await pgm.db.query({
                    text: `INSERT INTO jtl.user_project_access (project_id, user_id)
                           values ($1, $2)`,
                    values: [projectId.id, userId.id],
                })
            }
        }
    } catch(error) {
        console.log(error)
    }
}

