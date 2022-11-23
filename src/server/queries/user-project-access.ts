export const asignAdminAsProjectMember = (userId) => {
    return {
        text: `INSERT INTO jtl.user_project_access (project_id, user_id)
               SELECT id, $1 as user_id
               FROM jtl.projects`,
        values: [userId],
    }
}

export const assignAllAdminsAsProjectMembers = (projectId) => {
    return {
        text: `INSERT INTO jtl.user_project_access (project_id, user_id) 
                SELECT $1, u.id FROM jtl.users u 
                WHERE u.role = 'admin'`,
        values: [projectId],
    }
}

export const addProjectMember = (projectId, userId) => {
    return {
        text: `INSERT INTO jtl.user_project_access (project_id, user_id) 
                VALUES ($1, $2)`,
        values: [projectId, userId],
    }
}

export const isUserAuthorizedForProject = (projectName, userId) => {
    return {
        text: `SELECT user_id
               FROM jtl.user_project_access upa
                        LEFT JOIN jtl.projects p on p.id = upa.project_id
               WHERE p.project_name = $1
                 AND upa.user_id = $2`,
        values: [projectName, userId],
    }
}

export const getProjectMembers = (projectName) => {
    return {
        text: `SELECT user_id FROM jtl.user_project_access upa
                LEFT JOIN jtl.projects p on p.id = upa.project_id
                LEFT JOIN jtl.users u on u.id = upa.user_id
                WHERE p.project_name = $1
                AND NOT u.role = 'admin'`,
        values: [projectName],
    }
}

export const removeProjectMember = (projectId, userId) => {
    return {
        text: `DELETE FROM jtl.user_project_access WHERE project_id = $1 AND user_id = $2`,
        values: [projectId, userId],
    }
}
