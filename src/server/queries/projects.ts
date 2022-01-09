export const isExistingProject = projectName => {
  return {
    name: "is-existing-project",
    text: "SELECT EXISTS(SELECT * FROM jtl.projects WHERE project_name = $1)",
    values: [projectName],
  }
}

export const createNewProject = projectName => {
  return {
    name: "create-new-project",
    text: "INSERT INTO jtl.projects(project_name) VALUES($1)",
    values: [projectName],
  }
}

export const findProjectId = projectName => {
  return {
    name: "find-project-id",
    text: "SELECT id FROM jtl.projects WHERE project_name = $1 AND",
    values: [projectName],
  }
}

export const findProjects = () => {
  return {
    // eslint-disable-next-line max-len
    text: `SELECT project_name as "projectName", p.id, count(DISTINCT(s.name))::int as "scenarioCount", count(i.id)::int as "itemCount", MAX(i.start_time) as "latestRun"
    FROM jtl.projects as p
    LEFT JOIN jtl.scenario as s ON s.project_id = p.id
    LEFT JOIN jtl.items as i ON i.scenario_id = s.id
    GROUP BY project_name, p.id;`,
  }
}

export const latestItems = () => {
  return {
    // eslint-disable-next-line max-len
    text: `SELECT i.id, s.name, environment, project_name as "projectName", stat.overview->'startDate' as "startTime", status FROM jtl.items as i
    LEFT JOIN jtl.scenario as s ON s.id = i.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    LEFT JOIN jtl.item_stat as stat ON stat.item_id = i.id
    WHERE i.report_status = 'ready'
    ORDER BY start_time DESC LIMIT 10;`,
  }
}

export const deleteProject = (projectName) => {
  return {
    text: "DELETE FROM jtl.projects WHERE project_name = $1",
    values: [projectName],
  }
}

export const updateProjectName = (currentProjectName, newProjectName, topMetricsSettings) => {
  return {
    text: "UPDATE jtl.projects SET project_name = $2, item_top_statistics_settings = $3 WHERE project_name = $1",
    values: [currentProjectName, newProjectName, topMetricsSettings],
  }
}

export const getProject = (projectName) => {
  return {
    // eslint-disable-next-line max-len
    text: "SELECT project_name as \"projectName\", item_top_statistics_settings as \"topMetricsSettings\" FROM jtl.projects WHERE project_name = $1",
    values: [projectName],
  }
}
