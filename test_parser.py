from backend.app.services.telemetry_collector import TelemetryCollector

tc = TelemetryCollector()
line = 'Oct  9 11:00:00 hostname FILE: Honeytoken filename.enc successfully deployed'
evt = tc._parse_syslog(line)
print("Parsed event:", evt)
