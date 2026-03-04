import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const env = loadEnvFile(".env.local");

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

for (const key of required) {
  if (!env[key]) {
    fail(`Missing required env var: ${key}`);
  }
}

const appBaseUrl = env.APP_BASE_URL || "https://app-test-liard-sigma.vercel.app";
const smokeEmail = env.SMOKE_TEST_EMAIL || "smoke-proctor@app-test.local";
const smokePassword = env.SMOKE_TEST_PASSWORD || "SmokeTest!2026";

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const userId = await ensureSmokeUser();

const authed = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const signIn = await authed.auth.signInWithPassword({
  email: smokeEmail,
  password: smokePassword
});

if (signIn.error || !signIn.data.user) {
  fail(`Auth sign-in failed: ${signIn.error?.message || "unknown error"}`);
}

step(`Authenticated smoke user ${smokeEmail}`);

const cleanup = {
  conopId: null,
  scenarioId: null,
  sessionId: null
};

try {
  const reachability = await Promise.all([
    fetchStatus(`${appBaseUrl}/login`),
    fetchStatus(`${appBaseUrl}/`)
  ]);

  step(`App reachability OK: /login -> ${reachability[0]}, / -> ${reachability[1]}`);

  const metadata = {
    lane_type: "point-of-injury",
    training_level: "ranger-first-responder",
    unit: "1st Platoon",
    location: "Urban breach lane",
    training_objective: "Validate hemorrhage control and reassessment under pressure",
    weather: "cold and dry",
    enemy_posture: "sporadic small arms fire",
    smoke_test: true
  };

  const conop = await insertOne(
    authed,
    "conops",
    {
      title: "Smoke Test CONOP",
      raw_text:
        "Ranger platoon conducting limited objective raid on a compound. One casualty sustained during breach with ongoing threat, delayed evacuation, and instructor-controlled progression.",
      metadata_json: metadata,
      conop_hash: sha256(JSON.stringify(metadata)),
      created_by: userId
    },
    "id,title"
  );
  cleanup.conopId = conop.id;
  step(`Created CONOP ${conop.id}`);

  const scenario = await insertOne(
    authed,
    "scenarios",
    {
      conop_id: conop.id,
      name: "Smoke Test Breach Casualty Lane",
      status: "approved",
      moi: "Breach charge blast with right groin junctional bleed and chest wall trauma",
      difficulty: "intermediate",
      environment_json: {
        setting: "Urban breach lane",
        time_pressure: "high",
        resources: ["IFAK", "litter", "radio"],
        constraints: ["training-only", "instructor-controlled progression"],
        lane_type: "point-of-injury",
        medic_action_set_name: "Point of injury",
        medic_action_set: ["Control massive hemorrhage", "Support breathing", "Initiate reassessment"]
      },
      rubric_json: {
        critical_actions: [
          {
            action: "Control massive hemorrhage",
            must_occur_by_sec: 60,
            fail_if_missed: true,
            notes: "Immediate hemorrhage control is decisive."
          },
          {
            action: "Initiate reassessment",
            must_occur_by_sec: 180,
            fail_if_missed: false,
            notes: "Recheck after intervention."
          }
        ],
        scoring_dimensions: [
          { name: "sequence", max_points: 5, notes: "Correct order of care." },
          { name: "speed", max_points: 5, notes: "Timely intervention under pressure." },
          { name: "accuracy", max_points: 5, notes: "Correct treatment selection." },
          { name: "reassessment", max_points: 5, notes: "Rechecks after intervention." }
        ]
      },
      wound_set_json: {
        injuries: [
          {
            label: "Right groin junctional hemorrhage",
            region: "right lower extremity / groin",
            type: "fragmentation wound",
            severity: "severe",
            visible_findings: ["Bright red bleeding at right groin", "Pooling blood under casualty hip"],
            hidden_findings: ["Progressive shock if untreated"],
            expected_interventions: ["Control massive hemorrhage", "Initiate reassessment"],
            critical_errors: ["Delayed hemorrhage control", "Failure to reassess"]
          }
        ]
      },
      presentation_script_json: {
        demeanor: "Anxious but responsive",
        chief_complaint: "My leg is hit and I feel weak.",
        script_opening_line: "Medic, my leg is hit. I am getting dizzy.",
        answers_to_common_questions: {
          what_happened: "Charge went off at the breach and I caught fragments low.",
          where_does_it_hurt: "Right groin and right lower chest.",
          can_you_breathe: "I can talk, but it hurts to breathe deep.",
          are_you_bleeding: "Yes, my leg is bleeding."
        },
        behavior_cues: ["Grimacing", "Trying to grab right leg", "More coherent after bleeding controlled"]
      },
      vitals_model_json: {
        stage: "stable",
        baseline: {
          hr: 118,
          rr: 26,
          spo2: 94,
          bp_sys: 104,
          bp_dia: 66,
          temp_c: 36.8,
          pain_0_10: 8
        },
        progression_rules: [
          {
            trigger: "Control massive hemorrhage",
            allowed_transitions: [
              {
                to_stage: "stable",
                delta: { hr: -10, rr: -2, spo2: 1, bp_sys: 6, bp_dia: 4, pain_0_10: -1 },
                time_window_sec: 60,
                notes: "Bleeding visibly slows and mental status improves."
              }
            ]
          }
        ]
      },
      conop_hash: sha256(`scenario:${conop.id}`),
      ai_model: env.OPENAI_MODEL || "gpt-4.1-mini",
      prompt_version: "smoke-test",
      created_by: userId,
      approved_by: userId,
      approved_at: new Date().toISOString()
    },
    "id,status"
  );
  cleanup.scenarioId = scenario.id;
  step(`Created approved scenario ${scenario.id}`);

  const session = await insertOne(
    authed,
    "sessions",
    {
      scenario_id: scenario.id,
      instructor_id: userId,
      mode: "exam",
      current_stage: "stable",
      current_vitals_json: {
        hr: 118,
        rr: 26,
        spo2: 94,
        bp_sys: 104,
        bp_dia: 66,
        temp_c: 36.8,
        pain_0_10: 8
      }
    },
    "id,started_at"
  );
  cleanup.sessionId = session.id;
  step(`Started session ${session.id}`);

  await insertMany(authed, "events", [
    {
      session_id: session.id,
      type: "note",
      payload_json: { message: "Smoke test session started." }
    },
    {
      session_id: session.id,
      type: "score_mark",
      payload_json: { rubric_action: "Control massive hemorrhage", mark: "correct", source: "smoke-test" }
    },
    {
      session_id: session.id,
      type: "patient_change",
      payload_json: {
        stage: "stable",
        reason: "Bleeding visibly slows after simulated intervention.",
        vitals: {
          hr: 108,
          rr: 24,
          spo2: 95,
          bp_sys: 110,
          bp_dia: 70,
          temp_c: 36.8,
          pain_0_10: 7
        }
      }
    }
  ]);
  step("Inserted session events");

  await updateRows(
    authed,
    "sessions",
    {
      current_stage: "stable",
      current_vitals_json: {
        hr: 108,
        rr: 24,
        spo2: 95,
        bp_sys: 110,
        bp_dia: 70,
        temp_c: 36.8,
        pain_0_10: 7
      },
      ended_at: new Date().toISOString()
    },
    "id",
    session.id
  );

  await insertOne(
    authed,
    "scores",
    {
      session_id: session.id,
      rubric_version: "smoke-test",
      score_json: {
        total_possible: 20,
        total_awarded: 19,
        critical_actions: [
          {
            action: "Control massive hemorrhage",
            elapsed_sec: 45,
            status: "met",
            must_occur_by_sec: 60
          }
        ],
        mark_details: [
          {
            action: "Control massive hemorrhage",
            mark: "correct",
            notes: "Smoke test mark."
          }
        ],
        remediation_points: []
      },
      final_by: userId,
      final_at: new Date().toISOString()
    },
    "id"
  );
  step("Inserted final score and ended session");

  const verify = await authed
    .from("sessions")
    .select("id,current_stage,ended_at")
    .eq("id", session.id)
    .single();

  if (verify.error || !verify.data?.ended_at) {
    fail(`Session verification failed: ${verify.error?.message || "ended_at missing"}`);
  }

  step("Verified authenticated readback through RLS");
  console.log("\nSmoke test result: PASS");
  console.log(`User: ${smokeEmail}`);
  console.log(`CONOP: ${cleanup.conopId}`);
  console.log(`Scenario: ${cleanup.scenarioId}`);
  console.log(`Session: ${cleanup.sessionId}`);
  console.log(`Reachability: ${appBaseUrl}`);
} finally {
  await cleanupArtifacts(cleanup);
}

async function ensureSmokeUser() {
  const users = [];
  let page = 1;

  while (true) {
    const response = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (response.error) {
      fail(`Failed to list users: ${response.error.message}`);
    }
    users.push(...(response.data.users || []));
    if (!response.data.users?.length || response.data.users.length < 200) {
      break;
    }
    page += 1;
  }

  const existing = users.find((item) => item.email?.toLowerCase() === smokeEmail.toLowerCase());
  if (existing) {
    return existing.id;
  }

  const created = await admin.auth.admin.createUser({
    email: smokeEmail,
    password: smokePassword,
    email_confirm: true
  });

  if (created.error || !created.data.user) {
    fail(`Failed to create smoke user: ${created.error?.message || "unknown error"}`);
  }

  step(`Created smoke user ${smokeEmail}`);
  return created.data.user.id;
}

async function fetchStatus(url) {
  const response = await fetch(url, { redirect: "manual" });
  return response.status;
}

async function insertOne(client, table, payload, select) {
  const result = await client.from(table).insert(payload).select(select).single();
  if (result.error) {
    fail(`Insert into ${table} failed: ${result.error.message}`);
  }
  return result.data;
}

async function insertMany(client, table, payload) {
  const result = await client.from(table).insert(payload);
  if (result.error) {
    fail(`Insert into ${table} failed: ${result.error.message}`);
  }
}

async function updateRows(client, table, values, column, equals) {
  const result = await client.from(table).update(values).eq(column, equals);
  if (result.error) {
    fail(`Update ${table} failed: ${result.error.message}`);
  }
}

async function cleanupArtifacts(ids) {
  if (ids.sessionId) {
    await admin.from("scores").delete().eq("session_id", ids.sessionId);
    await admin.from("events").delete().eq("session_id", ids.sessionId);
    await admin.from("sessions").delete().eq("id", ids.sessionId);
  }
  if (ids.scenarioId) {
    await admin.from("scenarios").delete().eq("id", ids.scenarioId);
  }
  if (ids.conopId) {
    await admin.from("conops").delete().eq("id", ids.conopId);
  }
}

function loadEnvFile(file) {
  const path = resolve(process.cwd(), file);
  const values = { ...process.env };

  if (!existsSync(path)) {
    return values;
  }

  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const equals = line.indexOf("=");
    if (equals === -1) {
      continue;
    }
    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function step(message) {
  console.log(`- ${message}`);
}

function fail(message) {
  console.error(`Smoke test failed: ${message}`);
  process.exit(1);
}
