from pathlib import Path
import subprocess,sys,json,os
p=Path(__file__).resolve().parent; q=p/'qa';q.mkdir(exist_ok=True)
commands=[('production_qa.py','production-results.json',4),('stage16_qa.py','stage16-results.json',11),('smoke.py','smoke.json',9),('navigation_qa.py','navigation-results.json',9),('crew_qa.py','crew-results.json',12),('simulation_qa.py','allergy-results.json',11),('campaign_qa.py','campaign-results.json',17)]
for script,report,expected in commands:
 path=q/report;path.unlink(missing_ok=True);subprocess.run([sys.executable,str(p/script)],cwd=p,check=True);data=json.loads(path.read_text());rows=data if isinstance(data,list) else [data];fail=[e for r in rows for e in r.get('errors',[])];n=sum(len(r.get('passed',[])) for r in rows);print(f'{script}: {n} passes, {len(fail)} errors',flush=True);assert not fail and n>=expected,(script,n,expected,fail)
