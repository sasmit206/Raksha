import docker
import time
import uuid
import re
from datetime import datetime
import threading

class TelemetryCollector:
    def __init__(self, vm_id="RAKSHA-01"):
        self.vm_id = vm_id
        try:
            self.client = docker.from_env()
        except:
            self.client = None
        self.running = False
        self.events_collected = []
        
    def _parse_auth_log(self, line):
        line = line.strip()
        if not line: return None
        
        # Simple syslog/auth parsing
        # Example: Oct  5 09:30:00 RAKSHA-01 sshd[123]: Failed password for admin from 127.0.0.1 port 54321 ssh2
        
        evt = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "vm_id": self.vm_id,
            "raw_event": line,
            "anomaly_score": 0.0,
            "user": "unknown",
            "process": "unknown"
        }
        
        if "Failed password" in line or "Invalid user" in line:
            evt["source"] = "AUTH"
            evt["event_type"] = "authentication_failure"
            evt["severity"] = "high"
            if "admin" in line: evt["user"] = "admin"
            return evt
        elif "sudo" in line and "COMMAND=" in line:
            evt["source"] = "PRIVILEGE"
            evt["event_type"] = "sudo_execution"
            evt["severity"] = "critical" if "root" in line else "medium"
            return evt
        elif "session opened for user root" in line:
            evt["source"] = "PRIVILEGE"
            evt["event_type"] = "root_session_opened"
            evt["severity"] = "critical"
            return evt
            
        return None

    def _parse_syslog(self, line):
        line = line.strip()
        if not line: return None
        
        evt = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "vm_id": self.vm_id,
            "raw_event": line,
            "anomaly_score": 0.0,
            "user": "unknown",
            "process": "unknown"
        }
        
        if "PROCESS" in line:
            evt["source"] = "PROCESS"
            evt["event_type"] = "unusual_process_activity"
            evt["severity"] = "critical"
            return evt
        elif "FILE" in line:
            evt["source"] = "FILE"
            evt["event_type"] = "shadow_file_access"
            evt["severity"] = "critical"
            return evt
        elif "NETWORK" in line:
            evt["source"] = "NETWORK"
            evt["event_type"] = "outbound_c2_connection"
            evt["severity"] = "high"
            return evt
            
        return None

    def collect_logs(self, state_dict):
        """
        Polls the container for logs and appends them to the in-memory state dictionary.
        """
        if not self.client: return
        try:
            container = self.client.containers.get(self.vm_id)
        except Exception as e:
            print(f"Collector could not find container {self.vm_id}")
            return
            
        auth_lines_read = 0
        syslog_lines_read = 0
        self.running = True
        
        print(f"Started telemetry collection for {self.vm_id}")
        
        while self.running:
            try:
                # Read auth.log
                auth_res = container.exec_run("cat /var/log/auth.log")
                if auth_res.exit_code == 0:
                    auth_content = auth_res.output.decode('utf-8', errors='ignore').splitlines()
                    for line in auth_content[auth_lines_read:]:
                        parsed = self._parse_auth_log(line)
                        if parsed:
                            state_dict["telemetry"].append(parsed)
                            state_dict["events_collected"] += 1
                            state_dict["session_delta"] += 1
                    auth_lines_read = len(auth_content)

                # Read syslog
                sys_res = container.exec_run("cat /var/log/syslog")
                if sys_res.exit_code == 0:
                    sys_content = sys_res.output.decode('utf-8', errors='ignore').splitlines()
                    for line in sys_content[syslog_lines_read:]:
                        parsed = self._parse_syslog(line)
                        if parsed:
                            state_dict["telemetry"].append(parsed)
                            state_dict["events_collected"] += 1
                            state_dict["session_delta"] += 1
                    syslog_lines_read = len(sys_content)
                    
            except Exception as e:
                pass
            time.sleep(1)
            
    def start_collection_thread(self, state_dict):
        t = threading.Thread(target=self.collect_logs, args=(state_dict,))
        t.daemon = True
        t.start()
        return t
        
    def stop(self):
        self.running = False
