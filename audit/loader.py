"""Simple loader for an audit LORA adapter.

This loader tries to load a base model and apply a PEFT LORA adapter
from `lora_dir`. It falls back to CPU if CUDA isn't available.

Note: installing `transformers`, `peft` and optionally `bitsandbytes`
will improve performance. This loader accepts a `base_model` string
(eg. a Hugging Face model id) and a local `lora_dir` containing adapter
weights.
"""

import os
import torch


def load_audit_model(lora_dir, base_model=None, device=None, use_8bit=True):
    """Load tokenizer and model, applying a PEFT LORA adapter if present.

    Args:
        lora_dir (str): Path to the LORA adapter folder (from HF/PEFT).
        base_model (str|None): Base model id or path. If None, caller must supply.
        device (str|None): 'cuda' or 'cpu'. If None tries cuda then cpu.
        use_8bit (bool): If True and CUDA available, attempt 8-bit load.

    Returns:
        (tokenizer, model, device)
    """
    if lora_dir is None:
        raise ValueError("lora_dir must be provided")

    device = device or ("cuda" if torch.cuda.is_available() else "cpu")

    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
    except Exception as e:
        raise RuntimeError("Please install the 'transformers' package to load models") from e

    try:
        from peft import PeftModel
    except Exception:
        PeftModel = None

    if base_model is None:
        raise ValueError("base_model must be provided (e.g. a Hugging Face model id)")

    tokenizer = AutoTokenizer.from_pretrained(base_model, use_fast=True)

    # Build kwargs depending on device and availability of bitsandbytes
    kwargs = {}
    try:
        if device == "cuda":
            kwargs.update({"device_map": "auto", "trust_remote_code": True})
            # load_in_8bit may not be supported in every environment
            try:
                kwargs["load_in_8bit"] = bool(use_8bit)
            except Exception:
                pass
        else:
            kwargs.update({"device_map": {"": "cpu"}, "low_cpu_mem_usage": True, "trust_remote_code": True})

        model = AutoModelForCausalLM.from_pretrained(base_model, **kwargs)
    except Exception as e:
        raise RuntimeError(f"Failed to load base model '{base_model}': {e}") from e

    if PeftModel is not None and os.path.isdir(lora_dir):
        try:
            model = PeftModel.from_pretrained(model, lora_dir, device_map=("auto" if device == "cuda" else {"": "cpu"}))
        except Exception:
            # Non-fatal: if PEFT loading fails, keep base model
            pass

    model.eval()
    return tokenizer, model, device
