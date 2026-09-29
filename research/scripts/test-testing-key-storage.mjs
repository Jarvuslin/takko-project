import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const folder=path.resolve('.forge/credential-storage-test-'+Date.now());
fs.mkdirSync(folder,{recursive:true});
const target=path.join(folder,'synthetic.dpapi');
const ps='pwsh.exe';
for(const value of ['synthetic-credential-one','synthetic-credential-replacement']){
 const output=execFileSync(ps,['-NoProfile','-NonInteractive','-File',path.resolve('research/scripts/save-testing-key.ps1'),'-TargetPath',target],{input:value,encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe']});
 const result=JSON.parse(output);assert.equal(result.saved,true);assert.equal(result.roundTripVerified,true);
 assert.ok(!fs.readFileSync(target,'utf8').includes(value));assert.ok(!output.includes(value));
}
const rules=JSON.parse(execFileSync(ps,['-NoProfile','-NonInteractive','-Command',`$taskAcl=Get-Acl -LiteralPath '${target.replaceAll("'","''")}'; @{protected=$taskAcl.AreAccessRulesProtected;rules=@($taskAcl.Access).Count;ownerMatches=($taskAcl.Access[0].IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -eq [Security.Principal.WindowsIdentity]::GetCurrent().User.Value)} | ConvertTo-Json -Compress`],{encoding:'utf8',windowsHide:true}));
assert.deepEqual(rules,{protected:true,rules:1,ownerMatches:true});
fs.unlinkSync(target);fs.rmdirSync(folder);
console.log('PASS encrypted creation and replacement, round-trip verification, no plaintext output, current-user-only ACL. Synthetic test only.');
