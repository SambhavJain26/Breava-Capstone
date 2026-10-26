# AGENTS.md: Architectural Constraints & System Operational Specifications

## 1. System Mission & Operational Scope
Breava is a healthcare clinical diagnostic platform designed for early breast cancer detection. The platform couples a MERN stack (MongoDB, Express, React, Node.js) with a dedicated Python Flask machine learning microservice running a Gaussian Naive Bayes classification model trained on the Wisconsin Breast Cancer Diagnostic dataset.

---

## 2. Architecture & Invariant Rules

### Invariant 1: Clinical Model Feature Contract
- The Gaussian Naive Bayes model requires exactly 30 numerical features derived from Fine Needle Aspiration (FNA) cytology.
- All incoming CSV uploads must be validated against `EXPECTED_FEATURE_COUNT = 30`.
- Metadata columns (`id`, `diagnosis`, `Unnamed: 32`) must be stripped defensively without failing the request.
- Feature scaling must strictly use the pre-fitted `StandardScaler` artifact (`scaler.pkl`) without data leakage or refitting at inference time.

### Invariant 2: Service Decoupling & Microservice Isolation
- The Express API gateway forwards multipart file uploads to the Python ML microservice via internal HTTP (`POST /predict_csv`).
- The Express API must never attempt direct Python model execution within Node.js processes.
- All temporary uploaded files in `server/uploads/` must be deleted in a `finally` block immediately after forwarding to avoid disk leaks.

### Invariant 3: Offline Development & CI Resilience
- In development environments without an active MongoDB daemon, the Express server must fall back gracefully to an in-memory session/record store.
- Health check endpoints (`GET /health`) on both Express (port 5000) and Flask (port 8008) must report connection states and service availability for container orchestration.

### Invariant 4: Privacy & Credential Hygiene
- Zero medical patient identifiers, database credentials, or JWT secrets may be committed to version control.
- All configurations must be sourced via environment variables with `.env.example` templates.

---

## 3. Style & Writing Standards (STRICT)
- **Em Dash Ban**: Em dashes (Unicode \u2014) and en dashes (Unicode \u2013) are strictly prohibited across all code comments, documentation, and commits. Use colons, parentheses, commas, or standard single ASCII hyphens (-) exclusively.
- **Engineer-Led Framing**: All documentation and commit histories reflect engineering architecture, technical trade-offs, and systematic implementation.

---

## 4. Verification & Testing Gates
Before committing changes to this repository, verify the following gates:
1. **Model Accuracy Verification**: `python ml_service/Test_NB_Model.py sample_data/sample_patient_data.csv` executes with 0 exit code and classifies benchmark benign and malignant samples accurately.
2. **Syntax Validation**: `python -m py_compile ml_service/app.py ml_service/Test_NB_Model.py ml_service/Train_NB_Model.py` and `node -c server/server.js` return without errors.
3. **Git Cleanliness**: Zero node_modules or byte-compiled files (`*.pyc`) committed to git.
