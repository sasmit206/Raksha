import docker
import time
import threading
import random
import uuid
from typing import Callable
from datetime import datetime

class SimulationService:
    def __init__(self):
        self.active_containers = {}
        self.image_name = "raksha-target:latest"
        self._init_docker()
        
    def _init_docker(self):
        try:
            self.client = docker.from_env()
            self.client.ping()
            self._build_image()
            return True
        except Exception as e:
            self.client = None
            return False

    def get_client(self):
        if self.client is None:
            self._init_docker()
        return self.client
        
    def _build_image(self):
        if not self.get_client():
            return
        
        # Build an image with real services: sshd, rsyslog, sudo
        dockerfile = r'''
FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server rsyslog sudo sshpass curl procps net-tools
RUN mkdir -p /var/run/sshd
RUN useradd -m -s /bin/bash admin && echo "admin:password" | chpasswd
RUN echo "admin ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
# Script to start services
RUN echo '#!/bin/bash\n/usr/sbin/rsyslogd\n/usr/sbin/sshd -D\n' > /start.sh && chmod +x /start.sh
CMD ["/start.sh"]
'''
        from io import BytesIO
        f = BytesIO(dockerfile.encode('utf-8'))
        try:
            print("Building custom Docker image with sshd and rsyslog...")
            self.get_client().images.build(fileobj=f, rm=True, tag=self.image_name)
            print("Image built successfully.")
        except Exception as e:
            print(f"Failed to build image: {e}")

    def start_vm(self, vm_id: str = "Raksha-Ubuntu"):
        if not self.get_client():
            print("Docker not available, running in mock mode.")
            return True
            
        try:
            container = self.get_client().containers.run(
                self.image_name,
                name=vm_id,
                detach=True,
                auto_remove=True,
                privileged=True
            )
            self.active_containers[vm_id] = container
            # Wait for services to start
            time.sleep(3)
            return True
        except Exception as e:
            print(f"Failed to start VM: {e}")
            return False

    
    def deploy_fim_agent(self, vm_id: str):
        """Deploys a File Integrity Monitoring agent script into the VM."""
        if not self.client or vm_id not in self.active_containers:
            return
            
        script = '''#!/bin/sh
        # FIM Agent
        echo "Starting File Integrity Monitor..."
        while true; do
            CURRENT_HASH=$(sha256sum /etc/shadow | awk '{print $1}')
            if [ "$CURRENT_HASH" != "$EXPECTED_HASH" ] && [ -n "$EXPECTED_HASH" ]; then
                logger -t FILE "FIM ALERT: /etc/shadow hash mismatch detected! Unauthorized modification."
            fi
            EXPECTED_HASH=$CURRENT_HASH
            sleep 2
        done
        '''
        # Write script to container
        cmd = f"sh -c \"echo '{script}' > /usr/local/bin/fim_agent.sh && chmod +x /usr/local/bin/fim_agent.sh && nohup /usr/local/bin/fim_agent.sh &\""
        self.run_command(vm_id, cmd)

    def stop_vm(self, vm_id: str):
        if vm_id in self.active_containers:
            try:
                self.active_containers[vm_id].stop()
                del self.active_containers[vm_id]
            except:
                pass

    def run_command(self, vm_id: str, cmd: str):
        if vm_id in self.active_containers:
            try:
                res = self.active_containers[vm_id].exec_run(cmd)
                return res
            except Exception as e:
                return None
        return None

    def get_container_ip(self, vm_id: str):
        if vm_id in self.active_containers:
            try:
                self.active_containers[vm_id].reload()
                return self.active_containers[vm_id].attrs['NetworkSettings']['IPAddress']
            except:
                pass
        return "127.0.0.1"

    def execute_real_attack_sequence(self, vm_id: str):
        """
        Executes real attacks against the services in the container.
        This generates real logs instead of mocked JSON.
        """
        if not self.client or vm_id not in self.active_containers:
            return
            
        ip = self.get_container_ip(vm_id)
        
        # 1. AUTH: SSH Brute Force (Failed login)
        print("Executing AUTH attack (failed SSH)...")
        for _ in range(3):
            # Run sshpass from the host (if installed) or from within the container itself using another process
            self.run_command(vm_id, f"sshpass -p 'wrongpass' ssh -o StrictHostKeyChecking=no admin@localhost echo 'test'")
            time.sleep(0.5)
            
        # 2. PROCESS: Suspicious process execution
        print("Executing PROCESS attack...")
        self.run_command(vm_id, "sh -c 'logger -t PROCESS \"cp /bin/ls /tmp/suspicious_binary\"'")
        self.run_command(vm_id, "sh -c 'cp /bin/ls /tmp/suspicious_binary && /tmp/suspicious_binary'")
        time.sleep(1)
        
        # 3. PRIVILEGE: Privilege escalation attempt
        print("Executing PRIVILEGE attack...")
        self.run_command(vm_id, "sudo su -c 'logger -t PRIVILEGE \"User admin switched to root\"'")
        self.run_command(vm_id, "sudo -l")
        time.sleep(1)
        
        # 4. FILE: Accessing protected files
        print("Executing FILE attack...")
        self.run_command(vm_id, "sh -c 'logger -t FILE \"Unauthorized read of /etc/shadow\"'")
        self.run_command(vm_id, "sudo cat /etc/shadow")
        time.sleep(1)
        
        # 5. NETWORK: Suspicious outbound network
        print("Executing NETWORK attack...")
        self.run_command(vm_id, "sh -c 'logger -t NETWORK \"Outbound connection to malicious IP 192.168.100.50\"'")
        self.run_command(vm_id, "curl -s http://example.com > /dev/null")
        time.sleep(1)

    def inject_honeytoken(self, vm_id: str, filename: str, data: bytes):
        """Injects an encrypted honeytoken file into the VM."""
        if not self.client or vm_id not in self.active_containers:
            print(f"Mock Mode: Honeytoken '{filename}' deployed to virtual environment.")
            return True
            
        try:
            import tarfile
            import io
            
            tar_stream = io.BytesIO()
            tar = tarfile.TarFile(fileobj=tar_stream, mode='w')
            
            tarinfo = tarfile.TarInfo(name=filename)
            tarinfo.size = len(data)
            tarinfo.mtime = int(time.time())
            
            tar.addfile(tarinfo, io.BytesIO(data))
            tar.close()
            tar_stream.seek(0)
            
            # Place it in /home/admin
            self.active_containers[vm_id].put_archive("/home/admin/", tar_stream)
            print(f"Real Mode: Honeytoken '{filename}' injected into /home/admin/ in {vm_id}")
            return True
        except Exception as e:
            print(f"Failed to inject honeytoken: {e}")
            return False

    def execute_honeytoken_attack(self, vm_id: str, filename: str):
        """Simulates an attacker attempting to read or exfiltrate the honeytoken."""
        if not self.client or vm_id not in self.active_containers:
            print(f"Mock Mode: Simulating attack on honeytoken '{filename}'")
            return
            
        print(f"Executing Honeytoken attack on {filename}...")
        self.run_command(vm_id, f"sh -c 'logger -t FILE \"CRITICAL: Unauthorized read of honeytoken /home/admin/{filename}\"'")
        self.run_command(vm_id, f"cat /home/admin/{filename} > /dev/null")
        # Attacker tries to send the encrypted file out
        self.run_command(vm_id, f"sh -c 'logger -t NETWORK \"CRITICAL: High-entropy data exfiltration detected (Honeytoken)\"'")
