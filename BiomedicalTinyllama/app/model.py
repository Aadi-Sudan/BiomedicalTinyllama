from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class TinyLlamaChatbot:
    def __init__(self, model_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float16)
        self.model.to("cpu") 

    def generate_response(self, user_input: str) -> str:
        print("🧠 Starting generation for:", user_input)
        prompt = f"Instruction: {user_input}\nResponse:"
        input_ids = self.tokenizer(prompt, return_tensors="pt").input_ids.to(self.model.device)

        print("🔢 Tokenized. Beginning generation...")
        output_ids = self.model.generate(input_ids, max_new_tokens=200, do_sample=True, temperature=0.7)

        print("✅ Generation complete. Decoding output...")
        generated_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)

        response_section = generated_text.split("Response:")[-1]
        response_clean = response_section.split("Instruction:")[0].strip()

        return response_clean


