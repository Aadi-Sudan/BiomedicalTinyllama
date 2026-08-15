from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import List
import torch


def get_device():
    """Select best available device: CUDA > MPS > CPU."""
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


class TinyLlamaChatbot:
    def __init__(self, model_path: str):
        self.device = get_device()
        print(f"[MedLM] Loading model on: {self.device}")

        dtype = torch.float16 if self.device in ("cuda", "mps") else torch.float32

        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.tokenizer.pad_token = self.tokenizer.eos_token

        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            dtype=dtype,
            device_map="auto" if self.device == "cuda" else None,
        )

        if self.device != "cuda":
            self.model = self.model.to(self.device)

        self.model.eval()
        print(f"[MedLM] Model ready.")

    def generate_response(self, user_input: str, history: list = []) -> str:
        # Cap at last 3 exchanges (6 messages) to keep context manageable on CPU
        recent_history = history[-6:] if len(history) > 6 else history

        # Build multi-turn prompt from history
        prompt = ""
        for msg in recent_history:
            if msg.role == "user":
                prompt += f"Instruction: {msg.content}\n"
            else:
                prompt += f"Response: {msg.content}\n"

        # Append current user turn
        prompt += f"Instruction: {user_input}\nResponse:"

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=768,
        ).to(self.device)

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)

        # Extract only the final response section
        if "Response:" in generated:
            response = generated.split("Response:")[-1]
            if "Instruction:" in response:
                response = response.split("Instruction:")[0]
            return response.strip()

        return generated.strip()
