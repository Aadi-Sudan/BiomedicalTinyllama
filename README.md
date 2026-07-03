This site allows users to interact directly with a chatbot custom-trained on biomedical data to ask about diagnoses, treatments, and other health-related queries.

The model used was Ollama's open-source TinyLlama 1.1B, fine-tuned on a biomedical question-response dataset from HuggingFace. I used LoRa, Bitsandbytes, PEFT to adjust parameters and training on the tokenized dataset before merging back into the base model. Training resulted in a ROUGE L-sum score of 0.228 and a BERT F1 score of 0.88, indicating that the model is generalizing well and staying on topic without strictly copying the training data responses, which is crucial in a medical model that will be faced with a wide variety of different patient symptoms. 

After training, I exported the model and its weights to be used in a locally hosted webapp. The backend implements FastAPI to load the model in real-time, format and preprocess the prompt, and use the model to generate a response, and the frontend is a simple HTML/CSS/JS interface.

## Performance Benchmarks

Inference benchmarked across compute targets (5 biomedical prompts, 
30 timed runs each, 100 new tokens generated per prompt):

| Target                  | Mean Latency | Speedup vs CPU |
|-------------------------|-------------|----------------|
| CPU (float32)           | 16,609ms    | 1.00x          |
| GPU — NVIDIA T4 (fp16) | 1,364ms     | 12.18x         |
| GPU + torch.compile()   | 1,381ms     | 12.03x         |

### Operator-Level Profiling (PyTorch Profiler)
Top CUDA bottleneck: `aten::mm` (matrix multiplication) via 
Cutlass WMMA tensor core kernels — 64.9% of total CUDA time.
Full operator breakdown and Chrome trace available in 
`benchmark_results.json` and `tinyllama_trace.json`.
