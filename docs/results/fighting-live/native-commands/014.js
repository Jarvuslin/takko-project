fs.copyFileSync(path.join(output,"ledger.json"),path.join(output,"ledger-first-app.json"));
stop();
return {stoppedOwnedTestApp:true};
