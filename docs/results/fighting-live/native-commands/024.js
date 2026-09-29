fs.copyFileSync(path.join(output,"ledger.json"),path.join(output,"ledger-second-app.json"));
stop();
return {stoppedOwnedTestApp:true};
