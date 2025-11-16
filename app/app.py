# large_manual_audit_pipeline.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Tuple
from sentence_transformers import SentenceTransformer, util
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import logging
import time

app = FastAPI(title="Hybrid Large Manual Audit Prototype")
# ----------------------------
# CORS configuration
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------
# Logging configuration
# ----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("large_manual_audit")
# ----------------------------
# Load Local Embeddings Model
# ----------------------------
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")  # local fast embeddings


# ----------------------------
# LM Studio API Endpoint
# ----------------------------
import requests
LM_STUDIO_API_URL = "http://127.0.0.1:1234/v1/completions"

# ----------------------------
# Utility Functions
# ----------------------------
def read_txt(file: UploadFile) -> str:
    return file.file.read().decode("utf-8")

def chunk_text(text: str, max_tokens: int = 100) -> List[str]:
    """Split text into chunks, one per line in the file."""
    return [line.strip() for line in text.splitlines() if line.strip()]

def batch_encode(text_chunks: List[str], batch_size: int = 16):
    """Compute embeddings in batches."""
    embeddings = []
    for i in range(0, len(text_chunks), batch_size):
        batch = text_chunks[i:i+batch_size]
        batch_emb = embedding_model.encode(batch, convert_to_tensor=True)
        embeddings.append(batch_emb)
    return torch.cat(embeddings)

def retrieve_top_chunks(law_chunks, manual_chunks, top_k=3):
    logger.info("Starting retrieval: %d law chunks, %d user chunks, top_k=%d",
                len(law_chunks), len(manual_chunks), top_k)
    law_emb = batch_encode(law_chunks)
    manual_emb = batch_encode(manual_chunks)

    retrieved = []
    for i, l_emb in enumerate(law_emb):
        cosine_scores = util.cos_sim(l_emb, manual_emb)[0]
        top_results = torch.topk(cosine_scores, k=min(top_k, len(manual_chunks)))
        top_indices = top_results.indices.tolist()
        top_chunks = [manual_chunks[idx] for idx in top_indices]
        logger.info("Law clause %d matched user chunk indices: %s", i, top_indices)
        retrieved.append({
            "law_clause": law_chunks[i],
            "law_position": i,
            "user_chunks": top_chunks,
            "user_chunk_indices": top_indices
        })
    logger.info("Retrieval complete: %d clauses processed", len(retrieved))
    return retrieved

def assess_compliance(law_clause: str, relevant_chunks: List[str]) -> dict:
    prompt = f"""
Law Clause: "{law_clause}"
Relevant User Manual Chunks: "{' | '.join(relevant_chunks)}"
Task: Determine compliance (compliant, partially compliant, missing) with short reasoning. If non-compliant, specify the type of issue: missing requirement, contradiction, outdated reference, wrong interval, missing role, incorrect sequence, insufficient evidence, or other. Output JSON: {{ "compliance": ..., "type": ..., "comment": ... }}
"""
    payload = {
        "model": "llama-2-7b-chat",
        "prompt": prompt,
        "max_tokens": 256,
        "temperature": 0.0
    }
    logger.info("Assessing compliance for clause (len=%d). Sending request to LM Studio...",
                len(law_clause))
    start = time.time()
    try:
        response = requests.post(LM_STUDIO_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        output = result.get("choices", [{}])[0].get("text", "")
        elapsed = time.time() - start
        logger.info("LM Studio responded in %.2fs; output length=%d", elapsed, len(output))
    except Exception as e:
        logger.exception("LM Studio request failed: %s", e)
        return {"compliance": "error", "comment": str(e)}

    import re, json
    match = re.search(r"{.*}", output, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            # Ensure 'type' is present
            if 'type' not in result:
                # Heuristic: guess type from comment if possible
                comment = result.get('comment', '').lower()
                if 'missing' in comment:
                    result['type'] = 'missing requirement'
                elif 'contradict' in comment:
                    result['type'] = 'contradiction'
                elif 'outdated' in comment or 'old reg' in comment:
                    result['type'] = 'outdated reference'
                elif 'interval' in comment or 'time' in comment:
                    result['type'] = 'wrong interval'
                elif 'role' in comment or 'responsibilit' in comment:
                    result['type'] = 'missing role'
                elif 'sequence' in comment:
                    result['type'] = 'incorrect sequence'
                elif 'evidence' in comment or 'insufficient' in comment:
                    result['type'] = 'insufficient evidence'
                elif 'compliant' in comment:
                    result['type'] = 'compliant'
                else:
                    result['type'] = 'unknown'
            return result
        except Exception:
            logger.warning("Failed to parse JSON from LLM output; returning raw output")
    return {"compliance": "unknown", "type": "unknown", "comment": output.strip()}

# ----------------------------
# API Endpoint
# ----------------------------
from fastapi import Request
import os

@app.post("/large_manual_audit")
async def large_manual_audit(request: Request, law_file: UploadFile = File(None), user_file: UploadFile = File(...)):
    # If law_file is not provided, use test_law.txt from the app directory
    if law_file is None:
        law_path = os.path.join(os.path.dirname(__file__), "test_law.txt")
        logger.info("No law_file provided, using %s", law_path)
        with open(law_path, "r", encoding="utf-8") as f:
            law_text = f.read()
        law_file_name = "test_law.txt"
    else:
        law_text = read_txt(law_file)
        law_file_name = law_file.filename
    user_text = read_txt(user_file)
    logger.info("large_manual_audit called: law_file=%s, user_file=%s", law_file_name, user_file.filename)
    logger.info("Read files: law_text_len=%d, user_text_len=%d", len(law_text), len(user_text))

    # Step 1: Chunk both documents
    law_chunks = chunk_text(law_text, max_tokens=100)
    user_chunks = chunk_text(user_text, max_tokens=100)

    # Step 2: Retrieve relevant chunks via embeddings
    retrieved = retrieve_top_chunks(law_chunks, user_chunks, top_k=3)
    logger.info("Retrieved matches for %d law clauses", len(retrieved))

    # Step 3: Assess compliance with LLM
    findings = []
    for item in retrieved:
        law_clause = item["law_clause"]
        law_position = item["law_position"]
        user_chunks = item["user_chunks"]
        user_chunk_indices = item["user_chunk_indices"]
        logger.info("Processing law clause %d: %s", law_position, (law_clause[:140] + '...') if len(law_clause) > 140 else law_clause)
        llm_result = assess_compliance(law_clause, user_chunks)
        logger.info("Result for clause %d: compliance=%s", law_position, llm_result.get("compliance"))
        findings.append({
            "law_clause": law_clause,
            "law_position": law_position,
            "user_chunks": user_chunks,
            "user_chunk_indices": user_chunk_indices,
            "compliance": llm_result.get("compliance"),
            "type": llm_result.get("type", "unknown"),
            "comment": llm_result.get("comment")
        })

    return JSONResponse(content={"findings": findings})

# ----------------------------
# Run API
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
