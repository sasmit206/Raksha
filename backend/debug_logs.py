import docker
import time
from app.services.simulation_service import SimulationService

def test():
    sim = SimulationService()
    sim.start_vm("TEST-VM")
    print("Executing attacks...")
    sim.execute_real_attack_sequence("TEST-VM")
    time.sleep(3)
    
    print("--- AUTH LOG ---")
    res = sim.run_command("TEST-VM", "cat /var/log/auth.log")
    print(res.output.decode('utf-8', errors='ignore') if res else "No auth.log")
    
    print("--- SYSLOG ---")
    res = sim.run_command("TEST-VM", "cat /var/log/syslog")
    print(res.output.decode('utf-8', errors='ignore') if res else "No syslog")
    
    sim.stop_vm("TEST-VM")

if __name__ == "__main__":
    test()
