from pathlib import Path
import subprocess,sys
p=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else p.parent/'Ally_Quest_Welcome_Street_25.html'
subprocess.run([sys.executable,str(p/'stage18-campaign.py')],check=True)
subprocess.run([sys.executable,str(p/'build.py'),str(p/'welcome-street-25.json'),str(out)],check=True)
