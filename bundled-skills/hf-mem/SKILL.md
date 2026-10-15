---
name: hf-mem
description: Hugging Face CLI to estimate the required memory to load Safetensors or GGUF model weights for inference from the Hugging Face Hub
risk: critical
source: https://github.com/huggingface/skills/tree/main/skills/hf-mem
source_repo: huggingface/skills
source_type: official
date_added: 2026-07-01
license: Apache-2.0
license_source: https://github.com/huggingface/skills/blob/main/LICENSE
---

`hf_mem` estimates the required memory for inference, including model weights and an optional KV cache, for Safetensors and GGUF for models on the Hugging Face Hub using HTTP Range requests i.e., without downloading or loading any weights locally.

## When to use?

- User asks how much VRAM or memory a model needs to run
- User wants to know if a model fits on their GPU or a given instance
- User references a Hugging Face model ID or URL and asks about inference requirements

## What are the requirements?

- `uv` installed (for `uvx`)
- `HF_TOKEN` from the host's private credential handling for gated/private repositories; avoid putting tokens in command arguments, logs or reports.
- A reviewed pinned `hf-mem` package version and permission to access the requested model metadata. This skill does not bundle the executable.

## How to run?

The angle-bracket and square-bracket forms below are usage notation, not shell commands to paste literally. Quote actual model IDs and file paths. Inspect the selected package's `--help`, choose a reviewed version (for example with `uvx --from "hf-mem==REVIEWED_VERSION" hf-mem ...`) and use a private cache where metadata is sensitive. Do not print credentials.


Run with `--model-id` pointing to the Hugging Face Hub repository which will check that it either contains Safetensors (via `model.safetensors`, `model.safetensors.index.json` if sharded, or `model_index.json` for Diffusers) or GGUF model weights within.

```bash
uvx hf-mem --model-id <model-id> --json-output
```

If the repository contains GGUF model weights in multiple precisions / quantizations, the estimations will be on a per-file basis, whereas for inference you won't load all of those but rather only a single precision. This being said, for GGUF you might as well need to provide `--gguf-file` to target the specific file (or path if sharded) you want to run.

```bash
uvx hf-mem --model-id <model-id> --gguf-file <file-or-path> --json-output
```

Additionally, `hf-mem` comes with an `--experimental` flag that will also calculate the KV cache memory requirements too, useful for large-language models, meaning it applies to LLMs (`...ForCausalLM`), VLMs (`...ForConditionalGeneration`), and GGUF models.

As per the context window, it will be read from the default or overridden with `--max-model-len` a la vLLM. And, same goes for the KV cache precision, which will default to the model precision unless manually set via `--kv-cache-dtype` a la vLLM too.

For Safetensors use as:

```bash
uvx hf-mem --model-id <model-id> --experimental [--max-model-len N] [--batch-size N] [--kv-cache-dtype auto|bfloat16|fp8|fp8_ds_mla|fp8_e4m3|fp8_e5m2|fp8_inc] --json-output
```

And, for GGUF use as:

```bash
uvx hf-mem --model-id <model-id> --gguf-file <file-or-path> --experimental [--max-model-len N] [--batch-size N] [--kv-cache-dtype auto|F32|F16|Q4_0|Q4_1|Q5_0|Q5_1|Q8_0|Q8_1|Q2_K|Q3_K|Q4_K|Q5_K|Q6_K|Q8_K|IQ2_XXS|IQ2_XS|IQ3_XXS|IQ1_S|IQ4_NL|IQ3_S|IQ2_S|IQ4_XS|I8|I16|I32|I64|F64|IQ1_M|BF16|TQ1_0|TQ2_0|MXFP4] --json-output
```

## Examples

For Transformers with Safetensors weights:

```bash
uvx hf-mem --model-id MiniMaxAI/MiniMax-M2 --json-output
```

For Diffusers with Safetensors weights:

```bash
uvx hf-mem --model-id Qwen/Qwen-Image --json-output
```

For Sentence Transformers with Safetensors weights:

```bash
uvx hf-mem --model-id google/embeddinggemma-300m --json-output
```

With `--experimental` to include the KV cache estimation for LLMs and VLMs:

```bash
uvx hf-mem --model-id mistralai/Mistral-7B-v0.1 --experimental --json-output
```

And, for LLMs or VLMs with GGUF weights:

```bash
uvx hf-mem --model-id unsloth/Qwen3.5-397B-A17B-GGUF --gguf-file Q4_K_M --experimental --json-output
```

## Limitations

- Use this skill only when the task clearly matches its upstream product or API scope.
- Verify commands, API behavior, pricing, quotas, credentials, and deployment effects against current official documentation before making changes.
- Do not treat generated examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.

## Interpretation and verification

Report the model revision, selected weight file or quantization, batch size, context length and KV-cache dtype alongside the estimate. Weight/header estimates are not a guarantee that a model fits: runtime workspaces, activations, allocator fragmentation, offloading and concurrent processes add memory. Confirm with the intended inference backend on target hardware before making a purchase or deployment decision. HTTP metadata access still contacts the Hub and can reveal private model identifiers; it does not run inference. Experimental KV estimates depend on supported architectures.
