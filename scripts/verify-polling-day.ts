import { dbService } from "../src/lib/store/data-service";

async function runPollingDayVerification() {
  console.log("==========================================================");
  console.log("CHUNAV SETU - POLLING DAY MODULE COMPREHENSIVE VERIFICATION");
  console.log("==========================================================");

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
    }
  }

  // 1. Data Layer Verification
  console.log("\n1. Testing DataService Polling Day Methods:");
  const initialStats = dbService.getPollingDayDashboardStats("client-1");
  assert("Polling day dashboard stats retrieved for client-1", initialStats !== null && initialStats.totalVoters > 0);
  assert("Initial voting reported count is tracked", initialStats.votingActivityReported >= 0);
  assert("Hourly activity array has 10 hours (8 AM to 5 PM)", initialStats.hourlyActivity.length === 10);
  assert("Booth stats list is populated", initialStats.boothStats.length > 0);
  assert("Volunteer telemetry stats are populated", initialStats.volunteerStats.length > 0);

  // 2. Rapid Status Update Verification
  console.log("\n2. Testing Rapid Telemetry Status Update:");
  const updatedRecord = dbService.updatePollingVoterStatus(
    "client-1",
    "voter-101-1",
    "VOTING_REPORTED",
    "vol-1",
    "Field contact confirmed"
  );
  assert("Voter status updated to VOTING_REPORTED", updatedRecord.status === "VOTING_REPORTED");
  assert("Updated record has timestamp and volunteer info", !!updatedRecord.created_at && updatedRecord.updated_by === "Amit Kumar");

  const voterList = dbService.getPollingDayVoters("client-1", "vol-1", { pageSize: 10 });
  const updatedVoter = voterList.data.find((v: any) => v.id === "voter-101-1");
  assert("Voter list reflects updated polling status", updatedVoter?.polling_status === "VOTING_REPORTED");

  // 3. Follow-up Management Verification
  console.log("\n3. Testing Follow-up Queue Management:");
  const createdFollowUp = dbService.createPollingFollowUp("client-1", {
    client_id: "client-1",
    campaign_id: "campaign-1",
    polling_day_id: "pd-client-1",
    voter_id: "voter-2",
    voter_name: "Sunita Devi Sharma",
    voter_id_card: "VOT1002",
    booth_id: "booth-1",
    booth_number: "Booth 101",
    booth_name: "Govt Primary School Room 1",
    area_name: "Shastri Nagar",
    volunteer_id: "vol-1",
    volunteer_name: "Amit Kumar",
    reason: "Transport Assistance Required",
    note: "Pick up at 2 PM",
  });
  assert("Follow-up record created with pending status", createdFollowUp.status === "pending");

  const resolvedFollowUp = dbService.resolvePollingFollowUp("client-1", createdFollowUp.id);
  assert("Follow-up marked completed upon resolution", resolvedFollowUp?.status === "completed" && !!resolvedFollowUp.completed_at);

  // 4. Configuration & Locking Verification
  console.log("\n4. Testing Polling Day Configuration & Lock:");
  const configuredDay = dbService.configurePollingDay("client-1", {
    title: "Updated General Assembly Election 2026",
    polling_date: "15 December 2026",
    status: "active",
  });
  assert("Polling day configuration updated", configuredDay.polling_date === "15 December 2026");

  const locked = dbService.lockPollingDay("client-1");
  const lockedStats = dbService.getPollingDayDashboardStats("client-1");
  assert("Polling day locked to completed status", locked && lockedStats.pollingDay?.status === "completed");

  console.log("\n==========================================================");
  console.log(` RESULTS: ${passed}/${total} Assertions Passed`);
  console.log("==========================================================");

  if (passed === total) {
    console.log("\n SUCCESS: All Polling Day module workflows verified.\n");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPollingDayVerification().catch(console.error);
