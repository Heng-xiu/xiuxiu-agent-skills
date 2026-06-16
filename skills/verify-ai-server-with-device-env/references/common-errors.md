# Common Errors and Fixes

## GPU Not Visible in Container

### Symptoms
- `RuntimeError: Found no NVIDIA driver on your system.`
- `RuntimeError: No CUDA GPUs are available`
- `UserWarning: Can't initialize NVML`

### Cause
The container does not have GPU access. Most commonly caused by missing `runtime: nvidia` in the compose file.

### Fix
Add both `runtime: nvidia` and `deploy.resources` to the service in the compose file:
```yaml
runtime: nvidia
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

---

## Model Not Found (Local Files Only Mode)

### Symptoms
```
huggingface_hub.errors.LocalEntryNotFoundError: Cannot find the requested files in the disk cache
and outgoing traffic has been disabled. To enable hf.co look-ups and downloads online, set
'local_files_only' to False.
```
`[ModelLoadPlan]` log shows `"hf_local_files_only": true` and no local checkpoint file exists.

### Cause
The compose file hardcodes `SURGERY_HF_LOCAL_FILES_ONLY: "true"` (or equivalent), but no model files are mounted into the container.

### Fix — Option A: Allow HuggingFace download
Change in compose file:
```yaml
SURGERY_HF_LOCAL_FILES_ONLY: "false"
```
Remove or point `SURGERY_MODEL_DIR` to a non-existent path so the code falls back to HF download.

### Fix — Option B: Mount local model files
```bash
# Transfer model files to remote
rsync -avz -e "ssh -p <PORT>" ./models/surgery_pred_model/ <USER>@<HOST>:~/surgery_pred_model/

# Run with the mounted volume
SURGERY_MODEL_DIR=~/surgery_pred_model docker compose up <SERVICE>
```

---

## HuggingFace 401 Unauthorized

### Symptoms
```
huggingface_hub.errors.RepositoryNotFoundError: 401 Client Error
```
Or similar 401/403 error from HuggingFace Hub during checkpoint download.

### Cause
The checkpoint repository is private and requires authentication.

### Fix
Add a HuggingFace token to the compose environment:
```yaml
environment:
  HUGGING_FACE_HUB_TOKEN: hf_xxxxxxxxxxxxxxxxxxxx
```
Or pass it at runtime:
```bash
HUGGING_FACE_HUB_TOKEN=hf_xxx docker compose up <SERVICE>
```

---

## Docker NVIDIA Runtime Not Installed

### Symptoms
`docker info | grep -i nvidia` returns nothing, or:
```
docker: Error response from daemon: unknown or invalid runtime name: nvidia
```

### Cause
`nvidia-container-toolkit` is not installed or not registered with Docker.

### Fix
Install and configure on the host (Ubuntu/Debian):
```bash
# Install toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
# Follow NVIDIA Container Toolkit installation guide for your distro

# Register with Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

---

## SSH Key Auth Fails (Password Required)

### Symptom
`ssh -o BatchMode=yes ...` returns `Permission denied (publickey)` or `Host key verification failed`.

### Workaround
Switch to instruction-generation mode (Mode C). Prefix any command with `! ` in the chat to run it in your terminal and return the output here. Example:
```
! nvidia-smi
```
