import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export interface CredentialVault {
  read(): Record<string, string>;
  write(keys: Record<string, string>): void;
}

// Only ciphertext reaches disk. Secrets travel on stdin, never process arguments.
// DPAPI binds decryption to the Windows account. No plaintext fallback is allowed.
export function windowsCredentialVault(
  file: string,
): CredentialVault | undefined {
  if (process.platform !== "win32") return undefined;
  const shell = path.join(
    process.env.SystemRoot ?? "C:\\Windows",
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe",
  );
  const transform = (value: string, decrypt: boolean) => {
    const operation = decrypt
      ? "[Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($v),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))"
      : "[Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($v),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))";
    try {
      return execFileSync(
        shell,
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Security; $v=[Console]::In.ReadToEnd(); [Console]::Out.Write(" +
            operation +
            ")",
        ],
        {
          input: value,
          encoding: "utf8",
          windowsHide: true,
          timeout: 15000,
          stdio: ["pipe", "pipe", "pipe"],
          maxBuffer: 1024 * 1024,
        },
      );
    } catch {
      throw Error(
        "Windows could not unlock or save provider keys. No plaintext copy was saved.",
      );
    }
  };
  return {
    read() {
      if (!fs.existsSync(file)) return {};
      try {
        const value = JSON.parse(
          transform(fs.readFileSync(file, "utf8"), true),
        );
        if (
          !value ||
          Array.isArray(value) ||
          typeof value !== "object" ||
          Object.values(value).some(
            (v) => typeof v !== "string" || v.length > 1000,
          )
        )
          throw Error();
        return value;
      } catch {
        throw Error(
          "Saved provider keys could not be unlocked by this Windows account.",
        );
      }
    },
    write(keys) {
      const encrypted = transform(JSON.stringify(keys), false);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file + ".tmp", encrypted, { mode: 0o600 });
      fs.renameSync(file + ".tmp", file);
    },
  };
}
