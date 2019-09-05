export const isExistingProject = projectName => {
  return {
    name: 'is-existing-project',
    text: 'SELECT EXISTS(SELECT * FROM jtl.projects WHERE project_name = $1)',
    values: [projectName]
  };
};

export const createNewProject = projectName => {
  return {
    name: 'create-new-project',
    text: 'INSERT INTO jtl.projects(project_name) VALUES($1)',
    values: [projectName]
  };
};

export const findProjectId = projectName => {
  return {
    name: 'find-project-id',
    text: 'SELECT id FROM jtl.projects WHERE project_name = $1 AND',
    values: [projectName]
  };
};

export const findProjects = () => {
  return {
    text: `SELECT project_name as "projectName", id FROM jtl.projects;`
  };
};

export const latestItems = () => {
  return {
    // tslint:disable-next-line:max-line-length
    text: `SELECT i.id, s.name, environment, project_name as "projectName", start_time as "startTime", status FROM jtl.items as i
    LEFT JOIN jtl.scenario as s ON s.id = i.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    ORDER BY start_time DESC LIMIT 10;`
  };
};

export const deleteProject = (projectName) => {
  return {
    text: 'DELETE FROM jtl.projects WHERE project_name = $1',
    values: [projectName]
  };
};

export const updateProjectName = (currentProjectName, newProjectName) => {
  return {
    text: 'UPDATE jtl.projects SET project_name = $2 WHERE project_name = $1',
    values: [currentProjectName, newProjectName]
  };
};
