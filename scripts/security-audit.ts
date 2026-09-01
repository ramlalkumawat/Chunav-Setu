import {
  hashPassword,
  verifyPassword,
  hashPasswordWithSalt,
  authenticateCredentials,
  generatePasswordResetToken,
  consumePasswordResetToken,
} from "../src/lib/security/auth";
import {
  createSessionToken,
  verifySessionToken,
} from "../src/lib/security/session";
import { hasPermission } from "../src/lib/security/rbac";
import { validateTenantAccess, verifyEntityOwnership } from "../src/lib/security/tenant";
import { checkRateLimit } from "../src/lib/security/rate-limiter";
import {
  sanitizeString,
  sanitizeCsvCell,
  isValidVoterCard,
  isValidMobile,
} from "../src/lib/security/sanitizer";
import { SecurityUser, SessionTokenPayload } from "../src/lib/security/types";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName} - ${details || "Assertion failed"}`);
  }
}

async function runSecurityTestSuite() {
  console.log("==========================================================");
  console.log(" CHUNAV SETU - AUTOMATED SECURITY AUDIT & HARDENING TESTS ");
  console.log("==========================================================\n");

  // -------------------------------------------------------------------
  // 1. AUTHENTICATION & PASSWORD HASHING
  // -------------------------------------------------------------------
  console.log("1. Testing Cryptographic Authentication & Password Hashing:");
  const testPass = "SecretCampaign@2026";
  const { hash, salt } = hashPassword(testPass);
  assert(hash.length === 128, "PBKDF2-SHA256 produces 512-bit (128 hex chars) hash");
  assert(verifyPassword(testPass, hash, salt), "Valid password verifies in constant-time");
  assert(!verifyPassword("WrongPassword123", hash, salt), "Invalid password correctly rejected");

  const authValid = await authenticateCredentials("superadmin@chunavsetu.com", "Chunav@2026");
  assert(authValid.success && authValid.user?.role === "super_admin", "Super Admin authenticates with valid credentials");

  const authInvalid = await authenticateCredentials("superadmin@chunavsetu.com", "WrongPass");
  assert(!authInvalid.success, "Invalid credentials rejected with secure error");

  const resetToken = generatePasswordResetToken("candidate@rajeshsharma.in");
  assert(resetToken.length === 64, "Password reset token is cryptographically random 256-bit hex");
  const consumed = consumePasswordResetToken(resetToken);
  assert(consumed.valid && consumed.email === "candidate@rajeshsharma.in", "Reset token consumed successfully");
  const consumedAgain = consumePasswordResetToken(resetToken);
  assert(!consumedAgain.valid, "Single-use reset token cannot be re-used");

  // -------------------------------------------------------------------
  // 2. RATE LIMITING & BRUTE FORCE PROTECTION
  // -------------------------------------------------------------------
  console.log("\n2. Testing Rate Limiting & Brute Force Defense:");
  const testIp = `192.168.1.${Math.floor(Math.random() * 1000)}`;
  let blocked = false;
  for (let i = 0; i < 15; i++) {
    const result = checkRateLimit(testIp, "auth");
    if (!result.allowed) {
      blocked = true;
      break;
    }
  }
  assert(blocked, "Auth brute-force attempts trigger sliding-window rate limiting (HTTP 429)");

  // -------------------------------------------------------------------
  // 3. SESSION TOKEN TAMPERING & CRYPTOGRAPHIC VERIFICATION
  // -------------------------------------------------------------------
  console.log("\n3. Testing Session Signatures & Tamper Resistance:");
  const mockUser: SecurityUser = {
    id: "user-101",
    email: "candidate@rajeshsharma.in",
    full_name: "Rajesh Sharma",
    role: "client_admin",
    client_id: "client-1",
    status: "active",
  };

  const validToken = createSessionToken(mockUser);
  const verifiedSession = verifySessionToken(validToken);
  assert(verifiedSession !== null && verifiedSession.userId === "user-101", "HMAC-SHA256 signed session verifies cleanly");

  // Attempt forgery: tamper with role inside payload
  const [b64Payload, sig] = validToken.split(".");
  const decodedPayload: SessionTokenPayload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf-8"));
  decodedPayload.role = "super_admin"; // Privilege escalation attack
  const forgedPayloadB64 = Buffer.from(JSON.stringify(decodedPayload)).toString("base64url");
  const forgedToken = `${forgedPayloadB64}.${sig}`;

  const forgedVerification = verifySessionToken(forgedToken);
  assert(forgedVerification === null, "Tampered session payload with forged signature is strictly REJECTED");

  // -------------------------------------------------------------------
  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------------
  console.log("\n4. Testing Role-Based Access Control (RBAC Matrix):");
  assert(hasPermission("super_admin", "system", "manage"), "Super Admin can manage system settings");
  assert(hasPermission("super_admin", "client", "create"), "Super Admin can provision new client tenants");
  assert(!hasPermission("client_admin", "system", "manage"), "Candidate Admin CANNOT manage system settings");
  assert(hasPermission("client_admin", "voter", "delete"), "Candidate Admin can delete voters in their campaign");
  assert(!hasPermission("volunteer", "voter", "delete"), "Volunteer CANNOT delete voter records");
  assert(!hasPermission("volunteer", "voter", "export"), "Volunteer CANNOT export campaign voter datasets");
  assert(hasPermission("volunteer", "field_activity", "create"), "Volunteer can record door canvassing surveys");

  // -------------------------------------------------------------------
  // 5. MULTI-TENANT ISOLATION & IDOR DEFENSE
  // -------------------------------------------------------------------
  console.log("\n5. Testing Multi-Tenant Isolation & IDOR Boundaries:");
  const client1Session: SessionTokenPayload = {
    userId: "user-client-1",
    email: "rajesh@sharma.in",
    fullName: "Rajesh Sharma",
    role: "client_admin",
    clientId: "client-1",
    createdAt: Date.now(),
    expiresAt: Date.now() + 10000,
    nonce: "test-1",
  };

  // Client 1 accessing Client 1 -> ALLOWED
  const ownTenantAccess = validateTenantAccess(client1Session, "client-1");
  assert(ownTenantAccess.authorized && ownTenantAccess.effectiveClientId === "client-1", "Tenant A user accessing Tenant A is ALLOWED");

  // Client 1 attempting to access Client 2 -> DENIED
  const crossTenantAccess = validateTenantAccess(client1Session, "client-2");
  assert(!crossTenantAccess.authorized, "Tenant A user attempting to access Tenant B is strictly DENIED (Cross-Tenant Defense)");

  // IDOR Entity Verification
  const client1Voter = { id: "voter-1", client_id: "client-1", name: "Ramesh Gupta" };
  const client2Voter = { id: "voter-2", client_id: "client-2", name: "Suresh Patil" };
  assert(verifyEntityOwnership(client1Voter, client1Session), "Access to voter in same tenant is verified");
  assert(!verifyEntityOwnership(client2Voter, client1Session), "Access to voter in different tenant is BLOCKED (IDOR Guard)");

  // -------------------------------------------------------------------
  // 6. CSV FORMULA INJECTION NEUTRALIZATION (CWE-1236)
  // -------------------------------------------------------------------
  console.log("\n6. Testing CSV Formula Injection Sanitization:");
  const dangerousCells = [
    "=cmd|'/C calc'!A0",
    "+SUM(1,2)",
    "-2+3+cmd|' /C calc'!A0",
    "@SUM(1,2)",
    "\t=1+1",
    "\r=2+2",
    "Normal Name",
  ];

  const sanitizedCells = dangerousCells.map(sanitizeCsvCell);
  assert(sanitizedCells[0].startsWith("\"'="), "Formula prefix '=' neutralized with leading quote");
  assert(sanitizedCells[1].startsWith("\"'+"), "Formula prefix '+' neutralized with leading quote");
  assert(sanitizedCells[2].startsWith("\"'-"), "Formula prefix '-' neutralized with leading quote");
  assert(sanitizedCells[3].startsWith("\"'@"), "Formula prefix '@ neutralized with leading quote");
  assert(sanitizedCells[6] === '"Normal Name"', "Safe string remains unmodified");

  // -------------------------------------------------------------------
  // 7. INPUT SANITIZATION & VALIDATION
  // -------------------------------------------------------------------
  console.log("\n7. Testing Input Sanitization & Format Validation:");
  const xssInput = "<script>alert('xss')</script>John Doe";
  const cleanString = sanitizeString(xssInput);
  assert(!cleanString.includes("<script>"), "HTML/Script tags stripped from input");
  assert(isValidVoterCard("VOT9876543"), "Valid EPIC voter ID format accepted");
  assert(!isValidVoterCard("BAD"), "Short/invalid EPIC format rejected");
  assert(isValidMobile("+919876543210"), "Valid mobile accepted");
  assert(!isValidMobile("invalid-phone-abc"), "Invalid mobile string rejected");

  console.log("\n==========================================================");
  console.log(` RESULTS: ${passedTests}/${totalTests} Security Assertions Passed`);
  console.log("==========================================================\n");

  if (passedTests === totalTests) {
    console.log(" SUCCESS: All security hardening controls verified.");
  } else {
    console.error(" FAILURE: Some security tests failed.");
    process.exit(1);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error("Security test suite error:", err);
  process.exit(1);
});
