---
name: verify-ai-server-with-device-env
description: "Verify that a Dockerized AI inference server can run on a target GPU device. Use when the user wants to check GPU/CUDA environment compatibility, test if a Docker image can access the GPU, audit docker-compose GPU config, or confirm a deployed AI server is healthy and returning valid predictions. Triggers on phrases like 'check GPU env', 'will my server work on this machine', 'verify AI server', 'CUDA compatibility check', or 'test inference server on remote'."
---

# Verify AI Server with Device Environment

Act as a systematic environment verifier that checks whether a Dockerized AI inference server can run correctly on a target GPU machine. Work through four stages in order: host environment, image GPU access, compose configuration, and service health.

Before verifying, read `references/gpu-environment.md` for CUDA compatibility rules and Docker GPU config patterns. Read `references/common-errors.md` when a stage fails.

## Capabilities and Boundaries

Can help:

- Check host GPU driver and CUDA version compatibility against a container's CUDA runtime.
- Verify Docker NVIDIA runtime availability.
- Audit docker-compose GPU configuration.
- Test whether a container image can access the GPU.
- Confirm model loading and API health after service startup.
- Diagnose and fix common GPU pass-through and model-loading errors.

Cannot help:

- Set up or install NVIDIA drivers on the host.
- Build or modify Docker images.
- Resolve HuggingFace private repo access without a token from the user.

## Stage Overview

```text
connection established
  -> S1 Host environment check (driver, CUDA version, Docker nvidia runtime)
  -> S2 Image GPU access test (run container with --gpus all)
  -> S3 Compose GPU config audit (runtime: nvidia + deploy.resources)
  -> S4 Service startup and API health (model load logs + health + predict)
  -> Final report
```

## Connection Mode — Resolve Before Anything Else

Before entering S1, determine how to execute commands on the target machine.

Ask the user if not provided:
- **Target**: local machine or remote (host, port, user)?
- **Compose file path** on the target machine.
- **Service name** in the compose file.
- **Test payload** (optional): JSON body for the predict endpoint. Skip predict test if not provided.

Then test the connection mode:

**Mode A — Local**: run all commands directly via Bash tool.

**Mode B — Remote, key auth**: test with:
```bash
ssh -o BatchMode=yes -o ConnectTimeout=5 -p <PORT> <USER>@<HOST> "echo ok" 2>&1
```
If `ok` is returned, run all subsequent commands via:
```bash
ssh -o StrictHostKeyChecking=no -p <PORT> <USER>@<HOST> "<COMMAND>"
```

**Mode C — Remote, password auth** (key test fails): switch to instruction-generation mode. Output each command as a copy-paste block. Remind the user that prefixing a command with `! ` in this chat runs it in their terminal and returns output here.

---

## S1 — Host Environment Check

Read `references/gpu-environment.md` (CUDA compatibility table) before evaluating the output.

Run or generate:
```bash
nvidia-smi && echo "---" && docker info | grep -i nvidia && echo "---" && (nvidia-container-toolkit --version 2>/dev/null || nvidia-ctk --version 2>/dev/null)
```

Evaluate:
- `nvidia-smi` shows output → GPU present and driver loaded.
- `Runtimes:` line includes `nvidia` → Docker NVIDIA runtime installed.
- Host CUDA version ≥ container CUDA version → forward-compatible (newer driver supports older CUDA image).

If any check fails, stop here, report the blocker, and suggest a fix from `references/common-errors.md`. Do not proceed to S2.

---

## S2 — Image GPU Access Test

Extract the image name from the compose file. Run or generate:
```bash
docker run --rm --gpus all \
  <IMAGE_NAME> \
  python -c "import torch; print(torch.cuda.is_available(), torch.version.cuda, torch.cuda.get_device_name(0))"
```

Pass condition: output starts with `True`.

If this fails while S1 passed, the issue is almost always a missing GPU config in the compose file — proceed to S3 to confirm.

---

## S3 — Compose GPU Config Audit

Read the compose file (fetch via ssh cat or ask the user to paste it).

Check the AI server service for both of these blocks:

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

If either is missing, output the exact fix. For `runtime: nvidia`, it must be at the same indentation level as `image:` and `restart:`. See `references/gpu-environment.md` for the full correct structure.

---

## S4 — Service Startup and API Health

**This step always requires the user to run the command in their terminal** — log tailing is not suitable for background execution.

Provide the startup command (fill in the compose file path and service name):
```bash
SURGERY_ACCELERATOR=cuda \
docker compose -f <COMPOSE_FILE> up <SERVICE_NAME>
```

Ask the user to paste the log output. Look for these signals in order:

| Signal | Meaning |
|---|---|
| `[ModelLoadPlan]` with `"device": "cuda:0"` | Model loading started on GPU |
| `[ModelLoadPlan]` with `"hf_local_files_only": true` and no local files | Will fail — tell user to add `SURGERY_HF_LOCAL_FILES_ONLY=false` |
| `[ModelLoadCheckpointResolved]` | Checkpoint found (local or HF) |
| `[ModelLoadSuccess]` | Model loaded |
| `Swagger UI is available` | Server ready |
| `"GET /health HTTP/1.1" 200 OK` | Health check passing |

Once the service is up, run or generate:
```bash
# Health check
curl -s http://localhost:<PORT>/health

# Predict (if payload provided)
curl -s -X POST http://localhost:<PORT>/predict \
  -H "Content-Type: application/json" \
  -d '<PAYLOAD>' | python3 -m json.tool
```

If a failure occurs at any sub-step, read `references/common-errors.md` for the matching error pattern and provide the fix.

---

## Final Report

After all stages complete, output this report:

```
=== AI Server Environment Verification Report ===

Host:
  GPU:                   <model>
  Driver version:        <version>
  CUDA (host):           <version>
  Docker NVIDIA runtime: ✅ / ❌

Image:
  Image:                 <name>
  GPU visible:           ✅ / ❌
  CUDA (container):      <version>

Compose config:
  runtime: nvidia:       ✅ / ❌
  deploy.resources:      ✅ / ❌

Service:
  Model load source:     local / huggingface_hub
  Model loaded:          ✅ / ❌
  Health check:          ✅ / ❌
  Predict response:      ✅ / ❌ / skipped (no payload)

Verdict: <READY TO DEPLOY / BLOCKED — fix required: ...>
```
