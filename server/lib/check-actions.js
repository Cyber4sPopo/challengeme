const axios = require('axios');
const fs = require('fs').promises;

const { Submission } = require('../models');
module.exports = async () => {
  console.log('Runs check started')
  let data;
  try {

    const allRunsResponse = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_REPO}/actions/runs`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
      }
    });
    data = allRunsResponse.data;
  } catch (e) {
    if (e.response.status === 401) {
      console.log('Fail with 401 - probably you don\'t set the GITHUB_ACCESS_TOKEN correctly')
      return;
    }
  }

  const rawIds = await fs.readFile('checked-actions-memory.json');
  const checkedIds = JSON.parse(rawIds);
  await Promise.all(data.workflow_runs.filter(run => !checkedIds[run.id]).map(async (run) => {
    let data;
    try {

      const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_REPO}/actions/runs/${run.id}/jobs`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
        }
      });
      data = response.data;
    } catch (e) {
      console.log('error', e);
      return;
    }

    if(!data || !data.jobs || !data.jobs[0]) {
      // checkedIds[run.id] = true;
      return;
    }

    const submissionId = data.jobs[0].name.replace(`aa${process.env.ENV_NAME}`, '');
    let submission; 
    try {
    if (!isNaN(submissionId)) {
      submission = await Submission.findByPk(parseInt(submissionId));
    }
    } catch (e) {
      console.log('error on', submissionId , e)
      // checkedIds[run.id] = true;
      return;
    }

    if (!submission) {
      // checkedIds[run.id] = true;
      return;
    }

    if (run.status === 'completed') {
      await submission.update({
        state: run.conclusion === 'success' ? 'SUCCESS' : 'FAIL'
      })
      checkedIds[run.id] = true;
    }
  }))
  await fs.writeFile('checked-actions-memory.json', JSON.stringify(checkedIds));
}