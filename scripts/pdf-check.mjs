import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";

const resumes = [
  "assets/Cory_Ebert_LinkedIn_General_ATS.pdf",
  "assets/Cory_Ebert_Smartsheet_Product_Operations_ATS.pdf",
  "assets/Cory_Ebert_Smartsheet_AI_Automation_ATS.pdf",
  "assets/Cory_Ebert_Microsoft_All_Roles_ATS.pdf"
];

const requiredText = [
  "CORY EBERT",
  "coryebert@outlook.com",
  "Portfolio: coryebert.com",
  "Microsoft",
  "Corporate Imaging Concepts"
];

const failures = [];

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" });
  } catch (error) {
    const detail = error.stderr || error.message;
    failures.push(`${command} ${args.join(" ")} failed: ${detail.trim()}`);
    return "";
  }
}

for (const resume of resumes) {
  const info = run("pdfinfo", [resume]);
  const text = run("pdftotext", [resume, "-"]);
  const size = statSync(resume).size;

  if (!/Tagged:\s+yes/.test(info)) {
    failures.push(`${resume}: PDF is not tagged`);
  }

  if (/Encrypted:\s+yes/.test(info)) {
    failures.push(`${resume}: PDF should not be encrypted`);
  }

  if (size > 200_000) {
    failures.push(`${resume}: PDF is unexpectedly large for an ATS resume (${size} bytes)`);
  }

  for (const token of requiredText) {
    if (!text.includes(token)) {
      failures.push(`${resume}: extracted text missing "${token}"`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("PDF accessibility and ATS text checks passed.");
