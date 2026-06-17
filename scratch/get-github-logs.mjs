async function run() {
  const repo = "Jay-2007-coder/Smart-Picks-India";
  const runsUrl = `https://api.github.com/repos/${repo}/actions/runs`;
  console.log(`Fetching latest workflow runs for ${repo}...`);
  try {
    const res = await fetch(runsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch runs: ${res.statusText}`);
    }
    const data = await res.json();
    const latestRun = data.workflow_runs[0];
    if (!latestRun) {
      console.log("No runs found.");
      return;
    }
    console.log(`Latest Run Details:`);
    console.log(`- ID: ${latestRun.id}`);
    console.log(`- Name: ${latestRun.name}`);
    console.log(`- Event: ${latestRun.event}`);
    console.log(`- Status: ${latestRun.status}`);
    console.log(`- Conclusion: ${latestRun.conclusion}`);
    console.log(`- Commit: ${latestRun.head_commit.message}`);
    console.log(`- Logs URL: ${latestRun.logs_url}`);

    // Fetch jobs for this run
    const jobsUrl = latestRun.jobs_url;
    console.log(`\nFetching jobs for run ${latestRun.id}...`);
    const jobsRes = await fetch(jobsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const jobsData = await jobsRes.json();
    console.log(`Found ${jobsData.jobs.length} jobs:`);
    jobsData.jobs.forEach(job => {
      console.log(`- Job Name: "${job.name}" | Status: ${job.status} | Conclusion: ${job.conclusion}`);
      job.steps.forEach(step => {
        console.log(`  - Step: "${step.name}" | Status: ${step.status} | Conclusion: ${step.conclusion}`);
      });
    });
  } catch (err) {
    console.error("Failed to query GitHub API:", err);
  }
}
run();
