import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { argv, exit } from "node:process";
import { createHash } from "node:crypto";

const NEW_FILE_CONTENT_EXIT_CODE = 8;

const fileName = `/secrets/${argv[2]}`;
const secretId = argv[3];

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

const generateFileChecksum = (file) => {
  try {
    const data = readFileSync(file, "utf8");
    return createHash("sha1").update(data, "utf8").digest("hex");
  } catch {
    return "";
  }
};

const syncSecret = async () => {
  const command = new GetSecretValueCommand({
    SecretId: secretId,
  });

  const result = await client.send(command);
  unlinkSync(fileName);
  writeFileSync(fileName, result.SecretString, { encoding: "utf8" });
};

const checksumBefore = generateFileChecksum(fileName);
syncSecret()
  .then(() => {
    const checksumAfter = generateFileChecksum(fileName);
    if (checksumBefore === checksumAfter) {
      console.log(`Synced file ${fileName} with no checksum change`);
      exit(0);
    } else {
      console.log(`Synced file ${fileName} with checksum change`);
      exit(NEW_FILE_CONTENT_EXIT_CODE);
    }
  })
  .catch((e) => {
    console.error(`Syncing caused an error: ${fileName}`, e);
    try {
      unlinkSync(fileName);
    } catch {}
    process.exit(NEW_FILE_CONTENT_EXIT_CODE);
  });
