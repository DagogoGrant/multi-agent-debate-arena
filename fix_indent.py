with open("backend/main.py", "r") as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "from database import SessionLocal" in lines[i] and "if transcript:" in lines[i-1]:
        start = i
        break
        
# Fix indentation manually
lines[start] = "                from database import SessionLocal\n"
lines[start+1] = "                db = SessionLocal()\n"
lines[start+2] = "                try:\n"
lines[start+3] = "                    db_session = models.DebateSession(\n"
lines[start+4] = "                        user_id=current_user.id,\n"
lines[start+5] = "                        topic=config.topic,\n"
lines[start+6] = "                        transcript=json.dumps(transcript)\n"
lines[start+7] = "                    )\n"
lines[start+8] = "                    db.add(db_session)\n"
lines[start+9] = "                    db.commit()\n"
lines[start+10] = "                except Exception as e:\n"
lines[start+11] = "                    print(\"Failed to save debate to DB:\", e)\n"
lines[start+12] = "                finally:\n"
lines[start+13] = "                    db.close()\n"

with open("backend/main.py", "w") as f:
    f.writelines(lines)
