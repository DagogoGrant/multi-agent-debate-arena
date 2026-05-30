import sys

def patch():
    with open("backend/main.py", "r") as f:
        lines = f.readlines()
        
    start_idx = -1
    for i, l in enumerate(lines):
        if "transcript = []" in l:
            start_idx = i
            break
            
    end_idx = -1
    for i, l in enumerate(lines):
        if "yield {\"event\": \"complete\", \"data\": \"Debate finalized.\"}" in l:
            end_idx = i
            break
            
    if start_idx == -1 or end_idx == -1:
        print("Could not find start/end")
        return
        
    # Indent everything from start_idx+1 to end_idx-1
    for i in range(start_idx + 1, end_idx):
        if lines[i].strip() != "" and not lines[i].startswith("        # Save to history database"):
            lines[i] = "    " + lines[i]
            
    # Insert try block
    lines.insert(start_idx + 1, "        try:\n")
    
    # Replace the old save block with a finally block
    save_block_start = -1
    for i, l in enumerate(lines):
        if "        # Save to history database instead of local files" in l:
            save_block_start = i
            break
            
    if save_block_start != -1:
        lines[save_block_start] = "        finally:\n            if transcript:\n                # Save partial or full debate to history database\n"
        for i in range(save_block_start + 1, end_idx + 1): # end_idx shifted by 1 because of insert
            if lines[i].strip() != "":
                lines[i] = "            " + lines[i].lstrip()
                
    with open("backend/main.py", "w") as f:
        f.writelines(lines)
        
patch()
