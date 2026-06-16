# GPU Environment Reference

## CUDA Forward Compatibility

NVIDIA drivers are forward-compatible: a newer host driver supports older CUDA runtimes inside containers. A host with CUDA 13.x can run containers built for CUDA 12.x, 11.x, etc.

The container brings its own CUDA runtime libraries. The host only needs:
- A driver version ≥ the minimum required by the container's CUDA version.
- The NVIDIA Container Toolkit installed and registered with Docker.

### Minimum Driver Version per CUDA Runtime

| Container CUDA | Minimum Linux Driver |
|---|---|
| 12.8 | 525.60.13 |
| 12.4 | 525.60.13 |
| 12.0 | 525.60.13 |
| 11.8 | 450.80.02 |
| 11.0 | 450.36.06 |

If the host driver is below the minimum, the container cannot initialize CUDA.

---

## Docker Compose GPU Config — Correct Structure

Both `runtime: nvidia` and `deploy.resources.reservations.devices` are required for reliable GPU pass-through in Docker Compose.

```yaml
services:
  my-ai-server:
    image: my-image:tag
    container_name: my-ai-server
    restart: unless-stopped
    runtime: nvidia                     # ← required: tells Docker to use NVIDIA runtime
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all               # or: device_ids: ['0'] for a specific GPU
              capabilities: [gpu]
    ports:
      - "8080:8080"
    environment:
      NVIDIA_VISIBLE_DEVICES: all      # optional: explicit device visibility
```

### Why Both Are Needed

- `runtime: nvidia` ensures the NVIDIA container runtime is used when the container starts.
- `deploy.resources.reservations.devices` is the Compose v3 standard for GPU resource allocation; needed for `docker compose up` (as opposed to `docker run --gpus all`).

Using only `deploy.resources` without `runtime: nvidia` can produce `Can't initialize NVML` warnings and GPU invisibility in some Docker versions.

---

## Quick Verification Commands

### Host-level check (run on the host)
```bash
nvidia-smi
docker info | grep -i nvidia
nvidia-ctk --version 2>/dev/null || nvidia-container-toolkit --version 2>/dev/null
```

### Image-level check (test GPU visibility inside the container)
```bash
docker run --rm --gpus all <IMAGE> \
  python -c "import torch; print(torch.cuda.is_available(), torch.version.cuda, torch.cuda.get_device_name(0))"
```

Expected output: `True 12.8 NVIDIA GeForce RTX 4090`
